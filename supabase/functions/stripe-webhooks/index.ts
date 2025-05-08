// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@10.17.0?target=deno&no-check";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: "2023-10-16",
});

// IMPORTANT: Use Admin client for webhooks to bypass RLS
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "" // Use Service Role Key!
);

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

console.log("Stripe webhook function initialized (v2)");
console.log(`SUPABASE_URL: ${Deno.env.get("SUPABASE_URL") ? "Set" : "Not set"}`);
console.log(`STRIPE_SECRET_KEY: ${Deno.env.get("STRIPE_SECRET_KEY") ? "Set" : "Not set"}`);
console.log(`SUPABASE_SERVICE_ROLE_KEY: ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ? "Set" : "Not set"}`);
console.log(`STRIPE_WEBHOOK_SECRET: ${webhookSecret ? "Set" : "Not set"}`);

serve(async (req) => {
  console.log(`Received webhook request: ${req.method}`);
  const signature = req.headers.get("Stripe-Signature");
  console.log(`Stripe signature present: ${signature ? "Yes" : "No"}`);
  
  const body = await req.text();
  console.log(`Request body length: ${body.length}`);
  
  let event: Stripe.Event;

  try {
    if (!signature) {
      console.warn("Missing Stripe signature. Proceeding without verification (DEV ONLY).");
      event = JSON.parse(body);
    } else if (!webhookSecret || webhookSecret === "whsec_xxxxxxxxxxxxxxxxxxxxx") {
      console.warn("Webhook secret is missing or placeholder. Proceeding without verification (DEV ONLY).");
      event = JSON.parse(body);
    } else {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret,
        undefined,
        Stripe.createSubtleCryptoProvider()
      );
    }
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new Response(err.message, { status: 400 });
  }

  // Handle the event
  try {
    let supabaseUserId: string | null = null;
    let stripeCustomerId: string | null = null;
    let stripeSubscriptionId: string | null = null;
    
    const data = event.data.object as any; // Cast to any for easier access, consider specific types per event

    console.log(`Processing event type: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed":
        supabaseUserId = data.client_reference_id;
        stripeCustomerId = data.customer;
        // stripeSubscriptionId = data.subscription; // This is often populated here too.

        if (!supabaseUserId) {
          console.error("CRITICAL: checkout.session.completed missing client_reference_id!");
          break;
        }
        
        console.log(`Checkout completed for Supabase User: ${supabaseUserId}, Stripe Customer: ${stripeCustomerId}`);

        // Update profile: set onboarding_complete to true and ensure stripe_customer_id is stored
        const { error: profileUpdateError } = await supabaseAdmin
          .from("profiles")
          .update({ 
            onboarding_complete: true,
            stripe_customer_id: stripeCustomerId // Ensure this is set
          })
          .eq("user_id", supabaseUserId);

        if (profileUpdateError) {
          console.error(`Error updating profile for user ${supabaseUserId} on checkout completion:`, profileUpdateError.message);
        } else {
          console.log(`Profile for user ${supabaseUserId} marked as onboarding_complete.`);
        }
        // The actual subscription record in 'subscriptions' table is handled by 'customer.subscription.created/updated'
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        stripeSubscriptionId = data.id;
        stripeCustomerId = data.customer;
        const status = data.status;
        const currentPeriodStart = data.current_period_start ? new Date(data.current_period_start * 1000).toISOString() : null;
        const currentPeriodEnd = data.current_period_end ? new Date(data.current_period_end * 1000).toISOString() : null;
        const priceId = data.items?.data[0]?.price?.id;
        const trialEnd = data.trial_end ? new Date(data.trial_end * 1000).toISOString() : null;

        supabaseUserId = data.metadata?.supabase_user_id || (await getSupabaseUserIdFromCustomerId(stripeCustomerId));

        if (!supabaseUserId) {
          console.error(`Could not find Supabase User ID for Stripe Customer ${stripeCustomerId} during ${event.type}`);
          break;
        }
        
        console.log(`Subscription ${event.type} for Supabase User: ${supabaseUserId}, Status: ${status}`);

        // Upsert into subscriptions table
        const { error: subUpsertError } = await supabaseAdmin
          .from("subscriptions")
          .upsert({
            // id: generated by DB or map stripeSubscriptionId if preferred as PK
            user_id: supabaseUserId,
            stripe_subscription_id: stripeSubscriptionId,
            stripe_customer_id: stripeCustomerId,
            status: status,
            current_period_start: currentPeriodStart,
            current_period_end: currentPeriodEnd,
            price_id: priceId,
            // subscribed_at: will default on insert, or handle explicitly if needed for updates
          }, {
            onConflict: "stripe_subscription_id", // Assumes stripe_subscription_id is unique
          });

        if (subUpsertError) {
          console.error(`Error upserting subscription ${stripeSubscriptionId} for user ${supabaseUserId}:`, subUpsertError.message);
        } else {
           console.log(`Subscription ${stripeSubscriptionId} upserted for user ${supabaseUserId}.`);
        }

        // Update profiles table with general status and Stripe IDs
        const { error: profileSubUpdateError } = await supabaseAdmin
          .from("profiles")
          .update({
            subscription_status: status,
            stripe_subscription_id: stripeSubscriptionId, // Good to have here for quick checks
            stripe_customer_id: stripeCustomerId, // Ensure it's also in profiles
            trial_end: trialEnd, // Store trial_end in profiles as well
          })
          .eq("user_id", supabaseUserId);
        
        if (profileSubUpdateError) {
            console.error(`Error updating profile subscription status for user ${supabaseUserId}:`, profileSubUpdateError.message);
        }
        break;

      case "customer.subscription.deleted": // Handles cancellations
        stripeSubscriptionId = data.id;
        stripeCustomerId = data.customer;
        const deletedStatus = data.status; // usually 'canceled' or could be 'ended'

        supabaseUserId = data.metadata?.supabase_user_id || (await getSupabaseUserIdFromCustomerId(stripeCustomerId));

        if (!supabaseUserId) {
          console.error(`Could not find Supabase User ID for Stripe Customer ${stripeCustomerId} during subscription deletion`);
          break;
        }

        console.log(`Subscription deleted/canceled for Supabase User: ${supabaseUserId}, Stripe Sub ID: ${stripeSubscriptionId}`);

        // Update subscriptions table
        const { error: subDeleteUpdateError } = await supabaseAdmin
          .from("subscriptions")
          .update({
            status: deletedStatus, // e.g., 'canceled', or 'inactive'
            current_period_end: data.ended_at ? new Date(data.ended_at * 1000).toISOString() : (data.canceled_at ? new Date(data.canceled_at * 1000).toISOString() : new Date().toISOString()),
          })
          .eq("stripe_subscription_id", stripeSubscriptionId);

        if (subDeleteUpdateError) {
            console.error(`Error updating subscription ${stripeSubscriptionId} to canceled for user ${supabaseUserId}:`, subDeleteUpdateError.message);
        }

        // Update profiles table
        const { error: profileDeleteUpdateError } = await supabaseAdmin
          .from("profiles")
          .update({
            subscription_status: 'canceled', // A normalized status
            // Optionally clear stripe_subscription_id from profile or keep it for history
            // stripe_subscription_id: null, 
          })
          .eq("user_id", supabaseUserId);

        if (profileDeleteUpdateError) {
            console.error(`Error updating profile to canceled for user ${supabaseUserId}:`, profileDeleteUpdateError.message);
        }
        break;

      case "invoice.paid":
        stripeCustomerId = data.customer;
        supabaseUserId = await getSupabaseUserIdFromCustomerId(stripeCustomerId);

        if (!supabaseUserId) {
          console.error(`Invoice paid: Could not find Supabase User ID for Stripe Customer ${stripeCustomerId}`);
          break;
        }
        
        stripeSubscriptionId = data.subscription;
        const paidInvoicePeriodStart = data.period_start ? new Date(data.period_start * 1000).toISOString() : null;
        const paidInvoicePeriodEnd = data.period_end ? new Date(data.period_end * 1000).toISOString() : null;

        console.log(`Invoice paid for Supabase User: ${supabaseUserId}, Stripe Sub ID: ${stripeSubscriptionId}`);

        // Update subscriptions table
        const { error: invPaidSubError } = await supabaseAdmin
          .from("subscriptions")
          .update({
            status: 'active', // Assuming payment makes it active
            current_period_start: paidInvoicePeriodStart,
            current_period_end: paidInvoicePeriodEnd,
            last_billed_at: data.created ? new Date(data.created * 1000).toISOString() : new Date().toISOString(),
          })
          .eq("stripe_subscription_id", stripeSubscriptionId); // Ensure this sub ID exists

        if (invPaidSubError) {
            console.error(`Error updating subscription ${stripeSubscriptionId} on invoice.paid for user ${supabaseUserId}:`, invPaidSubError.message);
        }

        // Update profiles table
        const { error: invPaidProfileError } = await supabaseAdmin
          .from("profiles")
          .update({ subscription_status: 'active' })
          .eq("user_id", supabaseUserId);

        if (invPaidProfileError) {
            console.error(`Error updating profile on invoice.paid for user ${supabaseUserId}:`, invPaidProfileError.message);
        }
        break;

      case "invoice.payment_failed":
        stripeCustomerId = data.customer;
        supabaseUserId = await getSupabaseUserIdFromCustomerId(stripeCustomerId);

        if (!supabaseUserId) {
          console.error(`Invoice payment failed: Could not find Supabase User ID for Stripe Customer ${stripeCustomerId}`);
          break;
        }

        stripeSubscriptionId = data.subscription;
        const failedAttemptCount = data.attempt_count;
        const nextPaymentAttempt = data.next_payment_attempt ? new Date(data.next_payment_attempt * 1000).toISOString() : null;

        console.log(`Invoice payment failed for Supabase User: ${supabaseUserId}, Stripe Sub ID: ${stripeSubscriptionId}, Attempts: ${failedAttemptCount}`);
        
        // Update subscriptions table
        const { error: invFailedSubError } = await supabaseAdmin
          .from("subscriptions")
          .update({ status: 'past_due' }) // Or a more specific Stripe status if available and mapped
          .eq("stripe_subscription_id", stripeSubscriptionId);
        
        if (invFailedSubError) {
             console.error(`Error updating subscription ${stripeSubscriptionId} on invoice.payment_failed for user ${supabaseUserId}:`, invFailedSubError.message);
        }

        // Update profiles table
        const { error: invFailedProfileError } = await supabaseAdmin
          .from("profiles")
          .update({ subscription_status: 'past_due' })
          .eq("user_id", supabaseUserId);

        if (invFailedProfileError) {
            console.error(`Error updating profile on invoice.payment_failed for user ${supabaseUserId}:`, invFailedProfileError.message);
        }
        // Optionally, trigger notifications to the user about payment failure
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error("Error processing webhook event:", error.message);
    return new Response(`Webhook handler error: ${error.message}`, {
      status: 500,
    });
  }
});

// Helper function to find Supabase user ID if not in metadata
async function getSupabaseUserIdFromCustomerId(
  customerId: string | null
): Promise<string | null> {
  if (!customerId) return null;
  const { data, error } = await supabaseAdmin
    .from("profiles") // Continues to query profiles for the primary link
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (error) {
    console.error(
      `Error fetching profile for Stripe Customer ${customerId}:`,
      error.message
    );
    return null;
  }
  return data?.user_id || null;
}

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/stripe-webhooks' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/

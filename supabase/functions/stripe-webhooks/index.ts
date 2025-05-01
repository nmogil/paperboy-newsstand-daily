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

console.log("Stripe webhook function initialized");
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
      console.warn("Missing Stripe signature");
      // Proceed without verification in development, but log this issue
      try {
        event = JSON.parse(body);
        console.log("Parsed event without verification:", event.type);
      } catch (err) {
        console.error("Failed to parse webhook body as JSON:", err.message);
        return new Response("Invalid JSON body", { status: 400 });
      }
    } else if (!webhookSecret || webhookSecret === "whsec_xxxxxxxxxxxxxxxxxxxxx") {
      console.warn("Webhook secret is missing or using placeholder value");
      // Proceed without verification in development, but log this issue
      try {
        event = JSON.parse(body);
        console.log("Parsed event without verification:", event.type);
      } catch (err) {
        console.error("Failed to parse webhook body as JSON:", err.message);
        return new Response("Invalid JSON body", { status: 400 });
      }
    } else {
      // Normal verification path
      try {
        event = await stripe.webhooks.constructEventAsync(
          body,
          signature,
          webhookSecret,
          undefined,
          Stripe.createSubtleCryptoProvider()
        );
        console.log("Successfully verified webhook signature");
      } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return new Response(err.message, { status: 400 });
      }
    }
  } catch (err) {
    console.error(`General webhook processing error: ${err.message}`);
    return new Response(err.message, { status: 400 });
  }

  // Handle the event
  try {
    const relevantEvents = new Set([
      "checkout.session.completed",
      "customer.subscription.created",
      "customer.subscription.updated",
      "customer.subscription.deleted",
      // Add 'invoice.paid', 'invoice.payment_failed' if needed
    ]);

    if (relevantEvents.has(event.type)) {
      const session = event.data.object as any; // Type appropriately based on event
      let supabaseUserId: string | null = null;
      let stripeCustomerId: string | null = null;
      let subscriptionStatus: string | null = null;
      let stripeSubscriptionId: string | null = null;

      console.log(`Processing event type: ${event.type}`);

      switch (event.type) {
        case "checkout.session.completed":
          // Comes from the checkout session creation
          supabaseUserId = session.client_reference_id;
          stripeCustomerId = session.customer;
          stripeSubscriptionId = session.subscription;
          // Don't set status here, wait for subscription.created/updated
          console.log(
            `Checkout completed for Supabase User: ${supabaseUserId}, Stripe Customer: ${stripeCustomerId}, Sub ID: ${stripeSubscriptionId}`
          );
          if (!supabaseUserId) {
            console.error(
              "CRITICAL: checkout.session.completed event missing client_reference_id!"
            );
            break; // Exit switch, but maybe log more severely
          }
          // Update profile with Customer ID if it wasn't set during checkout creation (fallback)
          await supabaseAdmin
            .from("profiles")
            .update({ stripe_customer_id: stripeCustomerId })
            .eq("user_id", supabaseUserId);
          break;

        case "customer.subscription.created":
        case "customer.subscription.updated":
          stripeSubscriptionId = session.id;
          stripeCustomerId = session.customer;
          subscriptionStatus = session.status; // e.g., 'active', 'trialing', 'past_due'
          
          const trialEndTimestamp = session.trial_end; // Unix timestamp (seconds) or null
          const trialEndDate = trialEndTimestamp ? new Date(trialEndTimestamp * 1000).toISOString() : null;
          
          // Get Supabase User ID from metadata if available, or look up by customer ID
          supabaseUserId =
            session.metadata?.supabase_user_id ||
            (await getSupabaseUserIdFromCustomerId(stripeCustomerId));
          console.log(
            `Subscription ${event.type} for Supabase User: ${supabaseUserId}, Status: ${subscriptionStatus}, Trial End: ${trialEndDate}`
          );
          if (!supabaseUserId) {
            console.error(
              `Could not find Supabase User ID for Stripe Customer ${stripeCustomerId} during ${event.type}`
            );
            break;
          }
          await supabaseAdmin
            .from("profiles")
            .update({
              subscription_status: subscriptionStatus,
              stripe_subscription_id: stripeSubscriptionId,
              trial_end: trialEndDate,
            })
            .eq("user_id", supabaseUserId);
          break;

        case "customer.subscription.deleted": // Occurs when a subscription is canceled
          stripeSubscriptionId = session.id;
          stripeCustomerId = session.customer;
          subscriptionStatus = "inactive"; // Or 'canceled'
          supabaseUserId =
            session.metadata?.supabase_user_id ||
            (await getSupabaseUserIdFromCustomerId(stripeCustomerId));
          console.log(
            `Subscription deleted for Supabase User: ${supabaseUserId}`
          );
          if (!supabaseUserId) {
            console.error(
              `Could not find Supabase User ID for Stripe Customer ${stripeCustomerId} during subscription deletion`
            );
            break;
          }
          await supabaseAdmin
            .from("profiles")
            .update({
              subscription_status: subscriptionStatus,
              // stripe_subscription_id: null // Optionally clear the subscription ID
            })
            .eq("user_id", supabaseUserId);
          break;
        // Add other cases as needed (e.g., invoice.paid)
      }
    } else {
      console.log(`Unhandled event type ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error processing webhook event:", error);
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
    .from("profiles")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (error) {
    console.error(
      `Error fetching profile for Stripe Customer ${customerId}:`,
      error
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

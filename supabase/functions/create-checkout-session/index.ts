// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@10.17.0?target=deno&no-check"; // Use appropriate version
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts"; // Assuming you have a shared CORS file

const stripe = Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: "2023-10-16", // Use your target Stripe API version
});

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "" // Use Service Role Key for admin access if needed, or Anon Key + RLS
);

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Get User from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }
    const jwt = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(jwt);
    if (userError || !user) {
      throw new Error(
        `Authentication error: ${userError?.message ?? "User not found"}`
      );
    }

    // 2. Get user's profile to check for existing Stripe Customer ID
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      // Ignore 'not found' error if profile creation is separate
      console.error("Profile fetch error:", profileError);
      throw new Error("Could not fetch user profile.");
    }

    let stripeCustomerId = profile?.stripe_customer_id;

    // 3. Create Stripe Customer if they don't have one
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id }, // Link Stripe customer to Supabase user
      });
      stripeCustomerId = customer.id;

      // 4. Update profile with new Stripe Customer ID
      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Profile update error:", updateError);
        // Non-fatal, checkout can proceed, but log this issue
      }
    }

    // 5. Define Success and Cancel URLs
    const baseUrl = Deno.env.get("SITE_URL") || "http://localhost:8080"; // Your frontend URL
    const successUrl = `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/payment-canceled`;

    // 6. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer: stripeCustomerId, // Use existing or newly created customer ID
      line_items: [
        {
          price: Deno.env.get("STRIPE_PRICE_ID"), // Get Price ID from env vars
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      // IMPORTANT: Use client_reference_id to link session back to Supabase user ID in webhooks
      client_reference_id: user.id,
      subscription_data: {
        metadata: { supabase_user_id: user.id }, // Also add metadata to subscription
      },
    });

    // 7. Return the session URL
    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400, // Or 500 depending on the error
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-checkout-session' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/

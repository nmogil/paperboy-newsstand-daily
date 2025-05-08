import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { differenceInDays, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { useToast as useShadcnToast } from "@/hooks/use-toast";

type Profile = {
  id: string;
  user_id: string;
  email: string | null;
  name: string | null;
  title: string | null;
  goals: string | null;
  subscription_status: string;
  trial_end?: string | null; // Make optional with ?
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
};

const Dashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const navigate = useNavigate();
  const { toast: shadcnToast } = useShadcnToast();

  useEffect(() => {
    const checkAuthAndSubscription = async () => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        navigate("/auth");
        return;
      }

      const userId = sessionData.session.user.id;

      // Check if we're arriving from payment-success page with pending subscription
      const fromPaymentSuccess = sessionStorage.getItem('from_payment_success');
      if (fromPaymentSuccess) {
        // Clear the flag
        sessionStorage.removeItem('from_payment_success');
        
        // Show a temporary status message 
        toast.info("Checking subscription status...");
        
        // Wait a bit longer for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*") // Select all fields to match the Profile type
        .eq("user_id", userId)
        .single();

      console.log("Dashboard Debug: userId", userId);
      console.log("Dashboard Debug: profileData", profileData);
      console.log("Dashboard Debug: profileError", profileError);

      if (profileError) {
        console.error("Error fetching profile on dashboard:", profileError);
        // Handle error appropriately - maybe show an error message
        setLoading(false);
        return;
      }

      // Check subscription status without redirecting
      const isActive = profileData?.subscription_status === "active";
      const isTrialing = profileData?.subscription_status === "trialing";

      setProfile(profileData);
      setLoading(false);
    };

    checkAuthAndSubscription();
  }, [navigate]); // Add navigate to dependency array

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleManageSubscription = async () => {
    setIsPortalLoading(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        toast.error("Please log in again.");
        navigate("/auth");
        return;
      }

      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ovnpankwmmrmhqkxsqqq.supabase.co';
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/create-customer-portal-session`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to open billing portal.");
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Portal
      } else {
        throw new Error("No portal URL received");
      }
    } catch (error: any) {
      console.error("Portal error:", error);
      shadcnToast({
        title: "Error",
        description: error.message || "Could not open subscription management.",
        variant: "destructive",
      });
      setIsPortalLoading(false);
    }
  };

  const handleSubscribeNow = async () => {
    setIsCheckoutLoading(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        toast.error("Please log in again.");
        navigate("/auth");
        return;
      }

      // Log debugging info
      console.log("Session exists:", !!session);
      console.log("Access Token available:", !!session.access_token);
      
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ovnpankwmmrmhqkxsqqq.supabase.co';
      console.log("Using SUPABASE_URL:", SUPABASE_URL);
      
      try {
        // Get fresh ID and access tokens
        const { data: sessionRefresh } = await supabase.auth.refreshSession();
        const freshToken = sessionRefresh?.session?.access_token || session.access_token;

        console.log("Using fresh token:", !!freshToken);
        
        const response = await fetch(
          `${SUPABASE_URL}/functions/v1/create-checkout-session`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${freshToken}`,
              "Content-Type": "application/json",
              "x-client-info": "@supabase/auth-helpers-nextjs/0.6.1"
            },
          }
        );
        
        console.log("Response status:", response.status);
        
        let errorText = null;
        try {
          const textResponse = await response.text();
          console.log("Raw response:", textResponse);
          
          if (textResponse.includes("Invalid JWT")) {
            throw new Error("Authentication error. Please log out and log in again.");
          }
          
          const data = JSON.parse(textResponse);
          if (!response.ok)
            throw new Error(data.error || "Failed to create checkout session.");
          if (data.url) {
            window.location.href = data.url; // Redirect to Stripe Checkout
          } else {
            throw new Error("No checkout URL received");
          }
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
          errorText = parseError.message || "Invalid response from server";
          throw new Error(errorText);
        }
      } catch (fetchError) {
        console.error("Fetch error details:", fetchError);
        throw fetchError;
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      shadcnToast({
        title: "Error",
        description: error.message || "Could not start the subscription process.",
        variant: "destructive",
      });
      setIsCheckoutLoading(false);
    }
  };

  const handleDebugAuth = async () => {
    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error("No session found:", sessionError);
        toast.error("No active session. Please log in again.");
        return;
      }
      
      console.log("Current session:", {
        user_id: session.user.id,
        email: session.user.email,
        token_valid_until: new Date(session.expires_at ? session.expires_at * 1000 : 0).toLocaleString(),
        token_expires_in: session.expires_at ? Math.round((session.expires_at * 1000 - Date.now()) / 1000 / 60) + ' minutes' : 'unknown',
      });
      
      // Try to refresh the session
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error("Error refreshing session:", refreshError);
        toast.error("Could not refresh authentication. Please log in again.");
        return;
      }
      
      console.log("Session refreshed:", !!refreshData.session);
      if (refreshData.session) {
        toast.success("Authentication refreshed successfully. Try subscribing now.");
      } else {
        toast.error("Failed to refresh authentication.");
      }
    } catch (error) {
      console.error("Debug auth error:", error);
      toast.error("Authentication test failed: " + (error.message || "Unknown error"));
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-newsprint-red mx-auto"></div>
            <p className="mt-4 text-newsprint-light">Loading your dashboard...</p>
          </div>
        ) : (
          <>
            {profile && (profile.subscription_status === 'active' || profile.subscription_status === 'trialing') ? (
              // Subscribed user view - your existing dashboard content
              <div className="space-y-8">
                <div className="bg-paper-aged p-6 rounded-sm border border-newsprint/10 shadow-sm">
                  <h1 className="text-3xl font-bold font-display mb-2">Welcome, {profile?.name || 'Reader'}!</h1>
                  {!profile?.name && (
                    <p className="text-sm text-newsprint-light mb-3">
                      Complete your profile to personalize your experience! <Link to="/onboarding" className="underline hover:text-newsprint-red">Go to Profile Setup</Link>.
                    </p>
                  )}
                  <p className="text-lg text-newsprint-light mb-4">
                    {profile.subscription_status === 'trialing' ? (
                      <>
                        You're currently on a trial subscription
                        {profile.trial_end && (
                          <>
                            {" "}that will end in{" "}
                            <span className="font-bold text-newsprint-red">
                              {Math.max(0, differenceInDays(parseISO(profile.trial_end), new Date()))}
                            </span>{" "}
                            days
                          </>
                        )}
                        .
                      </>
                    ) : (
                      <>Thank you for being a Paperboy subscriber!</>
                    )}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button 
                      onClick={handleManageSubscription}
                      disabled={isPortalLoading}
                    >
                      {isPortalLoading ? 'Loading...' : 'Manage Subscription'}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/onboarding')}
                    >
                      Edit Profile
                    </Button>
                    {/* Debug button, could be removed in production */}
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={handleDebugAuth}
                    >
                      Debug Auth
                    </Button>
                  </div>
                </div>
                
                {/* Rest of your dashboard UI for subscribed users */}
              </div>
            ) : (
              // Unsubscribed user view
              <div className="space-y-8">
                <div className="bg-paper-aged p-6 rounded-sm border border-newsprint/10 shadow-sm">
                  <h1 className="text-3xl font-bold font-display mb-2">Welcome, {profile?.name || 'Reader'}!</h1>
                  {!profile?.name && (
                    <p className="text-sm text-newsprint-light mb-3">
                      Complete your profile to personalize your experience! <Link to="/onboarding" className="underline hover:text-newsprint-red">Go to Profile Setup</Link>.
                    </p>
                  )}
                  <p className="text-lg text-newsprint-light mb-4">
                    Your account is not currently subscribed to Paperboy.
                  </p>
                  <div className="bg-paper p-4 border border-newsprint-red/30 rounded-sm mb-4">
                    <h2 className="text-xl font-bold font-display text-newsprint-red mb-2">
                      Subscribe to Access Full Features
                    </h2>
                    <p className="text-newsprint mb-4">
                      Subscribe today to unlock all of Paperboy's premium features and content.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        className="w-full md:w-auto"
                        onClick={handleSubscribeNow}
                        disabled={isCheckoutLoading}
                      >
                        {isCheckoutLoading ? 'Loading...' : 'Subscribe Now'}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => navigate('/onboarding')}
                      >
                        Edit Profile
                      </Button>
                      {/* Debug button, could be removed in production */}
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={handleDebugAuth}
                      >
                        Debug Auth
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Limited dashboard content for unsubscribed users */}
                <div className="bg-paper p-6 rounded-sm border border-newsprint/10 shadow-sm">
                  <h2 className="text-2xl font-bold font-display mb-4">Limited Preview</h2>
                  <p className="text-newsprint-light mb-4">
                    This is a preview of what's available with a full subscription.
                  </p>
                  {/* Add some preview content or teaser features here */}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default Dashboard;

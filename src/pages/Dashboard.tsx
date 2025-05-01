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
  trial_end: string | null; // ISO string format from DB
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
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        navigate('/auth');
        return;
      }
      
      const userId = data.session.user.id;
      
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(profileData);
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, [navigate]);

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

  const renderSubscriptionInfo = () => {
    if (!profile) return null;

    const status = profile.subscription_status;
    const trialEnd = profile.trial_end ? parseISO(profile.trial_end) : null;
    const now = new Date();
    const isTrialing = status === 'trialing' && trialEnd && trialEnd > now;

    let trialDaysLeft: number | null = null;
    if (isTrialing && trialEnd) {
      trialDaysLeft = differenceInDays(trialEnd, now);
    }

    return (
      <div className="space-y-2">
        <p><span className="font-medium">Subscription Status:</span> <span className={`font-semibold ${isTrialing || status === 'active' ? 'text-green-700' : 'text-red-700'}`}>{status}</span></p>
        {isTrialing && trialDaysLeft !== null && (
          <p className="text-sm text-newsprint-light">
            Your free trial ends in {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} (on {trialEnd?.toLocaleDateString()}).
          </p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center">
          <div className="text-xl">Loading...</div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Dashboard</h1>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Name:</span> {profile?.name || 'Not set'}</p>
            <p><span className="font-medium">Email:</span> {profile?.email || 'Not set'}</p>
            <p><span className="font-medium">Title:</span> {profile?.title || 'Not set'}</p>
            <p><span className="font-medium">Goals:</span> {profile?.goals || 'Not set'}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Subscription</h2>
          {renderSubscriptionInfo()}
          <div className="mt-4 space-x-2">
            <Button onClick={() => navigate('/onboarding')}>
              Edit Profile
            </Button>
            {(profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing') && (
              <Button onClick={handleManageSubscription} disabled={isPortalLoading}>
                {isPortalLoading ? 'Loading...' : 'Manage Subscription'}
              </Button>
            )}
            {(profile?.subscription_status !== 'active' && profile?.subscription_status !== 'trialing') && (
              <Button 
                onClick={handleSubscribeNow} 
                disabled={isCheckoutLoading}
                className="bg-newsprint-red hover:bg-newsprint-red/90 text-white"
              >
                {isCheckoutLoading ? 'Loading...' : 'Subscribe Now'}
              </Button>
            )}
            <Button 
              onClick={handleDebugAuth} 
              variant="outline"
              size="sm"
            >
              Debug Auth
            </Button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Your Paper Recommendations</h2>
          <p className="text-gray-500">No recommendations yet. Stay tuned!</p>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Dashboard;

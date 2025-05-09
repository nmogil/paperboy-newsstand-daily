import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { differenceInDays, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { useToast as useShadcnToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Profile = {
  id: string;
  user_id: string;
  email: string | null;
  name: string | null;
  title: string | null;
  goals: string | null;
  subscription_status: string;
  trial_end?: string | null;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
};

const AccountPage = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const navigate = useNavigate();
  const { toast: shadcnToast } = useShadcnToast();

  // State for profile editing
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editableName, setEditableName] = useState('');
  const [editableTitle, setEditableTitle] = useState('');
  const [editableGoals, setEditableGoals] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    const checkAuthAndFetchProfile = async () => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        navigate("/auth");
        return;
      }

      const userId = sessionData.session.user.id;

      // Check if we're arriving from payment-success page with pending subscription
      const fromPaymentSuccess = sessionStorage.getItem('from_payment_success');
      if (fromPaymentSuccess) {
        sessionStorage.removeItem('from_payment_success');
        toast.info("Checking subscription status...");
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for webhook
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile on account page:", profileError);
        toast.error("Could not load your profile. Please try again.");
        setLoading(false);
        return;
      }

      setProfile(profileData);
      // Initialize editable fields when profile data is fetched
      if (profileData) {
        setEditableName(profileData.name || '');
        setEditableTitle(profileData.title || '');
        setEditableGoals(profileData.goals || '');
      }
      setLoading(false);
    };

    checkAuthAndFetchProfile();
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
      if (!response.ok) throw new Error(data.error || "Failed to open billing portal.");
      if (data.url) {
        window.location.href = data.url;
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
    } finally {
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
      
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ovnpankwmmrmhqkxsqqq.supabase.co';
      // Get fresh ID and access tokens
      const { data: sessionRefresh } = await supabase.auth.refreshSession();
      const freshToken = sessionRefresh?.session?.access_token || session.access_token;

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/create-checkout-session`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${freshToken}`,
            "Content-Type": "application/json",
            "x-client-info": "@supabase/auth-helpers-nextjs/0.6.1" // Example, adjust if needed
          },
        }
      );
      
      const textResponse = await response.text();
      try {
        const data = JSON.parse(textResponse);
        if (!response.ok) throw new Error(data.error || "Failed to create checkout session.");
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error("No checkout URL received");
        }
      } catch (parseError) {
         if (textResponse.includes("Invalid JWT")) {
            throw new Error("Authentication error. Please log out and log in again.");
          }
        console.error("Error parsing checkout response:", parseError, "Raw response:", textResponse);
        throw new Error("Could not process subscription request. Please try again.");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      shadcnToast({
        title: "Error",
        description: error.message || "Could not start the subscription process.",
        variant: "destructive",
      });
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleProfileEditToggle = () => {
    if (!profile) return;
    if (isEditingProfile) {
      // Reset fields to original profile data if canceling
      setEditableName(profile.name || '');
      setEditableTitle(profile.title || '');
      setEditableGoals(profile.goals || '');
    }
    setIsEditingProfile(!isEditingProfile);
  };

  const handleProfileSave = async () => {
    if (!profile) {
      toast.error("Profile data not loaded.");
      return;
    }
    setIsSavingProfile(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        toast.error("Authentication error. Please log in again.");
        navigate("/auth");
        setIsSavingProfile(false);
        return;
      }
      const userId = sessionData.session.user.id;

      const updates = {
        name: editableName,
        title: editableTitle,
        goals: editableGoals,
        updated_at: new Date(), // Optional: track updates
      };

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId);

      if (updateError) {
        throw updateError;
      }

      // Update local profile state
      setProfile(prevProfile => prevProfile ? { ...prevProfile, ...updates } : null);
      toast.success("Profile updated successfully!");
      setIsEditingProfile(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const trialDaysLeft = profile?.trial_end 
    ? differenceInDays(parseISO(profile.trial_end), new Date()) 
    : 0;

  return (
    <AuthenticatedLayout>
      <div className="max-w-2xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-newsprint-dark mb-8">Account Settings</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-newsprint-red mx-auto"></div>
            <p className="mt-4 text-newsprint-light">Loading your account details...</p>
          </div>
        ) : profile ? (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-newsprint-dark">Profile Information</h2>
                <Button onClick={handleProfileEditToggle} variant="outline" size="sm">
                  {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>
              {!isEditingProfile ? (
                <>
                  <p><strong>Name:</strong> {profile.name || 'Not set'}</p>
                  <p><strong>Email:</strong> {profile.email}</p>
                  <p><strong>Title:</strong> {profile.title || 'Not set'}</p>
                  <p><strong>Goals:</strong> {profile.goals || 'Not set'}</p>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      value={editableName} 
                      onChange={(e) => setEditableName(e.target.value)} 
                      placeholder="Your Name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      value={profile.email || ''} 
                      disabled 
                      className="bg-gray-100"
                    />
                     <p className="text-xs text-gray-500 mt-1">Email address cannot be changed here.</p>
                  </div>
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input 
                      id="title" 
                      value={editableTitle} 
                      onChange={(e) => setEditableTitle(e.target.value)}
                      placeholder="Your Title (e.g., Software Engineer, Founder)" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="goals">Goals/Interests</Label>
                    <Textarea 
                      id="goals" 
                      value={editableGoals} 
                      onChange={(e) => setEditableGoals(e.target.value)}
                      placeholder="What are your goals or interests related to this service?"
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleProfileSave} disabled={isSavingProfile}>
                    {isSavingProfile ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-newsprint-dark mb-4">Subscription</h2>
              {profile.subscription_status === 'active' && (
                <>
                  <p className="text-green-600 font-semibold">Your subscription is active.</p>
                  <Button onClick={handleManageSubscription} disabled={isPortalLoading} className="mt-4">
                    {isPortalLoading ? 'Loading...' : 'Manage Subscription'}
                  </Button>
                </>
              )}
              {profile.subscription_status === 'trialing' && (
                <>
                  <p className="text-blue-600 font-semibold">
                    You are currently on a trial.
                    {profile.trial_end && trialDaysLeft > 0 && ` ${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'} left.`}
                    {profile.trial_end && trialDaysLeft <= 0 && ' Your trial has ended.'}
                  </p>
                  <Button onClick={handleSubscribeNow} disabled={isCheckoutLoading} className="mt-4 mr-2">
                    {isCheckoutLoading ? 'Processing...' : 'Subscribe Now'}
                  </Button>
                  <Button onClick={handleManageSubscription} disabled={isPortalLoading} className="mt-4" variant="outline">
                    {isPortalLoading ? 'Loading...' : 'Manage Billing'}
                  </Button>
                </>
              )}
              {(!profile.subscription_status || !['active', 'trialing'].includes(profile.subscription_status)) && (
                 <>
                  <p className="text-red-600 font-semibold">You do not have an active subscription.</p>
                  <Button onClick={handleSubscribeNow} disabled={isCheckoutLoading} className="mt-4">
                    {isCheckoutLoading ? 'Processing...' : 'Subscribe Now'}
                  </Button>
                </>
              )}
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
               <h2 className="text-xl font-semibold text-newsprint-dark mb-4">Account Actions</h2>
                <Button onClick={handleLogout} variant="destructive" className="mt-4">
                    Log Out
                </Button>
            </div>

          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-newsprint-light">Could not load profile information.</p>
            <Button onClick={() => window.location.reload()} className="mt-4">Try Again</Button>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default AccountPage; 
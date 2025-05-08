import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const redirect = searchParams.get('redirect');
  const { toast: shadcnToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Completing Sign In...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      setLoading(true);
      setMessage('Processing authentication...');
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (sessionData?.session) {
          toast.success('Logged in successfully');
          setMessage('Fetching your profile...');

          const user = sessionData.session.user;
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('name, title, goals, onboarding_complete, subscription_status')
            .eq('user_id', user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') { // PGRST116: row not found
            // If profile genuinely not found and it's not just a new user case,
            // this is an issue. However, a profile should be created by a trigger.
            // For now, we'll assume a trigger handles profile creation.
            // If it doesn't, user will be stuck or redirected to onboarding.
            console.error('Profile fetch error:', profileError);
            // Potentially redirect to an error page or show a more specific error
          }
          
          // Decision logic for redirection
          // A new user might not have a profile record yet, or it might be empty.
          // The onboarding_complete flag is the primary determinant.
          // Also check for essential profile fields if the flag isn't robustly set for all users yet.
          const isProfilePartiallyComplete = profile?.name && profile?.title && profile?.goals;

          if (!profile || !profile.onboarding_complete) {
             setMessage('Redirecting to onboarding...');
            navigate('/onboarding');
          } else {
            // Onboarding is complete, and we assume subscription is handled
            // (or not a blocker for dashboard access post-onboarding step)
            setMessage('Redirecting to dashboard...');
            navigate('/dashboard');
          }

        } else {
          throw new Error("Authentication failed. No session established.");
        }
      } catch (error: any) {
        console.error('Auth callback error:', error);
        setMessage('Authentication Error');
        shadcnToast({
          title: 'Authentication Error',
          description: error.message || 'Failed to complete authentication. Please try again.',
          variant: 'destructive',
        });
        navigate('/auth');
      } finally {
        // Set loading to false only if not navigating immediately or if there's a message display period
        // For this example, navigation happens quickly, so visual loading state change might be brief.
        // setLoading(false); // Could be uncommented if there's a noticeable delay before navigate
      }
    };

    handleAuthCallback();
  }, [navigate, redirect, shadcnToast]); // `redirect` is kept if other use cases for it exist

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper-dark">
      <div className="w-full max-w-md p-8 space-y-6 bg-paper shadow-md rounded-sm border border-newsprint/10 text-center">
        <h2 className="text-2xl font-bold font-display">
          {message}
        </h2>
        {loading && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-newsprint-red"></div>
          </div>
        )}
        <p className="text-newsprint-light">
          {loading 
            ? 'Please wait while we process your sign in...'
            : 'Redirecting you...'}
        </p>
      </div>
    </div>
  );
};

export default AuthCallback; 
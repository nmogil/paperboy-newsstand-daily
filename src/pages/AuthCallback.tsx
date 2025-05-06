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

  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      setLoading(true);
      try {
        // When redirected from OAuth provider, the URL will contain a hash with the session info
        // Supabase client will automatically handle this to set up the session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (data?.session) {
          toast.success('Logged in successfully');
          
          // Handle redirect logic similar to regular login
          if (redirect === 'checkout') {
            // Handle checkout redirection if needed
            const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ovnpankwmmrmhqkxsqqq.supabase.co';
            const response = await fetch(
              `${SUPABASE_URL}/functions/v1/create-checkout-session`,
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${data.session.access_token}`,
                  'Content-Type': 'application/json',
                },
              }
            );
            const checkoutData = await response.json();
            if (!response.ok) 
              throw new Error(checkoutData.error || 'Failed to create checkout session.');
            if (checkoutData.url) {
              window.location.href = checkoutData.url;
              return;
            } else {
              throw new Error('No checkout URL received');
            }
          } else if (redirect === 'pricing') {
            navigate('/');
          } else if (redirect) {
            navigate(`/${redirect}`);
          } else {
            navigate('/dashboard');
          }
        } else {
          // If there's no session, the authentication may have failed
          throw new Error("Authentication failed. No session established.");
        }
      } catch (error: any) {
        console.error('Auth callback error:', error);
        shadcnToast({
          title: 'Authentication Error',
          description: error.message || 'Failed to complete authentication',
          variant: 'destructive',
        });
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate, redirect, shadcnToast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper-dark">
      <div className="w-full max-w-md p-8 space-y-6 bg-paper shadow-md rounded-sm border border-newsprint/10 text-center">
        <h2 className="text-2xl font-bold font-display">
          {loading ? 'Completing Sign In...' : 'Sign In Complete'}
        </h2>
        {loading && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-newsprint-red"></div>
          </div>
        )}
        <p className="text-newsprint-light">
          {loading 
            ? 'Please wait while we authenticate your account...'
            : 'Redirecting you...'}
        </p>
      </div>
    </div>
  );
};

export default AuthCallback; 
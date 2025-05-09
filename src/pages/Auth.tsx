import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authCheckLoading, setAuthCheckLoading] = useState(true);

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      setAuthCheckLoading(true);
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Error getting session:", sessionError);
        setAuthCheckLoading(false);
        return;
      }

      if (sessionData.session) {
        const user = sessionData.session.user;
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('name, title, goals, onboarding_complete, subscription_status')
            .eq('user_id', user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Profile fetch error on Auth page:', profileError);
            setAuthCheckLoading(false);
            return;
          }

          if (!profile || profile.onboarding_complete === false) {
            navigate('/account');
          } else if (profile && profile.onboarding_complete === true) {
            navigate('/dashboard');
          } else {
            navigate('/account');
          }
        } catch (e) {
          console.error("Error during profile check/redirect on Auth page:", e);
          setAuthCheckLoading(false);
        }
      } else {
        setAuthCheckLoading(false);
      }
    };

    checkSessionAndRedirect();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      
      if (!data.url) {
        throw new Error('No redirect URL received from Google authentication');
      }
    } catch (error: any) {
      console.error('Google auth error:', error);
      toast.error(error.message || 'An error occurred during Google authentication');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper-dark">
      {authCheckLoading ? (
        <div className="flex flex-col items-center justify-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-newsprint-red mb-4"></div>
          <p>Checking authentication status...</p>
        </div>
      ) : (
        <div className="w-full max-w-md p-8 space-y-6 bg-paper shadow-md rounded-sm border border-newsprint/10">
          <div className="space-y-2 text-center">
            <h1 className="font-display text-3xl font-extrabold">Sign In</h1>
            <p className="text-newsprint-light">Continue with your Google account</p>
          </div>
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              <path d="M1 1h22v22H1z" fill="none"/>
            </svg>
            {isSubmitting ? "Processing..." : "Continue with Google"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Auth;

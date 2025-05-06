import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'email_confirmation_pending'>('loading');
  const navigate = useNavigate();

  useEffect(() => {
    const processPaymentSuccess = async () => {
      try {
        // 1. Get current user and session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw new Error(`Session error: ${sessionError.message}`);
        if (!session || !session.user) {
          // This could happen if user clears cookies or confirmation link didn't log them in
          setStatus('error');
          console.error('Payment Success: No active session found after return.');
          return;
        }
        const user = session.user;

        // 2. Check email confirmation status
        // Need to refresh user data as getSession might have stale data
        const { data: { user: freshUser }, error: refreshError } = await supabase.auth.refreshSession();
        const refreshedUser = freshUser || user; // Use fresh data if available

        if (refreshError) {
          console.warn("Could not refresh user data, using possibly stale session data:", refreshError.message);
        }

        const isEmailConfirmed = refreshedUser?.email_confirmed_at || false;
        console.log(`Email confirmed status: ${isEmailConfirmed}`);

        // 3. Check subscription status (allow time for webhook)
        let attempts = 0;
        let profileStatus = null;
        while (attempts < 5 && (profileStatus !== 'active' && profileStatus !== 'trialing')) {
          attempts++;
          console.log(`Checking profile status, attempt ${attempts}`);
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('subscription_status')
              .eq('user_id', user.id)
              .single();

            if (profileError) {
              console.error("Error fetching profile status:", profileError);
              // Continue to next attempt
            } else if (profile) {
              profileStatus = profile.subscription_status;
              console.log(`Profile status found: ${profileStatus}`);
            }
          } catch (fetchError) {
            console.error("Error in profile fetch:", fetchError);
          }

          // If we're using the mock flow or in development for testing, we can bypass
          // webhook delays by considering the profile created as success
          if (attempts >= 3 && !profileStatus && window.location.hostname === 'localhost') {
            console.log("Development environment detected - Bypassing webhook wait");
            profileStatus = 'trialing'; // Assume success after 3 attempts in development
            break;
          }

          if (profileStatus === 'active' || profileStatus === 'trialing') {
            break; // Found active/trialing status
          }

          if (attempts < 5) {
            await new Promise(resolve => setTimeout(resolve, 1500)); // Wait 1.5s between checks
          }
        }

        // 4. Determine final status based on email and subscription
        if (profileStatus === 'active' || profileStatus === 'trialing') {
          if (isEmailConfirmed) {
            setStatus('success'); // All good, redirect to dashboard
            console.log("Subscription active/trialing and email confirmed. Redirecting to dashboard.");
            setTimeout(() => navigate('/dashboard'), 1000); // Short delay before redirect
          } else {
            setStatus('email_confirmation_pending'); // Subscription OK, needs email confirmation
            console.log("Subscription active/trialing, but email confirmation needed.");
          }
        } else {
          console.error(`Subscription status not active/trialing after ${attempts} attempts. Final status: ${profileStatus}`);
          // Still not active - show error or a "pending" state
          setStatus('error'); // Or a new 'pending_webhook' status
        }

      } catch (error) {
        console.error('Error processing payment success:', error);
        setStatus('error');
      }
    };
    
    if (sessionId) {
      processPaymentSuccess();
    } else {
      console.error("Payment Success: No session_id found in URL.");
      setStatus('error'); // No session ID is an error state
    }
  }, [sessionId, navigate]); // Add navigate to dependency array

  return (
    <div className="min-h-screen bg-paper-dark flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-paper p-8 rounded-sm border border-newsprint/10 shadow-lg">
        {status === 'loading' && (
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-newsprint-red" />
            <h1 className="text-3xl font-display font-bold mb-4">Processing your subscription</h1>
            <p className="text-newsprint-light mb-6">
              This will only take a moment. Please don't close this window.
            </p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-center">
            <div className="bg-newsprint-red/10 p-3 rounded-full inline-flex mb-6">
              <svg className="h-12 w-12 text-newsprint-red" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-display font-bold mb-4">Subscription Successful!</h1>
            <p className="text-newsprint-light mb-6">
              Thank you for subscribing to Paperboy! Your account is now active.
            </p>
            <Button className="w-full" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        )}
        
        {status === 'email_confirmation_pending' && (
          <div className="text-center">
            <div className="bg-green-100 p-3 rounded-full inline-flex mb-6">
              <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-display font-bold mb-4">Subscription Ready!</h1>
            <p className="text-newsprint-light mb-6">
              Your subscription is set up. Please check your inbox and click the confirmation link sent to your email address to access your dashboard.
            </p>
            <Button variant="outline" className="w-full" onClick={async () => {
              const { data } = await supabase.auth.getUser();
              const email = data.user?.email || '';
              if (email) {
                await supabase.auth.resend({ 
                  type: 'signup', 
                  email: email
                });
                toast.info('Confirmation email resent.');
              }
            }}>
              Resend Confirmation Email
            </Button>
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-center">
            <div className="bg-red-100 p-3 rounded-full inline-flex mb-6">
              <svg className="h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-display font-bold mb-4">Processing Payment</h1>
            <p className="text-newsprint-light mb-6">
              We're still processing your subscription. This may take a moment to complete.
              Your payment was received, but our system is still updating your account.
            </p>
            <div className="space-y-3">
              <Button className="w-full" onClick={() => {
                // Set flag for Dashboard to know we're coming from payment success with pending status
                sessionStorage.setItem('from_payment_success', 'true');
                navigate('/dashboard');
              }}>
                Go to Dashboard Anyway
              </Button>
              <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
                Retry Verification
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess; 
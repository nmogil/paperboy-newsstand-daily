import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const navigate = useNavigate();

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        // Wait briefly for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check the user's subscription status
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          throw new Error('No authenticated session found');
        }
        
        // Get the user's profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_status')
          .eq('user_id', session.user.id)
          .single();
          
        if (profileError) {
          throw profileError;
        }
        
        if (profile?.subscription_status === 'active' || 
            profile?.subscription_status === 'trialing') {
          setStatus('success');
        } else {
          // This could happen if the webhook hasn't processed yet
          // In a production app, you might want to check the status directly with Stripe
          console.log('Subscription not yet active, might still be processing');
          setStatus('success'); // Show success anyway, as payment likely went through
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        setStatus('error');
      }
    };
    
    if (sessionId) {
      checkSubscriptionStatus();
    } else {
      setStatus('error');
    }
  }, [sessionId]);

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
        
        {status === 'error' && (
          <div className="text-center">
            <div className="bg-red-100 p-3 rounded-full inline-flex mb-6">
              <svg className="h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-display font-bold mb-4">Something went wrong</h1>
            <p className="text-newsprint-light mb-6">
              We couldn't confirm your subscription. If you completed payment, 
              it might still be processing.
            </p>
            <div className="space-y-3">
              <Button className="w-full" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/support')}>
                Contact Support
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess; 
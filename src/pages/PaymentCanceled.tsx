import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const PaymentCanceled = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-paper-dark flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-paper p-8 rounded-sm border border-newsprint/10 shadow-lg text-center">
        <div className="bg-yellow-100 p-3 rounded-full inline-flex mb-6">
          <svg className="h-12 w-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h1 className="text-3xl font-display font-bold mb-4">Payment Canceled</h1>
        <p className="text-newsprint-light mb-6">
          Your attempt to set up a subscription was canceled. No payment was processed.
          You can try again or contact support if you faced any issues.
        </p>
        <div className="space-y-3">
          <Button className="w-full btn-primary" onClick={() => navigate('/onboarding')}>
            Retry Subscription Setup
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
            Go to Homepage
          </Button>
          <p className="text-sm text-newsprint-light pt-2">
            If you need help, please <a href="mailto:support@example.com" className="underline">contact support</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCanceled; 
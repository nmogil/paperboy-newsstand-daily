import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const PaymentCanceled = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-paper-dark flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-paper p-8 rounded-sm border border-newsprint/10 shadow-lg text-center">
        <div className="bg-gray-100 p-3 rounded-full inline-flex mb-6">
          <svg className="h-12 w-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-3xl font-display font-bold mb-4">Subscription Canceled</h1>
        <p className="text-newsprint-light mb-6">
          Your subscription process was canceled. No charges have been made.
        </p>
        <div className="space-y-3">
          <Button className="w-full" onClick={() => navigate('/#pricing')}>
            Return to Pricing
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
            Go to Homepage
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCanceled; 
import { Check, ArrowRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Pricing = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    
    checkAuth();
  }, []);
  
  const features = [
    "Daily research paper recommendations",
    "AI-powered content curation",
    "Full-text access to papers",
    "Expert summaries and highlights",
    "Career advancement insights",
    "Downloadable PDF archives",
    "Weekly research trend reports",
    "Reading history and bookmarks"
  ];
  
  const handleSubscribeClick = async () => {
    setIsLoading(true);
    
    try {
      // Check if the user is logged in
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        // If not logged in, redirect to auth page
        window.location.href = '/auth?mode=signup&redirect=pricing';
        return;
      }
      
      // User is logged in, create a checkout session
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ovnpankwmmrmhqkxsqqq.supabase.co';
      
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }
      
      const data = await response.json();
      
      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Could not initiate subscription',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };
  
  return (
    <section id="pricing" className="py-20 bg-paper-dark">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-8">
          <h2 className="newspaper-headline">Subscribe to Paperboy</h2>
          <p className="text-xl text-newsprint-light">
            One simple plan. Cancel anytime.
          </p>
        </div>
        
        {!isLoggedIn && (
          <div className="max-w-lg mx-auto mb-8">
            <Alert className="bg-newsprint-light/10 border-newsprint/20">
              <Info className="h-4 w-4 text-newsprint-red" />
              <AlertDescription>
                You'll need to create an account or log in to complete your subscription.
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <div className="max-w-lg mx-auto">
          <div className="relative group perspective-1000">
            {/* Stack layers that appear on hover - creating a uniform fan effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 origin-bottom 
                            group-hover:translate-y-6 group-hover:-translate-x-6 bg-paper border border-newsprint/10 
                            rounded-sm group-hover:-rotate-6 shadow-md transform scale-[0.97]" />
            
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 origin-bottom 
                            group-hover:translate-y-3 group-hover:-translate-x-3 bg-paper border border-newsprint/10 
                            rounded-sm group-hover:-rotate-3 shadow-md transform scale-[0.98]" />
            
            {/* Main card */}
            <div className="relative bg-paper border border-newsprint/10 rounded-sm shadow-xl overflow-hidden 
                           transform transition-all duration-300 group-hover:rotate-1 group-hover:scale-[1.01] 
                           group-hover:translate-y-1 group-hover:translate-x-1 z-10">
              <div className="p-8 border-b border-newsprint/10">
                <h3 className="font-display text-3xl font-bold text-center mb-2">Premium Subscription</h3>
                <div className="flex justify-center items-baseline mb-4">
                  <span className="text-5xl font-display font-bold">$20</span>
                  <span className="text-xl text-newsprint-light ml-1">/month</span>
                </div>
                
                <Button 
                  className="btn-subscribe w-full mt-6" 
                  onClick={handleSubscribeClick}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Subscribe Now'}
                  {!isLoading && <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />}
                </Button>
                
                <p className="text-center text-newsprint/60 text-sm mt-4">
                  Billed monthly. Cancel anytime.
                </p>
              </div>
              
              <div className="p-8">
                <h4 className="font-display text-lg font-bold mb-4 text-center">Everything you need to stay informed:</h4>
                <ul className="space-y-3">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-newsprint-red/10 flex items-center justify-center mr-3">
                        <Check className="h-4 w-4 text-newsprint-red" />
                      </div>
                      <span className="text-newsprint-light">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-newsprint-accent/5 p-6 text-center">
                <p className="font-medium">
                  Not ready to commit? <Link to="/auth?mode=signup" className="text-newsprint-red">Try a 7-day free trial</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;

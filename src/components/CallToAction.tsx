import { Button } from '@/components/ui/button';
import { Mail, ArrowRight, Check, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserCount } from '@/hooks/useUserCount';

const CallToAction = () => {
  const userCount = useUserCount();

  return (
    <section className="py-20 bg-newsprint text-paper relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block px-4 py-1 bg-newsprint-red text-paper rounded-full text-sm font-bold mb-4">
            Limited Time Offer
          </span>
          
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 text-paper">
            Join{' '}
            <span className="relative inline-flex items-center gap-2 bg-newsprint-red text-paper px-3 py-1 rounded-lg">
              <Activity className="h-4 w-4 text-paper animate-pulse" />
              <span className="animate-[pulse_2s_ease-in-out_infinite]">
                {userCount.toLocaleString()}+
              </span>
            </span>
            {' '}Researchers Who Trust Paperboy
          </h2>
          
          <p className="text-xl mb-8 text-paper-aged">
            Get personalized research papers delivered daily and stay ahead in your field.
          </p>
          
          <div className="grid sm:grid-cols-2 gap-8 max-w-2xl mx-auto mb-12 text-left">
            {[
              'AI-powered content curation',
              'Full-text access to papers',
              'Daily research recommendations',
              'Weekly trend insights',
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-paper/10 flex items-center justify-center">
                  <Check className="h-4 w-4 text-paper" />
                </div>
                <span className="text-paper-aged">{feature}</span>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              className="bg-newsprint-red hover:bg-newsprint-red/90 text-white px-8 py-6 text-lg flex items-center justify-center group"
              asChild
            >
              <Link to="/auth?mode=signup">
                Start Your Free Trial
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-8 text-paper-aged">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              <span>7-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-paper-aged"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-paper-aged"></div>
      </div>
    </section>
  );
};

export default CallToAction;

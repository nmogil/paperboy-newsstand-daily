
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

const CallToAction = () => {
  return (
    <section className="py-20 bg-newsprint text-paper relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 text-paper">
            Never Miss Important Research Again
          </h2>
          
          <p className="text-xl mb-8 text-paper-aged">
            Join thousands of professionals who start their day with Paperboy's curated research digest.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button className="bg-newsprint-red hover:bg-newsprint-red/90 text-white px-8 py-6 text-lg flex items-center justify-center">
              <Mail className="mr-2" size={20} />
              Start Your Subscription
            </Button>
            
            <Button variant="outline" className="border-paper-aged text-paper hover:bg-newsprint-light px-8 py-6 text-lg">
              Learn More
            </Button>
          </div>
          
          <p className="mt-6 text-paper-aged text-sm">
            Start with a 7-day free trial. Cancel anytime.
          </p>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-paper-aged"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-paper-aged"></div>
      </div>
    </section>
  );
};

export default CallToAction;

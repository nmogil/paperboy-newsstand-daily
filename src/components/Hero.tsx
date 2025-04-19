
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarDays, Mail, Star } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative pt-16 pb-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-paper-texture p-8">
          {/* Masthead */}
          <div className="text-center border-b-2 border-newsprint pb-6 mb-8">
            <p className="text-sm font-mono mb-2">Vol. 1 No. 1 - Est. 2025</p>
            <h1 className="text-6xl md:text-8xl font-black font-display tracking-tight mb-2">
              THE DAILY RESEARCHER
            </h1>
            <p className="text-lg font-serif italic">
              "Delivering Knowledge to Your Doorstep"
            </p>
          </div>

          {/* Main Story */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div>
              <h2 className="font-display text-4xl font-bold leading-tight mb-4">
                BREAKTHROUGH: AI-Powered Research Papers Now Delivered Daily
              </h2>
              <div className="flex items-center gap-2 text-sm mb-4 font-mono">
                <CalendarDays className="w-4 h-4" />
                <span>April 19, 2025</span>
                <span className="mx-2">|</span>
                <Star className="w-4 h-4" />
                <span>Featured Story</span>
              </div>
              <p className="text-lg leading-relaxed mb-6 first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1">
                In a groundbreaking development, researchers have unveiled a revolutionary 
                service that delivers personalized academic papers directly to subscribers. 
                This innovative platform promises to transform how professionals stay 
                informed in their fields.
              </p>
            </div>

            {/* Subscription Box */}
            <div className="bg-paper-aged p-6 border-2 border-newsprint">
              <div className="text-center mb-6">
                <Mail className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-2xl font-display font-bold mb-2">
                  SPECIAL SUBSCRIPTION OFFER
                </h3>
                <p className="text-lg mb-4">
                  $20/month for daily curated research papers
                </p>
                <p className="text-sm italic mb-6">
                  *Limited time introductory price
                </p>
              </div>

              <form className="space-y-4">
                <Input 
                  type="email" 
                  placeholder="Enter your email address"
                  className="h-12 text-lg bg-paper border-2 border-newsprint focus:ring-2 focus:ring-newsprint"
                />
                <Button 
                  className="w-full h-12 text-xl font-bold bg-newsprint hover:bg-newsprint/90 text-paper"
                  onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Subscribe Now
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

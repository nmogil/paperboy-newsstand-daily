import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarDays, Mail, Star, ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative pt-16 pb-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-paper-texture p-8 animate-fade-in">
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
                Transform Your Research Journey with AI-Powered Daily Insights
              </h2>
              <div className="flex items-center gap-2 text-sm mb-4 font-mono">
                <CalendarDays className="w-4 h-4" />
                <span>April 19, 2025</span>
                <span className="mx-2">|</span>
                <Star className="w-4 h-4" />
                <span>Featured Story</span>
              </div>
              <p className="text-lg leading-relaxed mb-6 first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1">
                Stay ahead of your field with personalized research papers delivered daily. 
                Join thousands of professionals who trust our AI-powered platform to curate 
                the most relevant academic content.
              </p>
              
              {/* Added Benefits List */}
              <ul className="space-y-3 mb-6">
                {[
                  'Tailored to your research interests',
                  'Save hours of manual searching',
                  'Never miss important papers',
                ].map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2 text-newsprint-light">
                    <Check className="w-5 h-5 text-newsprint-red" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Subscription Box */}
            <div className="bg-paper-aged p-8 border-2 border-newsprint shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-center mb-6">
                <div className="bg-newsprint-red inline-flex items-center justify-center p-2 rounded-full mb-4">
                  <Mail className="w-8 h-8 text-paper" />
                </div>
                <h3 className="text-2xl font-display font-bold mb-2">
                  SPECIAL OFFER
                </h3>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-3xl font-display font-bold">$10</span>
                  <span className="text-xl text-newsprint-light">/month</span>
                </div>
                <p className="text-newsprint-red font-bold mb-2">
                  Subscribe now for unlimited access
                </p>
              </div>

              <form className="space-y-4">
                <Input 
                  type="email" 
                  placeholder="Enter your email address"
                  className="h-12 text-lg bg-paper border-2 border-newsprint focus:ring-2 focus:ring-newsprint-red focus:border-newsprint-red"
                />
                <Button 
                  className="w-full h-12 text-xl font-bold bg-newsprint-red hover:bg-newsprint-red/90 text-paper group transition-all duration-300"
                  asChild
                >
                  <Link to="/auth?mode=signup">
                    Subscribe Now
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
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

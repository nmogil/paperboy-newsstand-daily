
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <section className="relative pt-16 pb-20 overflow-hidden">
      {/* Background paper texture */}
      <div className="absolute inset-0 bg-paper-texture opacity-30 pointer-events-none"></div>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="newspaper-date mb-4">
            ISSUE NO. 001 • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          
          <h1 className="newspaper-headline animate-fade-in">
            Research Papers Tailored to Your Career, Delivered Daily
          </h1>
          
          <div className="newspaper-subheading">
            Never miss groundbreaking research in your field
          </div>
          
          <p className="newspaper-lead mb-8 md:text-xl max-w-2xl mx-auto">
            Paperboy delivers personalized academic research papers straight to your inbox, 
            curated by AI to match your career path and professional goals.
            Stay ahead in your field without the endless searching.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button 
              className="btn-subscribe w-full sm:w-auto text-center"
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Subscribe for $20/month
            </Button>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto text-center border-newsprint/20 hover:bg-paper-dark"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn How It Works
            </Button>
          </div>
          
          <div className="animate-bounce mt-8">
            <ChevronDown className="mx-auto text-newsprint/50" size={32} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;


import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Hero = () => {
  return (
    <section className="relative pt-16 pb-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-paper-aged p-8 border-4 border-newsprint">
          {/* Decorative Frame Header */}
          <div className="border-2 border-newsprint mb-8">
            <h1 className="text-4xl md:text-6xl font-black text-center py-4 px-8 border-b-2 border-newsprint">
              PAPERBOY
            </h1>
            <div className="text-center py-2 text-lg font-bold">
              PERSONALIZED RESEARCH PAPERS
              <br />
              SENT TO YOUR INBOX DAILY
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
            {/* Paperboy Character */}
            <div className="w-40 h-40 flex-shrink-0">
              <img 
                src="/lovable-uploads/fce17eb1-4971-4580-aceb-f6ef956173cd.png" 
                alt="Paperboy Character"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Text Content */}
            <div className="flex-grow text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                Stay informed with new research papers tailored to your career and goals
              </h2>
            </div>
          </div>

          {/* Sign Up Section */}
          <div className="text-center mb-8">
            <p className="text-xl mb-6">
              Sign up for just $20/month and receive curated papers right to your inbox every day.
            </p>

            <form className="max-w-md mx-auto space-y-4">
              <Input 
                type="email" 
                placeholder="Email address"
                className="w-full h-12 text-lg bg-paper border-2 border-newsprint focus:ring-2 focus:ring-newsprint"
              />
              <Button 
                className="w-full h-12 text-xl font-bold bg-newsprint hover:bg-newsprint/90 text-paper transition-colors"
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Sign Up
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;


import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative pt-10 pb-14 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* VINTAGE NEWSPAPER MASTHEAD */}
        <div className="masthead-border py-6 px-3 rounded-t-lg shadow-md bg-paper-texture text-center relative mb-8 border-2 border-[#cab97d]">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-mono tracking-widest italic text-[#1A1F2C]/70">NY</span>
            <span className="text-xs font-mono tracking-widest italic text-[#1A1F2C]/70">
              Est. <span className="underline">2025</span>
            </span>
          </div>
          <div>
            <h1 className="vintage-headline">THE DAILY RESEARCHER</h1>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-mono tracking-widest text-[#1A1F2C]/70">100 &#162;</span>
            <span className="text-xs font-mono tracking-widest text-[#1A1F2C]/70">Vol. 1 No. 1</span>
          </div>
        </div>

        {/* Tagline Section */}
        <div className="text-center pb-3 -mt-2">
          <div className="vintage-border-label mb-1">Family Library</div>
          <p className="italic text-lg text-newsprint-light font-serif tracking-normal mb-2">
            "For the distinguished reader or the particularly wealthy dunder-head."
          </p>
        </div>
        <hr className="vintage-divider" />

        {/* Welcome sub-headline */}
        <div className="max-w-3xl mx-auto mb-8 text-center">
          <h2 className="font-headline text-2xl md:text-4xl text-[#191414] tracking-widest mb-4" style={{ letterSpacing: '0.12em' }}>
            Curated Academic Newsletters Delivered With 19th-Century Flair
          </h2>
          <span className="block text-base text-muted-foreground mb-2">
            Save hours of manual searching — join the AI-powered library for daily discoveries.
          </span>
        </div>

        {/* Subscription CTA */}
        <div className="flex flex-col items-center mx-auto bg-[#ede3c5] border-2 border-[#cab97d] rounded-lg shadow-lg p-8 max-w-lg">
          <div className="mb-2">
            <span className="block font-headline text-xl md:text-2xl uppercase tracking-widest" style={{ letterSpacing: '0.15em' }}>
              LIMITED TIME OFFER
            </span>
            <span className="block font-mono text-3xl font-bold text-[#1a1f2c] pt-1 pb-0">Only $20 <span className="text-base font-medium">/ month</span></span>
            <span className="block text-sm text-newsprint-light italic pb-2">*Save 50% - Regular $40/mo</span>
          </div>
          <Button className="w-full mt-3 text-lg font-bold bg-[#cab97d] text-[#181410] hover:bg-[#e6dcc3] border-2 border-[#1A1F2C] uppercase tracking-wider" asChild>
            <Link to="/auth?mode=signup">Start Your Free Trial</Link>
          </Button>
          <span className="block text-xs font-mono text-[#85755c] mt-4">No credit card required • Cancel anytime</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;

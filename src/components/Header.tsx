
import { useState } from 'react';
import { Menu, X, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-paper bg-paper-texture border-b border-newsprint/10 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="font-display text-4xl font-black tracking-tighter text-newsprint">
            <span className="text-newsprint-red">P</span>aperboy
          </div>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="font-medium no-underline hover:text-newsprint-red transition-colors">Features</a>
          <a href="#how-it-works" className="font-medium no-underline hover:text-newsprint-red transition-colors">How It Works</a>
          <a href="#pricing" className="font-medium no-underline hover:text-newsprint-red transition-colors">Pricing</a>
          <a href="#faq" className="font-medium no-underline hover:text-newsprint-red transition-colors">FAQ</a>
          <Button className="bg-newsprint text-paper hover:bg-newsprint-light">Sign In</Button>
        </nav>

        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 focus:outline-none" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-paper p-4 border-t border-newsprint/10 animate-slide-up">
          <nav className="flex flex-col space-y-4">
            <a href="#features" className="p-2 font-medium no-underline hover:bg-paper-dark rounded" onClick={() => setIsMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className="p-2 font-medium no-underline hover:bg-paper-dark rounded" onClick={() => setIsMenuOpen(false)}>How It Works</a>
            <a href="#pricing" className="p-2 font-medium no-underline hover:bg-paper-dark rounded" onClick={() => setIsMenuOpen(false)}>Pricing</a>
            <a href="#faq" className="p-2 font-medium no-underline hover:bg-paper-dark rounded" onClick={() => setIsMenuOpen(false)}>FAQ</a>
            <Button className="bg-newsprint text-paper hover:bg-newsprint-light w-full">Sign In</Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

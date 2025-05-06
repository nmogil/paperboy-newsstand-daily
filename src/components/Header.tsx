import { useState, useEffect } from 'react';
import { Menu, X, Github, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };

    checkSession();

    // Subscribe to auth state changes
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    navigate('/');
  };

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
          {!isAuthenticated ? (
            <>
              <a href="#features" className="font-medium no-underline hover:text-newsprint-red transition-colors">Features</a>
              <a href="#how-it-works" className="font-medium no-underline hover:text-newsprint-red transition-colors">How It Works</a>
              <a href="#pricing" className="font-medium no-underline hover:text-newsprint-red transition-colors">Pricing</a>
              <a href="#faq" className="font-medium no-underline hover:text-newsprint-red transition-colors">FAQ</a>
              <a 
                href="https://github.com/nmogil/paperboy" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-medium no-underline hover:text-newsprint-red transition-colors flex items-center gap-1"
              >
                <Github size={18} />
                <span>GitHub</span>
              </a>
              <Button className="bg-newsprint text-paper hover:bg-newsprint-light" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" className="font-medium hover:text-newsprint-red transition-colors" asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="ghost" className="font-medium hover:text-newsprint-red transition-colors" asChild>
                <Link to="/onboarding">Profile</Link>
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-1"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </Button>
            </>
          )}
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
            {!isAuthenticated ? (
              <>
                <a href="#features" className="p-2 font-medium no-underline hover:bg-paper-dark rounded" onClick={() => setIsMenuOpen(false)}>Features</a>
                <a href="#how-it-works" className="p-2 font-medium no-underline hover:bg-paper-dark rounded" onClick={() => setIsMenuOpen(false)}>How It Works</a>
                <a href="#pricing" className="p-2 font-medium no-underline hover:bg-paper-dark rounded" onClick={() => setIsMenuOpen(false)}>Pricing</a>
                <a href="#faq" className="p-2 font-medium no-underline hover:bg-paper-dark rounded" onClick={() => setIsMenuOpen(false)}>FAQ</a>
                <a 
                  href="https://github.com/nmogil/paperboy" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 font-medium no-underline hover:bg-paper-dark rounded flex items-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Github size={18} />
                  <span>GitHub</span>
                </a>
                <Button className="bg-newsprint text-paper hover:bg-newsprint-light w-full" asChild>
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" className="text-left p-2 font-medium" asChild>
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                </Button>
                <Button variant="ghost" className="text-left p-2 font-medium" asChild>
                  <Link to="/onboarding" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut size={16} className="mr-2" />
                  <span>Sign Out</span>
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

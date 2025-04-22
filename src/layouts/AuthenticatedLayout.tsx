
import React from 'react';
import { Home, Settings, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const AuthenticatedLayout = ({ children }: AuthenticatedLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-paper">
      <nav className="sticky top-0 z-50 w-full border-b border-newsprint/10 bg-paper bg-paper-texture">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="font-display text-2xl font-black tracking-tighter text-newsprint">
                <span className="text-newsprint-red">P</span>aperboy
              </div>
              
              <div className="ml-8 hidden md:flex items-center space-x-4">
                <Button 
                  variant={location.pathname === '/dashboard' ? 'default' : 'ghost'} 
                  size="sm"
                  asChild
                >
                  <Link to="/dashboard" className="flex items-center gap-2">
                    <Home size={18} />
                    <span>Dashboard</span>
                  </Link>
                </Button>
                
                <Button 
                  variant={location.pathname === '/onboarding' ? 'default' : 'ghost'} 
                  size="sm"
                  asChild
                >
                  <Link to="/onboarding" className="flex items-center gap-2">
                    <User size={18} />
                    <span>Profile</span>
                  </Link>
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
              >
                Log Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default AuthenticatedLayout;

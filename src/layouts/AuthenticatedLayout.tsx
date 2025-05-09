import React, { useEffect } from 'react';
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
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      setIsLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session in AuthenticatedLayout:", error);
        toast.error("Session error, please log in again.");
        navigate('/auth');
        return;
      }

      if (!session) {
        toast.info('Please log in to access this page.');
        navigate('/auth');
        return;
      }

      const user = session.user;
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('onboarding_complete, name, title, goals')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('AuthenticatedLayout: Profile fetch error:', profileError.message);
        toast.error('Error fetching your profile. Please try logging in again.');
        navigate('/auth');
        return;
      }

      setIsLoading(false);
    };

    checkAuthAndRedirect();
  }, [navigate, location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    navigate('/auth');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-newsprint-red"></div>
        <p className="ml-4 text-lg">Loading...</p>
      </div>
    );
  }

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
                  variant={location.pathname === '/account' ? 'default' : 'ghost'}
                  size="sm"
                  asChild
                >
                  <Link to="/account" className="flex items-center gap-2">
                    <Settings size={18} />
                    <span>Account Settings</span>
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

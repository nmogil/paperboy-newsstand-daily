import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import NewsStand from '@/components/NewsStand';
import Pricing from '@/components/Pricing';
import Faq from '@/components/Faq';
import CallToAction from '@/components/CallToAction';
import Footer from '@/components/Footer';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Error getting session on Index page:", sessionError);
        return; // Stay on index page if error
      }

      if (sessionData.session) {
        const user = sessionData.session.user;
        try {
          // NOTE: If you encounter TypeScript errors about properties not existing on 'profile',
          // please ensure your Supabase generated types are up-to-date after schema changes.
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('onboarding_complete') // Only need this flag here
            .eq('user_id', user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Profile fetch error on Index page:', profileError);
            return; // Stay on index if profile fetch fails
          }

          if (profile && profile.onboarding_complete === true) {
            navigate('/dashboard');
          } else {
            // If profile doesn't exist, or onboarding is not complete (false or null)
            // User should go through onboarding. If they are on Index, this implies they might be trying to bypass.
            // Or they are an existing user who hasn't completed new onboarding flow.
            // Navigating to /onboarding ensures they complete it.
            navigate('/onboarding');
          }
        } catch (e) {
          console.error("Error during profile check/redirect on Index page:", e);
          // Stay on index page if error
        }
      } else {
        // No session, user stays on Index page (public marketing page)
      }
    };

    checkSessionAndRedirect();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Header />
      <main>
        <Hero />
        <Features />
        <NewsStand />
        <Pricing />
        <Faq />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

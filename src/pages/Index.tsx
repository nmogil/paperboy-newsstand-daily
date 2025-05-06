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
    // Check if user is logged in, if so redirect to dashboard
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/dashboard');
      }
    };

    checkSession();
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

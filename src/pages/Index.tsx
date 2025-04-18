
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import NewsStand from '@/components/NewsStand';
import Pricing from '@/components/Pricing';
import Faq from '@/components/Faq';
import CallToAction from '@/components/CallToAction';
import Footer from '@/components/Footer';
import SupabaseNote from '@/components/SupabaseNote';

const Index = () => {
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
      <SupabaseNote />
    </div>
  );
};

export default Index;

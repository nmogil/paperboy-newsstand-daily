import React from 'react';
import Pricing from '@/components/Pricing';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Subscribe = () => {
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-10">
          <h1 className="newspaper-headline text-center mb-6">Choose Your Paperboy Subscription</h1>
          <p className="text-xl text-center text-newsprint-light max-w-2xl mx-auto mb-12">
            Get access to the latest research papers tailored to your interests and career goals.
          </p>
        </div>
        <Pricing />
      </main>
      <Footer />
    </div>
  );
};

export default Subscribe; 
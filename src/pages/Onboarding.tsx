import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { useToast as useShadcnToast } from "@/hooks/use-toast"; // For checkout errors

type OnboardingFormData = {
  name: string;
  title: string;
  goals: string;
};

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast: shadcnToast } = useShadcnToast(); // For checkout errors
  const [isSubmitting, setIsSubmitting] = useState(false); // Add loading state
  const form = useForm<OnboardingFormData>({
    defaultValues: {
      name: '',
      title: '',
      goals: ''
    }
  });

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        // Should not happen if they just signed up, but good practice
        toast.error('Authentication error. Please log in again.');
        navigate('/auth');
        setIsSubmitting(false);
        return;
      }
      const userId = session.user.id;

      // Update Profile first
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          title: data.title,
          goals: data.goals
          // DO NOT update status here, let webhook handle it
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Profile updated, now initiate checkout
      console.log("Profile updated, attempting to create checkout session...");

      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ovnpankwmmrmhqkxsqqq.supabase.co';
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          // No body needed if the function gets user from token
        }
      );

      console.log("Checkout session response status:", response.status);
      const responseData = await response.json();

      if (!response.ok) {
        console.error("Checkout session creation failed:", responseData);
        throw new Error(responseData.error || 'Failed to create checkout session.');
      }

      if (responseData.url) {
        console.log("Redirecting to Stripe:", responseData.url);
        window.location.href = responseData.url; // Redirect to Stripe
        // Don't setIsSubmitting(false) here as we are navigating away
      } else {
        throw new Error('No checkout URL received');
      }

    } catch (error: any) {
      console.error("Onboarding/Checkout initiation error:", error);
      toast.error(error.message || 'An error occurred during setup.');
      setIsSubmitting(false); // Stop loading on error
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="flex items-center justify-center">
        <div className="w-full max-w-lg p-8 space-y-6 bg-paper shadow-md rounded-sm border border-newsprint/10">
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
            <p className="font-bold">Account Created!</p>
            <p>Please complete your profile and subscription setup below. You'll need to confirm your email address afterwards to activate your account fully.</p>
          </div>
          <h2 className="text-2xl font-bold text-center font-display">
            Complete Your Paperboy Profile
          </h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: 'Name is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="title"
                rules={{ required: 'Title is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Title/Position</FormLabel>
                    <FormControl>
                      <Input placeholder="Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="goals"
                rules={{ required: 'Career goals are required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Career Goals</FormLabel>
                    <FormControl>
                      <Input placeholder="Become an AI research expert" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full btn-subscribe" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Proceed to Subscription"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Onboarding;

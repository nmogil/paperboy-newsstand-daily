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

  // Function to initiate checkout
  const initiateCheckout = async (accessToken: string) => {
    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ovnpankwmmrmhqkxsqqq.supabase.co';
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || 'Failed to create checkout session.');
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Checkout initiation error after onboarding:', error);
      shadcnToast({
        title: 'Checkout Error',
        description: error.message || 'Could not proceed to checkout automatically. Please visit the pricing page to subscribe.',
        variant: 'destructive',
      });
      navigate('/'); // Go home if checkout fails
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true); // Set loading state
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('No authenticated user found');
      }
      const userId = session.user.id;

      // Update Profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          title: data.title,
          goals: data.goals
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      toast.success('Profile updated successfully');

      // Instead of navigating to pricing, initiate checkout
      await initiateCheckout(session.access_token);
      // initiateCheckout handles redirect or error display
    } catch (error: any) {
      toast.error(error.message || 'An error occurred updating profile');
      setIsSubmitting(false); // Clear loading on error
    }
    // Don't clear loading on successful redirect
  };

  return (
    <AuthenticatedLayout>
      <div className="flex items-center justify-center">
        <div className="w-full max-w-md p-8 space-y-6 bg-paper shadow-md rounded-sm border border-newsprint/10">
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
              
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Continue to Subscription"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Onboarding;

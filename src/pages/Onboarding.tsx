import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';

type OnboardingFormData = {
  name: string;
  title: string;
  goals: string;
};

const Onboarding = () => {
  const navigate = useNavigate();
  const form = useForm<OnboardingFormData>({
    defaultValues: {
      name: '',
      title: '',
      goals: ''
    }
  });

  const onSubmit = async (data: OnboardingFormData) => {
    try {
      const session = await supabase.auth.getSession();
      const userId = session.data.session?.user.id;

      if (!userId) {
        throw new Error('No authenticated user found');
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          title: data.title,
          goals: data.goals
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Profile updated successfully');
      navigate('/#pricing');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    }
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
              
              <Button type="submit" className="w-full">
                Continue to Subscription
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Onboarding;

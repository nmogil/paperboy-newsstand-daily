
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

type AuthFormData = {
  email: string;
  password: string;
  name?: string;
};

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const form = useForm<AuthFormData>({
    defaultValues: {
      email: '',
      password: '',
      name: ''
    }
  });

  const onSubmit = async (data: AuthFormData) => {
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password
        });

        if (error) throw error;
        
        toast.success('Logged in successfully');
        navigate('/');
      } else {
        // For signup, make sure we're passing the name properly
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              name: data.name || '', // Ensure name is never undefined
            }
          }
        });

        if (error) throw error;
        
        toast.success('Account created successfully! Check your email for confirmation.');
        toast.info('You will be redirected to the onboarding page once confirmed.');
      }
    } catch (error: any) {
      console.error('Auth error:', error.message);
      toast.error(error.message || 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper bg-paper-texture">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-bold text-center">
          {isLogin ? 'Login to Paperboy' : 'Sign Up for Paperboy'}
        </h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!isLogin && (
              <FormField
                control={form.control}
                name="name"
                rules={{ required: !isLogin ? 'Name is required' : false }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="email"
              rules={{ 
                required: 'Email is required', 
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              rules={{ 
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters"
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full">
              {isLogin ? 'Log In' : 'Create Account'}
            </Button>
          </form>
        </Form>
        
        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin 
              ? 'Need an account? Sign Up' 
              : 'Already have an account? Log In'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;

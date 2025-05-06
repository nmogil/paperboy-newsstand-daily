import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useToast as useShadcnToast } from "@/hooks/use-toast";

type AuthFormData = {
  email: string;
  password: string;
};

const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const redirect = searchParams.get('redirect');
  
  const [isLogin, setIsLogin] = useState(mode !== 'signup');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast: shadcnToast } = useShadcnToast();
  const form = useForm<AuthFormData>({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  useEffect(() => {
    setIsLogin(mode !== 'signup');
  }, [mode]);

  useEffect(() => {
    // Redirect authenticated users to dashboard
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/dashboard');
      }
    };

    checkSession();
  }, [navigate]);

  const initiateCheckout = async (accessToken: string) => {
    setIsSubmitting(true);
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
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Checkout initiation error after login:', error);
      shadcnToast({
        title: 'Checkout Error',
        description: error.message || 'Could not proceed to checkout. Please try again from the pricing page.',
        variant: 'destructive',
      });
      navigate('/');
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: AuthFormData) => {
    setIsSubmitting(true);
    try {
      if (isLogin) {
        const { data: loginData, error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password
        });

        if (error) throw error;
        if (!loginData.session) throw new Error('Login session not found');
        
        toast.success('Logged in successfully');
        
        if (redirect === 'checkout') {
          await initiateCheckout(loginData.session.access_token);
          return;
        } else if (redirect === 'pricing') {
          navigate('/');
        } else if (redirect) {
          navigate(`/${redirect}`);
        } else {
          navigate('/dashboard');
        }
      } else {
        const { data: signUpData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        });

        if (error) {
          console.error('Signup error:', error);
          throw error;
        }

        if (signUpData.user) {
          navigate('/onboarding');
        } else {
          throw new Error("Signup completed but no user data returned.");
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || 'An error occurred during authentication');
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirect 
            ? `${window.location.origin}/auth/callback?redirect=${redirect}` 
            : `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      
      // If we get here without a redirect, there was an issue
      if (!data.url) {
        throw new Error('No redirect URL received from Google authentication');
      }
      
      // The user will be redirected to Google's OAuth page
    } catch (error: any) {
      console.error('Google auth error:', error);
      toast.error(error.message || 'An error occurred during Google authentication');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper-dark">
      <div className="w-full max-w-md p-8 space-y-6 bg-paper shadow-md rounded-sm border border-newsprint/10">
        <h2 className="text-2xl font-bold text-center font-display">
          {isLogin ? 'Login to Paperboy' : 'Sign Up for Paperboy'}
        </h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="********" 
                        {...field} 
                      />
                      <button 
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting
                ? "Processing..."
                : isLogin
                ? "Log In"
                : "Create Account"}
            </Button>
          </form>
        </Form>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-newsprint/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-paper px-2 text-newsprint-light">Or continue with</span>
          </div>
        </div>
        
        <Button 
          type="button" 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            <path d="M1 1h22v22H1z" fill="none"/>
          </svg>
          {isSubmitting ? "Processing..." : "Google"}
        </Button>
        
        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={() => {
              setIsLogin(!isLogin);
              const newMode = isLogin ? 'signup' : 'login';
              const newParams = new URLSearchParams(searchParams);
              newParams.set('mode', newMode);
              navigate(`/auth?${newParams.toString()}`);
            }}
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

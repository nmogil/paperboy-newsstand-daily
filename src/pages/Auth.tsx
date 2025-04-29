import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

type AuthFormData = {
  email: string;
  password: string;
  name?: string;
};

const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const redirect = searchParams.get('redirect');
  
  const [isLogin, setIsLogin] = useState(mode !== 'signup');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const form = useForm<AuthFormData>({
    defaultValues: {
      email: '',
      password: '',
      name: ''
    }
  });

  // Update mode when URL changes
  useEffect(() => {
    setIsLogin(mode !== 'signup');
  }, [mode]);

  const onSubmit = async (data: AuthFormData) => {
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password
        });

        if (error) throw error;
        
        toast.success('Logged in successfully');
        
        // Redirect to the specified redirect path or default
        if (redirect === 'pricing') {
          navigate('/subscribe');
        } else if (redirect) {
          navigate(`/${redirect}`);
        } else {
          navigate('/dashboard');
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              name: data.name || ''
            }
          }
        });

        if (error) {
          console.error('Signup error:', error);
          throw error;
        }
        
        toast.success('Account created successfully!');
        navigate('/onboarding');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || 'An error occurred during authentication');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper-dark">
      <div className="w-full max-w-md p-8 space-y-6 bg-paper shadow-md rounded-sm border border-newsprint/10">
        <h2 className="text-2xl font-bold text-center font-display">
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
            
            <Button type="submit" className="w-full">
              {isLogin ? 'Log In' : 'Create Account'}
            </Button>
          </form>
        </Form>
        
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


import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

type Profile = {
  id: string;
  user_id: string;
  email: string | null;
  name: string | null;
  title: string | null;
  goals: string | null;
  subscription_status: string;
};

const Dashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        navigate('/auth');
        return;
      }
      
      const userId = data.session.user.id;
      
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(profileData);
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Dashboard</h1>
          <Button variant="outline" onClick={handleLogout}>
            Log Out
          </Button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Name:</span> {profile?.name || 'Not set'}</p>
            <p><span className="font-medium">Email:</span> {profile?.email || 'Not set'}</p>
            <p><span className="font-medium">Title:</span> {profile?.title || 'Not set'}</p>
            <p><span className="font-medium">Goals:</span> {profile?.goals || 'Not set'}</p>
            <p><span className="font-medium">Subscription Status:</span> {profile?.subscription_status}</p>
          </div>
          <div className="mt-4">
            <Button onClick={() => navigate('/onboarding')}>
              Edit Profile
            </Button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Your Paper Recommendations</h2>
          <p className="text-gray-500">No recommendations yet. Stay tuned!</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

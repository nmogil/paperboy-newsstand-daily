import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
// import { Button } from '@/components/ui/button'; // Potentially remove if not used directly
// import { differenceInDays, parseISO } from 'date-fns'; // Remove if not used
// import { toast } from 'sonner'; // Remove if not used
// import { useToast as useShadcnToast } from "@/hooks/use-toast"; // Remove if not used

// The Profile type might be needed if we still fetch some basic user info here
// Or it could be a leaner type if only name/email is needed for a greeting.
// For now, let's assume basic auth check is sufficient.

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndFetchUser = async () => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        navigate("/auth");
        return;
      }
      
      // Optionally, fetch minimal user details like name if needed for a greeting
      const user = sessionData.session.user;
      // You might want to fetch from your 'profiles' table if you store names there
      // For simplicity, using email or a placeholder if name isn't directly on user object
      const { data: profileData } = await supabase
        .from("profiles")
        .select("name")
        .eq("user_id", user.id)
        .single();

      setUserName(profileData?.name || user.email || 'User');
      setLoading(false);
    };

    checkAuthAndFetchUser();
  }, [navigate]);

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto py-12 px-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-newsprint-red mx-auto"></div>
            <p className="mt-4 text-newsprint-light">Loading your dashboard...</p>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-newsprint-dark mb-8">Welcome to your Dashboard, {userName}!</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-newsprint-dark mb-4">Analytics</h2>
                <p className="text-newsprint-light">Your analytics will be displayed here soon.</p>
                {/* Placeholder for analytics components */}
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-newsprint-dark mb-4">Historical Newsletters</h2>
                <p className="text-newsprint-light">Links to your past newsletters will appear here.</p>
                {/* Placeholder for newsletter list */}
              </div>
            </div>
            
            {/* Example of a quick link to account settings, can be moved to header/sidebar */}
            {/* <div className="mt-12 text-center">
              <Link to="/account" className="text-newsprint-red hover:underline">
                Go to Account Settings
              </Link>
            </div> */}
          </>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default Dashboard;

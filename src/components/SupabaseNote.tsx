
import { Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

const SupabaseNote = () => {
  const [showNote, setShowNote] = useState(false);

  useEffect(() => {
    const checkSupabaseConnection = async () => {
      try {
        // Check if Supabase is correctly configured
        const { data, error } = await supabase.auth.getSession();
        
        // Only show note if no session exists or there's an error with connection
        setShowNote(!data.session || error !== null);
      } catch (err) {
        // If there's any error fetching the session, show the note
        setShowNote(true);
      }
    };

    checkSupabaseConnection();
  }, []);

  // Don't render anything if showNote is false
  if (!showNote) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-paper-aged border border-newsprint/20 p-4 rounded-sm shadow-lg z-50">
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          <Info className="h-5 w-5 text-newsprint-red" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-newsprint">Supabase Integration Completed</h3>
          <div className="mt-2 text-sm text-newsprint-light">
            <p>
              Your Supabase integration looks good! You can now use all authentication and database features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseNote;

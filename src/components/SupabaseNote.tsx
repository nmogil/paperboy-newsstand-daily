
import { Info } from 'lucide-react';

const SupabaseNote = () => {
  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-paper-aged border border-newsprint/20 p-4 rounded-sm shadow-lg z-50">
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          <Info className="h-5 w-5 text-newsprint-red" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-newsprint">Supabase Integration Required</h3>
          <div className="mt-2 text-sm text-newsprint-light">
            <p>
              To implement user authentication and database functionality, please connect this project to Supabase by clicking the green Supabase button in the top right corner.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseNote;

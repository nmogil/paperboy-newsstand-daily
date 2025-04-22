
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUserCount = () => {
  const [count, setCount] = useState(10);

  useEffect(() => {
    // Get initial count
    const fetchCount = async () => {
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (userCount !== null) {
        setCount(10 + userCount); // Add base number to actual count
      }
    };

    fetchCount();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        async () => {
          // Refetch count on any change
          const { count: newCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });
          
          if (newCount !== null) {
            setCount(10 + newCount); // Add base number to actual count
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return count;
};

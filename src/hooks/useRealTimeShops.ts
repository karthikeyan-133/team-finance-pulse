
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Shop {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useRealTimeShops = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setShops(data || []);
      console.log('[useRealTimeShops] Fetched shops:', data?.length);
    } catch (err: any) {
      console.error('[useRealTimeShops] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();

    // Set up real-time subscription
    const channel = supabase
      .channel('shops-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shops',
        },
        (payload) => {
          console.log('[useRealTimeShops] Real-time update:', payload);
          fetchShops(); // Refetch on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { shops, loading, error, refetch: fetchShops };
};

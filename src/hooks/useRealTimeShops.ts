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
    const handleRealtimeUpdate = (payload: any) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      setShops(currentShops => {
        let newShops;
        switch (eventType) {
          case 'INSERT':
            newShops = newRecord.is_active ? [newRecord, ...currentShops] : currentShops;
            break;
          case 'UPDATE':
            if (newRecord.is_active) {
              const exists = currentShops.some(s => s.id === newRecord.id);
              newShops = exists
                ? currentShops.map(s => s.id === newRecord.id ? newRecord : s)
                : [newRecord, ...currentShops];
            } else {
              newShops = currentShops.filter(s => s.id !== newRecord.id);
            }
            break;
          case 'DELETE':
            newShops = currentShops.filter(s => s.id !== oldRecord.id);
            break;
          default:
            return currentShops;
        }
        return newShops.sort((a, b) => a.name.localeCompare(b.name));
      });
    };
    const channel = supabase
      .channel('shops-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shops',
        },
        handleRealtimeUpdate
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  return { shops, loading, error, refetch: fetchShops };
};

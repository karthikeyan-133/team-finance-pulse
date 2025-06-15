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

// Helper to safely normalize shop fields
function normalizeShop(shop: any): Shop {
  return {
    ...shop,
    category: typeof shop.category === 'string' ? shop.category : '',
    is_active: typeof shop.is_active === 'boolean' ? shop.is_active : !!shop.is_active,
  };
}

export const useRealTimeShops = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Always fetch the initial data once
  useEffect(() => {
    let cancelled = false;
    const fetchShops = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('shops')
          .select('*')
          .order('name');
        if (error) throw error;
        if (!cancelled) {
          setShops(
            (data || [])
              .map(normalizeShop)
              .filter(s => s.is_active)
              .sort((a, b) => a.name.localeCompare(b.name))
          );
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchShops();

    const handleRealtimeUpdate = (payload: any) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      setShops((prevShops) => {
        let updated;
        switch (eventType) {
          case 'INSERT':
            updated = [normalizeShop(newRecord), ...prevShops.filter(s => s.id !== newRecord.id)];
            break;
          case 'UPDATE':
            updated = prevShops.map(s => s.id === newRecord.id ? normalizeShop(newRecord) : s);
            break;
          case 'DELETE':
            updated = prevShops.filter(s => s.id !== oldRecord.id);
            break;
          default:
            updated = prevShops;
        }
        return updated.filter(s => s.is_active).sort((a, b) => a.name.localeCompare(b.name));
      });
    };

    const channel = supabase
      .channel('shops-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shops' },
        handleRealtimeUpdate
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  // Refetch helper in case it's needed
  const refetch = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .order('name');
      if (error) throw error;
      setShops(
        (data || [])
          .map(normalizeShop)
          .filter(s => s.is_active)
          .sort((a, b) => a.name.localeCompare(b.name))
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return { shops, loading, error, refetch };
};

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Shop } from '@/types/Shop';

// add fetchKey param
export const useShops = (category?: string, fetchKey: number = 0) => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('shops')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (category) {
          query = query.eq('category', category);
        }
        const { data, error } = await query;

        if (error) {
          console.error('Error fetching shops:', error);
          setError(error.message);
          return;
        }
        setShops(data || []);
      } catch (err) {
        console.error('Error fetching shops:', err);
        setError('Failed to fetch shops');
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, [category, fetchKey]); // now refetches when fetchKey changes

  return { shops, loading, error };
};

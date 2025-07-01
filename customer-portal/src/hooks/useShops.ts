
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useShops = (category: string) => {
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!category) {
      setShops([]);
      return;
    }

    const fetchShops = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('shops')
          .select('*')
          .eq('category', category)
          .eq('is_active', true);

        if (error) throw error;
        setShops(data || []);
      } catch (error) {
        console.error('Error fetching shops:', error);
        setShops([]);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, [category]);

  return { shops, loading };
};

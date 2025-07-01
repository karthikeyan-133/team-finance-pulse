
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useProducts = (shopId: string, category: string) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!shopId || !category) {
      setProducts([]);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('shop_id', shopId)
          .eq('category', category)
          .eq('is_available', true);

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [shopId, category]);

  return { products, loading };
};

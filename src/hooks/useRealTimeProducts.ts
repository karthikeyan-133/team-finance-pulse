import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  shop_id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image_url?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export const useRealTimeProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
      console.log('[useRealTimeProducts] Fetched products:', data?.length);
    } catch (err: any) {
      console.error('[useRealTimeProducts] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    const handleRealtimeUpdate = (payload: any) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      setProducts(currentProducts => {
        let newProducts;
        switch (eventType) {
          case 'INSERT':
            newProducts = [newRecord, ...currentProducts];
            break;
          case 'UPDATE':
            newProducts = currentProducts.map(product =>
              product.id === newRecord.id ? newRecord : product
            );
            break;
          case 'DELETE':
            newProducts = currentProducts.filter(product => product.id !== oldRecord.id);
            break;
          default:
            return currentProducts;
        }
        return newProducts.sort((a, b) => a.name.localeCompare(b.name));
      });
    };
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        handleRealtimeUpdate
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  return { products, loading, error, refetch: fetchProducts };
};

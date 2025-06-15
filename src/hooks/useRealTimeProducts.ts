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

// Helper to safely normalize product fields
function normalizeProduct(product: any): Product {
  return {
    ...product,
    category: typeof product.category === 'string' ? product.category : '',
    is_available: typeof product.is_available === 'boolean' ? product.is_available : !!product.is_available,
  };
}

export const useRealTimeProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('name');
        if (error) throw error;
        if (!cancelled) setProducts(
          (data || [])
            .map(normalizeProduct)
            .sort((a, b) => a.name.localeCompare(b.name))
        );
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProducts();

    const handleRealtimeUpdate = (payload: any) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      setProducts((prevProducts) => {
        let updated;
        switch (eventType) {
          case 'INSERT':
            updated = [normalizeProduct(newRecord), ...prevProducts.filter(p => p.id !== newRecord.id)];
            break;
          case 'UPDATE':
            updated = prevProducts.map(p => p.id === newRecord.id ? normalizeProduct(newRecord) : p);
            break;
          case 'DELETE':
            updated = prevProducts.filter(p => p.id !== oldRecord.id);
            break;
          default:
            updated = prevProducts;
        }
        return updated.sort((a, b) => a.name.localeCompare(b.name));
      });
    };

    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        handleRealtimeUpdate
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  // Refetch helper (rarely needed, but available)
  const refetch = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      if (error) throw error;
      setProducts(
        (data || [])
          .map(normalizeProduct)
          .sort((a, b) => a.name.localeCompare(b.name))
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, refetch };
};

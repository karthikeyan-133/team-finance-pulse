
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
}

// add fetchKey param for external re-fetch
export const useProducts = (shopId?: string, category?: string, fetchKey: number = 0) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('products')
          .select('*')
          .eq('is_available', true)
          .order('name');

        if (shopId) {
          query = query.eq('shop_id', shopId);
        }

        if (category) {
          query = query.eq('category', category);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching products:', error);
          setError(error.message);
          return;
        }

        setProducts(data || []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [shopId, category, fetchKey]); // refetches when fetchKey changes

  return { products, loading, error };
};

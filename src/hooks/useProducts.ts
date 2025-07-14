
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

export const useProducts = (shopId?: string, category?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let query = supabase
          .from('products')
          .select('*')
          .eq('is_available', true)
          .order('name');

        // Always filter by shop_id if provided - this is the key fix
        if (shopId) {
          console.log('Filtering products by shop_id:', shopId);
          query = query.eq('shop_id', shopId);
        }

        // Also filter by category if provided
        if (category) {
          console.log('Filtering products by category:', category);
          query = query.eq('category', category);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching products:', error);
          setError(error.message);
          return;
        }

        console.log('Fetched products:', data?.length || 0, 'products');
        console.log('Products data:', data);
        setProducts(data || []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    // Always fetch products - filter by shopId and category if provided
    fetchProducts();
  }, [shopId, category]);

  return { products, loading, error };
};

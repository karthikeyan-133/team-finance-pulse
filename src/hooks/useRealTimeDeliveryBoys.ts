
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DeliveryBoy {
  id: string;
  name: string;
  phone: string;
  email?: string;
  vehicle_type?: 'bike' | 'bicycle' | 'car' | 'scooter';
  vehicle_number?: string;
  current_location?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useRealTimeDeliveryBoys = () => {
  const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeliveryBoys = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('delivery_boys')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setDeliveryBoys(data || []);
      console.log('[useRealTimeDeliveryBoys] Fetched delivery boys:', data?.length);
    } catch (err: any) {
      console.error('[useRealTimeDeliveryBoys] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryBoys();

    // Set up real-time subscription
    const channel = supabase
      .channel('delivery-boys-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'delivery_boys',
        },
        (payload) => {
          console.log('[useRealTimeDeliveryBoys] Real-time update:', payload);
          fetchDeliveryBoys(); // Refetch on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { deliveryBoys, loading, error, refetch: fetchDeliveryBoys };
};

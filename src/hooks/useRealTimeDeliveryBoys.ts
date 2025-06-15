import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DeliveryBoy {
  id: string;
  name: string;
  phone: string;
  email?: string;
  vehicle_type?: 'bike' | 'bicycle' | 'car' | 'scooter' | null;
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

  useEffect(() => {
    let cancelled = false;
    const fetchDeliveryBoys = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('delivery_boys')
          .select('*')
          .order('name');
        if (error) throw error;
        if (!cancelled) setDeliveryBoys((data || []).filter(b => b.is_active).sort((a, b) => a.name.localeCompare(b.name)));
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchDeliveryBoys();

    const handleRealtimeUpdate = (payload: any) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      setDeliveryBoys((prev) => {
        let updated;
        switch (eventType) {
          case 'INSERT':
            updated = [newRecord, ...prev.filter(b => b.id !== newRecord.id)];
            break;
          case 'UPDATE':
            updated = prev.map(b => b.id === newRecord.id ? newRecord : b);
            break;
          case 'DELETE':
            updated = prev.filter(b => b.id !== oldRecord.id);
            break;
          default:
            updated = prev;
        }
        return updated.filter(b => b.is_active).sort((a, b) => a.name.localeCompare(b.name));
      });
    };

    const channel = supabase
      .channel('delivery-boys-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'delivery_boys' },
        handleRealtimeUpdate
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const refetch = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('delivery_boys')
        .select('*')
        .order('name');
      if (error) throw error;
      setDeliveryBoys((data || []).filter(b => b.is_active).sort((a, b) => a.name.localeCompare(b.name)));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return { deliveryBoys, loading, error, refetch };
};

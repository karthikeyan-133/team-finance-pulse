
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

  const fetchDeliveryBoys = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('delivery_boys')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      
      // Transform the data to handle vehicle_type properly
      const transformedData = (data || []).map(boy => ({
        ...boy,
        vehicle_type: boy.vehicle_type as 'bike' | 'bicycle' | 'car' | 'scooter' | null
      }));
      
      setDeliveryBoys(transformedData);
      console.log('[useRealTimeDeliveryBoys] Fetched delivery boys:', transformedData?.length);
    } catch (err: any) {
      console.error('[useRealTimeDeliveryBoys] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryBoys();

    const transformBoy = (boy: any): DeliveryBoy => ({
      ...boy,
      vehicle_type: boy.vehicle_type as 'bike' | 'bicycle' | 'car' | 'scooter' | null
    });

    const handleRealtimeUpdate = (payload: any) => {
      console.log('[useRealTimeDeliveryBoys] Real-time update:', payload);
      const { eventType, new: newRecordUntyped, old: oldRecord } = payload;

      setDeliveryBoys(currentBoys => {
        let newBoys;
        switch (eventType) {
          case 'INSERT':
            const newRecord = transformBoy(newRecordUntyped);
            newBoys = newRecord.is_active ? [newRecord, ...currentBoys] : currentBoys;
            break;
          
          case 'UPDATE':
            const updatedRecord = transformBoy(newRecordUntyped);
            const boyExists = currentBoys.some(boy => boy.id === updatedRecord.id);
            if (updatedRecord.is_active) {
              newBoys = boyExists 
                ? currentBoys.map(boy => boy.id === updatedRecord.id ? updatedRecord : boy)
                : [updatedRecord, ...currentBoys];
            } else {
              newBoys = currentBoys.filter(boy => boy.id !== updatedRecord.id);
            }
            break;

          case 'DELETE':
            newBoys = currentBoys.filter(boy => boy.id !== oldRecord.id);
            break;
            
          default:
            return currentBoys;
        }
        return newBoys.sort((a, b) => a.name.localeCompare(b.name));
      });
    };

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
        handleRealtimeUpdate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { deliveryBoys, loading, error, refetch: fetchDeliveryBoys };
};

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderAssignment } from '@/types/orders';

// Helper to safely normalize order fields
function normalizeOrder(order: any): Order {
  return {
    ...order,
    delivery_charge: order.delivery_charge || 0,
    commission: order.commission || 0,
    payment_status: order.payment_status || 'pending',
    payment_method: order.payment_method || 'cash',
    order_status: order.order_status || 'pending',
    product_details: order.product_details || [],
  };
}

function normalizeAssignment(assignment: any): OrderAssignment {
  return {
    ...assignment,
    status: assignment.status || 'pending',
    orders: assignment.orders ? normalizeOrder(assignment.orders) : undefined,
  };
}

export const useRealTimeOrders = (deliveryBoyId?: string) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [assignments, setAssignments] = useState<OrderAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    
    const fetchOrders = async () => {
      if (!deliveryBoyId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch accepted orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('delivery_boy_id', deliveryBoyId)
          .in('order_status', ['assigned', 'picked_up'])
          .order('assigned_at', { ascending: false });

        if (ordersError) throw ordersError;

        // Fetch pending assignments
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from('order_assignments')
          .select(`
            *,
            orders(*)
          `)
          .eq('delivery_boy_id', deliveryBoyId)
          .eq('status', 'pending')
          .order('assigned_at', { ascending: false });

        if (assignmentsError) throw assignmentsError;

        if (!cancelled) {
          setOrders((ordersData || []).map(normalizeOrder));
          setAssignments((assignmentsData || []).map(normalizeAssignment));
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOrders();

    if (!deliveryBoyId) return;

    // Set up real-time subscriptions
    const handleOrdersUpdate = (payload: any) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      // Only update if the order is related to this delivery boy
      if (newRecord?.delivery_boy_id === deliveryBoyId || oldRecord?.delivery_boy_id === deliveryBoyId) {
        setOrders((prevOrders) => {
          let updated;
          switch (eventType) {
            case 'INSERT':
              if (newRecord.delivery_boy_id === deliveryBoyId && ['assigned', 'picked_up'].includes(newRecord.order_status)) {
                updated = [normalizeOrder(newRecord), ...prevOrders.filter(o => o.id !== newRecord.id)];
              } else {
                updated = prevOrders;
              }
              break;
            case 'UPDATE':
              if (newRecord.delivery_boy_id === deliveryBoyId && ['assigned', 'picked_up'].includes(newRecord.order_status)) {
                updated = prevOrders.map(o => o.id === newRecord.id ? normalizeOrder(newRecord) : o);
              } else {
                // Remove from list if no longer assigned to this delivery boy or status changed
                updated = prevOrders.filter(o => o.id !== newRecord.id);
              }
              break;
            case 'DELETE':
              updated = prevOrders.filter(o => o.id !== oldRecord.id);
              break;
            default:
              updated = prevOrders;
          }
          return updated;
        });
      }
    };

    const handleAssignmentsUpdate = (payload: any) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      // Only update if the assignment is for this delivery boy
      if (newRecord?.delivery_boy_id === deliveryBoyId || oldRecord?.delivery_boy_id === deliveryBoyId) {
        setAssignments((prevAssignments) => {
          let updated;
          switch (eventType) {
            case 'INSERT':
              if (newRecord.delivery_boy_id === deliveryBoyId && newRecord.status === 'pending') {
                // Fetch the full assignment with order details
                supabase
                  .from('order_assignments')
                  .select(`
                    *,
                    orders(*)
                  `)
                  .eq('id', newRecord.id)
                  .single()
                  .then(({ data }) => {
                    if (data) {
                      setAssignments(prev => [normalizeAssignment(data), ...prev.filter(a => a.id !== data.id)]);
                    }
                  });
                updated = prevAssignments;
              } else {
                updated = prevAssignments;
              }
              break;
            case 'UPDATE':
              if (newRecord.delivery_boy_id === deliveryBoyId && newRecord.status === 'pending') {
                updated = prevAssignments.map(a => 
                  a.id === newRecord.id ? { ...a, ...normalizeAssignment(newRecord) } : a
                );
              } else {
                // Remove from pending list if status changed
                updated = prevAssignments.filter(a => a.id !== newRecord.id);
              }
              break;
            case 'DELETE':
              updated = prevAssignments.filter(a => a.id !== oldRecord.id);
              break;
            default:
              updated = prevAssignments;
          }
          return updated;
        });
      }
    };

    const ordersChannel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        handleOrdersUpdate
      )
      .subscribe();

    const assignmentsChannel = supabase
      .channel('assignments-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'order_assignments' },
        handleAssignmentsUpdate
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(assignmentsChannel);
    };
  }, [deliveryBoyId]);

  // Refetch helper in case it's needed
  const refetch = async () => {
    if (!deliveryBoyId) return;
    
    setLoading(true);
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('delivery_boy_id', deliveryBoyId)
        .in('order_status', ['assigned', 'picked_up'])
        .order('assigned_at', { ascending: false });

      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('order_assignments')
        .select(`
          *,
          orders(*)
        `)
        .eq('delivery_boy_id', deliveryBoyId)
        .eq('status', 'pending')
        .order('assigned_at', { ascending: false });

      if (ordersError) throw ordersError;
      if (assignmentsError) throw assignmentsError;

      setOrders((ordersData || []).map(normalizeOrder));
      setAssignments((assignmentsData || []).map(normalizeAssignment));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return { orders, assignments, loading, error, refetch };
};

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  shop_name: string;
  shop_address?: string;
  shop_phone?: string;
  product_details: ProductDetail[];
  total_amount: number;
  delivery_charge: number;
  commission: number;
  payment_status: 'pending' | 'paid';
  payment_method: 'cash' | 'upi' | 'card' | 'other';
  order_status: 'pending' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled';
  delivery_boy_id?: string;
  delivery_boy?: {
    id: string;
    name: string;
    phone: string;
  };
  assigned_at?: string;
  picked_up_at?: string;
  delivered_at?: string;
  special_instructions?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProductDetail {
  name: string;
  quantity: number;
  price: number;
  description?: string;
}

export interface DeliveryBoy {
  id: string;
  name: string;
  phone: string;
  email?: string;
  vehicle_type?: 'bike' | 'bicycle' | 'car' | 'scooter' | null;
  vehicle_number?: string;
  is_active: boolean;
  current_location?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderAssignment {
  id: string;
  order_id: string;
  delivery_boy_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  assigned_at: string;
  responded_at?: string;
  notes?: string;
  orders?: Order;
  delivery_boys?: DeliveryBoy;
}

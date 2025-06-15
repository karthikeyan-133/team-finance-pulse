
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, MapPin, Phone, Mail, Car } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DeliveryBoy {
  id: string;
  name: string;
  phone: string;
  email?: string;
  vehicle_type?: 'bike' | 'bicycle' | 'car' | 'scooter';
  vehicle_number?: string;
  current_location?: string;
  is_active: boolean;
}

interface DeliveryBoyCardProps {
  deliveryBoy: DeliveryBoy;
  onEdit: (deliveryBoy: DeliveryBoy) => void;
}

export const DeliveryBoyCard = ({ deliveryBoy, onEdit }: DeliveryBoyCardProps) => {
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to deactivate this delivery boy?')) {
      return;
    }

    try {
      console.log('[DeliveryBoyCard] Deactivating delivery boy:', deliveryBoy.id);
      const { error } = await supabase
        .from('delivery_boys')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', deliveryBoy.id);

      if (error) {
        console.error('[DeliveryBoyCard] Deactivate error:', error);
        throw error;
      }

      console.log('[DeliveryBoyCard] Delivery boy deactivated successfully');
      toast.success('Delivery boy deactivated successfully');
    } catch (error: any) {
      console.error('[DeliveryBoyCard] Error deactivating delivery boy:', error);
      toast.error(`Failed to deactivate delivery boy: ${error.message}`);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-1">{deliveryBoy.name}</CardTitle>
        <div className="flex items-center justify-between">
          <Badge variant={deliveryBoy.is_active ? "default" : "destructive"}>
            {deliveryBoy.is_active ? 'Active' : 'Inactive'}
          </Badge>
          {deliveryBoy.vehicle_type && (
            <Badge variant="secondary">{deliveryBoy.vehicle_type}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4" />
            <span>{deliveryBoy.phone}</span>
          </div>
          
          {deliveryBoy.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              <span className="line-clamp-1">{deliveryBoy.email}</span>
            </div>
          )}
          
          {deliveryBoy.vehicle_number && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Car className="h-4 w-4" />
              <span>{deliveryBoy.vehicle_number}</span>
            </div>
          )}
          
          {deliveryBoy.current_location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-2">{deliveryBoy.current_location}</span>
            </div>
          )}
          
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(deliveryBoy)}
              className="flex-1"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

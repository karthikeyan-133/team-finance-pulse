
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Car } from 'lucide-react';
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

interface DeliveryBoyFormProps {
  deliveryBoy?: DeliveryBoy;
  onSuccess: () => void;
  onCancel?: () => void;
}

export const DeliveryBoyForm = ({ deliveryBoy, onSuccess, onCancel }: DeliveryBoyFormProps) => {
  const [formData, setFormData] = useState({
    name: deliveryBoy?.name || '',
    phone: deliveryBoy?.phone || '',
    email: deliveryBoy?.email || '',
    vehicle_type: deliveryBoy?.vehicle_type || '',
    vehicle_number: deliveryBoy?.vehicle_number || '',
    current_location: deliveryBoy?.current_location || '',
    is_active: deliveryBoy?.is_active ?? true
  });
  const [saving, setSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        ...formData,
        vehicle_type: formData.vehicle_type || null,
        vehicle_number: formData.vehicle_number || null,
        current_location: formData.current_location || null,
        email: formData.email || null,
        updated_at: new Date().toISOString()
      };

      let result;
      if (deliveryBoy) {
        console.log('[DeliveryBoyForm] Updating delivery boy:', deliveryBoy.id, data);
        result = await supabase
          .from('delivery_boys')
          .update(data)
          .eq('id', deliveryBoy.id);
      } else {
        console.log('[DeliveryBoyForm] Creating delivery boy:', data);
        result = await supabase
          .from('delivery_boys')
          .insert([data]);
      }

      if (result.error) {
        console.error('[DeliveryBoyForm] Database error:', result.error);
        throw result.error;
      }

      console.log('[DeliveryBoyForm] Success:', result);
      toast.success(`Delivery boy ${deliveryBoy ? 'updated' : 'added'} successfully!`);
      
      // Reset form if creating new
      if (!deliveryBoy) {
        setFormData({
          name: '',
          phone: '',
          email: '',
          vehicle_type: '',
          vehicle_number: '',
          current_location: '',
          is_active: true
        });
      }
      
      onSuccess();
    } catch (error: any) {
      console.error('[DeliveryBoyForm] Error:', error);
      toast.error(`Failed to ${deliveryBoy ? 'update' : 'add'} delivery boy: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {deliveryBoy ? 'Edit Delivery Boy' : 'Add New Delivery Boy'}
        </CardTitle>
        <CardDescription>
          {deliveryBoy ? 'Update delivery boy information' : 'Register a new delivery boy to your delivery team'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          {/* Vehicle Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              <h3 className="text-lg font-medium">Vehicle Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vehicle_type">Vehicle Type</Label>
                <Select value={formData.vehicle_type} onValueChange={(value) => handleSelectChange('vehicle_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bike">Bike</SelectItem>
                    <SelectItem value="bicycle">Bicycle</SelectItem>
                    <SelectItem value="car">Car</SelectItem>
                    <SelectItem value="scooter">Scooter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="vehicle_number">Vehicle Number</Label>
                <Input
                  id="vehicle_number"
                  name="vehicle_number"
                  value={formData.vehicle_number}
                  onChange={handleInputChange}
                  placeholder="e.g., MH-12-AB-1234"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="current_location">Current Location</Label>
            <Input
              id="current_location"
              name="current_location"
              value={formData.current_location}
              onChange={handleInputChange}
              placeholder="Current location or area"
            />
          </div>

          {deliveryBoy && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              />
              <Label htmlFor="is_active">Delivery boy is active</Label>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            )}
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? (deliveryBoy ? 'Updating...' : 'Adding...') : deliveryBoy ? 'Update Delivery Boy' : 'Add Delivery Boy'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

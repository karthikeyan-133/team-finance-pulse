
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Phone, Mail, Car } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AddDeliveryBoyForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    vehicle_type: '',
    vehicle_number: '',
    current_location: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const deliveryBoyData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || null,
        vehicle_type: formData.vehicle_type || null,
        vehicle_number: formData.vehicle_number || null,
        current_location: formData.current_location || null,
        is_active: true
      };

      const { error } = await supabase
        .from('delivery_boys')
        .insert([deliveryBoyData]);

      if (error) throw error;

      toast.success('Delivery boy added successfully!');
      
      // Reset form
      setFormData({
        name: '',
        phone: '',
        email: '',
        vehicle_type: '',
        vehicle_number: '',
        current_location: ''
      });

    } catch (error) {
      console.error('Error adding delivery boy:', error);
      toast.error('Failed to add delivery boy. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Add New Delivery Boy
        </CardTitle>
        <CardDescription>
          Register a new delivery boy to your delivery team
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

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Adding Delivery Boy...' : 'Add Delivery Boy'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddDeliveryBoyForm;

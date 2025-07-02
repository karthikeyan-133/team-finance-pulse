import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Truck, Search, Phone, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DeliveryBoy {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicle_type: string;
  vehicle_number: string;
  is_active: boolean;
  current_location: string;
  created_at: string;
}

const DeliveryBoyManagement = () => {
  const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoy[]>([]);
  const [filteredDeliveryBoys, setFilteredDeliveryBoys] = useState<DeliveryBoy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDeliveryBoys();
  }, []);

  useEffect(() => {
    filterDeliveryBoys();
  }, [deliveryBoys, searchTerm]);

  const fetchDeliveryBoys = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_boys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeliveryBoys(data || []);
    } catch (error) {
      console.error('Error fetching delivery boys:', error);
      toast.error('Failed to load delivery boys');
    } finally {
      setLoading(false);
    }
  };

  const filterDeliveryBoys = () => {
    let filtered = deliveryBoys;

    if (searchTerm) {
      filtered = filtered.filter(deliveryBoy =>
        deliveryBoy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deliveryBoy.phone.includes(searchTerm) ||
        deliveryBoy.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDeliveryBoys(filtered);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading delivery boys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Delivery Boy Management</h1>
          <p className="text-muted-foreground">Manage your delivery personnel</p>
          <p className="text-sm text-muted-foreground mt-1">
            Total delivery boys: {deliveryBoys.length} | Active: {deliveryBoys.filter(d => d.is_active).length}
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Delivery Boy
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Delivery Boys Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDeliveryBoys.map(deliveryBoy => (
          <Card key={deliveryBoy.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{deliveryBoy.name}</CardTitle>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  deliveryBoy.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {deliveryBoy.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{deliveryBoy.phone}</span>
              </div>
              
              {deliveryBoy.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{deliveryBoy.email}</span>
                </div>
              )}

              {deliveryBoy.vehicle_type && (
                <div className="text-sm">
                  <span className="font-medium">Vehicle:</span> {deliveryBoy.vehicle_type}
                  {deliveryBoy.vehicle_number && ` (${deliveryBoy.vehicle_number})`}
                </div>
              )}

              {deliveryBoy.current_location && (
                <div className="text-sm">
                  <span className="font-medium">Location:</span> {deliveryBoy.current_location}
                </div>
              )}

              <div className="text-xs text-muted-foreground pt-2 border-t">
                Joined: {new Date(deliveryBoy.created_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDeliveryBoys.length === 0 && (
        <div className="text-center py-12">
          <Truck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No delivery boys found</h3>
          <p className="text-muted-foreground">
            {!searchTerm
              ? 'Add a new delivery boy to get started.' 
              : 'Try adjusting your search or add a new delivery boy.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default DeliveryBoyManagement;
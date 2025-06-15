
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Shop {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  category: string;
  is_active: boolean;
}

interface ShopFormProps {
  shop?: Shop;
  onSuccess: () => void;
}

const ShopForm = ({ shop, onSuccess }: ShopFormProps) => {
  const [formData, setFormData] = useState({
    name: shop?.name || '',
    address: shop?.address || '',
    phone: shop?.phone || '',
    category: shop?.category || '',
    is_active: shop?.is_active ?? true
  });

  const categories = ['Food', 'Grocery', 'Vegetables', 'Meat'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let result;
      if (shop) {
        result = await supabase
          .from('shops')
          .update(formData)
          .eq('id', shop.id)
          .select('*');
      } else {
        result = await supabase
          .from('shops')
          .insert([formData])
          .select('*');
      }

      if (result.error) {
        toast.error(`Failed to ${shop ? 'update' : 'create'} shop: ${result.error.message}`);
        return;
      }

      toast.success(`Shop ${shop ? 'updated' : 'created'} successfully`);
      if (typeof onSuccess === "function") onSuccess();

    } catch (error: any) {
      toast.error(`Error saving shop: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Shop Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
        />
        <Label htmlFor="is_active">Shop is active</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {shop ? 'Update Shop' : 'Add Shop'}
        </Button>
      </div>
    </form>
  );
};

export default ShopForm;

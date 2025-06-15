
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Product {
  id: string;
  shop_id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image_url?: string;
  is_available: boolean;
}

interface Shop {
  id: string;
  name: string;
}

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
  shops: Shop[];
}

const ProductForm = ({ product, onSuccess, shops }: ProductFormProps) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    category: product?.category || '',
    shop_id: product?.shop_id || '',
    image_url: product?.image_url || '',
    is_available: product?.is_available ?? true
  });

  const categories = ['Food', 'Grocery', 'Vegetables', 'Meat'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = {
        ...formData,
        price: parseFloat(String(formData.price))
      };

      let result;
      if (product) {
        result = await supabase
          .from('products')
          .update(data)
          .eq('id', product.id);
      } else {
        result = await supabase
          .from('products')
          .insert([data]);
      }

      if (result.error) {
        toast.error(`Failed to ${product ? 'update' : 'create'} product: ${result.error.message}`);
        return;
      }

      toast.success(`Product ${product ? 'updated' : 'created'} successfully`);
      if (typeof onSuccess === "function") onSuccess();
    } catch (error: any) {
      toast.error(`Error saving product: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="price">Price ($)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
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
        <div>
          <Label htmlFor="shop">Shop</Label>
          <Select value={formData.shop_id} onValueChange={(value) => setFormData({...formData, shop_id: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select shop" />
            </SelectTrigger>
            <SelectContent>
              {shops.map((shop) => (
                <SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="image_url">Image URL</Label>
        <Input
          id="image_url"
          type="url"
          value={formData.image_url}
          onChange={(e) => setFormData({...formData, image_url: e.target.value})}
          placeholder="https://..."
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_available"
          checked={formData.is_available}
          onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
        />
        <Label htmlFor="is_available">Product is available</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {product ? 'Update Product' : 'Add Product'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;

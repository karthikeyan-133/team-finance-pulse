import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useShops as useShopsBase } from '@/hooks/useShops';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Store } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ShopCard from '@/components/shops/ShopCard';
import ShopForm from '@/components/shops/ShopForm';

interface Shop {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  category: string;
  is_active: boolean;
}

const ShopManagement = () => {
  const { shops: initialShops, loading, error } = useShopsBase();
  const [shops, setShops] = useState<Shop[]>(initialShops || []);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);

  const refreshShops = useCallback(async (reason?: string) => {
    console.log("REFRESH_SHOPS called", { reason });
    const { data, error } = await supabase.from('shops').select('*').order('name');
    console.log("Refreshing shops result:", { data, error });
    if (error) {
      toast.error('Failed to fetch shops');
      return;
    }
    setShops(data || []);
  }, []);

  useEffect(() => {
    setShops(initialShops || []);
  }, [initialShops]);

  useEffect(() => {
    refreshShops('On page mount');
    // eslint-disable-next-line
  }, []);

  const categories = ['Food', 'Grocery', 'Vegetables', 'Meat'];

  const filteredShops = (shops || []).filter(shop => {
    return selectedCategory === 'all' || shop.category === selectedCategory;
  });

  if (loading && !shops?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading shops...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error loading shops: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shop Management</h1>
          <p className="text-gray-600">Manage your shops and their information</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Shop
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Shop</DialogTitle>
              <DialogDescription>
                Add a new shop to your network
              </DialogDescription>
            </DialogHeader>
            <ShopForm 
              onSuccess={() => {
                setIsAddDialogOpen(false);
                refreshShops('Shop added');
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 mb-6">
        <div>
          <Label htmlFor="category-filter">Filter by Category</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredShops.map(shop => (
          <ShopCard 
            key={shop.id} 
            shop={shop} 
            onEdit={(shop) => setEditingShop(shop)}
            onDeleteSuccess={() => {
              refreshShops('Shop deleted');
            }}
          />
        ))}
      </div>

      {filteredShops.length === 0 && (
        <div className="text-center py-12">
          <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No shops found</h3>
          <p className="text-gray-500">Try adjusting your filters or add a new shop.</p>
        </div>
      )}

      {editingShop && (
        <Dialog open={!!editingShop} onOpenChange={(open) => {
            if (!open) setEditingShop(null);
          }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Shop</DialogTitle>
              <DialogDescription>
                Update shop information
              </DialogDescription>
            </DialogHeader>
            <ShopForm 
              shop={editingShop}
              onSuccess={() => {
                setEditingShop(null);
                refreshShops('Shop edited');
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ShopManagement;

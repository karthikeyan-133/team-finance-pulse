import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useShops as useShopsBase } from '@/hooks/useShops';
import { toast } from 'sonner';
import { Plus, Store } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ShopCard from '@/components/shops/ShopCard';
import type { Shop } from '@/types/Shop';
import ShopForm from '@/components/shops/ShopForm';

const ShopManagement = () => {
  const [fetchKey, setFetchKey] = useState(0);
  const { shops, loading, error } = useShopsBase(undefined, fetchKey);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Use only fetchKey to trigger re-query. Always clear edit state FIRST.
  const refreshShops = useCallback(async (reason?: string) => {
    setRefreshing(true);
    setEditingShop(null);
    setIsAddDialogOpen(false);
    setFetchKey((k) => k + 1);
    setRefreshing(false);
    toast.success("Shop list refreshed [" + (reason || "") + "]");
  }, []);
  
  useEffect(() => {
    refreshShops('On page mount');
    // eslint-disable-next-line
  }, []);

  const categories = ['Food', 'Grocery', 'Vegetables', 'Meat'];

  const filteredShops = React.useMemo(() => {
    const list = (shops || []).filter(shop => {
      return selectedCategory === 'all' || shop.category === selectedCategory;
    });
    return list.sort((a, b) => (a.name > b.name ? 1 : -1));
  }, [shops, selectedCategory]);

  // Debug: log values to ensure UI renders
  console.log("ShopManagement: shops =", shops);
  console.log("ShopManagement: filteredShops =", filteredShops);

  if ((loading || refreshing) && !shops?.length) {
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
      <div className="flex justify-between items-center mb-6 border-2 border-dashed border-blue-500">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shop Management</h1>
          <p className="text-gray-600">Manage your shops and their information</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) refreshShops('Shop add dialog closed');
          }}>
          <DialogTrigger asChild>
            <Button className="border-2 border-green-500">
              <span className="text-xs text-green-700 font-bold mr-1">[DEBUG ADD]</span>
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
              onSuccess={async () => {
                setIsAddDialogOpen(false);
                await refreshShops('Shop added');
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 mb-6 border-dashed border-2 border-yellow-500">
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

      <div className="border-4 border-purple-500 rounded-lg p-2">
        <p className="text-md font-semibold mb-2 text-purple-600">[DEBUG] Shop Card Grid, count={filteredShops.length}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" key={fetchKey}>
          {filteredShops.map(shop => (
            <ShopCard 
              key={`${shop.id}-${shop.updated_at ?? ''}`}
              shop={shop}
              onEdit={() => setEditingShop(shop)}
              onDeleteSuccess={async () => {
                await refreshShops('Shop deleted');
              }}
              debug
            />
          ))}
        </div>
      </div>

      {filteredShops.length === 0 && (
        <div className="text-center py-12">
          <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No shops found</h3>
          <p className="text-gray-500">Try adjusting your filters or add a new shop.</p>
        </div>
      )}

      {editingShop && (
        <Dialog open={!!editingShop} onOpenChange={async (open) => {
            if (!open) {
              setEditingShop(null);
              await refreshShops('Shop edited');
            }
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
              onSuccess={async () => {
                setEditingShop(null);
                await refreshShops('Shop edited');
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ShopManagement;

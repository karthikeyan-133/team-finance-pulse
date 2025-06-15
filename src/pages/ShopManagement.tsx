import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Store } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Shop {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  category: string;
  is_active: boolean;
}

const categories = ['Food', 'Grocery', 'Vegetables', 'Meat'];

const ShopManagement = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);

  // Always up-to-date fetch, with console after fetch
  const fetchShops = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('shops').select('*').eq('is_active', true).order('name');
      const { data, error } = await query;
      if (error) throw error;
      setShops(data || []);
      setLastFetched(new Date());
      console.log('[ShopManagement] Shop list (lastFetched):', new Date(), data);
    } catch (err: any) {
      setError('Failed to fetch shops');
    } finally {
      setLoading(false);
    }
  };

  // Always fetch when called, or when refreshVersion changes
  useEffect(() => {
    fetchShops();
  }, [refreshVersion]);

  const filteredShops = shops.filter(shop => selectedCategory === 'all' || shop.category === selectedCategory);

  // Explicit refresh (cause fetchShops + UI force update)
  const handleRefresh = () => {
    setRefreshVersion(v => v + 1);
  };

  if (loading) {
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
          {lastFetched && (
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {lastFetched.toLocaleTimeString()}
            </p>
          )}
        </div>
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={open => {
            setIsAddDialogOpen(open);
            if (!open) handleRefresh(); // force refresh always on close
          }}>
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
                handleRefresh(); // refresh list after add
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
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

      {/* Shops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredShops.map(shop => (
          <ShopCard 
            key={shop.id} 
            shop={shop} 
            onEdit={shop => setEditingShop(shop)}
            onDelete={handleRefresh}
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
      {/* Edit Dialog */}
      {editingShop && (
        <Dialog open={!!editingShop} onOpenChange={open => {
            if (!open) setEditingShop(null);
            if (!open) handleRefresh();
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
                handleRefresh(); // refresh after edit
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const ShopCard = ({ shop, onEdit, onDelete }: { shop: Shop, onEdit: (shop: Shop) => void, onDelete: () => void }) => {
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this shop?')) {
      try {
        // Instead of permanent delete, mark is_active = false for better data consistency (soft delete)
        const { error } = await supabase
          .from('shops')
          .update({ is_active: false })
          .eq('id', shop.id);

        if (error) {
          toast.error('Failed to delete shop');
          console.log('[ShopCard] Delete error:', error);
          return;
        }

        toast.success('Shop deleted successfully');
        onDelete();
      } catch (error) {
        toast.error('Error deleting shop');
        console.log('[ShopCard] Exception during delete:', error);
      }
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-1">{shop.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {shop.address || 'No address provided'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm text-gray-500">
            <p>Category: {shop.category || 'Not specified'}</p>
            {shop.phone && <p>Phone: {shop.phone}</p>}
          </div>
          <div className="flex items-center justify-between">
            <span className={`px-2 py-1 rounded-full text-xs ${
              shop.is_active 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {shop.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(shop)}
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

const ShopForm = ({ shop, onSuccess }: { shop?: Shop, onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    name: shop?.name || '',
    address: shop?.address || '',
    phone: shop?.phone || '',
    category: shop?.category || '',
    is_active: shop?.is_active ?? true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let result;
      if (shop) {
        result = await supabase
          .from('shops')
          .update(formData)
          .eq('id', shop.id);
        console.log('[ShopForm] Shop updated:', result);
      } else {
        result = await supabase
          .from('shops')
          .insert([formData]);
        console.log('[ShopForm] Shop added:', result);
      }

      if (result.error) {
        toast.error(`Failed to ${shop ? 'update' : 'create'} shop`);
        console.log('[ShopForm] Mutation error:', result.error);
        return;
      }

      toast.success(`Shop ${shop ? 'updated' : 'created'} successfully`);
      onSuccess();
    } catch (error) {
      toast.error('Error saving shop');
      console.log('[ShopForm] Exception during save:', error);
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

export default ShopManagement;

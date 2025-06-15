
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts as useProductsBase } from '@/hooks/useProducts';
import { useShops as useShopsBase } from '@/hooks/useShops';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const ProductManagement = () => {
  // use base hooks only for startup/refreshing, then local state
  const { products: initialProducts, loading: productsLoading, error: productsError } = useProductsBase();
  const { shops: initialShops, loading: shopsLoading } = useShopsBase();
  const [products, setProducts] = useState(initialProducts || []);
  const [shops, setShops] = useState(initialShops || []);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedShop, setSelectedShop] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Fetch all products for management, regardless of is_available
  const refreshProducts = useCallback(async () => {
    const { data, error } = await supabase.from('products').select('*').order('name');
    if (error) {
      toast.error('Failed to fetch products');
      return;
    }
    setProducts(data || []);
  }, []);

  // Refresh shops for accurate shop names as well
  const refreshShops = useCallback(async () => {
    const { data, error } = await supabase.from('shops').select('*').order('name');
    if (error) {
      toast.error('Failed to fetch shops');
      return;
    }
    setShops(data || []);
  }, []);

  useEffect(() => { setProducts(initialProducts || []); }, [initialProducts]);
  useEffect(() => { setShops(initialShops || []); }, [initialShops]);
  useEffect(() => {
    refreshProducts();
    refreshShops();
    // eslint-disable-next-line
  }, []);

  const categories = ['Food', 'Grocery', 'Vegetables', 'Meat'];

  const filteredProducts = (products || []).filter(product => {
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    const shopMatch = selectedShop === 'all' || product.shop_id === selectedShop;
    return categoryMatch && shopMatch;
  });

  if (productsLoading || shopsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error loading products: {productsError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600">Manage your products across all categories</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Add a new product to your inventory
              </DialogDescription>
            </DialogHeader>
            <ProductForm 
              onSuccess={() => {
                setIsAddDialogOpen(false);
                refreshProducts();
              }}
              shops={shops}
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
        <div>
          <Label htmlFor="shop-filter">Filter by Shop</Label>
          <Select value={selectedShop} onValueChange={setSelectedShop}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Shops" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Shops</SelectItem>
              {shops.map(shop => (
                <SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            shops={shops}
            onEdit={setEditingProduct}
            onDeleteSuccess={refreshProducts}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your filters or add a new product.</p>
        </div>
      )}

      {/* Edit Dialog */}
      {editingProduct && (
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Update product information
              </DialogDescription>
            </DialogHeader>
            <ProductForm 
              product={editingProduct}
              onSuccess={() => {
                setEditingProduct(null);
                refreshProducts();
              }}
              shops={shops}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const ProductCard = ({ product, shops, onEdit, onDeleteSuccess }: any) => {
  const shop = shops.find((s: any) => s.id === product.shop_id);
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', product.id);

        if (error) {
          toast.error('Failed to delete product');
          return;
        }

        toast.success('Product deleted successfully');
        if (typeof onDeleteSuccess === "function") onDeleteSuccess();
      } catch (error) {
        toast.error('Error deleting product');
      }
    }
  };

  return (
    <Card className="overflow-hidden">
      {product.image_url && (
        <div className="aspect-square overflow-hidden">
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {product.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-green-600">
              ${product.price}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              product.is_available 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {product.is_available ? 'Available' : 'Out of Stock'}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            <p>Category: {product.category}</p>
            <p>Shop: {shop?.name || 'Unknown'}</p>
          </div>
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(product)}
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

const ProductForm = ({ product, onSuccess, shops }: any) => {
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
        price: parseFloat(formData.price)
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
        toast.error(`Failed to ${product ? 'update' : 'create'} product`);
        return;
      }

      toast.success(`Product ${product ? 'updated' : 'created'} successfully`);
      if (typeof onSuccess === "function") onSuccess();
    } catch (error) {
      toast.error('Error saving product');
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
              {shops.map((shop: any) => (
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

export default ProductManagement;


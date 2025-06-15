
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts as useProductsBase } from '@/hooks/useProducts';
import { useShops as useShopsBase } from '@/hooks/useShops';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ProductCard from '@/components/products/ProductCard';
import ProductForm from '@/components/products/ProductForm';

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
  address?: string;
  phone?: string;
  category: string;
  is_active: boolean;
}

const ProductManagement = () => {
  const { products: initialProducts, loading: productsLoading, error: productsError } = useProductsBase();
  const { shops: initialShops, loading: shopsLoading } = useShopsBase();
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [shops, setShops] = useState<Shop[]>(initialShops || []);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedShop, setSelectedShop] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const refreshProducts = useCallback(async () => {
    const { data, error } = await supabase.from('products').select('*').order('name');
    console.log("Refreshing products. Data:", data, "Error:", error);
    if (error) {
      toast.error('Failed to fetch products');
      return;
    }
    setProducts(data || []);
  }, []);

  const refreshShops = useCallback(async () => {
    const { data, error } = await supabase.from('shops').select('*').order('name');
    console.log("Refreshing shops. Data:", data, "Error:", error);
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

export default ProductManagement;

// Reminder: This file is long, consider refactoring into smaller files if more changes are needed!

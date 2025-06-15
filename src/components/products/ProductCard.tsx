
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
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

interface ProductCardProps {
  product: Product;
  shops: Shop[];
  onEdit: (product: Product) => void;
}

export const ProductCard = ({ product, shops, onEdit }: ProductCardProps) => {
  const shop = shops.find(s => s.id === product.shop_id);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      console.log('[ProductCard] Deleting product:', product.id);
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) {
        console.error('[ProductCard] Delete error:', error);
        throw error;
      }

      console.log('[ProductCard] Product deleted successfully');
      toast.success('Product deleted successfully');
    } catch (error: any) {
      console.error('[ProductCard] Error deleting product:', error);
      toast.error(`Failed to delete product: ${error.message}`);
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
          {product.description || 'No description'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-green-600">
              ${product.price}
            </span>
            <Badge variant={product.is_available ? "default" : "destructive"}>
              {product.is_available ? 'Available' : 'Out of Stock'}
            </Badge>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Category:</span>
              <Badge variant="secondary">{product.category}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Shop:</span>
              <span className="font-medium">{shop?.name || 'Unknown'}</span>
            </div>
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

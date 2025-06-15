
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Edit, Trash2 } from 'lucide-react';

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
  onDeleteSuccess: () => void;
}

const ProductCard = ({ product, shops, onEdit, onDeleteSuccess }: ProductCardProps) => {
  const shop = shops.find((s) => s.id === product.shop_id);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', product.id);

        if (error) {
          toast.error(`Failed to delete product: ${error.message}`);
          return;
        }

        toast.success('Product deleted successfully');
        if (typeof onDeleteSuccess === "function") onDeleteSuccess();
      } catch (error: any) {
        toast.error(`Error deleting product: ${error.message}`);
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

export default ProductCard;

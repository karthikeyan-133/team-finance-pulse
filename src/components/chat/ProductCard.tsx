
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image_url?: string; // Changed from image to image_url to match database
}

interface ProductCardProps {
  product: Product;
  onAdd: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="h-32 bg-gray-200 rounded-t-lg overflow-hidden">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-100">
              <span className="text-2xl">🍽️</span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-3">
          <h3 className="font-semibold text-sm mb-1">{product.name}</h3>
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">{product.description}</p>
          
          <div className="flex items-center justify-between">
            <span className="font-bold text-green-600">₹{product.price}</span>
            <Button size="sm" onClick={onAdd} className="h-7 w-7 p-0">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;

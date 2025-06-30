
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, IndianRupee } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image_url?: string;
}

interface ProductCardProps {
  product: Product;
  onAdd: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => {
  return (
    <Card className="hover:shadow-md transition-shadow w-full">
      <CardContent className="p-0">
        {/* Product Image - Compact Mobile */}
        <div className="h-16 bg-gray-200 rounded-t-lg overflow-hidden">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-100">
              <span className="text-lg">🍽️</span>
            </div>
          )}
        </div>

        {/* Product Details - Compact Mobile */}
        <div className="p-2">
          <h3 className="font-semibold text-xs mb-1 line-clamp-1">{product.name}</h3>
          <p className="text-xs text-gray-600 mb-2 line-clamp-2 leading-3">{product.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-green-600 font-bold text-xs">
              <IndianRupee className="h-3 w-3 mr-0.5" />
              <span>{product.price}</span>
            </div>
            <Button size="sm" onClick={onAdd} className="h-6 w-6 p-0 hover:scale-105 transition-transform">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;

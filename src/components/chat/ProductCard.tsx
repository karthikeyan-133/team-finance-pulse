
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
        {/* Product Image - Mobile Optimized */}
        <div className="h-24 sm:h-32 bg-gray-200 rounded-t-lg overflow-hidden">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-100">
              <span className="text-xl sm:text-2xl">🍽️</span>
            </div>
          )}
        </div>

        {/* Product Details - Mobile Optimized */}
        <div className="p-2 sm:p-3">
          <h3 className="font-semibold text-sm sm:text-base mb-1 line-clamp-1">{product.name}</h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-green-600 font-bold text-sm sm:text-base">
              <IndianRupee className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span>{product.price}</span>
            </div>
            <Button size="sm" onClick={onAdd} className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:scale-105 transition-transform">
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;

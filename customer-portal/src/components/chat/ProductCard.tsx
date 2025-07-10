
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    description?: string;
    image_url?: string;
  };
  onAddToCart: (product: any) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <Card className="w-full">
      <CardContent className="p-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-medium text-sm">{product.name}</h3>
            {product.description && (
              <p className="text-xs text-gray-600 mt-1">{product.description}</p>
            )}
            <p className="text-sm font-semibold text-green-600 mt-1">₹{product.price}</p>
          </div>
          <Button
            size="sm"
            onClick={() => onAddToCart(product)}
            className="ml-2 h-8 text-xs"
          >
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;

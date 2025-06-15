import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Edit, Trash2 } from 'lucide-react';
import type { Shop } from '@/types/Shop';

interface ShopCardProps {
  shop: Shop;
  onEdit: (shop: Shop) => void;
  onDeleteSuccess: () => void;
  debug?: boolean;
}

const ShopCard = ({ shop, onEdit, onDeleteSuccess, debug }: ShopCardProps) => {
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this shop? This might affect products associated with it.')) {
      try {
        const { error } = await supabase
          .from('shops')
          .delete()
          .eq('id', shop.id);

        if (error) {
          toast.error(`Failed to delete shop: ${error.message}`);
          return;
        }

        toast.success('Shop deleted successfully');
        // Always call refresh after success
        if (typeof onDeleteSuccess === "function") onDeleteSuccess();
      } catch (error: any) {
        toast.error(`Error deleting shop: ${error.message}`);
      }
    }
  };

  return (
    <Card className="overflow-visible border-8 border-blue-700 bg-blue-50 shadow-2xl p-4">
      <div className="bg-pink-300 text-pink-900 p-2 font-extrabold text-lg shadow-inner">
        [DEBUG CARD] id={shop.id}, name={shop.name}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold text-blue-900">{shop.name}</CardTitle>
        <CardDescription className="line-clamp-2 text-md">{shop.address || 'No address provided'}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-base text-gray-700">
            <p>Category: {shop.category || 'Not specified'}</p>
            {shop.phone && <p>Phone: {shop.phone}</p>}
          </div>
          <div className="flex items-center justify-between">
            <span className={`px-3 py-2 rounded-full text-lg font-bold`}
              style={{
                backgroundColor: shop.is_active ? '#bbf7d0' : '#fecaca',
                color: shop.is_active ? '#166534' : '#991b1b'
              }}>
              {shop.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex gap-4 pt-3 border-t-4 border-dashed border-pink-500 mt-2">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => onEdit(shop)}
              className="border-4 border-blue-900 bg-blue-300 text-blue-900 font-extrabold text-lg px-6 py-3"
              data-testid="edit-shop-btn"
            >
              [EDIT]
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleDelete}
              className="border-4 border-red-900 bg-red-300 text-red-900 font-extrabold text-lg px-6 py-3"
              data-testid="delete-shop-btn"
            >
              [DELETE]
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export default ShopCard;

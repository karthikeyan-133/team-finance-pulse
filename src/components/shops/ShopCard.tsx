
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
    <Card className={`overflow-hidden ${debug ? "border-4 border-pink-500" : ""}`}>
      {debug && (
        <div className="bg-pink-100 text-pink-700 text-xs px-2 py-1">[DEBUG] ShopCard id={shop.id}, name={shop.name}</div>
      )}
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
          <div className="flex gap-2 pt-2 border-t-2 border-pink-300 mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(shop)}
              className="flex-1 border-2 border-blue-300"
            >
              <span className="text-xs text-blue-700 font-bold mr-1">[Edit]</span>
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 border-2 border-red-400"
            >
              <span className="text-xs text-red-800 font-bold mr-1">[Delete]</span>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShopCard;

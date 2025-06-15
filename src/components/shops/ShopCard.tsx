import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Edit, Trash2 } from 'lucide-react';

interface Shop {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  category: string;
  is_active: boolean;
  updated_at?: string;
}

interface ShopCardProps {
  shop: Shop;
  onEdit: (shop: Shop) => void;
  onDeleteSuccess: () => void;
}

const ShopCard = ({ shop, onEdit, onDeleteSuccess }: ShopCardProps) => {
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
    <Card className="overflow-hidden">
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
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(shop)}
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

export default ShopCard;

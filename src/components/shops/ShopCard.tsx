
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, MapPin, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Shop {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  category: string;
  is_active: boolean;
}

interface ShopCardProps {
  shop: Shop;
  onEdit: (shop: Shop) => void;
}

export const ShopCard = ({ shop, onEdit }: ShopCardProps) => {
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this shop?')) {
      return;
    }

    try {
      console.log('[ShopCard] Deleting shop:', shop.id);
      const { error } = await supabase
        .from('shops')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', shop.id);

      if (error) {
        console.error('[ShopCard] Delete error:', error);
        throw error;
      }

      console.log('[ShopCard] Shop deleted successfully');
      toast.success('Shop deleted successfully');
    } catch (error: any) {
      console.error('[ShopCard] Error deleting shop:', error);
      toast.error(`Failed to delete shop: ${error.message}`);
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
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">{shop.category}</Badge>
            <Badge variant={shop.is_active ? "default" : "destructive"}>
              {shop.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          
          {shop.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              <span>{shop.phone}</span>
            </div>
          )}
          
          {shop.address && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-2">{shop.address}</span>
            </div>
          )}
          
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

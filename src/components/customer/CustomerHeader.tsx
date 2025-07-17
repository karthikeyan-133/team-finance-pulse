
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, LogOut, Loader2, RotateCcw } from 'lucide-react';

interface CustomerData {
  id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
}

interface CustomerHeaderProps {
  customer: CustomerData | null;
  selectedCategory: string;
  currentStep: string;
  cartItemCount: number;
  cartTotal: number;
  isLoading: boolean;
  onLogout: () => void;
  onNewOrder: () => void;
}

const CustomerHeader: React.FC<CustomerHeaderProps> = ({
  customer,
  selectedCategory,
  currentStep,
  cartItemCount,
  cartTotal,
  isLoading,
  onLogout,
  onNewOrder
}) => {
  return (
    <div className="bg-white shadow-sm border-b px-3 py-2 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <img 
          src="/lovable-uploads/1bce2b84-91de-467d-b543-bc74a5bdffd6.png" 
          alt="Slicker Connect Logo" 
          className="h-8 w-8 flex-shrink-0" 
        />
        <div className="min-w-0 flex-1">
          <h1 className="text-sm font-semibold truncate">Slicker Connect</h1>
          {selectedCategory && (
            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-nowrap">
              {selectedCategory}
            </span>
          )}
        </div>
        {isLoading && (
          <Loader2 className="h-3 w-3 animate-spin text-blue-600 flex-shrink-0" />
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {currentStep === 'completed' && (
          <Button variant="outline" size="sm" onClick={onNewOrder} className="h-6 px-2 text-xs">
            <RotateCcw className="h-3 w-3 mr-1" />
            New Order
          </Button>
        )}
        
        {cartItemCount > 0 && currentStep !== 'completed' && (
          <div className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded-full">
            <ShoppingCart className="h-3 w-3 text-blue-600" />
            <span className="text-xs font-medium text-blue-800">
              {cartItemCount} • ₹{cartTotal}
            </span>
          </div>
        )}
        
        {customer && (
          <div className="flex items-center gap-1">
            <User className="h-3 w-3 text-gray-600" />
            <Button variant="outline" size="sm" onClick={onLogout} className="h-6 w-6 p-0">
              <LogOut className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerHeader;

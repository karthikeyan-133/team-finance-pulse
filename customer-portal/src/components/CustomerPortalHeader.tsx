import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, LogOut, Loader2, RotateCcw } from 'lucide-react';

interface CustomerPortalHeaderProps {
  selectedCategory: string;
  shopsLoading: boolean;
  productsLoading: boolean;
  currentStep: string;
  cartTotalItems: number;
  cartTotalAmount: number;
  customer: any;
  onNewOrder: () => void;
  onLogout: () => void;
}

const CustomerPortalHeader: React.FC<CustomerPortalHeaderProps> = ({
  selectedCategory,
  shopsLoading,
  productsLoading,
  currentStep,
  cartTotalItems,
  cartTotalAmount,
  customer,
  onNewOrder,
  onLogout
}) => {
  return (
    <div className="bg-white shadow-sm border-b px-3 py-2 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold flex-shrink-0">
          <ShoppingCart className="h-3 w-3" />
          SLICKERCONNECT
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-sm font-semibold truncate">Order Assistant</h1>
          {selectedCategory && (
            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-nowrap">
              {selectedCategory}
            </span>
          )}
        </div>
        {(shopsLoading || productsLoading) && (
          <Loader2 className="h-3 w-3 animate-spin text-blue-600 flex-shrink-0" />
        )}
      </div>
      
      {/* Cart & User Info */}
      <div className="flex items-center gap-2">
        {/* New Order Button - Show when order is completed */}
        {currentStep === 'completed' && (
          <Button
            variant="outline"
            size="sm"
            onClick={onNewOrder}
            className="h-6 px-2 text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            New Order
          </Button>
        )}
        
        {cartTotalItems > 0 && currentStep !== 'completed' && (
          <div className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded-full">
            <ShoppingCart className="h-3 w-3 text-blue-600" />
            <span className="text-xs font-medium text-blue-800">
              {cartTotalItems} • ₹{cartTotalAmount}
            </span>
          </div>
        )}
        {customer && (
          <div className="flex items-center gap-1">
            <User className="h-3 w-3 text-gray-600" />
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="h-6 w-6 p-0"
            >
              <LogOut className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerPortalHeader;
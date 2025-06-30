
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Edit, Check, X, DollarSign, Loader2 } from 'lucide-react';
import { ShopPayment } from '@/hooks/useShopPayments';
import { formatCurrency } from '@/utils/reportUtils';
import { toast } from 'sonner';

interface ShopPaymentCardProps {
  payment: ShopPayment;
  onMarkAsPaid: (paymentId: string, paidBy: string) => Promise<void>;
  onUpdateAmount: (paymentId: string, newAmount: number) => Promise<void>;
  isAdmin?: boolean;
}

const ShopPaymentCard: React.FC<ShopPaymentCardProps> = ({
  payment,
  onMarkAsPaid,
  onUpdateAmount,
  isAdmin = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editAmount, setEditAmount] = useState(payment.amount.toString());
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSaveAmount = async () => {
    const newAmount = parseFloat(editAmount);
    if (isNaN(newAmount) || newAmount < 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (newAmount === payment.amount) {
      setIsEditing(false);
      return;
    }

    try {
      setIsProcessing(true);
      await onUpdateAmount(payment.id, newAmount);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating amount:', error);
      toast.error('Failed to update amount');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkAsPaid = async () => {
    try {
      setIsProcessing(true);
      await onMarkAsPaid(payment.id, 'Admin');
    } catch (error) {
      console.error('Error marking as paid:', error);
      toast.error('Failed to mark as paid');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditAmount(payment.amount.toString());
    setIsEditing(false);
  };

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'commission':
        return 'Commission';
      case 'delivery_charge':
        return 'Delivery Charge';
      case 'other':
        return 'Other';
      default:
        return type;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">
            {payment.shop_name}
          </CardTitle>
          <CardDescription>
            {getPaymentTypeLabel(payment.payment_type)} • {new Date(payment.payment_date).toLocaleDateString()}
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={payment.payment_status === 'paid' ? 'default' : 'destructive'}>
            {payment.payment_status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            {isEditing && isAdmin ? (
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-24 h-8"
                  step="0.01"
                  min="0"
                  disabled={isProcessing}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSaveAmount}
                  disabled={isProcessing}
                >
                  {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isProcessing}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold">
                  {formatCurrency(Number(payment.amount))}
                </span>
                {isAdmin && payment.payment_status === 'pending' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(true)}
                    disabled={isProcessing}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {isAdmin && payment.payment_status === 'pending' && !isEditing && (
            <Button
              size="sm"
              onClick={handleMarkAsPaid}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : null}
              Mark as Paid
            </Button>
          )}
        </div>

        {payment.paid_by && payment.paid_at && (
          <div className="mt-2 text-xs text-muted-foreground">
            Paid by {payment.paid_by} on {new Date(payment.paid_at).toLocaleString()}
          </div>
        )}

        {payment.order_id && (
          <div className="mt-2 text-xs text-muted-foreground">
            Order ID: {payment.order_id.slice(0, 8)}...
          </div>
        )}

        {payment.notes && (
          <div className="mt-2 text-xs text-muted-foreground">
            Notes: {payment.notes}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShopPaymentCard;


import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Transaction } from '../../types';
import { calculatePaymentMethodDistribution } from '../../utils/reportUtils';

interface PaymentMethodsProps {
  transactions: Transaction[];
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({ transactions }) => {
  const paymentMethods = calculatePaymentMethodDistribution(transactions);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>Distribution by payment type</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Cash:</span>
            <span className="font-bold">₹{paymentMethods.cash.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>UPI:</span>
            <span className="font-bold">₹{paymentMethods.upi.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Other:</span>
            <span className="font-bold">₹{paymentMethods.other.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentMethods;

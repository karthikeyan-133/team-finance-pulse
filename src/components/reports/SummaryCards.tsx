
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Transaction, Customer } from '../../types';

interface SummaryCardsProps {
  transactions: Transaction[];
  customers: Customer[];
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ transactions, customers }) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₹{transactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-muted-foreground">
            From {transactions.length} transactions
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600">
            ₹{transactions.filter(t => t.paymentStatus === 'pending').reduce((sum, t) => sum + t.amount, 0).toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-muted-foreground">
            From {transactions.filter(t => t.paymentStatus === 'pending').length} transactions
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Customer Base</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {customers.length}
          </div>
          <p className="text-xs text-muted-foreground">
            {customers.filter(c => c.isNew).length} new, {customers.length - customers.filter(c => c.isNew).length} returning
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryCards;

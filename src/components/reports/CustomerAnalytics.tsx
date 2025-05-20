
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Customer } from '../../types';
import { calculateCustomerMetrics } from '../../utils/reportUtils';

interface CustomerAnalyticsProps {
  customers: Customer[];
}

const CustomerAnalytics: React.FC<CustomerAnalyticsProps> = ({ customers }) => {
  const customerMetrics = calculateCustomerMetrics(customers);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Analytics</CardTitle>
        <CardDescription>Distribution of customer types</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Total Customers:</span>
            <span className="font-bold">{customerMetrics.total}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>New Customers:</span>
            <span className="font-bold text-green-600">{customerMetrics.new} ({customerMetrics.newPercentage}%)</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Returning Customers:</span>
            <span className="font-bold text-blue-600">{customerMetrics.returning} ({100 - customerMetrics.newPercentage}%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerAnalytics;

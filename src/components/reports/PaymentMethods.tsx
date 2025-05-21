
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Transaction } from '../../types';
import { calculatePaymentMethodDistribution } from '../../utils/reportUtils';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PaymentMethodsProps {
  transactions: Transaction[];
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({ transactions }) => {
  const paymentMethods = calculatePaymentMethodDistribution(transactions);
  
  // Prepare data for pie chart
  const total = paymentMethods.cash + paymentMethods.upi + paymentMethods.other;
  
  const data = [
    { name: 'Cash', value: paymentMethods.cash },
    { name: 'UPI', value: paymentMethods.upi },
    { name: 'Other', value: paymentMethods.other },
  ].filter(item => item.value > 0); // Only show methods with values

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];
  
  // Calculate percentages
  const getPercentage = (value: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>Distribution by payment type</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Payment method breakdown list */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="flex items-center">
                <span className="h-3 w-3 rounded-full bg-[#0088FE] mr-2"></span>
                Cash:
              </span>
              <span className="font-bold">₹{paymentMethods.cash.toLocaleString('en-IN')} ({getPercentage(paymentMethods.cash)}%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center">
                <span className="h-3 w-3 rounded-full bg-[#00C49F] mr-2"></span>
                UPI:
              </span>
              <span className="font-bold">₹{paymentMethods.upi.toLocaleString('en-IN')} ({getPercentage(paymentMethods.upi)}%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center">
                <span className="h-3 w-3 rounded-full bg-[#FFBB28] mr-2"></span>
                Other:
              </span>
              <span className="font-bold">₹{paymentMethods.other.toLocaleString('en-IN')} ({getPercentage(paymentMethods.other)}%)</span>
            </div>
          </div>
          
          {/* Pie chart */}
          {total > 0 && (
            <div className="h-[200px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          
          {/* Total */}
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="font-semibold">Total Collections:</span>
            <span className="font-bold text-lg">₹{total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentMethods;

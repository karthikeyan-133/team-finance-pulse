
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table';
import { Transaction } from '../../types';
import { calculateMonthlySales } from '../../utils/reportUtils';

interface MonthlySalesTableProps {
  transactions: Transaction[];
}

const MonthlySalesTable: React.FC<MonthlySalesTableProps> = ({ transactions }) => {
  const monthlySales = calculateMonthlySales(transactions);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Sales Summary</CardTitle>
        <CardDescription>Revenue breakdown by month</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead>Transactions</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Paid Amount</TableHead>
              <TableHead>Pending Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {monthlySales.map((month) => (
              <TableRow key={month.month}>
                <TableCell className="font-medium">{month.month}</TableCell>
                <TableCell>{month.count}</TableCell>
                <TableCell>₹{month.total.toLocaleString('en-IN')}</TableCell>
                <TableCell>₹{month.paid.toLocaleString('en-IN')}</TableCell>
                <TableCell>₹{month.pending.toLocaleString('en-IN')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default MonthlySalesTable;

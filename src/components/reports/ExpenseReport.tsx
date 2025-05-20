
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Expense } from '../../types';
import { generateCsvData, formatDateForFilename, exportToCsv } from '../../utils/reportUtils';

interface ExpenseReportProps {
  expenses: Expense[];
}

const ExpenseReport: React.FC<ExpenseReportProps> = ({ expenses }) => {
  const handleExport = () => {
    const data = generateCsvData(expenses, 'expenses');
    const filename = `expenses_${formatDateForFilename()}.csv`;
    exportToCsv(data, filename);
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Expense Report</CardTitle>
          <CardDescription>Comprehensive expense history</CardDescription>
        </div>
        <Button size="sm" onClick={handleExport} className="flex items-center gap-1">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.slice(0, 10).map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                <TableCell>{expense.title}</TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell>₹{expense.amount.toLocaleString('en-IN')}</TableCell>
                <TableCell className="max-w-xs truncate">{expense.description || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {expenses.length > 10 && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Showing 10 of {expenses.length} expenses. Export to CSV for full data.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseReport;

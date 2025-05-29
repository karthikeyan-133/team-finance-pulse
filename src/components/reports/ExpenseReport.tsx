
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, Trash2 } from 'lucide-react';
import { Expense } from '../../types';
import { generateCsvData, formatDateForFilename, exportToCsv } from '../../utils/reportUtils';
import { useData } from '../../context/DataContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ExpenseReportProps {
  expenses: Expense[];
}

const ExpenseReport: React.FC<ExpenseReportProps> = ({ expenses }) => {
  const { deleteExpense } = useData();

  const handleExport = () => {
    const data = generateCsvData(expenses, 'expenses');
    const filename = `expenses_${formatDateForFilename()}.csv`;
    exportToCsv(data, filename);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id);
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
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
              <TableHead>Actions</TableHead>
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
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this expense? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(expense.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
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

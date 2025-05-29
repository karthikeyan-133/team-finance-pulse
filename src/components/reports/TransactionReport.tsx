
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, Trash2, Edit } from 'lucide-react';
import { Transaction } from '../../types';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import EditTransactionForm from '../forms/EditTransactionForm';

interface TransactionReportProps {
  transactions: Transaction[];
}

const TransactionReport: React.FC<TransactionReportProps> = ({ transactions }) => {
  const { deleteTransaction } = useData();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleExport = () => {
    const data = generateCsvData(transactions, 'transactions');
    const filename = `transactions_${formatDateForFilename()}.csv`;
    exportToCsv(data, filename);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id);
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    }
  };

  const handleEditSuccess = () => {
    setEditingTransaction(null);
  };
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Transaction Report</CardTitle>
            <CardDescription>Comprehensive transaction history</CardDescription>
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
                <TableHead>Shop</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.slice(0, 10).map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                  <TableCell>{transaction.shopName}</TableCell>
                  <TableCell>₹{transaction.amount.toLocaleString('en-IN')}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                      transaction.paymentStatus === 'paid' 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {transaction.paymentStatus}
                    </span>
                  </TableCell>
                  <TableCell>{transaction.paymentMethod}</TableCell>
                  <TableCell>₹{(transaction.commission || 0).toLocaleString('en-IN')}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setEditingTransaction(transaction)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this transaction? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(transaction.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {transactions.length > 10 && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Showing 10 of {transactions.length} transactions. Export to CSV for full data.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          {editingTransaction && (
            <EditTransactionForm 
              transaction={editingTransaction}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingTransaction(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TransactionReport;

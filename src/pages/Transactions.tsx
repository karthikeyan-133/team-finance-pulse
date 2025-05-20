
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Filter, 
  MoreVertical, 
  FileText, 
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const PAGE_SIZE = 10;

const Transactions: React.FC = () => {
  const { user } = useAuth();
  const { transactions, customers, getCustomerById, updateTransaction, isLoading } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending'>('paid');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'other'>('cash');
  const [commissionStatus, setCommissionStatus] = useState<'paid' | 'pending'>('paid');
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  
  // Filter and search transactions
  const filteredTransactions = transactions
    .filter((transaction) => {
      const customer = getCustomerById(transaction.customerId);
      const searchContent = `${transaction.shopName} ${customer?.name || ''}`.toLowerCase();
      
      return searchContent.includes(searchTerm.toLowerCase());
    })
    .filter((transaction) => {
      if (!filterStatus) return true;
      return transaction.paymentStatus === filterStatus;
    })
    .filter((transaction) => {
      if (!filterPaymentMethod) return true;
      return transaction.paymentMethod === filterPaymentMethod;
    })
    // Sort by date (most recent first)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / PAGE_SIZE);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const resetFilters = () => {
    setFilterStatus(null);
    setFilterPaymentMethod(null);
    setSearchTerm('');
  };

  const handleEdit = (transactionId: string) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction) {
      setEditingTransaction(transactionId);
      setPaymentStatus(transaction.paymentStatus);
      setPaymentMethod(transaction.paymentMethod);
      setCommissionStatus(transaction.commissionStatus);
      setShowTransactionDialog(true);
    }
  };

  const handleUpdateTransaction = () => {
    if (!editingTransaction) return;
    
    updateTransaction(editingTransaction, {
      paymentStatus,
      paymentMethod,
      commissionStatus,
    });
    
    setShowTransactionDialog(false);
    setEditingTransaction(null);
  };

  const handleExportCSV = () => {
    // Convert transaction data to CSV format
    const headers = ['Date', 'Shop', 'Customer', 'Amount', 'Payment Status', 'Payment Method', 'Commission Status'];
    
    const csvData = filteredTransactions.map(transaction => {
      const customer = getCustomerById(transaction.customerId);
      return [
        new Date(transaction.date).toLocaleDateString(),
        transaction.shopName,
        customer?.name || 'Unknown',
        transaction.amount,
        transaction.paymentStatus,
        transaction.paymentMethod,
        transaction.commissionStatus
      ].join(',');
    });
    
    const csvContent = [
      headers.join(','),
      ...csvData
    ].join('\n');
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Transactions exported successfully');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground">
            Manage your delivery transactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={handleExportCSV}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>
            Showing {Math.min(filteredTransactions.length, PAGE_SIZE)} of {filteredTransactions.length} transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Search by shop or customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="sm:max-w-[300px]"
              />
              
              {showFilters && (
                <>
                  <Select
                    value={filterStatus || ""}
                    onValueChange={(value) => setFilterStatus(value || null)}
                  >
                    <SelectTrigger className="sm:w-[180px]">
                      <SelectValue placeholder="Payment Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={filterPaymentMethod || ""}
                    onValueChange={(value) => setFilterPaymentMethod(value || null)}
                  >
                    <SelectTrigger className="sm:w-[180px]">
                      <SelectValue placeholder="Payment Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Methods</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                  >
                    Reset Filters
                  </Button>
                </>
              )}
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Shop</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedTransactions.map((transaction) => {
                      const customer = getCustomerById(transaction.customerId);
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">
                            {new Date(transaction.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{transaction.shopName}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{customer?.name || 'Unknown'}</span>
                              {customer?.isNew && (
                                <Badge variant="outline" className="mt-1 w-fit">New</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            ₹{transaction.amount.toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={transaction.paymentStatus === 'paid' ? 'default' : 'destructive'}
                              className="capitalize"
                            >
                              {transaction.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="capitalize">{transaction.paymentMethod}</TableCell>
                          <TableCell>
                            <Badge
                              variant={transaction.commissionStatus === 'paid' ? 'outline' : 'secondary'}
                              className="capitalize"
                            >
                              {transaction.commissionStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(transaction.id)}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  Update Status
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous Page</span>
                </Button>
                <div className="text-sm">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next Page</span>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Transaction Dialog */}
      <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Transaction Status</DialogTitle>
            <DialogDescription>
              Change payment and commission status for this transaction.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="paymentStatus">Payment Status</Label>
              <Select
                value={paymentStatus}
                onValueChange={(value) => setPaymentStatus(value as 'paid' | 'pending')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as 'cash' | 'upi' | 'other')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="commissionStatus">Commission Status</Label>
              <Select
                value={commissionStatus}
                onValueChange={(value) => setCommissionStatus(value as 'paid' | 'pending')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTransactionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTransaction}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Transactions;

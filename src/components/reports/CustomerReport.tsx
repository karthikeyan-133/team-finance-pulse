
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, Trash2 } from 'lucide-react';
import { Customer } from '../../types';
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

interface CustomerReportProps {
  customers: Customer[];
}

const CustomerReport: React.FC<CustomerReportProps> = ({ customers }) => {
  const { deleteCustomer } = useData();

  const handleExport = () => {
    const data = generateCsvData(customers, 'customers');
    const filename = `customers_${formatDateForFilename()}.csv`;
    exportToCsv(data, filename);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCustomer(id);
    } catch (error) {
      console.error('Failed to delete customer:', error);
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Customer Report</CardTitle>
          <CardDescription>Comprehensive customer data</CardDescription>
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
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Since</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.slice(0, 10).map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                    customer.isNew 
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {customer.isNew ? 'New' : 'Returning'}
                  </span>
                </TableCell>
                <TableCell>{customer.address || 'N/A'}</TableCell>
                <TableCell>{new Date(customer.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this customer? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(customer.id)}
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
        {customers.length > 10 && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Showing 10 of {customers.length} customers. Export to CSV for full data.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerReport;

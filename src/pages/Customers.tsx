
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
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const PAGE_SIZE = 10;

const Customers: React.FC = () => {
  const { user } = useAuth();
  const { customers, addCustomer, isLoading } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false);
  
  // New customer form state
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    isNew: true,
  });

  // Filter customers by search term
  const filteredCustomers = customers
    .filter((customer) => {
      const searchContent = `${customer.name} ${customer.phone} ${customer.email || ''}`.toLowerCase();
      return searchContent.includes(searchTerm.toLowerCase());
    })
    // Sort by most recently created
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / PAGE_SIZE);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleAddCustomer = () => {
    addCustomer(newCustomer);
    setNewCustomer({
      name: '',
      phone: '',
      email: '',
      address: '',
      isNew: true,
    });
    setShowNewCustomerDialog(false);
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
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground">
            Manage your customer database
          </p>
        </div>
        <Button onClick={() => setShowNewCustomerDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>All Customers</CardTitle>
          <CardDescription>
            Showing {Math.min(filteredCustomers.length, PAGE_SIZE)} of {filteredCustomers.length} customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Search by name, phone or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-[300px]"
            />

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                        No customers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{customer.phone}</span>
                            {customer.email && (
                              <span className="text-sm text-muted-foreground">
                                {customer.email}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{customer.address || 'Not provided'}</TableCell>
                        <TableCell>
                          {customer.isNew ? (
                            <Badge>New</Badge>
                          ) : (
                            <Badge variant="outline">Regular</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(customer.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
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

      {/* Add Customer Dialog */}
      <Dialog open={showNewCustomerDialog} onOpenChange={setShowNewCustomerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Enter the details of the new customer
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Customer Name *</Label>
              <Input 
                id="name"
                value={newCustomer.name} 
                onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                placeholder="Enter customer name" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input 
                id="phone"
                value={newCustomer.phone} 
                onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                placeholder="Enter phone number" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input 
                id="email"
                type="email"
                value={newCustomer.email} 
                onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                placeholder="Enter email address" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address (Optional)</Label>
              <Input 
                id="address"
                value={newCustomer.address} 
                onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                placeholder="Enter address" 
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="isNew"
                checked={newCustomer.isNew}
                onCheckedChange={(checked) => setNewCustomer({...newCustomer, isNew: checked as boolean})}
              />
              <label htmlFor="isNew" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Mark as new customer
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewCustomerDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddCustomer}
              disabled={!newCustomer.name || !newCustomer.phone}
            >
              Add Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;

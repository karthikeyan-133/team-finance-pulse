import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from '@/context/DataContext';
import { MapPin, Truck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';
import { Navigate } from 'react-router-dom';

const DeliveryUpdate = () => {
  const { addTransaction, addCustomer, customers, getCustomerById } = useData();
  const { user } = useAuth();
  
  // Redirect admins to admin analytics page as they should use that page
  if (user?.role === 'admin') {
    return <Navigate to="/admin-analytics" replace />;
  }
  
  const [formData, setFormData] = useState({
    shopName: '',
    customerName: '',
    customerPhone: '',
    customerStatus: 'old',
    customerLocation: '',
    amount: '',
    amountStatus: 'pending',
    deliveryCharge: '',
    commission: '',
    paymentMethod: 'upi'
  });

  // Add state for customer selection
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [isNewCustomerEntry, setIsNewCustomerEntry] = useState(true);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
    
    // Populate form with existing customer data
    const selectedCustomer = getCustomerById(customerId);
    if (selectedCustomer) {
      setFormData(prev => ({
        ...prev,
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.phone,
        customerLocation: selectedCustomer.address || selectedCustomer.customerLocation || '',
        customerStatus: selectedCustomer.isNew ? 'new' : 'old'
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.shopName || !formData.customerName || !formData.customerPhone || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      let customerId = selectedCustomerId;

      // If this is a new customer entry, create a new customer record
      if (isNewCustomerEntry) {
        customerId = await addCustomer({
          name: formData.customerName,
          phone: formData.customerPhone,
          address: formData.customerLocation,
          isNew: formData.customerStatus === 'new',
          customerLocation: formData.customerLocation,
          email: ''
        });
        toast.success('New customer added');
      }

      const newTransaction = {
        shopName: formData.shopName,
        customerId: customerId,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerLocation: formData.customerLocation,
        isNewCustomer: formData.customerStatus === 'new' ? 'true' : 'false',
        date: new Date().toISOString(),
        amount: parseFloat(formData.amount) || 0,
        paymentStatus: formData.amountStatus as 'paid' | 'pending',
        paymentMethod: formData.paymentMethod as 'cash' | 'upi' | 'other',
        deliveryCharge: formData.deliveryCharge ? parseFloat(formData.deliveryCharge) : null,
        commission: formData.commission ? parseFloat(formData.commission) : null,
        commissionStatus: 'pending' as 'paid' | 'pending',
        description: '',
        handledBy: user?.name || 'Unknown',
      };

      await addTransaction(newTransaction);
      
      // Reset form
      setFormData({
        shopName: '',
        customerName: '',
        customerPhone: '',
        customerStatus: 'old',
        customerLocation: '',
        amount: '',
        amountStatus: 'pending',
        deliveryCharge: '',
        commission: '',
        paymentMethod: 'upi'
      });
      setSelectedCustomerId('');
      setIsNewCustomerEntry(true);

      toast.success('Delivery details updated successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to update delivery details');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Truck className="h-5 w-5" />
              Update Delivery
            </CardTitle>
            <CardDescription>
              Fill in the delivery details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="shopName">Shop Name</Label>
                <Input
                  id="shopName"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleInputChange}
                  placeholder="e.g., Zyra"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Customer Entry</Label>
                  <div className="flex items-center space-x-2">
                    <Button 
                      type="button" 
                      variant={isNewCustomerEntry ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsNewCustomerEntry(true)}
                    >
                      New Entry
                    </Button>
                    <Button 
                      type="button" 
                      variant={!isNewCustomerEntry ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsNewCustomerEntry(false)}
                    >
                      Existing
                    </Button>
                  </div>
                </div>

                {!isNewCustomerEntry ? (
                  <div>
                    <Label htmlFor="customerId">Select Customer</Label>
                    <Select 
                      value={selectedCustomerId} 
                      onValueChange={handleCustomerSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name} - {customer.phone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}
              </div>

              <div>
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="e.g., Hevana"
                  required
                  readOnly={!isNewCustomerEntry && selectedCustomerId !== ''}
                  className={!isNewCustomerEntry && selectedCustomerId !== '' ? "bg-gray-100" : ""}
                />
              </div>

              <div>
                <Label htmlFor="customerStatus">Customer Status</Label>
                <Select 
                  value={formData.customerStatus} 
                  onValueChange={(value) => handleSelectChange('customerStatus', value)}
                  disabled={!isNewCustomerEntry && selectedCustomerId !== ''}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="old">Old</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="customerPhone">Customer Number</Label>
                <Input
                  id="customerPhone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  placeholder="e.g., 9633981130"
                  required
                  readOnly={!isNewCustomerEntry && selectedCustomerId !== ''}
                  className={!isNewCustomerEntry && selectedCustomerId !== '' ? "bg-gray-100" : ""}
                />
              </div>

              <div>
                <Label htmlFor="customerLocation" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Customer Location
                </Label>
                <Input
                  id="customerLocation"
                  name="customerLocation"
                  value={formData.customerLocation}
                  onChange={handleInputChange}
                  placeholder="e.g., 10.7373653,76.8244398"
                />
              </div>

              <div>
                <Label htmlFor="amountStatus">Amount Status</Label>
                <Select 
                  value={formData.amountStatus} 
                  onValueChange={(value) => handleSelectChange('amountStatus', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="e.g., 380"
                  required
                />
              </div>

              <div>
                <Label htmlFor="deliveryCharge">Delivery Charge (₹)</Label>
                <Input
                  id="deliveryCharge"
                  name="deliveryCharge"
                  type="number"
                  value={formData.deliveryCharge}
                  onChange={handleInputChange}
                  placeholder="Leave empty if nil"
                />
              </div>

              <div>
                <Label htmlFor="commission">Commission (₹)</Label>
                <Input
                  id="commission"
                  name="commission"
                  type="number"
                  value={formData.commission}
                  onChange={handleInputChange}
                  placeholder="Leave empty if nil"
                />
              </div>

              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select 
                  value={formData.paymentMethod} 
                  onValueChange={(value) => handleSelectChange('paymentMethod', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full">
                Update Delivery
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeliveryUpdate;

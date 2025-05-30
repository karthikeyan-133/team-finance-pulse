import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from '@/context/DataContext';
import { MapPin, Truck, User, Phone, IndianRupee, Store } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';
import { Navigate } from 'react-router-dom';
import { getActiveShops, getShopById } from '@/config/shops';
import MultiShopDeliveryForm from '@/components/forms/MultiShopDeliveryForm';

const DeliveryUpdate = () => {
  const { user } = useAuth();
  const [deliveryMode, setDeliveryMode] = useState<'single' | 'multi'>('single');
  
  // Redirect admins to admin analytics page as they should use that page
  if (user?.role === 'admin') {
    return <Navigate to="/admin-analytics" replace />;
  }

  // If multi-shop mode is selected, show the multi-shop form
  if (deliveryMode === 'multi') {
    return <MultiShopDeliveryForm />;
  }

  const { addTransaction, addCustomer, customers, getCustomerById } = useData();
  
  const [formData, setFormData] = useState({
    shopId: '',
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

  const activeShops = getActiveShops();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleShopSelect = (shopId: string) => {
    const selectedShop = getShopById(shopId);
    if (selectedShop) {
      setFormData(prev => ({
        ...prev,
        shopId,
        shopName: selectedShop.name
      }));
    }
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
    
    if (!formData.shopId || !formData.customerName || !formData.customerPhone || !formData.amount) {
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
        shopId: '',
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

  const handleDeliveryModeChange = (mode: 'single' | 'multi') => {
    setDeliveryMode(mode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4">
      <div className="max-w-lg mx-auto space-y-4">
        {/* Delivery Mode Toggle */}
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur">
          <CardContent className="p-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Delivery Mode</Label>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant={deliveryMode === 'single' ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleDeliveryModeChange('single')}
                  className="flex-1 h-10"
                >
                  Single Shop
                </Button>
                <Button 
                  type="button" 
                  variant={deliveryMode === 'multi' ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleDeliveryModeChange('multi')}
                  className="flex-1 h-10"
                >
                  Multi Shop
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur">
          <CardHeader className="text-center pb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center justify-center gap-2 text-lg sm:text-xl">
              <Truck className="h-5 w-5 sm:h-6 sm:w-6" />
              Update Delivery
            </CardTitle>
            <CardDescription className="text-blue-100 text-sm">
              Fill in the delivery details for single shop
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Shop Selection */}
              <div className="space-y-2">
                <Label htmlFor="shopId" className="text-sm font-medium flex items-center gap-2">
                  <Store className="h-4 w-4 text-blue-600" />
                  Select Shop *
                </Label>
                <Select 
                  value={formData.shopId} 
                  onValueChange={handleShopSelect}
                  key={activeShops.length} // Force re-render when shops change
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Choose a shop" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeShops.map((shop) => (
                      <SelectItem key={shop.id} value={shop.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{shop.name}</span>
                          {shop.location && (
                            <span className="text-xs text-gray-500">{shop.location}</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Customer Entry Toggle */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Customer Entry</Label>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant={isNewCustomerEntry ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsNewCustomerEntry(true)}
                    className="flex-1 h-10"
                  >
                    New Entry
                  </Button>
                  <Button 
                    type="button" 
                    variant={!isNewCustomerEntry ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsNewCustomerEntry(false)}
                    className="flex-1 h-10"
                  >
                    Existing
                  </Button>
                </div>

                {!isNewCustomerEntry && (
                  <div className="space-y-2">
                    <Label htmlFor="customerId" className="text-sm">Select Customer</Label>
                    <Select 
                      value={selectedCustomerId} 
                      onValueChange={handleCustomerSelect}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{customer.name}</span>
                              <span className="text-xs text-gray-500">{customer.phone}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Customer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName" className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    Customer Name *
                  </Label>
                  <Input
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    placeholder="e.g., Hevana"
                    required
                    readOnly={!isNewCustomerEntry && selectedCustomerId !== ''}
                    className={`h-11 ${!isNewCustomerEntry && selectedCustomerId !== '' ? "bg-gray-50" : ""}`}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerStatus" className="text-sm font-medium">Customer Status</Label>
                  <Select 
                    value={formData.customerStatus} 
                    onValueChange={(value) => handleSelectChange('customerStatus', value)}
                    disabled={!isNewCustomerEntry && selectedCustomerId !== ''}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="old">Old</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone" className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-600" />
                  Customer Number *
                </Label>
                <Input
                  id="customerPhone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  placeholder="e.g., 9633981130"
                  required
                  readOnly={!isNewCustomerEntry && selectedCustomerId !== ''}
                  className={`h-11 ${!isNewCustomerEntry && selectedCustomerId !== '' ? "bg-gray-50" : ""}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerLocation" className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Customer Location
                </Label>
                <Input
                  id="customerLocation"
                  name="customerLocation"
                  value={formData.customerLocation}
                  onChange={handleInputChange}
                  placeholder="e.g., 10.7373653,76.8244398"
                  className="h-11"
                />
              </div>

              {/* Payment Details */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <h3 className="font-medium text-sm flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-green-600" />
                  Payment Details
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amountStatus" className="text-sm">Amount Status</Label>
                    <Select 
                      value={formData.amountStatus} 
                      onValueChange={(value) => handleSelectChange('amountStatus', value)}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-sm">Amount (₹) *</Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="e.g., 380"
                      required
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deliveryCharge" className="text-sm">Delivery Charge (₹)</Label>
                    <Input
                      id="deliveryCharge"
                      name="deliveryCharge"
                      type="number"
                      value={formData.deliveryCharge}
                      onChange={handleInputChange}
                      placeholder="Optional"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="commission" className="text-sm">Commission (₹)</Label>
                    <Input
                      id="commission"
                      name="commission"
                      type="number"
                      value={formData.commission}
                      onChange={handleInputChange}
                      placeholder="Optional"
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod" className="text-sm">Payment Method</Label>
                  <Select 
                    value={formData.paymentMethod} 
                    onValueChange={(value) => handleSelectChange('paymentMethod', value)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
              >
                <Truck className="h-5 w-5 mr-2" />
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

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

const DeliveryUpdate = () => {
  const { addTransaction, addCustomer, customers, getCustomerById } = useData();
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <Navigate to="/admin-analytics" replace />;
  }

  const [formData, setFormData] = useState({
    shopNames: [''],
    amounts: [''],
    customerName: '',
    customerPhone: '',
    customerStatus: 'old',
    customerLocation: '',
    amountStatus: 'pending',
    deliveryCharge: '',
    commission: '',
    paymentMethod: 'upi'
  });

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

  const handleArrayChange = (name: 'shopNames' | 'amounts', index: number, value: string) => {
    setFormData(prev => {
      const updated = [...prev[name]];
      updated[index] = value;
      return { ...prev, [name]: updated };
    });
  };

  const addField = (name: 'shopNames' | 'amounts') => {
    setFormData(prev => ({
      ...prev,
      [name]: [...prev[name], '']
    }));
  };

  const removeField = (name: 'shopNames' | 'amounts', index: number) => {
    setFormData(prev => {
      const updated = [...prev[name]];
      updated.splice(index, 1);
      return { ...prev, [name]: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      formData.shopNames.some(name => !name.trim()) ||
      formData.amounts.some(amount => !amount.trim()) ||
      !formData.customerName ||
      !formData.customerPhone
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      let customerId = selectedCustomerId;

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

      const totalAmount = formData.amounts.reduce((sum, val) => sum + parseFloat(val || '0'), 0);

      const newTransaction = {
        shopName: formData.shopNames.join(', '),
        customerId: customerId,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerLocation: formData.customerLocation,
        isNewCustomer: formData.customerStatus === 'new' ? 'true' : 'false',
        date: new Date().toISOString(),
        amount: totalAmount,
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
        shopNames: [''],
        amounts: [''],
        customerName: '',
        customerPhone: '',
        customerStatus: 'old',
        customerLocation: '',
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4">
      <div className="max-w-lg mx-auto">
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur">
          <CardHeader className="text-center pb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center justify-center gap-2 text-lg sm:text-xl">
              <Truck className="h-5 w-5 sm:h-6 sm:w-6" />
              Update Delivery
            </CardTitle>
            <CardDescription className="text-blue-100 text-sm">
              Fill in the delivery details
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Shop Name Fields */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Store className="h-4 w-4 text-blue-600" />
                  Shop Names *
                </Label>
                {formData.shopNames.map((shop, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      value={shop}
                      onChange={(e) => handleArrayChange('shopNames', index, e.target.value)}
                      placeholder={`Shop ${index + 1}`}
                      required
                      className="h-11 flex-1"
                    />
                    {index > 0 && (
                      <Button type="button" variant="destructive" onClick={() => removeField('shopNames', index)}>Remove</Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => addField('shopNames')}>+ Add Shop</Button>
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
                    <Label className="text-sm">Select Customer</Label>
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
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    Customer Name *
                  </Label>
                  <Input
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
                  <Label className="text-sm font-medium">Customer Status</Label>
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
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-600" />
                  Customer Number *
                </Label>
                <Input
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
                <Label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Customer Location
                </Label>
                <Input
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

                {/* Amounts Field */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Amounts (₹) *</Label>
                  {formData.amounts.map((amt, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        type="number"
                        value={amt}
                        onChange={(e) => handleArrayChange('amounts', index, e.target.value)}
                        placeholder={`Amount ${index + 1}`}
                        required
                        className="h-11 flex-1"
                      />
                      {index > 0 && (
                        <Button type="button" variant="destructive" onClick={() => removeField('amounts', index)}>Remove</Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={() => addField('amounts')}>+ Add Amount</Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Amount Status</Label>
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
                    <Label className="text-sm">Payment Method</Label>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Delivery Charge (₹)</Label>
                    <Input
                      type="number"
                      name="deliveryCharge"
                      value={formData.deliveryCharge}
                      onChange={handleInputChange}
                      placeholder="Optional"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Commission (₹)</Label>
                    <Input
                      type="number"
                      name="commission"
                      value={formData.commission}
                      onChange={handleInputChange}
                      placeholder="Optional"
                      className="h-11"
                    />
                  </div>
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

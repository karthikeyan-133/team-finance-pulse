
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

  const [deliveryMode, setDeliveryMode] = useState<'single' | 'multi'>('single');
  const [formData, setFormData] = useState({
    shopNames: [''],
    customerName: '',
    customerPhone: '',
    customerStatus: 'old',
    customerLocation: '',
    amounts: [''],
    amountStatuses: ['pending'],
    deliveryCharge: '',
    commission: '',
    paymentMethod: 'upi'
  });

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [isNewCustomerEntry, setIsNewCustomerEntry] = useState(true);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (field, index, value) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData(prev => ({ ...prev, [field]: updated }));
  };

  const addField = (field) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        [field]: [...prev[field], '']
      };
      if (field === 'amounts') {
        updated.amountStatuses = [...prev.amountStatuses, 'pending'];
      }
      return updated;
    });
  };

  const removeField = (field, index) => {
    setFormData(prev => {
      const updatedField = [...prev[field]];
      updatedField.splice(index, 1);
      const updated = { ...prev, [field]: updatedField };
      if (field === 'amounts') {
        const updatedStatuses = [...prev.amountStatuses];
        updatedStatuses.splice(index, 1);
        updated.amountStatuses = updatedStatuses;
      }
      return updated;
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomerSelect = (customerId) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.shopNames[0] || !formData.customerName || !formData.customerPhone || !formData.amounts[0]) {
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

      // Create transactions for each shop and amount combination
      const shops = formData.shopNames.filter(shop => shop.trim() !== '');
      const amounts = formData.amounts.filter(amount => amount.trim() !== '');

      for (let shopIndex = 0; shopIndex < shops.length; shopIndex++) {
        for (let amountIndex = 0; amountIndex < amounts.length; amountIndex++) {
          const newTransaction = {
            shopName: shops[shopIndex],
            customerId,
            customerName: formData.customerName,
            customerPhone: formData.customerPhone,
            customerLocation: formData.customerLocation,
            isNewCustomer: formData.customerStatus === 'new' ? 'true' : 'false',
            date: new Date().toISOString(),
            amount: parseFloat(amounts[amountIndex]) || 0,
            paymentStatus: formData.amountStatuses[amountIndex] || 'pending',
            paymentMethod: formData.paymentMethod,
            deliveryCharge: formData.deliveryCharge ? parseFloat(formData.deliveryCharge) : null,
            commission: formData.commission ? parseFloat(formData.commission) : null,
            commissionStatus: 'pending',
            description: '',
            handledBy: user?.name || 'Unknown'
          };
          await addTransaction(newTransaction);
        }
      }

      toast.success('Delivery details updated successfully!');

      setFormData({
        shopNames: [''],
        customerName: '',
        customerPhone: '',
        customerStatus: 'old',
        customerLocation: '',
        amounts: [''],
        amountStatuses: ['pending'],
        deliveryCharge: '',
        commission: '',
        paymentMethod: 'upi'
      });
      setSelectedCustomerId('');
      setIsNewCustomerEntry(true);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update delivery details');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4">
      <div className="max-w-lg mx-auto">
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur">
          <CardHeader className="text-center pb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center justify-center gap-2 text-lg sm:text-xl">
              <Truck className="h-5 w-5 sm:h-6 sm:w-6" /> Update Delivery
            </CardTitle>
            <CardDescription className="text-blue-100 text-sm">
              Fill in the delivery details
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="space-y-3">
                <Label className="text-sm font-medium">Delivery Mode</Label>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant={deliveryMode === 'single' ? "default" : "outline"} 
                    onClick={() => setDeliveryMode('single')} 
                    className="flex-1 h-10"
                  >
                    Single Shop
                  </Button>
                  <Button 
                    type="button" 
                    variant={deliveryMode === 'multi' ? "default" : "outline"} 
                    onClick={() => setDeliveryMode('multi')} 
                    className="flex-1 h-10"
                  >
                    Multiple Shops
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Shop Name *</Label>
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
                {deliveryMode === 'multi' && (
                  <Button type="button" variant="outline" onClick={() => addField('shopNames')}>+ Add Shop</Button>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Customer Entry</Label>
                <div className="flex gap-2">
                  <Button type="button" variant={isNewCustomerEntry ? "default" : "outline"} onClick={() => setIsNewCustomerEntry(true)} className="flex-1 h-10">New</Button>
                  <Button type="button" variant={!isNewCustomerEntry ? "default" : "outline"} onClick={() => setIsNewCustomerEntry(false)} className="flex-1 h-10">Existing</Button>
                </div>

                {!isNewCustomerEntry && (
                  <Select value={selectedCustomerId} onValueChange={handleCustomerSelect}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{customer.name}</span>
                            <span className="text-xs text-gray-500">{customer.phone}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Customer Name *</Label>
                  <Input
                    value={formData.customerName}
                    onChange={handleInputChange}
                    name="customerName"
                    required
                    readOnly={!isNewCustomerEntry && selectedCustomerId !== ''}
                    className={!isNewCustomerEntry && selectedCustomerId !== '' ? "bg-gray-50" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Customer Status</Label>
                  <Select value={formData.customerStatus} onValueChange={(v) => handleSelectChange('customerStatus', v)}>
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
                <Label>Customer Phone *</Label>
                <Input
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  name="customerPhone"
                  required
                  readOnly={!isNewCustomerEntry && selectedCustomerId !== ''}
                  className={!isNewCustomerEntry && selectedCustomerId !== '' ? "bg-gray-50" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label>Customer Location</Label>
                <Input
                  value={formData.customerLocation}
                  onChange={handleInputChange}
                  name="customerLocation"
                />
              </div>

              <div className="space-y-2">
                <Label>Amounts (₹) with Status *</Label>
                {formData.amounts.map((amt, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <Input
                      type="number"
                      value={amt}
                      onChange={(e) => handleArrayChange('amounts', index, e.target.value)}
                      className="col-span-5 h-11"
                      required
                    />
                    <Select
                      value={formData.amountStatuses[index]}
                      onValueChange={(v) => {
                        const statuses = [...formData.amountStatuses];
                        statuses[index] = v;
                        setFormData(prev => ({ ...prev, amountStatuses: statuses }));
                      }}
                    >
                      <SelectTrigger className="col-span-4 h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                    {index > 0 && (
                      <Button type="button" variant="destructive" onClick={() => removeField('amounts', index)} className="col-span-3 h-11">Remove</Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => addField('amounts')}>+ Add Amount</Button>
              </div>

              <div className="space-y-2">
                <Label>Delivery Charge</Label>
                <Input name="deliveryCharge" value={formData.deliveryCharge} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label>Commission</Label>
                <Input name="commission" value={formData.commission} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={formData.paymentMethod} onValueChange={(v) => handleSelectChange('paymentMethod', v)}>
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

              <Button type="submit" className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
                <Truck className="h-5 w-5 mr-2" /> Update Delivery
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeliveryUpdate;

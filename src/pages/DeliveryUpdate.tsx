
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

const DeliveryUpdate = () => {
  const { addTransaction, addCustomer, customers, getCustomerById } = useData();
  const { user } = useAuth();

  const [deliveryMode, setDeliveryMode] = useState<'single' | 'multi'>('single');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    shopNames: [''],
    customerName: '',
    customerPhone: '',
    customerStatus: 'old' as 'old' | 'new',
    customerLocation: '',
    amounts: [''],
    amountStatuses: ['pending'] as ('pending' | 'paid')[],
    deliveryCharge: '',
    commission: '',
    paymentMethod: 'upi' as 'upi' | 'cash' | 'other'
  });

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [isNewCustomerEntry, setIsNewCustomerEntry] = useState(true);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (field: 'shopNames' | 'amounts', index: number, value: string) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData(prev => ({ ...prev, [field]: updated }));
  };

  const addField = (field: 'shopNames' | 'amounts') => {
    setFormData(prev => {
      const updated = {
        ...prev,
        [field]: [...prev[field], '']
      };
      if (field === 'amounts') {
        updated.amountStatuses = [...prev.amountStatuses, 'pending' as const];
      }
      return updated;
    });
  };

  const removeField = (field: 'shopNames' | 'amounts', index: number) => {
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
        customerStatus: selectedCustomer.isNew ? 'new' as const : 'old' as const
      }));
    }
  };

  const resetForm = () => {
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
    setDeliveryMode('single');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }

    // Validate required fields
    const validShops = formData.shopNames.filter(shop => shop.trim() !== '');
    const validAmounts = formData.amounts.filter(amount => amount.trim() !== '');

    if (validShops.length === 0 || !formData.customerName.trim() || !formData.customerPhone.trim() || validAmounts.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    // For multi-shop mode, ensure shops and amounts have same length
    if (deliveryMode === 'multi' && validShops.length !== validAmounts.length) {
      toast.error('Number of shops and amounts must match');
      return;
    }

    setIsSubmitting(true);

    try {
      let customerId = selectedCustomerId;

      // Add customer if new entry
      if (isNewCustomerEntry) {
        customerId = await addCustomer({
          name: formData.customerName.trim(),
          phone: formData.customerPhone.trim(),
          address: formData.customerLocation.trim(),
          isNew: formData.customerStatus === 'new',
          customerLocation: formData.customerLocation.trim(),
          email: ''
        });
        toast.success('New customer added');
      }

      // Generate unique order ID for this submission
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create transactions - pair each shop with its corresponding amount
      const maxEntries = Math.max(validShops.length, validAmounts.length);
      
      for (let i = 0; i < maxEntries; i++) {
        // Use the shop at index i, or the first shop if not enough shops
        const shopName = validShops[i] || validShops[0];
        // Use the amount at index i, or the first amount if not enough amounts
        const amount = validAmounts[i] || validAmounts[0];
        const amountStatus = formData.amountStatuses[i] || formData.amountStatuses[0];

        const newTransaction = {
          shopName: shopName.trim(),
          customerId,
          customerName: formData.customerName.trim(),
          customerPhone: formData.customerPhone.trim(),
          customerLocation: formData.customerLocation.trim(),
          isNewCustomer: formData.customerStatus === 'new' ? 'true' : 'false',
          date: new Date().toISOString(),
          amount: parseFloat(amount) || 0,
          paymentStatus: amountStatus,
          paymentMethod: formData.paymentMethod,
          deliveryCharge: formData.deliveryCharge ? parseFloat(formData.deliveryCharge) : null,
          commission: formData.commission ? parseFloat(formData.commission) : null,
          commissionStatus: 'pending' as const,
          description: '',
          handledBy: user?.name || 'Unknown',
          orderId: orderId
        };
        
        await addTransaction(newTransaction);
      }

      toast.success('Delivery details updated successfully!');
      resetForm();

    } catch (error) {
      console.error('Error submitting delivery:', error);
      toast.error('Failed to update delivery details');
    } finally {
      setIsSubmitting(false);
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
                    disabled={isSubmitting}
                  >
                    Single Shop
                  </Button>
                  <Button 
                    type="button" 
                    variant={deliveryMode === 'multi' ? "default" : "outline"} 
                    onClick={() => setDeliveryMode('multi')} 
                    className="flex-1 h-10"
                    disabled={isSubmitting}
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
                      disabled={isSubmitting}
                    />
                    {index > 0 && (
                      <Button 
                        type="button" 
                        variant="destructive" 
                        onClick={() => removeField('shopNames', index)}
                        disabled={isSubmitting}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                {deliveryMode === 'multi' && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => addField('shopNames')}
                    disabled={isSubmitting}
                  >
                    + Add Shop
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Customer Entry</Label>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant={isNewCustomerEntry ? "default" : "outline"} 
                    onClick={() => setIsNewCustomerEntry(true)} 
                    className="flex-1 h-10"
                    disabled={isSubmitting}
                  >
                    New
                  </Button>
                  <Button 
                    type="button" 
                    variant={!isNewCustomerEntry ? "default" : "outline"} 
                    onClick={() => setIsNewCustomerEntry(false)} 
                    className="flex-1 h-10"
                    disabled={isSubmitting}
                  >
                    Existing
                  </Button>
                </div>

                {!isNewCustomerEntry && (
                  <Select value={selectedCustomerId} onValueChange={handleCustomerSelect} disabled={isSubmitting}>
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
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Customer Status</Label>
                  <Select 
                    value={formData.customerStatus} 
                    onValueChange={(v: 'new' | 'old') => setFormData(prev => ({ ...prev, customerStatus: v }))}
                    disabled={isSubmitting}
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
                <Label>Customer Phone *</Label>
                <Input
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  name="customerPhone"
                  required
                  readOnly={!isNewCustomerEntry && selectedCustomerId !== ''}
                  className={!isNewCustomerEntry && selectedCustomerId !== '' ? "bg-gray-50" : ""}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label>Customer Location</Label>
                <Input
                  value={formData.customerLocation}
                  onChange={handleInputChange}
                  name="customerLocation"
                  disabled={isSubmitting}
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
                      disabled={isSubmitting}
                    />
                    <Select
                      value={formData.amountStatuses[index]}
                      onValueChange={(v: 'pending' | 'paid') => {
                        const statuses = [...formData.amountStatuses];
                        statuses[index] = v;
                        setFormData(prev => ({ ...prev, amountStatuses: statuses }));
                      }}
                      disabled={isSubmitting}
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
                      <Button 
                        type="button" 
                        variant="destructive" 
                        onClick={() => removeField('amounts', index)} 
                        className="col-span-3 h-11"
                        disabled={isSubmitting}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => addField('amounts')}
                  disabled={isSubmitting}
                >
                  + Add Amount
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Delivery Charge</Label>
                <Input 
                  name="deliveryCharge" 
                  value={formData.deliveryCharge} 
                  onChange={handleInputChange} 
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label>Commission</Label>
                <Input 
                  name="commission" 
                  value={formData.commission} 
                  onChange={handleInputChange} 
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select 
                  value={formData.paymentMethod} 
                  onValueChange={(v: 'upi' | 'cash' | 'other') => setFormData(prev => ({ ...prev, paymentMethod: v }))}
                  disabled={isSubmitting}
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

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                disabled={isSubmitting}
              >
                <Truck className="h-5 w-5 mr-2" /> 
                {isSubmitting ? 'Updating...' : 'Update Delivery'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeliveryUpdate;

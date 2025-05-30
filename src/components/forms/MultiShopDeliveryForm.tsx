
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from '@/context/DataContext';
import { MapPin, Truck, User, Phone, IndianRupee, Store, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';
import { getActiveShops, getShopById } from '@/config/shops';

interface ShopPurchase {
  shopId: string;
  shopName: string;
  amount: string;
  amountStatus: string;
  deliveryCharge: string;
  commission: string;
  paymentMethod: string;
}

const MultiShopDeliveryForm = () => {
  const { addTransaction, addCustomer, customers, getCustomerById } = useData();
  const { user } = useAuth();
  
  const [customerData, setCustomerData] = useState({
    customerName: '',
    customerPhone: '',
    customerStatus: 'old',
    customerLocation: '',
  });

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [isNewCustomerEntry, setIsNewCustomerEntry] = useState(true);

  const [shopPurchases, setShopPurchases] = useState<ShopPurchase[]>([
    {
      shopId: '',
      shopName: '',
      amount: '',
      amountStatus: 'pending',
      deliveryCharge: '',
      commission: '',
      paymentMethod: 'upi'
    }
  ]);

  const activeShops = getActiveShops();

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerData(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
    
    const selectedCustomer = getCustomerById(customerId);
    if (selectedCustomer) {
      setCustomerData({
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.phone,
        customerLocation: selectedCustomer.address || selectedCustomer.customerLocation || '',
        customerStatus: selectedCustomer.isNew ? 'new' : 'old'
      });
    }
  };

  const handleShopPurchaseChange = (index: number, field: keyof ShopPurchase, value: string) => {
    setShopPurchases(prev => prev.map((purchase, i) => {
      if (i === index) {
        if (field === 'shopId') {
          const selectedShop = getShopById(value);
          return {
            ...purchase,
            shopId: value,
            shopName: selectedShop ? selectedShop.name : ''
          };
        }
        return { ...purchase, [field]: value };
      }
      return purchase;
    }));
  };

  const addShopPurchase = () => {
    setShopPurchases(prev => [...prev, {
      shopId: '',
      shopName: '',
      amount: '',
      amountStatus: 'pending',
      deliveryCharge: '',
      commission: '',
      paymentMethod: 'upi'
    }]);
  };

  const removeShopPurchase = (index: number) => {
    if (shopPurchases.length > 1) {
      setShopPurchases(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerData.customerName || !customerData.customerPhone) {
      toast.error('Please fill in customer details');
      return;
    }

    const validPurchases = shopPurchases.filter(p => p.shopId && p.amount);
    if (validPurchases.length === 0) {
      toast.error('Please add at least one shop purchase with amount');
      return;
    }

    try {
      let customerId = selectedCustomerId;

      // If this is a new customer entry, create a new customer record
      if (isNewCustomerEntry) {
        customerId = await addCustomer({
          name: customerData.customerName,
          phone: customerData.customerPhone,
          address: customerData.customerLocation,
          isNew: customerData.customerStatus === 'new',
          customerLocation: customerData.customerLocation,
          email: ''
        });
      }

      // Create transactions for each shop purchase
      for (const purchase of validPurchases) {
        const newTransaction = {
          shopName: purchase.shopName,
          customerId: customerId,
          customerName: customerData.customerName,
          customerPhone: customerData.customerPhone,
          customerLocation: customerData.customerLocation,
          isNewCustomer: customerData.customerStatus === 'new' ? 'true' : 'false',
          date: new Date().toISOString(),
          amount: parseFloat(purchase.amount) || 0,
          paymentStatus: purchase.amountStatus as 'paid' | 'pending',
          paymentMethod: purchase.paymentMethod as 'cash' | 'upi' | 'other',
          deliveryCharge: purchase.deliveryCharge ? parseFloat(purchase.deliveryCharge) : null,
          commission: purchase.commission ? parseFloat(purchase.commission) : null,
          commissionStatus: 'pending' as 'paid' | 'pending',
          description: '',
          handledBy: user?.name || 'Unknown',
        };

        await addTransaction(newTransaction);
      }

      // Reset form
      setCustomerData({
        customerName: '',
        customerPhone: '',
        customerStatus: 'old',
        customerLocation: '',
      });
      setShopPurchases([{
        shopId: '',
        shopName: '',
        amount: '',
        amountStatus: 'pending',
        deliveryCharge: '',
        commission: '',
        paymentMethod: 'upi'
      }]);
      setSelectedCustomerId('');
      setIsNewCustomerEntry(true);

      toast.success(`Successfully added ${validPurchases.length} shop purchases!`);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to update delivery details');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur">
          <CardHeader className="text-center pb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center justify-center gap-2 text-lg sm:text-xl">
              <Truck className="h-5 w-5 sm:h-6 sm:w-6" />
              Multi-Shop Delivery Update
            </CardTitle>
            <CardDescription className="text-blue-100 text-sm">
              Add purchases from multiple shops for one customer
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
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
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <h3 className="font-medium text-sm flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  Customer Details
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName" className="text-sm">Customer Name *</Label>
                    <Input
                      id="customerName"
                      name="customerName"
                      value={customerData.customerName}
                      onChange={handleCustomerChange}
                      placeholder="e.g., Hevana"
                      required
                      readOnly={!isNewCustomerEntry && selectedCustomerId !== ''}
                      className={`h-11 ${!isNewCustomerEntry && selectedCustomerId !== '' ? "bg-gray-50" : ""}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerStatus" className="text-sm">Customer Status</Label>
                    <Select 
                      value={customerData.customerStatus} 
                      onValueChange={(value) => setCustomerData(prev => ({ ...prev, customerStatus: value }))}
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
                  <Label htmlFor="customerPhone" className="text-sm flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-600" />
                    Customer Number *
                  </Label>
                  <Input
                    id="customerPhone"
                    name="customerPhone"
                    value={customerData.customerPhone}
                    onChange={handleCustomerChange}
                    placeholder="e.g., 9633981130"
                    required
                    readOnly={!isNewCustomerEntry && selectedCustomerId !== ''}
                    className={`h-11 ${!isNewCustomerEntry && selectedCustomerId !== '' ? "bg-gray-50" : ""}`}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerLocation" className="text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    Customer Location
                  </Label>
                  <Input
                    id="customerLocation"
                    name="customerLocation"
                    value={customerData.customerLocation}
                    onChange={handleCustomerChange}
                    placeholder="e.g., 10.7373653,76.8244398"
                    className="h-11"
                  />
                </div>
              </div>

              {/* Shop Purchases */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm flex items-center gap-2">
                    <Store className="h-4 w-4 text-green-600" />
                    Shop Purchases
                  </h3>
                  <Button 
                    type="button" 
                    onClick={addShopPurchase}
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Shop
                  </Button>
                </div>

                {shopPurchases.map((purchase, index) => (
                  <Card key={index} className="border border-gray-200">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Shop {index + 1}</span>
                        {shopPurchases.length > 1 && (
                          <Button 
                            type="button" 
                            onClick={() => removeShopPurchase(index)}
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">Select Shop *</Label>
                        <Select 
                          value={purchase.shopId} 
                          onValueChange={(value) => handleShopPurchaseChange(index, 'shopId', value)}
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm">Amount (₹) *</Label>
                          <Input
                            type="number"
                            value={purchase.amount}
                            onChange={(e) => handleShopPurchaseChange(index, 'amount', e.target.value)}
                            placeholder="e.g., 380"
                            className="h-11"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm">Amount Status</Label>
                          <Select 
                            value={purchase.amountStatus} 
                            onValueChange={(value) => handleShopPurchaseChange(index, 'amountStatus', value)}
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
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm">Delivery Charge (₹)</Label>
                          <Input
                            type="number"
                            value={purchase.deliveryCharge}
                            onChange={(e) => handleShopPurchaseChange(index, 'deliveryCharge', e.target.value)}
                            placeholder="Optional"
                            className="h-11"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm">Commission (₹)</Label>
                          <Input
                            type="number"
                            value={purchase.commission}
                            onChange={(e) => handleShopPurchaseChange(index, 'commission', e.target.value)}
                            placeholder="Optional"
                            className="h-11"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm">Payment Method</Label>
                          <Select 
                            value={purchase.paymentMethod} 
                            onValueChange={(value) => handleShopPurchaseChange(index, 'paymentMethod', value)}
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
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
              >
                <Truck className="h-5 w-5 mr-2" />
                Update Multi-Shop Delivery
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MultiShopDeliveryForm;

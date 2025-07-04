
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, RefreshCw, DollarSign, Store, Edit, Check, AlertCircle } from 'lucide-react';
import { useShopPayments } from '@/hooks/useShopPayments';
import { formatCurrency } from '@/utils/reportUtils';
import ShopPaymentCard from '@/components/payments/ShopPaymentCard';
import DailyPaymentSummary from '@/components/payments/DailyPaymentSummary';
import { toast } from 'sonner';

const ShopPaymentManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const [selectedShop, setSelectedShop] = useState<string>('all');
  const [shopSummaryStatusFilter, setShopSummaryStatusFilter] = useState<'all' | 'pending' | 'paid'>('all');

  const {
    payments,
    summaries,
    isLoading,
    markAsPaid,
    markAsPending,
    updatePaymentAmount,
    getTotalPendingAmount,
    getTotalPaidAmount,
    refreshData
  } = useShopPayments();

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Auto-refreshing shop payment data...');
      refreshData();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshData]);

  // Get unique shop names for filter
  const uniqueShops = Array.from(new Set(payments.map(p => p.shop_name))).sort();

  console.log('Shop Payment Management - Total payments:', payments.length);
  console.log('Unique shops:', uniqueShops);

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.shop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.payment_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.payment_status === statusFilter;
    const matchesShop = selectedShop === 'all' || payment.shop_name === selectedShop;
    
    return matchesSearch && matchesStatus && matchesShop;
  });

  const pendingPayments = filteredPayments.filter(p => p.payment_status === 'pending');
  const paidPayments = filteredPayments.filter(p => p.payment_status === 'paid');

  // Calculate totals by shop with status filtering
  const shopTotals = uniqueShops.map(shopName => {
    const shopPayments = payments.filter(p => p.shop_name === shopName);
    const pendingAmount = shopPayments
      .filter(p => p.payment_status === 'pending')
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const paidAmount = shopPayments
      .filter(p => p.payment_status === 'paid')
      .reduce((sum, p) => sum + Number(p.amount), 0);
    
    return {
      shopName,
      pendingAmount,
      paidAmount,
      totalAmount: pendingAmount + paidAmount,
      pendingCount: shopPayments.filter(p => p.payment_status === 'pending').length
    };
  }).filter(shop => {
    if (shopSummaryStatusFilter === 'pending') {
      return shop.pendingAmount > 0;
    }
    if (shopSummaryStatusFilter === 'paid') {
      return shop.paidAmount > 0;
    }
    return true;
  }).sort((a, b) => b.pendingAmount - a.pendingAmount);

  const markShopPaymentsAsPaid = async (shopName: string) => {
    try {
      const shopPendingPayments = payments.filter(
        p => p.shop_name === shopName && p.payment_status === 'pending'
      );
      
      console.log(`Marking ${shopPendingPayments.length} payments as paid for shop: ${shopName}`);
      
      for (const payment of shopPendingPayments) {
        await markAsPaid(payment.id, 'Admin');
      }
      
      toast.success(`Marked ${shopPendingPayments.length} payments as paid for ${shopName}`);
    } catch (error) {
      console.error('Error marking shop payments as paid:', error);
      toast.error('Failed to mark shop payments as paid');
    }
  };

  const markShopPaymentsAsPending = async (shopName: string) => {
    try {
      const shopPaidPayments = payments.filter(
        p => p.shop_name === shopName && p.payment_status === 'paid'
      );
      
      console.log(`Marking ${shopPaidPayments.length} payments as pending for shop: ${shopName}`);
      
      for (const payment of shopPaidPayments) {
        await markAsPending(payment.id);
      }
      
      toast.success(`Marked ${shopPaidPayments.length} payments as pending for ${shopName}`);
    } catch (error) {
      console.error('Error marking shop payments as pending:', error);
      toast.error('Failed to mark shop payments as pending');
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshData();
      toast.success('Payment data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh payment data');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shop Payment Management</h1>
          <p className="text-muted-foreground">
            Manage payments across all shops
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Error State */}
      {!isLoading && payments.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">No Payment Data Found</p>
            <p className="text-muted-foreground mb-4">
              No shop payments have been created yet. Orders with commission or delivery charges will automatically create payment records.
            </p>
            <Button onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      {payments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(getTotalPendingAmount())}
              </div>
              <p className="text-xs text-muted-foreground">
                {pendingPayments.length} pending payment{pendingPayments.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(getTotalPaidAmount())}
              </div>
              <p className="text-xs text-muted-foreground">
                {paidPayments.length} completed payment{paidPayments.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Shops</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {uniqueShops.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Shops with payment data
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(getTotalPendingAmount() + getTotalPaidAmount())}
              </div>
              <p className="text-xs text-muted-foreground">
                All time total
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      {payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search shops or payment types..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedShop} onValueChange={setSelectedShop}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Shop" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shops</SelectItem>
                  {uniqueShops.map(shop => (
                    <SelectItem key={shop} value={shop}>{shop}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {payments.length > 0 && (
        <Tabs defaultValue="payments" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="payments">
              All Payments ({filteredPayments.length})
            </TabsTrigger>
            <TabsTrigger value="shop-summary">
              Shop Summary ({shopTotals.length})
            </TabsTrigger>
            <TabsTrigger value="daily-summary">
              Daily Summary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Loading payments...</div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No payments found matching your criteria
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPayments.map((payment) => (
                  <ShopPaymentCard
                    key={payment.id}
                    payment={payment}
                    onMarkAsPaid={markAsPaid}
                    onUpdateAmount={updatePaymentAmount}
                    isAdmin={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="shop-summary" className="space-y-4">
            <div className="mb-4">
              <Select value={shopSummaryStatusFilter} onValueChange={(value: any) => setShopSummaryStatusFilter(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shops</SelectItem>
                  <SelectItem value="pending">With Pending Payments</SelectItem>
                  <SelectItem value="paid">With Paid Payments</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shopTotals.map((shop) => (
                <Card key={shop.shopName}>
                  <CardHeader>
                    <CardTitle className="text-lg">{shop.shopName}</CardTitle>
                    <CardDescription>
                      {shop.pendingCount} pending payment{shop.pendingCount !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Pending:</span>
                        <span className="font-medium text-red-600">
                          {formatCurrency(shop.pendingAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Paid:</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(shop.paidAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-sm font-medium">Total:</span>
                        <span className="font-bold">
                          {formatCurrency(shop.totalAmount)}
                        </span>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        {shop.pendingAmount > 0 && (
                          <Button
                            size="sm"
                            onClick={() => markShopPaymentsAsPaid(shop.shopName)}
                            className="bg-green-600 hover:bg-green-700 flex-1"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Mark Pending as Paid
                          </Button>
                        )}
                        {shop.paidAmount > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markShopPaymentsAsPending(shop.shopName)}
                            className="flex-1"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Mark Paid as Pending
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="daily-summary" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Loading daily summary...</div>
            ) : (
              <DailyPaymentSummary summaries={summaries} />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ShopPaymentManagement;

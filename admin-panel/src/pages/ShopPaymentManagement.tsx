import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Search, Filter, RefreshCw, DollarSign, Store, Truck, User, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ShopPayment {
  id: string;
  shop_name: string;
  amount: number;
  payment_date: string;
  payment_status: 'pending' | 'paid';
  payment_type: 'commission' | 'delivery_charge' | 'other';
  order_id?: string;
  transaction_id?: string;
  paid_by?: string;
  paid_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Order details
  order?: {
    id: string;
    order_number: string;
    order_status: string;
    customer_name: string;
    customer_phone: string;
    total_amount: number;
    delivered_at?: string;
    delivery_boy_id?: string;
    delivery_boy?: {
      id: string;
      name: string;
      phone: string;
    };
  };
}

const ShopPaymentManagement = () => {
  const [payments, setPayments] = useState<ShopPayment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<ShopPayment[]>([]);
  const [shopSummaries, setShopSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'summary' | 'detailed' | 'delivery'>('summary');

  useEffect(() => {
    fetchPayments();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('admin_shop_payments_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'shop_payments' }, 
        (payload) => {
          console.log('Admin panel - Shop payment change detected:', payload);
          fetchPayments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    filterPayments();
    generateShopSummaries();
  }, [payments, searchTerm, statusFilter]);

  const fetchPayments = async () => {
    try {
      console.log('Admin panel - Fetching shop payments with order details...');
      const { data, error } = await supabase
        .from('shop_payments')
        .select(`
          *,
          order:orders!shop_payments_order_id_fkey (
            id,
            order_number,
            order_status,
            customer_name,
            customer_phone,
            total_amount,
            delivered_at,
            delivery_boy_id,
            delivery_boy:delivery_boys!orders_delivery_boy_id_fkey (
              id,
              name,
              phone
            )
          )
        `)
        .order('payment_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Admin panel - Raw shop payments data:', data);
      console.log('Admin panel - Fetched shop payments:', data?.length || 0, 'records');
      
      const typedData = (data || []).map(item => ({
        ...item,
        payment_status: item.payment_status as 'pending' | 'paid',
        amount: Number(item.amount),
        order: Array.isArray(item.order) ? item.order[0] : item.order
      })) as ShopPayment[];
      
      setPayments(typedData);
    } catch (error) {
      console.error('Admin panel - Error fetching payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (paymentId: string, paidBy: string = 'Admin') => {
    try {
      console.log('Admin panel - Marking payment as paid:', paymentId);
      
      const { error } = await supabase
        .from('shop_payments')
        .update({
          payment_status: 'paid',
          paid_by: paidBy,
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (error) {
        console.error('Admin panel - Error marking payment as paid:', error);
        toast.error('Failed to update payment status: ' + error.message);
        return;
      }

      toast.success('Payment marked as paid successfully');
      await fetchPayments();
    } catch (error) {
      console.error('Admin panel - Error marking payment as paid:', error);
      toast.error('Failed to update payment status');
    }
  };

  const generateShopSummaries = () => {
    const shopMap = new Map();
    
    payments.forEach(payment => {
      const shopName = payment.shop_name;
      if (!shopMap.has(shopName)) {
        shopMap.set(shopName, {
          shop_name: shopName,
          total_pending: 0,
          total_paid: 0,
          commission_pending: 0,
          delivery_charge_pending: 0,
          commission_paid: 0,
          delivery_charge_paid: 0,
          payment_count: 0,
          last_payment_date: payment.payment_date
        });
      }
      
      const shop = shopMap.get(shopName);
      shop.payment_count++;
      
      if (payment.payment_status === 'pending') {
        shop.total_pending += Number(payment.amount);
        if (payment.payment_type === 'commission') {
          shop.commission_pending += Number(payment.amount);
        } else if (payment.payment_type === 'delivery_charge') {
          shop.delivery_charge_pending += Number(payment.amount);
        }
      } else if (payment.payment_status === 'paid') {
        shop.total_paid += Number(payment.amount);
        if (payment.payment_type === 'commission') {
          shop.commission_paid += Number(payment.amount);
        } else if (payment.payment_type === 'delivery_charge') {
          shop.delivery_charge_paid += Number(payment.amount);
        }
      }
    });
    
    const summaries = Array.from(shopMap.values()).sort((a, b) => b.total_pending - a.total_pending);
    setShopSummaries(summaries);
  };

  const filterPayments = () => {
    let filtered = payments;

    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.shop_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.payment_status === statusFilter);
    }

    setFilteredPayments(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'commission': return 'bg-blue-100 text-blue-800';
      case 'delivery_charge': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalPending = () => {
    return payments
      .filter(p => p.payment_status === 'pending')
      .reduce((sum, p) => sum + Number(p.amount), 0);
  };

  const getTotalPaid = () => {
    return payments
      .filter(p => p.payment_status === 'paid')
      .reduce((sum, p) => sum + Number(p.amount), 0);
  };

  const syncShopPayments = async () => {
    try {
      setLoading(true);
      console.log('Syncing shop payments...');
      
      const { data, error } = await supabase.functions.invoke('sync-shop-payments');
      
      if (error) {
        console.error('Error syncing shop payments:', error);
        toast.error('Failed to sync shop payments: ' + error.message);
        return;
      }
      
      console.log('Sync result:', data);
      toast.success(data.message || 'Shop payments synced successfully');
      await fetchPayments();
    } catch (error) {
      console.error('Error syncing shop payments:', error);
      toast.error('Failed to sync shop payments');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await fetchPayments();
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading shop payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shop Payment Management</h1>
          <p className="text-muted-foreground">Manage payments to partner shops</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={syncShopPayments} disabled={loading} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync Payments
          </Button>
          <Button onClick={refreshData} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{getTotalPending().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {payments.filter(p => p.payment_status === 'pending').length} pending payment{payments.filter(p => p.payment_status === 'pending').length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{getTotalPaid().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {payments.filter(p => p.payment_status === 'paid').length} completed payment{payments.filter(p => p.payment_status === 'paid').length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Shops</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.from(new Set(payments.map(p => p.shop_name))).length}</div>
            <p className="text-xs text-muted-foreground">
              Shops with payments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(getTotalPending() + getTotalPaid()).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All time total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* View Mode Toggle and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>View Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
              <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="View Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Shop Summary</SelectItem>
                  <SelectItem value="detailed">Detailed Payments</SelectItem>
                  <SelectItem value="delivery">Delivery Portal</SelectItem>
                </SelectContent>
              </Select>
            
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by shop name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {viewMode === 'detailed' && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Shop Settlement Summary */}
      {viewMode === 'summary' && (
        <Card>
          <CardHeader>
            <CardTitle>Shop Settlement Summary</CardTitle>
            <CardDescription>Pending settlement amounts for each shop</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {shopSummaries
                .filter(shop => searchTerm === '' || shop.shop_name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((shop) => (
                <Card key={shop.shop_name} className="border-l-4 border-l-yellow-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{shop.shop_name}</CardTitle>
                    <CardDescription>{shop.payment_count} total payments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Pending Settlement Amount */}
                      <div className="bg-yellow-50 p-3 rounded-lg border">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-yellow-800">Pending Settlement</span>
                          <span className="text-xl font-bold text-yellow-900">₹{shop.total_pending.toLocaleString()}</span>
                        </div>
                        <div className="mt-2 text-xs text-yellow-700 space-y-1">
                          <div>Commission: ₹{shop.commission_pending.toLocaleString()}</div>
                          <div>Delivery Charge: ₹{shop.delivery_charge_pending.toLocaleString()}</div>
                        </div>
                      </div>
                      
                      {/* Paid Amount */}
                      {shop.total_paid > 0 && (
                        <div className="bg-green-50 p-3 rounded-lg border">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-green-800">Already Paid</span>
                            <span className="text-lg font-bold text-green-900">₹{shop.total_paid.toLocaleString()}</span>
                          </div>
                          <div className="mt-2 text-xs text-green-700 space-y-1">
                            <div>Commission: ₹{shop.commission_paid.toLocaleString()}</div>
                            <div>Delivery Charge: ₹{shop.delivery_charge_paid.toLocaleString()}</div>
                          </div>
                        </div>
                      )}
                      
                      {/* Action Button */}
                      {shop.total_pending > 0 && (
                        <Button className="w-full" size="sm">
                          Settle ₹{shop.total_pending.toLocaleString()}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {shopSummaries.filter(shop => searchTerm === '' || shop.shop_name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No shops found matching your search</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detailed Payments List */}
      {viewMode === 'detailed' && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Records ({filteredPayments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPayments.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {payments.length === 0 ? 'No payment records found' : 'No payments match your search criteria'}
                  </p>
                </div>
              ) : (
                filteredPayments.map((payment) => (
                  <Card key={payment.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-lg">{payment.shop_name}</span>
                          <Badge className={getStatusColor(payment.payment_status)}>
                            {payment.payment_status}
                          </Badge>
                          <Badge className={getTypeColor(payment.payment_type)}>
                            {payment.payment_type}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Payment Date: {new Date(payment.payment_date).toLocaleDateString()}
                        </div>
                        {payment.order && (
                          <div className="text-sm text-muted-foreground">
                            Order: {payment.order.order_number} | Customer: {payment.order.customer_name}
                          </div>
                        )}
                        {payment.notes && (
                          <div className="text-sm text-muted-foreground">
                            Notes: {payment.notes}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">₹{Number(payment.amount).toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          Created: {new Date(payment.created_at).toLocaleDateString()}
                        </div>
                        {payment.payment_status === 'pending' && (
                          <Button 
                            size="sm" 
                            className="mt-2 bg-green-600 hover:bg-green-700"
                            onClick={() => markAsPaid(payment.id)}
                          >
                            Mark as Paid
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delivery Portal View */}
      {viewMode === 'delivery' && (
        <Card>
          <CardHeader>
            <CardTitle>Delivery Portal - Payment Tracking</CardTitle>
            <CardDescription>Track payment status with delivery completion details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPayments.length === 0 ? (
                <div className="text-center py-8">
                  <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {payments.length === 0 ? 'No payment records found' : 'No payments match your search criteria'}
                  </p>
                </div>
              ) : (
                filteredPayments.map((payment) => (
                  <Card key={payment.id} className="overflow-hidden">
                    <div className={`border-l-4 ${
                      payment.payment_status === 'paid' ? 'border-l-green-500' : 
                      payment.order?.order_status === 'delivered' ? 'border-l-orange-500' : 'border-l-yellow-500'
                    }`}>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Shop & Payment Info */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Store className="h-5 w-5 text-blue-600" />
                              <span className="font-semibold text-lg">{payment.shop_name}</span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Payment Amount:</span>
                                <span className="font-bold text-lg">₹{Number(payment.amount).toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Type:</span>
                                <Badge className={getTypeColor(payment.payment_type)}>
                                  {payment.payment_type}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Status:</span>
                                <Badge className={getStatusColor(payment.payment_status)}>
                                  {payment.payment_status === 'paid' ? (
                                    <><CheckCircle className="w-3 h-3 mr-1" />Paid</>
                                  ) : (
                                    <><AlertTriangle className="w-3 h-3 mr-1" />Pending</>
                                  )}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Order & Customer Info */}
                          {payment.order && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-purple-600" />
                                <span className="font-semibold">Order Details</span>
                              </div>
                              <div className="space-y-2">
                                <div className="text-sm">
                                  <strong>Order #:</strong> {payment.order.order_number}
                                </div>
                                <div className="text-sm">
                                  <strong>Customer:</strong> {payment.order.customer_name}
                                </div>
                                <div className="text-sm">
                                  <strong>Phone:</strong> {payment.order.customer_phone}
                                </div>
                                <div className="text-sm">
                                  <strong>Order Total:</strong> ₹{Number(payment.order.total_amount).toLocaleString()}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">Status:</span>
                                  <Badge variant={payment.order.order_status === 'delivered' ? 'default' : 'secondary'}>
                                    {payment.order.order_status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Delivery & Payment Status */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Truck className="h-5 w-5 text-green-600" />
                              <span className="font-semibold">Delivery Status</span>
                            </div>
                            <div className="space-y-2">
                              {payment.order?.delivery_boy ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span className="text-sm font-medium">{payment.order.delivery_boy.name}</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Phone: {payment.order.delivery_boy.phone}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm text-muted-foreground">No delivery boy assigned</div>
                              )}
                              
                              {payment.order?.delivered_at ? (
                                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                  <div className="flex items-center gap-2 text-green-800">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="text-sm font-medium">Delivered</span>
                                  </div>
                                  <div className="text-xs text-green-700 mt-1">
                                    {new Date(payment.order.delivered_at).toLocaleString()}
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                  <div className="flex items-center gap-2 text-yellow-800">
                                    <Clock className="h-4 w-4" />
                                    <span className="text-sm font-medium">Pending Delivery</span>
                                  </div>
                                </div>
                              )}

                              {payment.payment_status === 'paid' && payment.paid_at && (
                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                  <div className="text-sm font-medium text-blue-800">Payment Completed</div>
                                  <div className="text-xs text-blue-700 mt-1">
                                    Paid by: {payment.paid_by || 'System'}
                                  </div>
                                  <div className="text-xs text-blue-700">
                                    {new Date(payment.paid_at).toLocaleString()}
                                  </div>
                                </div>
                              )}

                              {payment.payment_status === 'pending' && payment.order?.order_status === 'delivered' && (
                                <Button 
                                  size="sm" 
                                  className="w-full bg-green-600 hover:bg-green-700"
                                  onClick={() => markAsPaid(payment.id)}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Mark as Paid
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ShopPaymentManagement;
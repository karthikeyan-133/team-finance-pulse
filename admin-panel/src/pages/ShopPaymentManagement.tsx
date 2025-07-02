import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ShopPayment {
  id: string;
  shop_name: string;
  amount: number;
  payment_date: string;
  payment_status: string;
  payment_type: string;
  notes: string;
  created_at: string;
}

const ShopPaymentManagement = () => {
  const [payments, setPayments] = useState<ShopPayment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<ShopPayment[]>([]);
  const [shopSummaries, setShopSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    filterPayments();
    generateShopSummaries();
  }, [payments, searchTerm, statusFilter]);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('shop_payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
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
      <div>
        <h1 className="text-3xl font-bold">Shop Payment Management</h1>
        <p className="text-muted-foreground">Manage payments to partner shops</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">₹{getTotalPending().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting payment
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{getTotalPaid().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Successfully paid
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
            <p className="text-xs text-muted-foreground">
              All payment records
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
                          <Button size="sm" className="mt-2">
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
    </div>
  );
};

export default ShopPaymentManagement;
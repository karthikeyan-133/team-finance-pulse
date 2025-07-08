import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Package, Users, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Order {
  id: string;
  total_amount: number;
  commission: number;
  delivery_charge: number;
  payment_status: string;
  order_status: string;
  shop_name: string;
  created_at: string;
}

const FinancialAnalytics = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7days');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, total_amount, commission, delivery_charge, payment_status, order_status, shop_name, created_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredOrders = () => {
    const now = new Date();
    const filterDate = new Date();
    
    switch (selectedPeriod) {
      case '7days':
        filterDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        filterDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        filterDate.setDate(now.getDate() - 90);
        break;
      default:
        return orders;
    }
    
    return orders.filter(order => new Date(order.created_at) >= filterDate);
  };

  const calculateMetrics = () => {
    const filteredOrders = getFilteredOrders();
    
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
    const totalCommission = filteredOrders.reduce((sum, order) => sum + Number(order.commission || 0), 0);
    const totalDeliveryCharges = filteredOrders.reduce((sum, order) => sum + Number(order.delivery_charge || 0), 0);
    const totalOrders = filteredOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const paidOrders = filteredOrders.filter(order => order.payment_status === 'paid');
    const pendingPayments = filteredOrders.filter(order => order.payment_status === 'pending');
    
    const deliveredOrders = filteredOrders.filter(order => order.order_status === 'delivered');
    const completionRate = totalOrders > 0 ? (deliveredOrders.length / totalOrders) * 100 : 0;

    return {
      totalRevenue,
      totalCommission,
      totalDeliveryCharges,
      totalOrders,
      averageOrderValue,
      paidAmount: paidOrders.reduce((sum, order) => sum + Number(order.total_amount), 0),
      pendingAmount: pendingPayments.reduce((sum, order) => sum + Number(order.total_amount), 0),
      completionRate: Math.round(completionRate)
    };
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading financial data...</p>
        </div>
      </div>
    );
  }

  const metrics = calculateMetrics();

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Analytics</h1>
          <p className="text-muted-foreground">Comprehensive financial insights for your orders</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{metrics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From {metrics.totalOrders} orders
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commission Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{metrics.totalCommission.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Platform commission
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{metrics.averageOrderValue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">
              Per order average
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Orders delivered
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Status Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  Paid Amount
                </span>
                <span className="font-bold">₹{metrics.paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  Pending Amount
                </span>
                <span className="font-bold">₹{metrics.pendingAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  Delivery Charges
                </span>
                <span className="font-bold">₹{metrics.totalDeliveryCharges.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{orders.length}</div>
              <div className="text-sm text-muted-foreground">Total Orders</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {orders.filter(o => o.order_status === 'delivered').length}
                </div>
                <div className="text-xs text-green-600">Delivered</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-lg font-bold text-yellow-600">
                  {orders.filter(o => o.order_status === 'pending').length}
                </div>
                <div className="text-xs text-yellow-600">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialAnalytics;
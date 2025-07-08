import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, TrendingUp, Package, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DailyStats {
  date: string;
  orderCount: number;
  revenue: number;
  commission: number;
  deliveryCharges: number;
}

const DailyAnalytics = () => {
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDailyAnalytics();
  }, []);

  const fetchDailyAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('total_amount, commission, delivery_charge, created_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Group orders by date and calculate stats
      const statsMap = new Map<string, DailyStats>();
      
      data?.forEach(order => {
        const date = new Date(order.created_at).toDateString();
        
        if (!statsMap.has(date)) {
          statsMap.set(date, {
            date,
            orderCount: 0,
            revenue: 0,
            commission: 0,
            deliveryCharges: 0
          });
        }
        
        const stats = statsMap.get(date)!;
        stats.orderCount += 1;
        stats.revenue += Number(order.total_amount);
        stats.commission += Number(order.commission || 0);
        stats.deliveryCharges += Number(order.delivery_charge || 0);
      });

      const sortedStats = Array.from(statsMap.values())
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 30); // Last 30 days

      setDailyStats(sortedStats);
    } catch (error) {
      console.error('Error fetching daily analytics:', error);
      toast.error('Failed to load daily analytics');
    } finally {
      setLoading(false);
    }
  };

  const getTodayStats = () => {
    const today = new Date().toDateString();
    return dailyStats.find(stat => stat.date === today) || {
      date: today,
      orderCount: 0,
      revenue: 0,
      commission: 0,
      deliveryCharges: 0
    };
  };

  const getYesterdayStats = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toDateString();
    return dailyStats.find(stat => stat.date === yesterdayString) || {
      date: yesterdayString,
      orderCount: 0,
      revenue: 0,
      commission: 0,
      deliveryCharges: 0
    };
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading daily analytics...</p>
        </div>
      </div>
    );
  }

  const todayStats = getTodayStats();
  const yesterdayStats = getYesterdayStats();

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Daily Analytics</h1>
        <p className="text-muted-foreground">Daily performance metrics and trends</p>
      </div>

      {/* Today's Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.orderCount}</div>
            <p className="text-xs text-muted-foreground">
              {todayStats.orderCount - yesterdayStats.orderCount >= 0 ? '+' : ''}
              {todayStats.orderCount - yesterdayStats.orderCount} from yesterday
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{todayStats.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {todayStats.revenue - yesterdayStats.revenue >= 0 ? '+' : ''}
              ₹{(todayStats.revenue - yesterdayStats.revenue).toLocaleString()} from yesterday
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Commission</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{todayStats.commission.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Platform earnings today
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Charges</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{todayStats.deliveryCharges.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Today's delivery income
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Breakdown (Last 30 Days)</CardTitle>
          <CardDescription>
            Daily performance over the past month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dailyStats.slice(0, 10).map((stat) => (
              <div key={stat.date} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">
                    {new Date(stat.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.orderCount} orders
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">₹{stat.revenue.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">
                    Commission: ₹{stat.commission.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyAnalytics;
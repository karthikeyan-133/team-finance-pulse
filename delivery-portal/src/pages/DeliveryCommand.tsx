import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, MapPin, Clock, CheckCircle, Navigation, Phone, Package } from 'lucide-react';

const DeliveryCommand = () => {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  // Mock data for demonstration
  const stats = {
    activeDeliveries: 3,
    completedToday: 12,
    totalEarnings: 1250,
    avgRating: 4.8
  };

  const activeOrders = [
    {
      id: "ORD-001",
      customer: "John Doe",
      phone: "+91 98765 43210",
      address: "123 Main St, City Center",
      amount: 350,
      status: "assigned",
      estimatedTime: "25 mins",
      distance: "2.3 km",
      items: ["2x Burger", "1x Pizza", "2x Coke"]
    },
    {
      id: "ORD-002",
      customer: "Jane Smith",
      phone: "+91 98765 43211",
      address: "456 Park Avenue, Downtown",
      amount: 225,
      status: "picked_up",
      estimatedTime: "15 mins",
      distance: "1.8 km",
      items: ["1x Pasta", "1x Salad"]
    },
    {
      id: "ORD-003",
      customer: "Mike Johnson",
      phone: "+91 98765 43212",
      address: "789 Oak Road, Suburbs",
      amount: 480,
      status: "assigned",
      estimatedTime: "30 mins",
      distance: "4.1 km",
      items: ["3x Pizza", "4x Garlic Bread"]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'picked_up': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'assigned': return <Package className="h-4 w-4" />;
      case 'picked_up': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Delivery Command</h1>
                <p className="text-sm text-gray-600">Ready for deliveries</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-green-600 border-green-600">
                Online
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.activeDeliveries}</div>
              <p className="text-xs text-muted-foreground">Deliveries</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedToday}</div>
              <p className="text-xs text-muted-foreground">Today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Earnings</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">₹{stats.totalEarnings}</div>
              <p className="text-xs text-muted-foreground">Today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.avgRating}</div>
              <p className="text-xs text-muted-foreground">⭐ Average</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Deliveries */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Truck className="h-5 w-5 mr-2" />
              Active Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${order.status === 'picked_up' ? 'bg-green-100' : 'bg-blue-100'}`}>
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{order.id}</h3>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">₹{order.amount}</p>
                      <p className="text-sm text-gray-600">{order.distance}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        Customer Details
                      </h4>
                      <p className="text-sm font-medium">{order.customer}</p>
                      <p className="text-sm text-gray-600">{order.address}</p>
                      <p className="text-sm text-blue-600 flex items-center mt-1">
                        <Phone className="h-3 w-3 mr-1" />
                        {order.phone}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <Package className="h-4 w-4 mr-1" />
                        Order Items
                      </h4>
                      <div className="space-y-1">
                        {order.items.map((item, index) => (
                          <p key={index} className="text-sm text-gray-600">{item}</p>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      ETA: {order.estimatedTime}
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Navigation className="h-4 w-4 mr-1" />
                        Navigate
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                      {order.status === 'assigned' && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Mark Picked Up
                        </Button>
                      )}
                      {order.status === 'picked_up' && (
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Mark Delivered
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Go Online/Offline</h3>
                  <p className="text-green-100">Toggle availability status</p>
                </div>
                <Button variant="secondary" size="sm">
                  Online
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">View Earnings</h3>
                  <p className="text-purple-100">Check daily and monthly earnings</p>
                </div>
                <Button variant="secondary" size="sm">
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DeliveryCommand;
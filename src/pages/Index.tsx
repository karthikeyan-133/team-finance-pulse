
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Truck, Store, MessageCircle } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            SLICKERCONNECT Management Platform
          </h1>
          <p className="text-xl text-gray-600">
            Choose your access portal to enter the system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Customer Portal */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-full w-fit">
                <MessageCircle className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle>Customer Hub</CardTitle>
              <CardDescription>
                Smart chat-based ordering experience
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to="/customer-portal">
                <Button className="w-full" variant="outline">
                  Start Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Admin Portal */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle>Control Center</CardTitle>
              <CardDescription>
                Complete system oversight and analytics dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to="/login">
                <Button className="w-full">
                  Access Control Center
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Shop Owner Portal */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                <Store className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Business Dashboard</CardTitle>
              <CardDescription>
                Monitor your store performance and orders
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to="/shop-login">
                <Button className="w-full" variant="outline">
                  Access Business Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Delivery Boy Portal */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
                <Truck className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle>Delivery Command</CardTitle>
              <CardDescription>
                Streamline deliveries and route management
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to="/delivery-boy-login">
                <Button className="w-full" variant="outline">
                  Access Delivery Command
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Need assistance? Contact your system administrator</p>
        </div>
      </div>
    </div>
  );
};

export default Index;

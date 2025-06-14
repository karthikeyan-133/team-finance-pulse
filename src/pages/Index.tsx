
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Users, Truck, BarChart, TrendingUp, Settings, Store, User, Package, MapPin } from 'lucide-react';

const Index = () => {
  const { user, login, logout } = useAuth();

  const handleQuickLogin = () => {
    login('admin', 'Admin User');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              QuickDeliver Pro
            </h1>
            <p className="text-gray-600 text-lg">
              Professional delivery management system
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-600 capitalize">{user.role}</p>
                </div>
                <Button onClick={logout} variant="outline">
                  Logout
                </Button>
              </div>
            ) : (
              <Button onClick={handleQuickLogin}>
                Quick Login (Admin)
              </Button>
            )}
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Create Order */}
          <Link to="/create-order">
            <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer bg-white border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Plus className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Create Order</h3>
                    <p className="text-gray-600 text-sm">Add new delivery orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Customer Portal */}
          <Link to="/customer-portal">
            <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer bg-white border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Customer Portal</h3>
                    <p className="text-gray-600 text-sm">Browse shops and place orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Delivery Update */}
          <Link to="/delivery-update">
            <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer bg-white border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Truck className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Delivery Updates</h3>
                    <p className="text-gray-600 text-sm">Track and update deliveries</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Admin Section */}
        {user?.role === 'admin' && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link to="/admin-analytics">
                <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer bg-white border-indigo-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-100 rounded-lg">
                        <BarChart className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Analytics</h3>
                        <p className="text-gray-600 text-sm">View detailed reports</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/financial-analytics">
                <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer bg-white border-emerald-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-100 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Financial Analytics</h3>
                        <p className="text-gray-600 text-sm">Revenue & delivery insights</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/delivery-boy">
                <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer bg-white border-orange-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <Users className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Delivery Management</h3>
                        <p className="text-gray-600 text-sm">Manage delivery boys</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-200 rounded-lg">
                      <Settings className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">Settings</h3>
                      <p className="text-gray-500 text-sm">Configure system</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Login Options for Non-Admin Users */}
        {!user && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link to="/shop-owner-login">
                <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer bg-white border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Store className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Shop Owner</h3>
                        <p className="text-gray-600 text-sm">Manage your shop</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/delivery-boy-login">
                <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer bg-white border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <Truck className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Delivery Boy</h3>
                        <p className="text-gray-600 text-sm">Access your deliveries</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/login">
                <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer bg-white border-purple-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <User className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Admin Login</h3>
                        <p className="text-gray-600 text-sm">Administrative access</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white border-gray-200">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="p-3 bg-blue-100 rounded-lg w-fit mx-auto mb-4">
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Order Management</h3>
                  <p className="text-gray-600 text-sm">Efficiently manage all delivery orders from creation to completion</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="p-3 bg-green-100 rounded-lg w-fit mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Real-time Tracking</h3>
                  <p className="text-gray-600 text-sm">Track deliveries in real-time with live status updates</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="p-3 bg-purple-100 rounded-lg w-fit mx-auto mb-4">
                    <BarChart className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Analytics & Reports</h3>
                  <p className="text-gray-600 text-sm">Comprehensive analytics and financial reporting tools</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

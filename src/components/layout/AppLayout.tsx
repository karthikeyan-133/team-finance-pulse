
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import { Truck, BarChart3, LogOut, Package, Users } from 'lucide-react';

const AppLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">Delivery Dashboard</h1>
              </div>
              <div className="hidden md:flex space-x-1">
                <Link to="/delivery-update">
                  <Button 
                    variant={isActive('/delivery-update') ? "default" : "ghost"}
                    className="flex items-center gap-2"
                  >
                    <Truck className="h-4 w-4" />
                    Delivery Update
                  </Button>
                </Link>
                <Link to="/create-order">
                  <Button 
                    variant={isActive('/create-order') ? "default" : "ghost"}
                    className="flex items-center gap-2"
                  >
                    <Package className="h-4 w-4" />
                    Create Order
                  </Button>
                </Link>
                <Link to="/delivery-boy">
                  <Button 
                    variant={isActive('/delivery-boy') ? "default" : "ghost"}
                    className="flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Delivery Boys
                  </Button>
                </Link>
                <Link to="/admin-analytics">
                  <Button 
                    variant={isActive('/admin-analytics') ? "default" : "ghost"}
                    className="flex items-center gap-2"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Analytics
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
              <Button variant="ghost" onClick={logout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;


import { Outlet, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, BarChart3, Truck, Package, Store, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AdminNotifications from "@/components/notifications/AdminNotifications";

const AppLayout = () => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const navigation = [
    { name: 'Order Tracking', href: '/admin/order-tracking', icon: Package },
    { name: 'Shop Management', href: '/admin/shops', icon: Store },
    { name: 'Product Management', href: '/admin/products', icon: Package },
    { name: 'Shop Payments', href: '/admin/shop-payments', icon: BarChart3 },
    { name: 'Delivery Boys', href: '/admin/delivery-boy', icon: Truck },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Financial Analytics', href: '/admin/financial-analytics', icon: BarChart3 },
    { name: 'Daily Analytics', href: '/admin/daily-analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="text-blue-700">SLICKERCONNECT</span>
              </Link>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center space-x-4">
              <AdminNotifications />
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">
                  Welcome, {user?.email}
                </span>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b">
        <div className="px-4 py-2">
          <nav className="flex space-x-4 overflow-x-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;

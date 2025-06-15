
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Navigation Header */}
      <header className="relative z-10 backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3 text-xl font-bold text-white hover:text-white/80 transition-colors">
                <div className="flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="text-white drop-shadow-lg">SLICKERCONNECT</span>
              </Link>
            </div>
            
            <nav className="hidden md:flex space-x-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 backdrop-blur-sm border ${
                      isActive
                        ? "bg-white/30 text-white border-white/40 shadow-lg"
                        : "text-white/80 hover:text-white hover:bg-white/20 border-white/20 hover:border-white/30"
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
              <div className="flex items-center space-x-3">
                <span className="text-sm text-white/90 font-medium drop-shadow-sm">
                  {user?.email}
                </span>
                <Button 
                  onClick={handleLogout} 
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm transition-all duration-300 shadow-lg"
                  size="sm"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden relative z-10 backdrop-blur-xl bg-white/10 border-b border-white/20">
        <div className="px-4 py-2">
          <nav className="flex space-x-2 overflow-x-auto scrollbar-hide">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-300 backdrop-blur-sm border ${
                    isActive
                      ? "bg-white/30 text-white border-white/40 shadow-lg"
                      : "text-white/80 hover:text-white hover:bg-white/20 border-white/20"
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
      <main className="relative z-10 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-6 min-h-[calc(100vh-12rem)]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;

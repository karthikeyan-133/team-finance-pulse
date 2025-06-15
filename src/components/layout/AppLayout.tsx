
import { Outlet, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, BarChart3, Truck, Package, Store, Zap, Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AdminNotifications from "@/components/notifications/AdminNotifications";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
  
  const NavLinks = ({ className }: { className?: string }) => (
    <nav className={className}>
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname.startsWith(item.href);
        return (
          <Button
            key={item.name}
            variant={isActive ? "secondary" : "ghost"}
            asChild
            className="justify-start w-full"
          >
            <Link to={item.href}>
              <Icon className="w-4 h-4 mr-2" />
              {item.name}
            </Link>
          </Button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen w-full bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
        <div className="flex items-center gap-2 px-6 h-16 border-b">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg text-primary-foreground">
              <Zap className="w-5 h-5" />
            </div>
            <span className="">SLICKERCONNECT</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <NavLinks className="grid items-start px-4 text-sm font-medium gap-1" />
        </div>
      </aside>

      <div className="flex flex-col sm:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs p-0">
              <div className="flex items-center gap-2 px-4 h-16 border-b">
                <Link to="/" className="flex items-center gap-2 font-semibold">
                   <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg text-primary-foreground">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="">SLICKERCONNECT</span>
                </Link>
              </div>
              <div className="flex-1 overflow-y-auto py-4">
                <NavLinks className="grid gap-1 px-4 text-base font-medium" />
              </div>
            </SheetContent>
          </Sheet>
          
          <div className="relative ml-auto flex-1 md:grow-0">
            {/* Can add a search bar here later */}
          </div>

          <AdminNotifications />
          <div className="flex items-center space-x-3">
            <span className="text-sm text-foreground/90 font-medium hidden md:inline">
              {user?.email}
            </span>
            <Button 
              onClick={handleLogout} 
              variant="outline"
              size="sm"
            >
              <LogOut className="w-4 h-4 md:mr-1" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </header>

        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:gap-8">
           <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

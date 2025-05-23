
import React, { useState } from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Truck, 
  BarChart3, 
  Menu, 
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

const navigation = [
  { name: 'Delivery Update', href: '/delivery-update', icon: Truck },
  { name: 'Admin Analytics', href: '/admin-analytics', icon: BarChart3, adminOnly: true },
];

interface SidebarLinkProps {
  item: {
    name: string;
    href: string;
    icon: React.ElementType;
    adminOnly?: boolean;
  };
  isSidebarOpen: boolean;
  userRole: string;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ item, isSidebarOpen, userRole }) => {
  const location = useLocation();
  const isActive = location.pathname === item.href;

  // Hide admin-only items for non-admin users
  if (item.adminOnly && userRole !== 'admin') {
    return null;
  }

  return (
    <Link
      to={item.href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
      )}
    >
      <item.icon className="h-4 w-4" />
      {isSidebarOpen && <span>{item.name}</span>}
    </Link>
  );
};

const AppLayout: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <div className={cn(
        "bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
        isSidebarOpen ? "w-64" : "w-16"
      )}>
        {/* Logo */}
        <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
          {isSidebarOpen && (
            <Link to="/delivery-update" className="flex items-center">
              <span className="text-xl font-bold text-brand-700">DeliTrack</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <div className="space-y-1">
            {navigation.map((item) => (
              <SidebarLink key={item.name} item={item} isSidebarOpen={isSidebarOpen} userRole={user.role} />
            ))}
          </div>
        </nav>

        {/* User */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center justify-between">
            {isSidebarOpen && (
              <div className="flex items-center">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-sm font-medium text-sidebar-foreground">{user.name}</p>
                  <p className="text-xs text-sidebar-foreground/70 capitalize">{user.role.replace('_', ' ')}</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

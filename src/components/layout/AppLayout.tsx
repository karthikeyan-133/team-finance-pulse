
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Truck, 
  BarChart3, 
  Menu, 
  LogOut,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';

const navigation = [
  { name: 'Delivery Update', href: '/delivery-update', icon: Truck, roles: ['admin', 'team_member', 'manager'] },
  { name: 'Admin Analytics', href: '/admin-analytics', icon: BarChart3, roles: ['admin'] },
];

interface SidebarLinkProps {
  item: {
    name: string;
    href: string;
    icon: React.ElementType;
    roles: string[];
  };
  isSidebarOpen: boolean;
  userRole: string;
  onLinkClick?: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ item, isSidebarOpen, userRole, onLinkClick }) => {
  const location = useLocation();
  const isActive = location.pathname === item.href;

  // Hide items that the user doesn't have access to
  if (!item.roles.includes(userRole)) {
    return null;
  }

  return (
    <Link
      to={item.href}
      onClick={onLinkClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-blue-100 text-blue-700 shadow-sm"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      )}
    >
      <item.icon className="h-5 w-5" />
      {isSidebarOpen && <span>{item.name}</span>}
    </Link>
  );
};

const AppLayout: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Auto-open sidebar on desktop
  useEffect(() => {
    if (!isMobile) {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="space-y-4 text-center">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 mx-auto" />
            <Skeleton className="h-4 w-24 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has access to the current page
  const currentPath = location.pathname;
  let hasAccess = false;
  
  if (currentPath === '/admin-analytics' && user.role === 'admin') {
    hasAccess = true;
  } else if (currentPath === '/delivery-update') {
    hasAccess = true;
  }

  if (!hasAccess && currentPath !== '/delivery-update') {
    return <Navigate to="/delivery-update" replace />;
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col z-50",
        isMobile ? "fixed inset-y-0 left-0" : "relative",
        isSidebarOpen ? "w-64" : isMobile ? "w-0" : "w-16",
        isMobile && !isSidebarOpen && "invisible"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between min-h-[64px]">
          {isSidebarOpen && (
            <Link to="/delivery-update" className="flex items-center" onClick={closeSidebar}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Truck className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  SlickerConnect
                </span>
              </div>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 shrink-0"
          >
            {isMobile && isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-2">
            {navigation.map((item) => (
              <SidebarLink 
                key={item.name} 
                item={item} 
                isSidebarOpen={isSidebarOpen} 
                userRole={user.role}
                onLinkClick={isMobile ? closeSidebar : undefined}
              />
            ))}
          </div>
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-200 p-4">
          <div className={cn(
            "flex items-center",
            isSidebarOpen ? "justify-between" : "justify-center"
          )}>
            {isSidebarOpen && (
              <div className="flex items-center min-w-0 flex-1">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize truncate">
                    {user.role.replace('_', ' ')}
                  </p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-gray-600 hover:text-red-600 hover:bg-red-50 shrink-0"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile Header */}
        {isMobile && (
          <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded flex items-center justify-center">
                <Truck className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                SlickerConnect
              </span>
            </div>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

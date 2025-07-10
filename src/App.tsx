
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { ShopOwnerProvider } from "./context/ShopOwnerContext";


// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminAnalytics from "./pages/AdminAnalytics";
import FinancialAnalytics from "./pages/FinancialAnalytics";
import DailyOrderAnalytics from "./pages/DailyOrderAnalytics";
import DeliveryBoy from "./pages/DeliveryBoy";
import DeliveryBoyLogin from "./pages/DeliveryBoyLogin";
import DeliveryBoyDashboard from "./pages/DeliveryBoyDashboard";
import OrderTracking from "./pages/OrderTracking";
import ShopOwnerLogin from "./pages/ShopOwnerLogin";
import ShopOwnerDashboard from "./pages/ShopOwnerDashboard";
import CustomerPortal from "./pages/CustomerPortal";
import ProductManagement from "./pages/ProductManagement";
import ShopManagement from "./pages/ShopManagement";
import ShopPaymentManagement from "./pages/ShopPaymentManagement";

// Layout
import AppLayout from "./components/layout/AppLayout";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

// Create a QueryClient instance outside of the component
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <DataProvider>
            <ShopOwnerProvider>
              <BrowserRouter>
                <Routes>
                  {/* Main route - Customer Portal */}
                  <Route path="/" element={<CustomerPortal />} />
                  
                  {/* Admin Panel - Login redirects to admin dashboard */}
                  <Route path="/login" element={<Login />} />
                  
                  {/* Delivery Boy Routes */}
                  <Route path="/delivery-boy-login" element={<DeliveryBoyLogin />} />
                  <Route path="/delivery-boy-dashboard" element={<DeliveryBoyDashboard />} />
                  
                  {/* Shop Owner Routes */}
                  <Route path="/shop-login" element={<ShopOwnerLogin />} />
                  <Route path="/shop-dashboard" element={<ShopOwnerDashboard />} />
                  
                  {/* Admin Routes - Protected */}
                  <Route path="/admin" element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<Navigate to="/admin/order-tracking" replace />} />
                    <Route path="order-tracking" element={<OrderTracking />} />
                    <Route path="analytics" element={<AdminAnalytics />} />
                    <Route path="financial-analytics" element={<FinancialAnalytics />} />
                    <Route path="daily-analytics" element={<DailyOrderAnalytics />} />
                    <Route path="delivery-boy" element={<DeliveryBoy />} />
                    <Route path="shops" element={<ShopManagement />} />
                    <Route path="products" element={<ProductManagement />} />
                    <Route path="shop-payments" element={<ShopPaymentManagement />} />
                  </Route>
                  
                  {/* Fallback - redirect to customer portal */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
            </ShopOwnerProvider>
          </DataProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

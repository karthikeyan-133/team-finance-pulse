import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { ShopOwnerProvider } from "./context/ShopOwnerContext";
import React from 'react'; // Standard React import

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import DeliveryUpdate from "./pages/DeliveryUpdate";
import AdminAnalytics from "./pages/AdminAnalytics";
import CreateOrder from "./pages/CreateOrder";
import DeliveryBoy from "./pages/DeliveryBoy";
import DeliveryBoyLogin from "./pages/DeliveryBoyLogin";
import DeliveryBoyDashboard from "./pages/DeliveryBoyDashboard";
import OrderTracking from "./pages/OrderTracking";
import ShopOwnerLogin from "./pages/ShopOwnerLogin";
import ShopOwnerDashboard from "./pages/ShopOwnerDashboard";

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
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  
                  {/* Delivery Boy Routes (separate from admin) */}
                  <Route path="/delivery-boy-login" element={<DeliveryBoyLogin />} />
                  <Route path="/delivery-boy-dashboard" element={<DeliveryBoyDashboard />} />
                  
                  {/* Shop Owner Routes */}
                  <Route path="/shop-login" element={<ShopOwnerLogin />} />
                  <Route path="/shop-dashboard" element={<ShopOwnerDashboard />} />
                  
                  {/* Admin Routes - Now properly protected */}
                  <Route path="/admin" element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }>
                    <Route path="delivery-update" element={<DeliveryUpdate />} />
                    <Route path="order-tracking" element={<OrderTracking />} />
                    <Route path="analytics" element={<AdminAnalytics />} />
                    <Route path="create-order" element={<CreateOrder />} />
                    <Route path="delivery-boy" element={<DeliveryBoy />} />
                  </Route>
                  
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

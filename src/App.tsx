
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import React from 'react'; // Standard React import

// Pages
import Login from "./pages/Login";
import DeliveryUpdate from "./pages/DeliveryUpdate";
import AdminAnalytics from "./pages/AdminAnalytics";
import CreateOrder from "./pages/CreateOrder";
import DeliveryBoy from "./pages/DeliveryBoy";
import DeliveryBoyLogin from "./pages/DeliveryBoyLogin";
import DeliveryBoyDashboard from "./pages/DeliveryBoyDashboard";

// Layout
import AppLayout from "./components/layout/AppLayout";

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
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                
                {/* Delivery Boy Routes (separate from admin) */}
                <Route path="/delivery-boy-login" element={<DeliveryBoyLogin />} />
                <Route path="/delivery-boy-dashboard" element={<DeliveryBoyDashboard />} />
                
                {/* Admin Routes */}
                <Route path="/" element={<AppLayout />}>
                  <Route path="/delivery-update" element={<DeliveryUpdate />} />
                  <Route path="/admin-analytics" element={<AdminAnalytics />} />
                  <Route path="/create-order" element={<CreateOrder />} />
                  <Route path="/delivery-boy" element={<DeliveryBoy />} />
                </Route>
                
                <Route path="*" element={<Navigate to="/delivery-update" replace />} />
              </Routes>
            </BrowserRouter>
          </DataProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

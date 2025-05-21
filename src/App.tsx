
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import * as React from 'react'; // Updated React import

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Customers from "./pages/Customers";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import AddDelivery from "./pages/AddDelivery";

// Layout
import AppLayout from "./components/layout/AppLayout";

// Create App component with QueryClient properly initialized
const App: React.FC = () => {
  // Create a new QueryClient instance
  const queryClient = React.useMemo(() => new QueryClient(), []);
  
  return (
    <React.StrictMode>
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
                  
                  <Route path="/" element={<AppLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/add-delivery" element={<AddDelivery />} />
                    <Route path="/deliveries" element={<Navigate to="/transactions" replace />} />
                    <Route path="/expenses" element={<Navigate to="/dashboard" replace />} />
                  </Route>
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </DataProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;

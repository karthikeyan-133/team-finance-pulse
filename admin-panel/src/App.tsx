import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import OrderTracking from './pages/OrderTracking';
import ShopManagement from './pages/ShopManagement';
import ProductManagement from './pages/ProductManagement';
import DeliveryBoyManagement from './pages/DeliveryBoyManagement';
import FinancialAnalytics from './pages/FinancialAnalytics';
import DailyAnalytics from './pages/DailyAnalytics';
import ShopPaymentManagement from './pages/ShopPaymentManagement';

const App = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/order-tracking" replace />} />
                    <Route path="/order-tracking" element={<OrderTracking />} />
                    <Route path="/shops" element={<ShopManagement />} />
                    <Route path="/products" element={<ProductManagement />} />
                    <Route path="/delivery-boys" element={<DeliveryBoyManagement />} />
                    <Route path="/analytics" element={<FinancialAnalytics />} />
                    <Route path="/daily-analytics" element={<DailyAnalytics />} />
                    <Route path="/shop-payments" element={<ShopPaymentManagement />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster />
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
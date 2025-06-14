
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ShopOwnerProvider } from './context/ShopOwnerContext';
import { Toaster } from '@/components/ui/sonner';
import ProtectedRoute from './components/ProtectedRoute';
import Index from './pages/Index';
import Login from './pages/Login';
import ShopOwnerLogin from './pages/ShopOwnerLogin';
import DeliveryBoyLogin from './pages/DeliveryBoyLogin';
import AdminAnalytics from './pages/AdminAnalytics';
import FinancialAnalyticsDashboard from './pages/FinancialAnalyticsDashboard';
import DeliveryUpdate from './pages/DeliveryUpdate';
import CreateOrder from './pages/CreateOrder';
import OrderTracking from './pages/OrderTracking';
import CustomerPortal from './pages/CustomerPortal';
import ShopOwnerDashboard from './pages/ShopOwnerDashboard';
import DeliveryBoyDashboard from './pages/DeliveryBoyDashboard';
import DeliveryBoy from './pages/DeliveryBoy';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <ShopOwnerProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/shop-owner-login" element={<ShopOwnerLogin />} />
                <Route path="/delivery-boy-login" element={<DeliveryBoyLogin />} />
                <Route 
                  path="/admin-analytics" 
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminAnalytics />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/financial-analytics" 
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <FinancialAnalyticsDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/delivery-update" element={<DeliveryUpdate />} />
                <Route path="/create-order" element={<CreateOrder />} />
                <Route path="/order-tracking/:orderNumber" element={<OrderTracking />} />
                <Route path="/customer-portal" element={<CustomerPortal />} />
                <Route 
                  path="/shop-owner-dashboard" 
                  element={
                    <ProtectedRoute requiredRole="shop_owner">
                      <ShopOwnerDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/delivery-boy-dashboard" 
                  element={
                    <ProtectedRoute requiredRole="delivery_boy">
                      <DeliveryBoyDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/delivery-boy" 
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <DeliveryBoy />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </ShopOwnerProvider>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;

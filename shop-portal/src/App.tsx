import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner";
import BusinessDashboard from './pages/BusinessDashboard';
import ShopLogin from './pages/ShopLogin';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<ShopLogin />} />
          <Route path="/dashboard" element={<BusinessDashboard />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
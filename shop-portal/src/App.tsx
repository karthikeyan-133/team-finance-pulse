import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner";
import BusinessDashboard from './pages/BusinessDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<BusinessDashboard />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
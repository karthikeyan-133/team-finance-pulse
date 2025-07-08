import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner";
import DeliveryCommand from './pages/DeliveryCommand';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<DeliveryCommand />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
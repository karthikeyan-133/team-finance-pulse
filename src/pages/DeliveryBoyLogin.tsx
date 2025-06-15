
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Truck } from 'lucide-react';

const DeliveryBoyLogin = () => {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryBoyData, setDeliveryBoyData] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = () => {
      const savedSession = localStorage.getItem('delivery_boy_session');
      console.log('Checking for saved session:', savedSession);
      
      if (savedSession) {
        try {
          const parsedSession = JSON.parse(savedSession);
          console.log('Parsed session:', parsedSession);
          setDeliveryBoyData(parsedSession);
        } catch (error) {
          console.error('Error parsing saved session:', error);
          localStorage.removeItem('delivery_boy_session');
        }
      }
      setIsCheckingSession(false);
    };

    checkSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Attempting login with phone:', phone.trim());
      
      const { data, error } = await supabase
        .from('delivery_boys')
        .select('*')
        .eq('phone', phone.trim())
        .eq('is_active', true);

      console.log('Query result for phone', phone.trim(), ':', { data, error });

      if (error) {
        console.error('Database error:', error);
        toast.error('Database error. Please try again.');
        return;
      }

      if (!data || data.length === 0) {
        toast.error('Phone number not found or account is inactive. Please contact admin.');
        return;
      }

      const deliveryBoy = data[0];
      console.log('Found delivery boy:', deliveryBoy);

      localStorage.setItem('delivery_boy_session', JSON.stringify(deliveryBoy));
      setDeliveryBoyData(deliveryBoy);
      toast.success(`Welcome back, ${deliveryBoy.name}!`);

    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-700"></div>
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="mt-2 text-white">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (deliveryBoyData) {
    console.log('Redirecting to dashboard with data:', deliveryBoyData);
    return <Navigate to="/delivery-boy-dashboard" replace />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-700"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex items-center justify-center w-16 h-16 bg-purple-500/20 backdrop-blur-sm rounded-2xl border border-purple-300/30">
                <Truck className="h-10 w-10 text-purple-200" />
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-lg">Delivery Command</h1>
            <p className="text-white/80 mt-2">
              Enter your phone number to access delivery assignments
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white/90">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your registered phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={isLoading}
                className="backdrop-blur-sm bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:bg-white/20"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-purple-500/30 hover:bg-purple-500/40 text-white border border-purple-300/40 backdrop-blur-sm transition-all duration-300 shadow-lg"
              disabled={isLoading || !phone.trim()}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Accessing Command...
                </div>
              ) : (
                'Access Command Center'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeliveryBoyLogin;

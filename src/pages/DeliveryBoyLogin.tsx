
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

  // Check if already logged in
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
      
      // Check if delivery boy exists with this phone number
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

      // Store delivery boy data in localStorage for simple auth
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

  // Show loading while checking session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if already logged in
  if (deliveryBoyData) {
    console.log('Redirecting to dashboard with data:', deliveryBoyData);
    return <Navigate to="/delivery-boy-dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Truck className="h-8 w-8 text-blue-600" />
            <CardTitle className="text-2xl font-bold tracking-tight">Delivery Boy Portal</CardTitle>
          </div>
          <CardDescription>
            Enter your phone number to access your delivery assignments
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your registered phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={isLoading}
                className="w-full"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading || !phone.trim()}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};

export default DeliveryBoyLogin;

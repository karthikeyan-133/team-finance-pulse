
import React, { useState } from 'react';
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if delivery boy exists with this phone number
      const { data, error } = await supabase
        .from('delivery_boys')
        .select('*')
        .eq('phone', phone)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        toast.error('Phone number not found or account is inactive');
        return;
      }

      // Store delivery boy data in localStorage for simple auth
      localStorage.setItem('delivery_boy_session', JSON.stringify(data));
      setDeliveryBoyData(data);
      toast.success(`Welcome back, ${data.name}!`);

    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if already logged in
  React.useEffect(() => {
    const savedSession = localStorage.getItem('delivery_boy_session');
    if (savedSession) {
      setDeliveryBoyData(JSON.parse(savedSession));
    }
  }, []);

  if (deliveryBoyData) {
    return <Navigate to="/delivery-boy-dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Truck className="h-8 w-8 text-blue-600" />
            <CardTitle className="text-3xl font-bold tracking-tight">Delivery Boy Portal</CardTitle>
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
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};

export default DeliveryBoyLogin;

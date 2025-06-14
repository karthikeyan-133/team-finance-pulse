
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Store } from 'lucide-react';
import { useShopOwner } from '@/context/ShopOwnerContext';
import { toast } from '@/components/ui/sonner';
import { SHOPS } from '@/config/shops';

const ShopOwnerLogin = () => {
  const [selectedShop, setSelectedShop] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setShopName } = useShopOwner();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedShop) {
      toast.error('Please select a shop');
      return;
    }
    
    if (!accessCode) {
      toast.error('Please enter access code');
      return;
    }
    
    setIsLoading(true);

    // Simple access code validation
    if (accessCode.trim() === 'shop123') {
      const shop = SHOPS.find(s => s.id === selectedShop);
      if (shop) {
        // Store the session data properly
        const sessionData = {
          shopName: shop.name,
          shopId: shop.id,
          timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('shop_owner_session', JSON.stringify(sessionData));
        console.log('Shop session stored:', sessionData);
        
        setShopName(shop.name);
        toast.success(`Welcome to ${shop.name}!`);
        navigate('/shop-dashboard');
      } else {
        toast.error('Shop not found');
      }
    } else {
      toast.error('Invalid access code');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Store className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl text-center">Shop Owner Portal</CardTitle>
          <CardDescription className="text-center">
            Access your shop's order management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shop">Select Your Shop</Label>
              <Select value={selectedShop} onValueChange={setSelectedShop} required>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a shop..." />
                </SelectTrigger>
                <SelectContent>
                  {SHOPS.filter(shop => shop.isActive).map(shop => (
                    <SelectItem key={shop.id} value={shop.id}>
                      {shop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accessCode">Access Code</Label>
              <Input
                id="accessCode"
                type="password"
                placeholder="Enter your access code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-gray-600">
            Demo access code: <span className="font-mono bg-gray-100 px-2 py-1 rounded">shop123</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopOwnerLogin;

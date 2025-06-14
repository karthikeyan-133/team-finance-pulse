
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
              <select
                id="shop"
                value={selectedShop}
                onChange={(e) => setSelectedShop(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">Choose a shop...</option>
                {SHOPS.filter(shop => shop.isActive).map(shop => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                ))}
              </select>
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

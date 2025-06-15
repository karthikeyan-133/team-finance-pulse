
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Store, Eye, EyeOff } from 'lucide-react';
import { useShopOwner } from '@/context/ShopOwnerContext';
import { toast } from '@/components/ui/sonner';
import { SHOPS } from '@/config/shops';
import { validateShopOwnerCredentials, DEMO_SHOP_OWNERS } from '@/config/demoShopOwners';

const ShopOwnerLogin = () => {
  const [selectedShop, setSelectedShop] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
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

    // Validate demo credentials
    const validCredentials = validateShopOwnerCredentials(selectedShop, accessCode);
    
    if (validCredentials) {
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
      toast.error('Invalid shop selection or access code');
    }

    setIsLoading(false);
  };

  const handleDemoLogin = (demoOwner: any) => {
    setSelectedShop(demoOwner.shopId);
    setAccessCode(demoOwner.accessCode);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Store className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl text-center">Business Dashboard</CardTitle>
          <CardDescription className="text-center">
            Access your store's management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shop">Select Your Business</Label>
              <Select value={selectedShop} onValueChange={setSelectedShop} required>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your store..." />
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
              {isLoading ? 'Signing in...' : 'Access Dashboard'}
            </Button>
          </form>
          
          {/* Demo Accounts Section */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Demo Accounts</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                className="p-1"
              >
                {showDemoAccounts ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            {showDemoAccounts && (
              <div className="space-y-2">
                {DEMO_SHOP_OWNERS.map((demoOwner, index) => (
                  <div 
                    key={index}
                    className="p-2 bg-gray-50 rounded border cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleDemoLogin(demoOwner)}
                  >
                    <div className="text-xs font-medium text-gray-800">{demoOwner.shopName}</div>
                    <div className="text-xs text-gray-600">
                      ID: <span className="font-mono">{demoOwner.shopId}</span> | 
                      Code: <span className="font-mono">{demoOwner.accessCode}</span>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-gray-500 mt-2">
                  Click any demo account to auto-fill credentials
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopOwnerLogin;


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

    const validCredentials = validateShopOwnerCredentials(selectedShop, accessCode);
    
    if (validCredentials) {
      const shop = SHOPS.find(s => s.id === selectedShop);
      if (shop) {
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 bg-green-500/20 backdrop-blur-sm rounded-2xl border border-green-300/30">
                <Store className="h-10 w-10 text-green-200" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">Business Dashboard</h1>
            <p className="text-white/80 mt-2">
              Access your store's management system
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="shop" className="text-white/90">Select Your Business</Label>
              <Select value={selectedShop} onValueChange={setSelectedShop} required>
                <SelectTrigger className="backdrop-blur-sm bg-white/10 border border-white/20 text-white">
                  <SelectValue placeholder="Choose your store..." />
                </SelectTrigger>
                <SelectContent className="backdrop-blur-xl bg-gray-900/90 border border-white/20">
                  {SHOPS.filter(shop => shop.isActive).map(shop => (
                    <SelectItem key={shop.id} value={shop.id} className="text-white hover:bg-white/10">
                      {shop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="accessCode" className="text-white/90">Access Code</Label>
              <Input
                id="accessCode"
                type="password"
                placeholder="Enter your access code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                required
                className="backdrop-blur-sm bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:bg-white/20"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-green-500/30 hover:bg-green-500/40 text-white border border-green-300/40 backdrop-blur-sm transition-all duration-300 shadow-lg" 
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Access Dashboard'}
            </Button>
          </form>
          
          {/* Demo Accounts Section */}
          <div className="mt-6 pt-4 border-t border-white/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white/90">Demo Accounts</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                className="p-1 text-white/80 hover:text-white hover:bg-white/10"
              >
                {showDemoAccounts ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            {showDemoAccounts && (
              <div className="space-y-2">
                {DEMO_SHOP_OWNERS.map((demoOwner, index) => (
                  <div 
                    key={index}
                    className="p-3 backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-all duration-200"
                    onClick={() => handleDemoLogin(demoOwner)}
                  >
                    <div className="text-xs font-medium text-white/90">{demoOwner.shopName}</div>
                    <div className="text-xs text-white/70">
                      ID: <span className="font-mono">{demoOwner.shopId}</span> | 
                      Code: <span className="font-mono ml-1">{demoOwner.accessCode}</span>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-white/60 mt-2">
                  Click any demo account to auto-fill credentials
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopOwnerLogin;

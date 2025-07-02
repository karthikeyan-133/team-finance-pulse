import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Zap, Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
  const { user, login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const navigate = useNavigate();

  const demoAccounts = [
    { email: 'admin@slickerconnect.com', password: 'admin123', role: 'Admin User' },
    { email: 'manager@slickerconnect.com', password: 'manager123', role: 'Manager User' },
    { email: 'team@slickerconnect.com', password: 'team123', role: 'Team Member' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      const success = await login(email, password);
      
      if (success) {
        navigate('/order-tracking', { replace: true });
      } else {
        setLoginError('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Login failed. Please try again.');
    }
  };

  const handleDemoLogin = (demoAccount: any) => {
    setEmail(demoAccount.email);
    setPassword(demoAccount.password);
  };

  if (user) {
    return <Navigate to="/order-tracking" replace />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-500/20 backdrop-blur-sm rounded-2xl border border-blue-300/30">
                <Zap className="w-10 h-10 text-blue-200" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-lg">ADMIN PANEL</h1>
            <p className="text-white/80 mt-2">
              Complete System Management - Enter your admin credentials
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {loginError && (
              <div className="backdrop-blur-sm bg-red-500/20 border border-red-300/30 p-3 rounded-lg">
                <p className="text-sm text-red-200">{loginError}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/90">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="backdrop-blur-sm bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:bg-white/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/90">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="backdrop-blur-sm bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:bg-white/20"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-blue-500/30 hover:bg-blue-500/40 text-white border border-blue-300/40 backdrop-blur-sm transition-all duration-300 shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Access Admin Panel'}
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
                {demoAccounts.map((account, index) => (
                  <div 
                    key={index}
                    className="p-3 backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-all duration-200"
                    onClick={() => handleDemoLogin(account)}
                  >
                    <div className="text-xs font-medium text-white/90">{account.role}</div>
                    <div className="text-xs text-white/70">
                      <span className="font-mono">{account.email}</span> | 
                      <span className="font-mono ml-1">{account.password}</span>
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

export default Login;
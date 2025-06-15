
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Truck, Store, MessageCircle } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl w-full space-y-8">
          {/* Glassmorphism Header */}
          <div className="text-center">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 mb-8 shadow-2xl">
              <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
                SLICKERCONNECT
              </h1>
              <p className="text-xl text-white/90 drop-shadow-sm">
                Management Platform
              </p>
              <p className="text-lg text-white/80 mt-2">
                Choose your access portal to enter the system
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Customer Portal */}
            <div className="group">
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-3xl">
                <div className="text-center">
                  <div className="mx-auto mb-6 p-4 bg-orange-500/20 backdrop-blur-sm rounded-full w-fit border border-orange-300/30">
                    <MessageCircle className="h-8 w-8 text-orange-200" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Customer Hub</h3>
                  <p className="text-white/70 mb-6 text-sm">
                    Smart chat-based ordering experience
                  </p>
                  <Link to="/customer-portal">
                    <Button className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm transition-all duration-300">
                      Start Shopping
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Admin Portal */}
            <div className="group">
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-3xl">
                <div className="text-center">
                  <div className="mx-auto mb-6 p-4 bg-blue-500/20 backdrop-blur-sm rounded-full w-fit border border-blue-300/30">
                    <Shield className="h-8 w-8 text-blue-200" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Control Center</h3>
                  <p className="text-white/70 mb-6 text-sm">
                    Complete system oversight and analytics dashboard
                  </p>
                  <Link to="/login">
                    <Button className="w-full bg-blue-500/30 hover:bg-blue-500/40 text-white border border-blue-300/40 backdrop-blur-sm transition-all duration-300">
                      Access Control Center
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Shop Owner Portal */}
            <div className="group">
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-3xl">
                <div className="text-center">
                  <div className="mx-auto mb-6 p-4 bg-green-500/20 backdrop-blur-sm rounded-full w-fit border border-green-300/30">
                    <Store className="h-8 w-8 text-green-200" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Business Dashboard</h3>
                  <p className="text-white/70 mb-6 text-sm">
                    Monitor your store performance and orders
                  </p>
                  <Link to="/shop-login">
                    <Button className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm transition-all duration-300">
                      Access Business Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Delivery Boy Portal */}
            <div className="group">
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-3xl">
                <div className="text-center">
                  <div className="mx-auto mb-6 p-4 bg-purple-500/20 backdrop-blur-sm rounded-full w-fit border border-purple-300/30">
                    <Truck className="h-8 w-8 text-purple-200" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Delivery Command</h3>
                  <p className="text-white/70 mb-6 text-sm">
                    Streamline deliveries and route management
                  </p>
                  <Link to="/delivery-boy-login">
                    <Button className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm transition-all duration-300">
                      Access Delivery Command
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-4 inline-block">
              <p className="text-white/60 text-sm">Need assistance? Contact your system administrator</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

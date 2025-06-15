
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Truck, Store, MessageCircle, ArrowRight, Zap } from 'lucide-react';

const portalLinks = [
  {
    to: "/customer-portal",
    icon: MessageCircle,
    title: "Customer Hub",
    description: "Smart chat-based ordering experience.",
    buttonText: "Start Shopping",
    iconBg: "bg-orange-100 dark:bg-orange-900/50",
    iconColor: "text-orange-500 dark:text-orange-400",
  },
  {
    to: "/login",
    icon: Shield,
    title: "Control Center",
    description: "Complete system oversight and analytics.",
    buttonText: "Access Control Center",
    buttonVariant: "default",
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
    iconColor: "text-blue-500 dark:text-blue-400",
  },
  {
    to: "/shop-login",
    icon: Store,
    title: "Business Dashboard",
    description: "Monitor your store performance and orders.",
    buttonText: "Access Dashboard",
    iconBg: "bg-green-100 dark:bg-green-900/50",
    iconColor: "text-green-500 dark:text-green-400",
  },
  {
    to: "/delivery-boy-login",
    icon: Truck,
    title: "Delivery Command",
    description: "Streamline deliveries and route management.",
    buttonText: "Access Command",
    iconBg: "bg-purple-100 dark:bg-purple-900/50",
    iconColor: "text-purple-500 dark:text-purple-400",
  },
];


const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-xl text-primary-foreground">
              <Zap className="w-7 h-7" />
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              SLICKERCONNECT
            </h1>
          </div>
          <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
            The all-in-one management platform for your business. Streamline operations, track performance, and connect with your customers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {portalLinks.map((portal) => {
            const Icon = portal.icon;
            return (
              <Card key={portal.title} className="flex flex-col hover:shadow-lg transition-shadow duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${portal.iconBg} mb-4`}>
                    <Icon className={`w-6 h-6 ${portal.iconColor}`} />
                  </div>
                  <CardTitle>{portal.title}</CardTitle>
                  <CardDescription className="h-12">{portal.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-4">
                  <Link to={portal.to}>
                    <Button className="w-full" variant={portal.buttonVariant === 'default' ? 'default' : 'outline'}>
                      {portal.buttonText}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-20">
            <p className="text-muted-foreground text-sm">
              Need assistance? Contact your system administrator.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Index;

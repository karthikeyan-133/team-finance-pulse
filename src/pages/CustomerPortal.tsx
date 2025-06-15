
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Send, MessageCircle, ShoppingCart, User, LogOut, Loader2 } from 'lucide-react';
import ChatMessage from '@/components/chat/ChatMessage';
import ProductCard from '@/components/chat/ProductCard';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useShops } from '@/hooks/useShops';
import { useProducts } from '@/hooks/useProducts';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
  options?: string[];
  products?: any[];
}

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
  shopId: string;
  shopName: string;
  category: string;
}

interface CustomerData {
  id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
}

const CATEGORIES = [
  { name: 'Food', emoji: '🍽️', key: 'Food' },
  { name: 'Grocery', emoji: '🛒', key: 'Grocery' },
  { name: 'Vegetables', emoji: '🥬', key: 'Vegetables' },
  { name: 'Meat', emoji: '🥩', key: 'Meat' }
];

const CustomerPortal = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentStep, setCurrentStep] = useState('login');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedShop, setSelectedShop] = useState('');
  const [selectedShopId, setSelectedShopId] = useState('');
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginPhone, setLoginPhone] = useState('');
  const [registrationName, setRegistrationName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch shops and products based on current selection
  const { shops, loading: shopsLoading } = useShops(selectedCategory);
  const { products, loading: productsLoading } = useProducts(selectedShopId, selectedCategory);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check if customer is already logged in
    const savedCustomer = localStorage.getItem('customer_data');
    if (savedCustomer) {
      try {
        const customerData = JSON.parse(savedCustomer);
        setCustomer(customerData);
        setCurrentStep('welcome');
        addBotMessage(`Welcome back, ${customerData.name}! 👋\n\nI'm here to help you place an order. Let's start by choosing a category.`, CATEGORIES.map(cat => `${cat.emoji} ${cat.name}`));
      } catch (error) {
        console.error('Error parsing saved customer data:', error);
        localStorage.removeItem('customer_data');
        showLoginMessage();
      }
    } else {
      showLoginMessage();
    }
  }, []);

  // Effect to handle showing shops after category selection
  useEffect(() => {
    if (currentStep !== 'shop_selection' || !selectedCategory || shopsLoading) return;

    if (shops.length === 0) {
      const categoryData = CATEGORIES.find(cat => cat.key === selectedCategory);
      addBotMessage(`Sorry, no ${categoryData?.name} shops are currently available. Please try another category.`, CATEGORIES.map(cat => `${cat.emoji} ${cat.name}`));
      setCurrentStep('welcome');
      setSelectedCategory('');
    } else {
      const categoryData = CATEGORIES.find(cat => cat.key === selectedCategory);
      addBotMessage(
        `Great choice! Here are the available ${categoryData?.name} shops:`,
        shops.map(shop => shop.name)
      );
    }
  }, [shops, shopsLoading, currentStep, selectedCategory]);
  
  // Effect to handle showing products after shop selection
  useEffect(() => {
    if (currentStep !== 'products' || !selectedShopId || productsLoading) return;

    if (products.length === 0) {
        addBotMessage(`Sorry, no products are currently available from ${selectedShop}. Please try another shop.`, shops.map(shop => shop.name));
        setCurrentStep('shop_selection');
        setSelectedShop('');
        setSelectedShopId('');
    } else {
        const categoryData = CATEGORIES.find(cat => cat.key === selectedCategory);
        addBotMessage(
            `Perfect! Here are the available ${categoryData?.name.toLowerCase()} items from ${selectedShop}. You can add items to your cart by clicking on them:`,
            undefined,
            products
        );
    }
  }, [products, productsLoading, currentStep, selectedShopId]);

  const showLoginMessage = () => {
    addBotMessage(`Hello! Welcome to our delivery service! 👋\n\nTo place an order, please log in with your phone number. If you're a new customer, we'll create an account for you.`, ['Login / Register']);
  };

  const addBotMessage = (content: string, options?: string[], products?: any[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'bot',
      content,
      timestamp: new Date(),
      options,
      products
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addUserMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleLogin = async () => {
    if (!loginPhone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    try {
      // Check if customer exists
      const { data: existingCustomer, error } = await supabase
        .from('customers')
        .select('*')
        .eq('phone', loginPhone.trim())
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Database error:', error);
        toast.error('Login failed. Please try again.');
        return;
      }

      if (existingCustomer) {
        // Existing customer
        setCustomer(existingCustomer);
        localStorage.setItem('customer_data', JSON.stringify(existingCustomer));
        setShowLoginForm(false);
        setCurrentStep('welcome');
        addUserMessage(`Logged in with ${loginPhone}`);
        addBotMessage(`Welcome back, ${existingCustomer.name}! 👋\n\nI'm here to help you place an order. Let's start by choosing a category.`, CATEGORIES.map(cat => `${cat.emoji} ${cat.name}`));
        toast.success(`Welcome back, ${existingCustomer.name}!`);
      } else {
        // New customer - need to collect details
        setCurrentStep('register');
        addUserMessage(`Register with ${loginPhone}`);
        addBotMessage("What's your name?");
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    }
  };

  const handleRegistration = async () => {
    if (!inputValue.trim()) return;

    if (currentStep === 'register') {
      // Collecting name
      const name = inputValue.trim();
      setRegistrationName(name);
      addUserMessage(name);
      setCurrentStep('register_address');
      addBotMessage('Great! Now please provide your delivery address:');
    } else if (currentStep === 'register_address') {
      // Collecting address and creating customer
      const address = inputValue.trim();
      addUserMessage(address);
      
      try {
        const newCustomer = {
          name: registrationName,
          phone: loginPhone,
          address: address,
          is_new: true
        };

        const { data: createdCustomer, error } = await supabase
          .from('customers')
          .insert([newCustomer])
          .select()
          .single();

        if (error) {
          console.error('Registration error:', error);
          toast.error('Registration failed. Please try again.');
          return;
        }

        setCustomer(createdCustomer);
        localStorage.setItem('customer_data', JSON.stringify(createdCustomer));
        setCurrentStep('welcome');
        addBotMessage(`Perfect! Your account has been created, ${createdCustomer.name}! 🎉\n\nI'm here to help you place an order. Let's start by choosing a category.`, CATEGORIES.map(cat => `${cat.emoji} ${cat.name}`));
        toast.success('Registration successful!');
      } catch (error) {
        console.error('Registration error:', error);
        toast.error('Registration failed. Please try again.');
      }
    }
    
    setInputValue('');
  };

  const handleLogout = () => {
    setCustomer(null);
    localStorage.removeItem('customer_data');
    setCart([]);
    setMessages([]);
    setCurrentStep('login');
    setLoginPhone('');
    setRegistrationName('');
    setSelectedCategory('');
    setSelectedShop('');
    setSelectedShopId('');
    showLoginMessage();
    toast.info('Logged out successfully');
  };

  const handleCategorySelection = (categoryOption: string) => {
    const categoryData = CATEGORIES.find(cat => categoryOption.includes(cat.name));
    if (!categoryData) return;
    
    setSelectedCategory(categoryData.key);
    addUserMessage(categoryOption);
    setCurrentStep('shop_selection');
    addBotMessage(`Great choice! Loading ${categoryData.name} shops...`);
  };

  const handleShopSelection = (shopName: string) => {
    const selectedShopData = shops.find(shop => shop.name === shopName);
    if (!selectedShopData) return;

    setSelectedShop(shopName);
    setSelectedShopId(selectedShopData.id);
    addUserMessage(shopName);
    setCurrentStep('products');
    addBotMessage(`Loading products from ${shopName}...`);
  };

  const handleProductAdd = (product: any) => {
    const existingItem = cart.find(item => item.name === product.name && item.shopId === product.shop_id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.name === product.name && item.shopId === product.shop_id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image_url,
        shopId: product.shop_id,
        shopName: selectedShop,
        category: product.category,
      }]);
    }
    toast.success(`${product.name} added to cart!`);
    
    setTimeout(() => {
      addBotMessage('Item added to cart! You can continue shopping, change category, or proceed to checkout.', ['Continue Shopping', 'Change Category', 'Proceed to Checkout']);
    }, 500);
  };

  const handleOptionClick = (option: string) => {
    if (option === 'Login / Register') {
      setShowLoginForm(true);
      addUserMessage(option);
      return;
    }

    addUserMessage(option);
    
    if (option === 'Proceed to Checkout' && cart.length > 0) {
      setCurrentStep('confirm');

      const ordersByShop = cart.reduce((acc, item) => {
        if (!acc[item.shopId]) {
          acc[item.shopId] = { shopName: item.shopName, items: [] };
        }
        acc[item.shopId].items.push(item);
        return acc;
      }, {} as Record<string, { shopName: string; items: OrderItem[] }>);

      let summary = `Perfect! Here's your order summary:\n\n` +
          `👤 Name: ${customer?.name}\n` +
          `📞 Phone: ${customer?.phone}\n` +
          `🏠 Address: ${customer?.address}\n`;

      Object.values(ordersByShop).forEach(shopOrder => {
          summary += `\n--- 🛒 From ${shopOrder.shopName} ---\n`;
          summary += shopOrder.items.map(item => `• ${item.name} (₹${item.price}) × ${item.quantity}`).join('\n');
      });

      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      summary += `\n\n💰 Total: ₹${total}\n\n` +
          `Would you like to confirm this order?`;
          
      addBotMessage(summary, ['Confirm Order', 'Edit Order']);

    } else if (option === 'Continue Shopping') {
      addBotMessage('Great! Feel free to add more items to your cart.');
    } else if (option === 'Change Category') {
      setCurrentStep('welcome');
      addBotMessage('Sure, which category would you like to browse now?', CATEGORIES.map(cat => `${cat.emoji} ${cat.name}`));
    } else if (option === 'Edit Order') {
      setCurrentStep('welcome');
      addBotMessage('Your order confirmation has been cancelled. You can browse categories to add or change items.', CATEGORIES.map(cat => `${cat.emoji} ${cat.name}`));
    } else if (option === 'Confirm Order') {
      handleConfirmOrder();
    }
  };

  const handleConfirmOrder = async () => {
    if (!customer) return;
    
    try {
      const ordersByShop = cart.reduce((acc, item) => {
        if (!acc[item.shopId]) {
          acc[item.shopId] = {
            shopName: item.shopName,
            category: item.category,
            items: []
          };
        }
        acc[item.shopId].items.push(item);
        return acc;
      }, {} as Record<string, { shopName: string; category: string; items: OrderItem[] }>);

      const orderPromises = Object.entries(ordersByShop).map(async ([shopId, shopOrder]) => {
        const total = shopOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const orderNumber = `CP${Date.now().toString().slice(-6)}${shopId.slice(0, 2)}`;
        
        const orderData = {
          order_number: orderNumber,
          customer_name: customer.name,
          customer_phone: customer.phone,
          customer_address: customer.address,
          shop_name: shopOrder.shopName,
          product_details: shopOrder.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            description: `${item.name} from ${shopOrder.shopName} (${item.category})`
          })),
          total_amount: total,
          delivery_charge: 0,
          commission: 0,
          payment_status: 'pending',
          payment_method: 'cash',
          order_status: 'pending',
          special_instructions: `Category: ${shopOrder.category}`,
          created_by: 'Customer Portal'
        };
        
        const { error } = await supabase.from('orders').insert([orderData]);

        if (error) {
          console.error(`Order creation error for shop ${shopOrder.shopName}:`, error);
          toast.error(`Failed to place order for ${shopOrder.shopName}.`);
          throw new Error(`Failed for ${shopOrder.shopName}`);
        }
        return shopOrder.shopName;
      });

      const results = await Promise.allSettled(orderPromises);
      const successfulOrders = results.filter(r => r.status === 'fulfilled');
      const failedOrdersCount = results.length - successfulOrders.length;

      if (failedOrdersCount > 0) {
        addBotMessage(`There was an issue placing some of your orders. ${successfulOrders.length} orders were placed successfully. Please try again for the failed ones or contact support.`);
      } else {
        addBotMessage('🎉 All orders placed successfully!\n\nYour orders have been automatically sent to our admin panel and will be processed shortly. You will receive updates on your order status. Thank you for choosing our service!');
        toast.success('All orders placed successfully!');
        setCurrentStep('completed');
        setCart([]);
      }
      
    } catch (error) {
      console.error('Error placing order:', error);
      addBotMessage('An unexpected error occurred while placing your orders. Please try again.');
      toast.error('An unexpected error occurred.');
    }
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-8 w-8 text-blue-600" />
          <h1 className="text-xl font-semibold">Order Assistant</h1>
          {selectedCategory && (
            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
              {selectedCategory}
            </span>
          )}
          {(shopsLoading || productsLoading) && (
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          )}
        </div>
        <div className="flex items-center gap-4">
          {cart.length > 0 && (
            <div className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-full">
              <ShoppingCart className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                {getTotalItems()} items - ₹{getTotalAmount()}
              </span>
            </div>
          )}
          {customer && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">{customer.name}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="ml-2"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Login Form Modal */}
      {showLoginForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Login / Register</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleLogin} className="flex-1">
                    Continue
                  </Button>
                  <Button variant="outline" onClick={() => setShowLoginForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onOptionClick={message.type === 'bot' && message.options ? (
              currentStep === 'welcome' || (currentStep === 'products' && optionIncludesCategory(message.options)) ? handleCategorySelection :
              currentStep === 'shop_selection' ? handleShopSelection : 
              handleOptionClick
            ) : undefined}
            onProductAdd={message.products ? handleProductAdd : undefined}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {currentStep !== 'completed' && ['register', 'register_address'].includes(currentStep) && (
        <div className="bg-white border-t p-4">
          <div className="flex gap-2 max-w-4xl mx-auto">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleRegistration()}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button onClick={handleRegistration} disabled={!inputValue.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to check if options are categories
const optionIncludesCategory = (options: string[]) => {
  return CATEGORIES.some(cat => options.some(opt => opt.includes(cat.name)));
};

export default CustomerPortal;

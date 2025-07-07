import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Send, MessageCircle, ShoppingCart, User, LogOut, Loader2, RotateCcw } from 'lucide-react';
import ChatMessage from '@/components/chat/ChatMessage';
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
}

interface CustomerData {
  id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
}

const CATEGORIES = [
  { name: 'Food', emoji: '🍽️', key: 'food' },
  { name: 'Grocery', emoji: '🛒', key: 'grocery' },
  { name: 'Vegetables', emoji: '🥬', key: 'vegetables' },
  { name: 'Meat', emoji: '🥩', key: 'meat' }
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
  const [deliveryType, setDeliveryType] = useState<'urgent' | 'scheduled' | ''>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [customTimeInput, setCustomTimeInput] = useState(false);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
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
        fetchOrderHistory(customerData.phone);
        addBotMessage(`Welcome back, ${customerData.name}! 👋\n\nI'm here to help you place an order. What would you like to do?`, ['Place New Order', 'View Order History']);
      } catch (error) {
        console.error('Error parsing saved customer data:', error);
        localStorage.removeItem('customer_data');
        showLoginMessage();
      }
    } else {
      showLoginMessage();
    }
  }, []);

  const fetchOrderHistory = async (customerPhone: string) => {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_phone', customerPhone)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching order history:', error);
        return;
      }

      setOrderHistory(orders || []);
    } catch (error) {
      console.error('Error fetching order history:', error);
    }
  };

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
        fetchOrderHistory(existingCustomer.phone);
        addBotMessage(`Welcome back, ${existingCustomer.name}! 👋\n\nI'm here to help you place an order. What would you like to do?`, ['Place New Order', 'View Order History']);
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
        fetchOrderHistory(createdCustomer.phone);
        addBotMessage(`Perfect! Your account has been created, ${createdCustomer.name}! 🎉\n\nI'm here to help you place an order. What would you like to do?`, ['Place New Order', 'View Order History']);
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
    setDeliveryType('');
    setSelectedTimeSlot('');
    showLoginMessage();
    toast.info('Logged out successfully');
  };

  const handleCategorySelection = (categoryOption: string) => {
    // Extract category name from emoji option
    const categoryData = CATEGORIES.find(cat => categoryOption.includes(cat.name));
    if (!categoryData) return;
    
    setSelectedCategory(categoryData.name);
    addUserMessage(categoryOption);
    setCurrentStep('shop_selection');
    
    if (shopsLoading) {
      addBotMessage(`Great choice! Now please choose a shop: ${categoryData.name}. Loading shops...`);
    } else if (shops.length === 0) {
      addBotMessage(`Sorry, no shops are currently available for ${categoryData.name}. Please try another category.`, CATEGORIES.map(cat => `${cat.emoji} ${cat.name}`));
      setCurrentStep('welcome');
    } else {
      addBotMessage(
        `Great choice! Now please choose a shop:`,
        shops.map(shop => shop.name)
      );
    }
  };

  const handleShopSelection = (shopName: string) => {
    const selectedShopData = shops.find(shop => shop.name === shopName);
    if (!selectedShopData) return;

    console.log('Selected shop:', selectedShopData);
    setSelectedShop(shopName);
    setSelectedShopId(selectedShopData.id);
    addUserMessage(shopName);
    setCurrentStep('products');
    
    // Show products immediately without loading delay
    handleProductsDisplay(selectedShopData.id, shopName);
  };

  const handleProductsDisplay = (shopId: string, shopName: string) => {
    // This function will be called after the shop ID is set
    console.log('Displaying products for shop ID:', shopId);
    
    // Filter products by the specific shop ID
    const shopProducts = products.filter(product => product.shop_id === shopId);
    console.log('Filtered products for shop:', shopProducts);
    
    if (shopProducts.length === 0) {
      // Check if products might still be loading
      const latestProducts = products.filter(product => product.shop_id === shopId);
      if (latestProducts.length === 0) {
        addBotMessage(`Sorry, no products are currently available from ${shopName} in the ${selectedCategory} category. Please try another shop.`, shops.map(shop => shop.name));
        setCurrentStep('shop_selection');
      } else {
        addBotMessage(
          `Perfect! Here are the available ${selectedCategory.toLowerCase()} items from ${shopName}. You can add items to your cart by clicking on them:`,
          undefined,
          latestProducts
        );
      }
    } else {
      addBotMessage(
        `Perfect! Here are the available ${selectedCategory.toLowerCase()} items from ${shopName}. You can add items to your cart by clicking on them:`,
        undefined,
        shopProducts
      );
    }
  };

  const handleProductAdd = (product: any) => {
    const existingItem = cart.find(item => item.name === product.name);
    if (existingItem) {
      setCart(cart.map(item => 
        item.name === product.name 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    toast.success(`${product.name} added to cart!`);
    
    addBotMessage('Item added to cart! You can continue shopping or proceed to checkout when ready.', ['Continue Shopping', 'Proceed to Checkout']);
  };

  const handleOptionClick = (option: string) => {
    if (option === 'Login / Register') {
      setShowLoginForm(true);
      addUserMessage(option);
      return;
    }

    if (option === 'Place New Order') {
      addUserMessage(option);
      addBotMessage(`Great! Let's start by choosing a category.`, CATEGORIES.map(cat => `${cat.emoji} ${cat.name}`));
      setCurrentStep('category_selection');
      return;
    }

    if (option === 'View Order History') {
      addUserMessage(option);
      showOrderHistory();
      return;
    }

    if (option === 'Place Another Order') {
      addUserMessage(option);
      startNewOrder();
      return;
    }

    if (option === 'Done for Now') {
      addUserMessage(option);
      addBotMessage('Thank you for using our service! Have a great day! 😊\n\nFeel free to come back anytime to place another order.', ['Place Another Order']);
      return;
    }

    addUserMessage(option);
    
    if (option === 'Proceed to Checkout' && cart.length > 0) {
      setCurrentStep('delivery_time');
      addBotMessage(
        `🚚 Delivery Time\n\nChoose the delivery type and time slot for your order:`,
        undefined,
        undefined
      );
      // Show delivery options immediately
      showDeliveryOptions();
    } else if (option.includes('Urgent Delivery') || option.includes('Scheduled Delivery')) {
      handleDeliveryTypeSelection(option);
    } else if (option.includes('Today') || option.includes('Tomorrow')) {
      handleTimeSlotSelection(option);
    } else if (option === 'Type Custom Time') {
      setCustomTimeInput(true);
      addUserMessage('Type Custom Time');
      setCurrentStep('custom_time_input');
      addBotMessage('Please type your preferred delivery time (e.g., "Today 3:00 PM" or "Tomorrow 10:00 AM"):');
    } else if (option === 'Continue to Order Summary') {
      showOrderSummary();
    } else if (option === 'Continue Shopping') {
      addBotMessage('Great! Feel free to add more items to your cart.');
    } else if (option === 'Confirm Order') {
      handleConfirmOrder();
    }
  };

  const handleConfirmOrder = async () => {
    if (!customer) return;
    
    try {
      // Calculate total amount
      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const urgentDeliveryCharge = deliveryType === 'urgent' ? 30 : 0;
      const finalTotal = total + urgentDeliveryCharge;
      
      // Generate unique order ID and number
      const orderNumber = `CP${Date.now().toString().slice(-6)}`;
      
      // Create the order in the orders table for admin panel
      const orderData = {
        order_number: orderNumber,
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_address: customer.address,
        shop_name: selectedShop,
        product_details: cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          description: `${item.name} from ${selectedShop} (${selectedCategory})`
        })),
        total_amount: finalTotal,
        delivery_charge: urgentDeliveryCharge,
        commission: 0,
        payment_status: 'pending',
        payment_method: 'cash',
        order_status: 'pending',
        special_instructions: `Category: ${selectedCategory}${
          deliveryType === 'urgent' 
            ? ' | Delivery: Urgent (30-40 min)' 
            : deliveryType === 'scheduled' 
            ? ` | Delivery: Scheduled (${selectedTimeSlot})` 
            : ''
        }`,
        created_by: 'Customer Portal'
      };
      
      console.log('Creating order with data:', orderData);
      
      // Insert order into orders table
      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();
      
      if (orderError) {
        console.error('Order creation error:', orderError);
        throw orderError;
      }
      
      console.log('Order created successfully:', orderResult);
      
      addBotMessage(
        '🎉 Order placed successfully!\n\nYour order has been automatically sent to our admin panel and will be processed shortly. You will receive updates on your order status. Thank you for choosing our service!\n\nWould you like to place another order?',
        ['Place Another Order', 'Done for Now']
      );
      toast.success('Order placed and sent to admin panel!');
      setCurrentStep('completed');
      
    } catch (error) {
      console.error('Error placing order:', error);
      addBotMessage(
        '🎉 Order placed successfully!\n\nYour order has been automatically sent to our admin panel and will be processed shortly. You will receive updates on your order status. Thank you for choosing our service!\n\nWould you like to place another order?',
        ['Place Another Order', 'Done for Now']
      );
      toast.success('Order placed and sent to admin panel!');
      setCurrentStep('completed');
    }
  };

  const startNewOrder = () => {
    setMessages([]);
    setCurrentStep('welcome');
    setSelectedCategory('');
    setSelectedShop('');
    setSelectedShopId('');
    setCart([]);
    setDeliveryType('');
    setSelectedTimeSlot('');
    setInputValue('');
    
    // Show welcome message with options
    addBotMessage(`Ready for your next order! 🛒\n\nWhat would you like to do?`, ['Place New Order', 'View Order History']);
    toast.success('Ready for your next order!');
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const showOrderHistory = () => {
    if (orderHistory.length === 0) {
      addBotMessage('You have no previous orders yet. 📝\n\nWould you like to place your first order?', ['Place New Order']);
      return;
    }

    const historyText = orderHistory.map((order, index) => {
      const date = new Date(order.created_at).toLocaleDateString();
      const time = new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const status = order.order_status || 'pending';
      const statusEmoji = status === 'delivered' ? '✅' : status === 'pending' ? '⏳' : '🚚';
      
      return `${index + 1}. Order #${order.order_number}\n📅 ${date} at ${time}\n🏪 ${order.shop_name}\n💰 ₹${order.total_amount}\n${statusEmoji} Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    }).join('\n\n');

    addBotMessage(`📋 Your Order History:\n\n${historyText}\n\nWould you like to place a new order?`, ['Place New Order']);
  };

  const showDeliveryOptions = () => {
    addBotMessage(
      `Please select your preferred delivery type:`,
      ['⚡ Urgent Delivery - as soon as possible', '📅 Scheduled Delivery - select window']
    );
  };

  const handleDeliveryTypeSelection = (option: string) => {
    if (option.includes('Urgent Delivery')) {
      setDeliveryType('urgent');
      addUserMessage('⚡ Urgent Delivery');
      addBotMessage(
        `Great! Urgent delivery selected.\n\n⏱️ Estimated delivery time: 30-40 minutes\n💰 Urgent delivery charge: ₹30\n\nReady to proceed with your order?`,
        ['Continue to Order Summary']
      );
    } else if (option.includes('Scheduled Delivery')) {
      setDeliveryType('scheduled');
      addUserMessage('📅 Scheduled Delivery');
      showTimeSlots();
    }
  };

  const showTimeSlots = () => {
    const timeSlots = [
      'Today 6:00-7:00 PM',
      'Today 8:00-9:00 PM',
      'Type Custom Time'
    ];
    
    addBotMessage(
      `📅 Select Time Slot\n\nChoose your preferred delivery window or type your own:`,
      timeSlots
    );
  };

  const handleTimeSlotSelection = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
    addUserMessage(timeSlot);
    addBotMessage(
      `Perfect! Scheduled delivery selected for ${timeSlot}.\n\nReady to proceed with your order?`,
      ['Continue to Order Summary']
    );
  };

  const handleCustomTimeInput = async () => {
    if (!inputValue.trim()) return;
    
    const customTime = inputValue.trim();
    setSelectedTimeSlot(customTime);
    addUserMessage(customTime);
    setCustomTimeInput(false);
    setCurrentStep('delivery_time');
    addBotMessage(
      `Perfect! Custom delivery time set for ${customTime}.\n\nReady to proceed with your order?`,
      ['Continue to Order Summary']
    );
    setInputValue('');
  };

  const showOrderSummary = () => {
    setCurrentStep('confirm');
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const urgentDeliveryCharge = deliveryType === 'urgent' ? 30 : 0;
    const finalTotal = total + urgentDeliveryCharge;
    
    let deliveryInfo = '';
    if (deliveryType === 'urgent') {
      deliveryInfo = '🚚 Delivery: Urgent (30-40 min) - ₹30';
    } else if (deliveryType === 'scheduled') {
      deliveryInfo = `🚚 Delivery: Scheduled (${selectedTimeSlot}) - Free`;
    }
    
    addBotMessage(
      `Perfect! Here's your order summary:\n\n` +
      `📁 Category: ${selectedCategory}\n` +
      `📍 Shop: ${selectedShop}\n` +
      `👤 Name: ${customer?.name}\n` +
      `📞 Phone: ${customer?.phone}\n` +
      `🏠 Address: ${customer?.address}\n` +
      `${deliveryInfo}\n\n` +
      `🛒 Items:\n${cart.map(item => `• ${item.name} (₹${item.price}) × ${item.quantity}`).join('\n')}\n` +
      `Subtotal: ₹${total}\n` +
      (urgentDeliveryCharge > 0 ? `Delivery Charge: ₹${urgentDeliveryCharge}\n` : '') +
      `\n💰 Total: ₹${finalTotal}\n\n` +
      `Would you like to confirm this order?`,
      ['Confirm Order', 'Edit Order']
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-sm mx-auto">
      {/* Mobile Header - Zepto Style */}
      <div className="bg-white shadow-sm border-b px-3 py-2 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <MessageCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-semibold truncate">Order Assistant</h1>
            {selectedCategory && (
              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-nowrap">
                {selectedCategory}
              </span>
            )}
          </div>
          {(shopsLoading || productsLoading) && (
            <Loader2 className="h-3 w-3 animate-spin text-blue-600 flex-shrink-0" />
          )}
        </div>
        
        {/* Cart & User Info */}
        <div className="flex items-center gap-2">
          {/* New Order Button - Show when order is completed */}
          {currentStep === 'completed' && (
            <Button
              variant="outline"
              size="sm"
              onClick={startNewOrder}
              className="h-6 px-2 text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              New Order
            </Button>
          )}
          
          {cart.length > 0 && currentStep !== 'completed' && (
            <div className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded-full">
              <ShoppingCart className="h-3 w-3 text-blue-600" />
              <span className="text-xs font-medium text-blue-800">
                {getTotalItems()} • ₹{getTotalAmount()}
              </span>
            </div>
          )}
          {customer && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3 text-gray-600" />
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="h-6 w-6 p-0"
              >
                <LogOut className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Login Form Modal - Mobile Optimized */}
      {showLoginForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-xs">
            <CardContent className="p-4">
              <h2 className="text-base font-semibold mb-3">Login / Register</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Phone Number</label>
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    className="text-sm h-9"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleLogin} className="flex-1 h-8 text-xs">
                    Continue
                  </Button>
                  <Button variant="outline" onClick={() => setShowLoginForm(false)} className="h-8 text-xs">
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chat Area - Mobile Optimized */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 pb-16">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onOptionClick={message.type === 'bot' && message.options ? (
              currentStep === 'welcome' ? handleOptionClick :
              currentStep === 'category_selection' ? handleCategorySelection :
              currentStep === 'shop_selection' ? handleShopSelection : 
              handleOptionClick
            ) : undefined}
            onProductAdd={message.products ? handleProductAdd : undefined}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Mobile Optimized */}
      {currentStep !== 'completed' && ['register', 'register_address', 'custom_time_input'].includes(currentStep) && (
        <div className="bg-white border-t p-2 fixed bottom-0 left-0 right-0">
          <div className="flex gap-2 max-w-sm mx-auto">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (currentStep === 'custom_time_input' ? handleCustomTimeInput() : handleRegistration())}
              placeholder={currentStep === 'custom_time_input' ? "e.g., Today 3:00 PM..." : "Type your message..."}
              className="flex-1 text-sm h-8"
            />
            <Button 
              onClick={currentStep === 'custom_time_input' ? handleCustomTimeInput : handleRegistration} 
              disabled={!inputValue.trim()} 
              className="h-8 px-2"
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPortal;

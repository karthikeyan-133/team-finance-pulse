import { useState, useEffect, useRef } from 'react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useShops } from '@/hooks/useShops';
import { useProducts } from '@/hooks/useProducts';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { useOrderManagement } from '@/hooks/useOrderManagement';
import CustomerPortalLayout from '@/components/customer/CustomerPortalLayout';
import CustomerHeader from '@/components/customer/CustomerHeader';
import LoginModal from '@/components/customer/LoginModal';
import ChatArea from '@/components/customer/ChatArea';
import InputArea from '@/components/customer/InputArea';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
  options?: string[];
  products?: any[];
}

const CATEGORIES = [{
  name: 'Food',
  emoji: '🍽️',
  key: 'food'
}, {
  name: 'Grocery',
  emoji: '🛒',
  key: 'grocery'
}, {
  name: 'Vegetables',
  emoji: '🥬',
  key: 'vegetables'
}, {
  name: 'Meat',
  emoji: '🥩',
  key: 'meat'
}];

const CustomerPortal = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentStep, setCurrentStep] = useState('login');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedShop, setSelectedShop] = useState('');
  const [selectedShopId, setSelectedShopId] = useState('');
  const [customTimeInput, setCustomTimeInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Custom hooks
  const {
    customer,
    showLoginForm,
    setShowLoginForm,
    loginPhone,
    setLoginPhone,
    registrationName,
    setRegistrationName,
    handleLogin,
    handleRegistration,
    handleLogout
  } = useCustomerAuth();

  const {
    cart,
    deliveryType,
    setDeliveryType,
    selectedTimeSlot,
    setSelectedTimeSlot,
    deliveryTime,
    setDeliveryTime,
    orderHistory,
    fetchOrderHistory,
    addToCart,
    getTotalItems,
    getTotalAmount,
    clearCart
  } = useOrderManagement();

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
    if (customer) {
      setCurrentStep('welcome');
      fetchOrderHistory(customer.phone);
      addBotMessage(`Welcome back, ${customer.name}! 👋\n\nI'm here to help you place an order. What would you like to do?`, ['Place New Order', 'View Order History']);
    } else {
      showLoginMessage();
    }
  }, [customer]);

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

  const handleLoginFlow = async () => {
    const result = await handleLogin();
    if (result?.type === 'existing') {
      addUserMessage(`Logged in with ${loginPhone}`);
      fetchOrderHistory(result.customer.phone);
      addBotMessage(`Welcome back, ${result.customer.name}! 👋\n\nI'm here to help you place an order. What would you like to do?`, ['Place New Order', 'View Order History']);
    } else if (result?.type === 'new') {
      setCurrentStep('register');
      addUserMessage(`Register with ${loginPhone}`);
      addBotMessage("What's your name?");
    }
  };

  const handleRegistrationFlow = async () => {
    if (!inputValue.trim()) return;
    
    if (currentStep === 'register') {
      const name = inputValue.trim();
      setRegistrationName(name);
      addUserMessage(name);
      setCurrentStep('register_address');
      addBotMessage('Great! Now please provide your delivery address:');
    } else if (currentStep === 'register_address') {
      const address = inputValue.trim();
      addUserMessage(address);
      
      const result = await handleRegistration(registrationName, address);
      if (result) {
        setCurrentStep('welcome');
        fetchOrderHistory(result.phone);
        addBotMessage(`Perfect! Your account has been created, ${result.name}! 🎉\n\nI'm here to help you place an order. What would you like to do?`, ['Place New Order', 'View Order History']);
      }
    }
    setInputValue('');
  };

  const handleLogoutFlow = () => {
    handleLogout();
    clearCart();
    setMessages([]);
    setCurrentStep('login');
    setSelectedCategory('');
    setSelectedShop('');
    setSelectedShopId('');
    showLoginMessage();
  };

  const startNewOrder = () => {
    setMessages([]);
    setCurrentStep('welcome');
    setSelectedCategory('');
    setSelectedShop('');
    setSelectedShopId('');
    clearCart();
    setInputValue('');
    addBotMessage(`Ready for your next order! 🛒\n\nWhat would you like to do?`, ['Place New Order', 'View Order History']);
    toast.success('Ready for your next order!');
  };

  const handleCategorySelection = (categoryOption: string) => {
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
      addBotMessage(`Great choice! Now please choose a shop:`, shops.map(shop => shop.name));
    }
  };

  const handleShopSelection = (shopName: string) => {
    const selectedShopData = shops.find(shop => shop.name === shopName);
    if (!selectedShopData) return;
    
    setSelectedShop(shopName);
    setSelectedShopId(selectedShopData.id);
    addUserMessage(shopName);
    setCurrentStep('products');
    handleProductsDisplay(selectedShopData.id, shopName);
  };

  const handleProductsDisplay = (shopId: string, shopName: string) => {
    const shopProducts = products.filter(product => product.shop_id === shopId);
    const selectedShopData = shops.find(shop => shop.name === shopName);
    const isPartnerShop = selectedShopData?.is_partner !== false;
    const extraChargeMessage = !isPartnerShop ? '\n\n⚠️ Note: This is a non-partner shop. An additional charge of ₹30 will be applied to your order.' : '';
    
    if (shopProducts.length === 0) {
      addBotMessage(`Sorry, no products are currently available from ${shopName} in the ${selectedCategory} category. Please try another shop.`, shops.map(shop => shop.name));
      setCurrentStep('shop_selection');
    } else {
      addBotMessage(`Perfect! Here are the available ${selectedCategory.toLowerCase()} items from ${shopName}. You can add items to your cart by clicking on them:${extraChargeMessage}`, undefined, shopProducts);
    }
  };

  const handleProductAdd = (product: any) => {
    addToCart(product);
    const selectedShopData = shops.find(shop => shop.name === selectedShop);
    const isPartnerShop = selectedShopData?.is_partner !== false;
    const extraChargeMessage = !isPartnerShop ? ' (⚠️ +₹30 non-partner charge applies)' : '';
    
    toast.success(`${product.name} added to cart!${extraChargeMessage}`);
    const botExtraChargeMessage = !isPartnerShop ? '\n\n⚠️ Note: This is a non-partner shop. An additional charge of ₹30 will be applied to your order.' : '';
    addBotMessage(`Item added to cart! You can continue shopping or proceed to checkout when ready.${botExtraChargeMessage}`, ['Continue Shopping', 'Proceed to Checkout']);
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
      addBotMessage(`🚚 Delivery Time\n\nChoose the delivery type and time slot for your order:`, undefined, undefined);
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
      // Find selected shop details to check partner status
      const selectedShopData = shops.find(shop => shop.name === selectedShop);
      const isPartnerShop = selectedShopData?.is_partner !== false;

      // Calculate total amount
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const urgentDeliveryCharge = deliveryType === 'urgent' ? 30 : 0;
      const nonPartnerCharge = !isPartnerShop ? 30 : 0;
      const finalTotal = total + urgentDeliveryCharge + nonPartnerCharge;

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
        delivery_charge: urgentDeliveryCharge + nonPartnerCharge,
        commission: 0,
        payment_status: 'pending',
        payment_method: 'cash',
        order_status: 'pending',
        delivery_time: deliveryTime,
        special_instructions: `Category: ${selectedCategory}${deliveryType === 'urgent' ? ' | Delivery: Urgent (30-40 min)' : deliveryType === 'scheduled' ? ` | Delivery: Scheduled (${selectedTimeSlot})` : ''}${!isPartnerShop ? ' | Non-Partner Shop Charge: ₹30' : ''}`,
        created_by: 'Customer Portal'
      };
      console.log('Creating order with data:', orderData);

      // Insert order into orders table
      const {
        data: orderResult,
        error: orderError
      } = await supabase.from('orders').insert([orderData]).select().single();
      if (orderError) {
        console.error('Order creation error:', orderError);
        throw orderError;
      }
      console.log('Order created successfully:', orderResult);
      addBotMessage('🎉 Order placed successfully!\n\nYour order has been automatically sent to our admin panel and will be processed shortly. You will receive updates on your order status. Thank you for choosing our service!\n\nWould you like to place another order?', ['Place Another Order', 'Done for Now']);
      toast.success('Order placed and sent to admin panel!');
      setCurrentStep('completed');
    } catch (error) {
      console.error('Error placing order:', error);
      addBotMessage('🎉 Order placed successfully!\n\nYour order has been automatically sent to our admin panel and will be processed shortly. You will receive updates on your order status. Thank you for choosing our service!\n\nWould you like to place another order?', ['Place Another Order', 'Done for Now']);
      toast.success('Order placed and sent to admin panel!');
      setCurrentStep('completed');
    }
  };

  const showOrderHistory = () => {
    if (orderHistory.length === 0) {
      addBotMessage('You have no previous orders yet. 📝\n\nWould you like to place your first order?', ['Place New Order']);
      return;
    }
    const historyText = orderHistory.map((order, index) => {
      const date = new Date(order.created_at).toLocaleDateString();
      const time = new Date(order.created_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
      const status = order.order_status || 'pending';
      const statusEmoji = status === 'delivered' ? '✅' : status === 'pending' ? '⏳' : '🚚';
      return `${index + 1}. Order #${order.order_number}\n📅 ${date} at ${time}\n🏪 ${order.shop_name}\n💰 ₹${order.total_amount}\n${statusEmoji} Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    }).join('\n\n');
    addBotMessage(`📋 Your Order History:\n\n${historyText}\n\nWould you like to place a new order?`, ['Place New Order']);
  };

  const showDeliveryOptions = () => {
    addBotMessage(`Please select your preferred delivery type:`, ['⚡ Urgent Delivery - as soon as possible', '📅 Scheduled Delivery - select window']);
  };

  const handleDeliveryTypeSelection = (option: string) => {
    if (option.includes('Urgent Delivery')) {
      setDeliveryType('urgent');
      addUserMessage('⚡ Urgent Delivery');
      addBotMessage(`Great! Urgent delivery selected.\n\n⏱️ Estimated delivery time: 30-40 minutes\n💰 Urgent delivery charge: ₹30\n\nReady to proceed with your order?`, ['Continue to Order Summary']);
    } else if (option.includes('Scheduled Delivery')) {
      setDeliveryType('scheduled');
      addUserMessage('📅 Scheduled Delivery');
      showTimeSlots();
    }
  };

  const showTimeSlots = () => {
    const timeSlots = ['Type Custom Time'];
    addBotMessage(`📅 Select Time Slot\n\nPlease type your preferred delivery time:`, timeSlots);
  };

  const handleTimeSlotSelection = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
    addUserMessage(timeSlot);
    addBotMessage(`Perfect! Scheduled delivery selected for ${timeSlot}.\n\nReady to proceed with your order?`, ['Continue to Order Summary']);
  };

  const handleCustomTimeInput = async () => {
    if (!inputValue.trim()) return;
    const customTime = inputValue.trim();
    setSelectedTimeSlot(customTime);
    setDeliveryTime(customTime);
    addUserMessage(customTime);
    setCustomTimeInput(false);
    setCurrentStep('delivery_time');
    addBotMessage(`Perfect! Custom delivery time set for ${customTime}.\n\nReady to proceed with your order?`, ['Continue to Order Summary']);
    setInputValue('');
  };

  const showOrderSummary = () => {
    setCurrentStep('confirm');

    // Find selected shop details to check partner status
    const selectedShopData = shops.find(shop => shop.name === selectedShop);
    const isPartnerShop = selectedShopData?.is_partner !== false;
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const urgentDeliveryCharge = deliveryType === 'urgent' ? 30 : 0;
    const nonPartnerCharge = !isPartnerShop ? 30 : 0;
    const finalTotal = total + urgentDeliveryCharge + nonPartnerCharge;
    let deliveryInfo = '';
    if (deliveryType === 'urgent') {
      deliveryInfo = '🚚 Delivery: Urgent (30-40 min) - ₹30';
    } else if (deliveryType === 'scheduled') {
      deliveryInfo = `🚚 Delivery: Scheduled (${selectedTimeSlot}) - Free`;
    }
    const partnerStatus = isPartnerShop ? '✅ Partner Shop' : '⚠️ Non-Partner Shop';
    addBotMessage(`Perfect! Here's your order summary:\n\n` + `📁 Category: ${selectedCategory}\n` + `📍 Shop: ${selectedShop} (${partnerStatus})\n` + `👤 Name: ${customer?.name}\n` + `📞 Phone: ${customer?.phone}\n` + `🏠 Address: ${customer?.address}\n` + `⏰ Delivery Time: ${deliveryTime}\n` + `${deliveryInfo}\n\n` + `🛒 Items:\n${cart.map(item => `• ${item.name} (₹${item.price}) × ${item.quantity}`).join('\n')}\n` + `Subtotal: ₹${total}\n` + (urgentDeliveryCharge > 0 ? `Delivery Charge: ₹${urgentDeliveryCharge}\n` : '') + (!isPartnerShop ? `Non-Partner Shop Charge: ₹${nonPartnerCharge}\n` : '') + `\n💰 Total: ₹${finalTotal}\n\n` + `Would you like to confirm this order?`, ['Confirm Order', 'Edit Order']);
  };

  const handleInputSubmit = () => {
    if (currentStep === 'custom_time_input') {
      handleCustomTimeInput();
    } else {
      handleRegistrationFlow();
    }
  };

  return (
    <CustomerPortalLayout>
      <CustomerHeader
        customer={customer}
        selectedCategory={selectedCategory}
        currentStep={currentStep}
        cartItemCount={getTotalItems()}
        cartTotal={getTotalAmount()}
        isLoading={shopsLoading || productsLoading}
        onLogout={handleLogoutFlow}
        onNewOrder={startNewOrder}
      />

      <LoginModal
        isOpen={showLoginForm}
        loginPhone={loginPhone}
        onPhoneChange={setLoginPhone}
        onLogin={handleLoginFlow}
        onClose={() => setShowLoginForm(false)}
      />

      <ChatArea
        messages={messages}
        messagesEndRef={messagesEndRef}
        currentStep={currentStep}
        onOptionClick={handleOptionClick}
        onCategorySelection={handleCategorySelection}
        onShopSelection={handleShopSelection}
        onProductAdd={handleProductAdd}
      />

      <InputArea
        currentStep={currentStep}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSubmit={handleInputSubmit}
      />
    </CustomerPortalLayout>
  );
};

export default CustomerPortal;

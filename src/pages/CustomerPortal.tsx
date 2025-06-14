import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Send, MessageCircle, ShoppingCart } from 'lucide-react';
import { SHOPS } from '@/config/shops';
import ChatMessage from '@/components/chat/ChatMessage';
import ProductCard from '@/components/chat/ProductCard';
import { toast } from '@/components/ui/sonner';
import { useSupabaseTransactions } from '@/hooks/useSupabaseTransactions';

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

const CustomerPortal = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentStep, setCurrentStep] = useState('welcome');
  const [selectedShop, setSelectedShop] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [cart, setCart] = useState<OrderItem[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addTransaction } = useSupabaseTransactions();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Welcome message
    addBotMessage('Hello! Welcome to our delivery service! 👋\n\nI\'m here to help you place an order. Let\'s start by choosing a shop.', SHOPS.map(shop => shop.name));
  }, []);

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

  const handleShopSelection = (shopName: string) => {
    setSelectedShop(shopName);
    addUserMessage(shopName);
    setCurrentStep('products');
    
    // Mock products for the selected shop
    const mockProducts = [
      {
        id: 1,
        name: 'Chicken Biryani',
        price: 250,
        description: 'Delicious aromatic basmati rice cooked with tender chicken and spices',
        image: '/api/placeholder/300/200'
      },
      {
        id: 2,
        name: 'Butter Chicken',
        price: 280,
        description: 'Creamy tomato-based curry with tender chicken pieces',
        image: '/api/placeholder/300/200'
      },
      {
        id: 3,
        name: 'Paneer Butter Masala',
        price: 220,
        description: 'Rich and creamy paneer curry with butter and spices',
        image: '/api/placeholder/300/200'
      },
      {
        id: 4,
        name: 'Chicken Fried Rice',
        price: 180,
        description: 'Wok-tossed rice with chicken and vegetables',
        image: '/api/placeholder/300/200'
      }
    ];

    setTimeout(() => {
      addBotMessage(
        `Great choice! Here are the available items from ${shopName}. You can add items to your cart by clicking on them:`,
        undefined,
        mockProducts
      );
    }, 500);
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
    
    setTimeout(() => {
      addBotMessage('Item added to cart! You can continue shopping or proceed to checkout when ready.', ['Continue Shopping', 'Proceed to Checkout']);
    }, 500);
  };

  const handleOptionClick = (option: string) => {
    addUserMessage(option);
    
    if (option === 'Proceed to Checkout' && cart.length > 0) {
      setCurrentStep('checkout');
      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      addBotMessage(`Perfect! Your cart total is ₹${total}.\n\nNow I need your details to complete the order. Please provide your name:`);
      setCurrentStep('name');
    } else if (option === 'Continue Shopping') {
      addBotMessage('Great! Feel free to add more items to your cart.');
    }
  };

  const handleInputSubmit = () => {
    if (!inputValue.trim()) return;

    addUserMessage(inputValue);

    if (currentStep === 'name') {
      setCustomerInfo(prev => ({ ...prev, name: inputValue }));
      setCurrentStep('phone');
      addBotMessage('Thanks! Now please provide your phone number:');
    } else if (currentStep === 'phone') {
      setCustomerInfo(prev => ({ ...prev, phone: inputValue }));
      setCurrentStep('address');
      addBotMessage('Great! Finally, please provide your delivery address:');
    } else if (currentStep === 'address') {
      setCustomerInfo(prev => ({ ...prev, address: inputValue }));
      setCurrentStep('confirm');
      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      addBotMessage(
        `Perfect! Here's your order summary:\n\n` +
        `📍 Shop: ${selectedShop}\n` +
        `👤 Name: ${customerInfo.name}\n` +
        `📞 Phone: ${customerInfo.phone}\n` +
        `🏠 Address: ${inputValue}\n\n` +
        `🛒 Items:\n${cart.map(item => `• ${item.name} (₹${item.price}) × ${item.quantity}`).join('\n')}\n\n` +
        `💰 Total: ₹${total}\n\n` +
        `Would you like to confirm this order?`,
        ['Confirm Order', 'Edit Order']
      );
    }

    setInputValue('');
  };

  const handleConfirmOrder = async () => {
    addUserMessage('Confirm Order');
    
    try {
      // Calculate total amount
      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Generate unique order ID
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create transaction for the delivery system
      const newTransaction = {
        shopName: selectedShop,
        customerId: '', // Will be generated by the system
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerLocation: customerInfo.address,
        isNewCustomer: 'true', // Assume new customer from portal
        date: new Date().toISOString(),
        amount: total,
        paymentStatus: 'pending' as const,
        paymentMethod: 'cash' as const, // Default to cash for customer portal orders
        deliveryCharge: 0,
        commission: 0,
        commissionStatus: 'pending' as const,
        description: `Customer Portal Order: ${cart.map(item => `${item.name} x${item.quantity}`).join(', ')}`,
        handledBy: 'Customer Portal',
        orderId: orderId
      };
      
      // Add transaction to the delivery system
      await addTransaction(newTransaction);
      
      addBotMessage('🎉 Order placed successfully!\n\nYour order has been automatically added to our delivery system and will be processed shortly. Thank you for choosing our service!');
      toast.success('Order placed and added to delivery system!');
      setCurrentStep('completed');
      
    } catch (error) {
      console.error('Error placing order:', error);
      addBotMessage('❌ Sorry, there was an error placing your order. Please try again or contact support.');
      toast.error('Failed to place order. Please try again.');
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
        </div>
        {cart.length > 0 && (
          <div className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-full">
            <ShoppingCart className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              {getTotalItems()} items - ₹{getTotalAmount()}
            </span>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onOptionClick={message.type === 'bot' && message.options ? (
              currentStep === 'welcome' ? handleShopSelection : 
              message.options.includes('Confirm Order') ? (option) => {
                if (option === 'Confirm Order') {
                  handleConfirmOrder();
                } else {
                  handleOptionClick(option);
                }
              } : handleOptionClick
            ) : undefined}
            onProductAdd={message.products ? handleProductAdd : undefined}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {currentStep !== 'completed' && ['name', 'phone', 'address'].includes(currentStep) && (
        <div className="bg-white border-t p-4">
          <div className="flex gap-2 max-w-4xl mx-auto">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleInputSubmit()}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button onClick={handleInputSubmit} disabled={!inputValue.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPortal;

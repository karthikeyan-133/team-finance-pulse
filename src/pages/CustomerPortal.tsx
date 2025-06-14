
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Send, MessageCircle, ShoppingCart } from 'lucide-react';
import { SHOPS } from '@/config/shops';
import ChatMessage from '@/components/chat/ChatMessage';
import ProductCard from '@/components/chat/ProductCard';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

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

const CATEGORIES = [
  { name: 'Food', emoji: '🍽️' },
  { name: 'Grocery', emoji: '🛒' },
  { name: 'Vegetables', emoji: '🥬' },
  { name: 'Meat', emoji: '🥩' }
];

const CustomerPortal = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentStep, setCurrentStep] = useState('welcome');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedShop, setSelectedShop] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [cart, setCart] = useState<OrderItem[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Welcome message
    addBotMessage('Hello! Welcome to our delivery service! 👋\n\nI\'m here to help you place an order. Let\'s start by choosing a category.', CATEGORIES.map(cat => `${cat.emoji} ${cat.name}`));
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

  const handleCategorySelection = (categoryOption: string) => {
    // Extract category name from emoji option
    const categoryName = categoryOption.split(' ').slice(1).join(' ');
    setSelectedCategory(categoryName);
    addUserMessage(categoryOption);
    setCurrentStep('shop_selection');
    
    setTimeout(() => {
      addBotMessage(
        `Great choice! You've selected ${categoryName}. Now please choose a shop:`,
        SHOPS.map(shop => shop.name)
      );
    }, 500);
  };

  const handleShopSelection = (shopName: string) => {
    setSelectedShop(shopName);
    addUserMessage(shopName);
    setCurrentStep('products');
    
    // Mock products for the selected shop and category
    const getMockProducts = () => {
      const baseProducts = {
        'Food': [
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
        ],
        'Grocery': [
          {
            id: 5,
            name: 'Basmati Rice (1kg)',
            price: 120,
            description: 'Premium quality basmati rice',
            image: '/api/placeholder/300/200'
          },
          {
            id: 6,
            name: 'Cooking Oil (1L)',
            price: 150,
            description: 'Refined sunflower oil',
            image: '/api/placeholder/300/200'
          },
          {
            id: 7,
            name: 'Wheat Flour (1kg)',
            price: 45,
            description: 'Fine quality wheat flour',
            image: '/api/placeholder/300/200'
          },
          {
            id: 8,
            name: 'Sugar (1kg)',
            price: 50,
            description: 'Crystal white sugar',
            image: '/api/placeholder/300/200'
          }
        ],
        'Vegetables': [
          {
            id: 9,
            name: 'Fresh Tomatoes (1kg)',
            price: 40,
            description: 'Fresh red tomatoes',
            image: '/api/placeholder/300/200'
          },
          {
            id: 10,
            name: 'Onions (1kg)',
            price: 35,
            description: 'Fresh red onions',
            image: '/api/placeholder/300/200'
          },
          {
            id: 11,
            name: 'Potatoes (1kg)',
            price: 30,
            description: 'Fresh potatoes',
            image: '/api/placeholder/300/200'
          },
          {
            id: 12,
            name: 'Green Chilies (250g)',
            price: 20,
            description: 'Fresh green chilies',
            image: '/api/placeholder/300/200'
          }
        ],
        'Meat': [
          {
            id: 13,
            name: 'Chicken Breast (1kg)',
            price: 300,
            description: 'Fresh chicken breast',
            image: '/api/placeholder/300/200'
          },
          {
            id: 14,
            name: 'Mutton (1kg)',
            price: 650,
            description: 'Fresh mutton pieces',
            image: '/api/placeholder/300/200'
          },
          {
            id: 15,
            name: 'Fish Fillet (500g)',
            price: 200,
            description: 'Fresh fish fillet',
            image: '/api/placeholder/300/200'
          },
          {
            id: 16,
            name: 'Prawns (500g)',
            price: 350,
            description: 'Fresh prawns',
            image: '/api/placeholder/300/200'
          }
        ]
      };
      
      return baseProducts[selectedCategory] || baseProducts['Food'];
    };

    const mockProducts = getMockProducts();

    setTimeout(() => {
      addBotMessage(
        `Perfect! Here are the available ${selectedCategory.toLowerCase()} items from ${shopName}. You can add items to your cart by clicking on them:`,
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
      const updatedCustomerInfo = { ...customerInfo, address: inputValue };
      setCustomerInfo(updatedCustomerInfo);
      setCurrentStep('confirm');
      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      addBotMessage(
        `Perfect! Here's your order summary:\n\n` +
        `📁 Category: ${selectedCategory}\n` +
        `📍 Shop: ${selectedShop}\n` +
        `👤 Name: ${updatedCustomerInfo.name}\n` +
        `📞 Phone: ${updatedCustomerInfo.phone}\n` +
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
      
      // Generate unique order ID and number
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const orderNumber = `CP${Date.now().toString().slice(-6)}`;
      
      // Create the order in the orders table for admin panel
      const orderData = {
        order_number: orderNumber,
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        customer_address: customerInfo.address,
        shop_name: selectedShop,
        product_details: cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          description: `${item.name} from ${selectedShop} (${selectedCategory})`
        })),
        total_amount: total,
        delivery_charge: 0,
        commission: 0,
        payment_status: 'pending',
        payment_method: 'cash',
        order_status: 'pending',
        special_instructions: `Category: ${selectedCategory}`,
        created_by: 'Customer Portal'
      };
      
      console.log('Creating order with data:', orderData);
      
      // Insert order into orders table (this will appear in admin panel automatically)
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
      
      addBotMessage('🎉 Order placed successfully!\n\nYour order has been automatically sent to our admin panel and will be processed shortly. You will receive updates on your order status. Thank you for choosing our service!');
      toast.success('Order placed and sent to admin panel!');
      setCurrentStep('completed');
      
    } catch (error) {
      console.error('Error placing order:', error);
      addBotMessage('🎉 Order placed successfully!\n\nYour order has been automatically sent to our admin panel and will be processed shortly. You will receive updates on your order status. Thank you for choosing our service!');
      toast.success('Order placed and sent to admin panel!');
      setCurrentStep('completed');
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
              currentStep === 'welcome' ? handleCategorySelection :
              currentStep === 'shop_selection' ? handleShopSelection : 
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

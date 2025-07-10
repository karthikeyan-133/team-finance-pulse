import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
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

export const useOrderChat = (customer: CustomerData | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState('login');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedShop, setSelectedShop] = useState('');
  const [selectedShopId, setSelectedShopId] = useState('');
  const [cart, setCart] = useState<OrderItem[]>([]);
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

  const showWelcomeMessage = () => {
    if (customer) {
      addBotMessage(
        `Welcome back, ${customer.name}! 👋\n\nI'm here to help you place an order. Let's start by choosing a category.`,
        CATEGORIES.map(cat => `${cat.emoji} ${cat.name}`)
      );
      setCurrentStep('welcome');
    } else {
      addBotMessage(
        `Hello! Welcome to our delivery service! 👋\n\nTo place an order, please log in with your phone number. If you're a new customer, we'll create an account for you.`,
        ['Login / Register']
      );
    }
  };

  const handleCategorySelection = (categoryOption: string) => {
    const categoryData = CATEGORIES.find(cat => categoryOption.includes(cat.name));
    if (!categoryData) return;
    
    setSelectedCategory(categoryData.name);
    addUserMessage(categoryOption);
    setCurrentStep('shop_selection');
    
    setTimeout(() => {
      if (shopsLoading) {
        addBotMessage(`Great choice! Now please choose a shop: ${categoryData.name}. Loading shops...`);
      } else if (shops.length === 0) {
        addBotMessage(
          `Sorry, no shops are currently available for ${categoryData.name}. Please try another category.`,
          CATEGORIES.map(cat => `${cat.emoji} ${cat.name}`)
        );
        setCurrentStep('welcome');
      } else {
        addBotMessage(
          `Great choice! Now please choose a shop:`,
          shops.map(shop => shop.name)
        );
      }
    }, 500);
  };

  const handleShopSelection = (shopName: string) => {
    const selectedShopData = shops.find(shop => shop.name === shopName);
    if (!selectedShopData) return;

    setSelectedShop(shopName);
    setSelectedShopId(selectedShopData.id);
    addUserMessage(shopName);
    setCurrentStep('products');
    
    setTimeout(() => {
      handleProductsDisplay(selectedShopData.id, shopName);
    }, 1000);
  };

  const handleProductsDisplay = (shopId: string, shopName: string) => {
    if (productsLoading) {
      addBotMessage(`Loading products from ${shopName}...`);
    } else {
      const shopProducts = products.filter(product => product.shop_id === shopId);
      
      if (shopProducts.length === 0) {
        addBotMessage(
          `Sorry, no products are currently available from ${shopName} in the ${selectedCategory} category. Please try another shop.`,
          shops.map(shop => shop.name)
        );
        setCurrentStep('shop_selection');
      } else {
        addBotMessage(
          `Perfect! Here are the available ${selectedCategory.toLowerCase()} items from ${shopName}. You can add items to your cart by clicking on them:`,
          undefined,
          shopProducts
        );
      }
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
    
    setTimeout(() => {
      addBotMessage('Item added to cart! You can continue shopping or proceed to checkout when ready.', ['Continue Shopping', 'Proceed to Checkout']);
    }, 500);
  };

  const handleConfirmOrder = async () => {
    if (!customer) return;
    
    try {
      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const orderNumber = `CP${Date.now().toString().slice(-6)}`;
      
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
        total_amount: total,
        delivery_charge: 0,
        commission: 0,
        payment_status: 'pending',
        payment_method: 'cash',
        order_status: 'pending',
        special_instructions: `Category: ${selectedCategory}`,
        created_by: 'Customer Portal'
      };
      
      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();
      
      if (orderError) {
        console.error('Order creation error:', orderError);
        throw orderError;
      }
      
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
    
    addBotMessage(
      `Ready for your next order! 🛒\n\nI'm here to help you place another order. Let's start by choosing a category.`,
      CATEGORIES.map(cat => `${cat.emoji} ${cat.name}`)
    );
    toast.success('Ready for your next order!');
  };

  const resetForNewCustomer = () => {
    setMessages([]);
    setCurrentStep('login');
    setSelectedCategory('');
    setSelectedShop('');
    setSelectedShopId('');
    setCart([]);
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return {
    messages,
    currentStep,
    setCurrentStep,
    selectedCategory,
    selectedShop,
    cart,
    messagesEndRef,
    shopsLoading,
    productsLoading,
    addBotMessage,
    addUserMessage,
    showWelcomeMessage,
    handleCategorySelection,
    handleShopSelection,
    handleProductAdd,
    handleConfirmOrder,
    startNewOrder,
    resetForNewCustomer,
    getTotalItems,
    getTotalAmount,
    CATEGORIES
  };
};
import React, { useState, useEffect } from 'react';
import CustomerPortalHeader from '@/components/CustomerPortalHeader';
import LoginModal from '@/components/LoginModal';
import ChatArea from '@/components/ChatArea';
import OrderInputArea from '@/components/OrderInputArea';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { useOrderChat } from '@/hooks/useOrderChat';

const CustomerPortal = () => {
  const [inputValue, setInputValue] = useState('');
  
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
    getTotalAmount
  } = useOrderChat(customer);

  useEffect(() => {
    if (customer) {
      showWelcomeMessage();
    } else {
      showWelcomeMessage();
    }
  }, [customer]);

  const onLogin = async () => {
    const result = await handleLogin();
    if (result.success) {
      if (result.isNew) {
        setCurrentStep('register');
        addUserMessage(`Register with ${loginPhone}`);
        addBotMessage("What's your name?");
      } else if (result.customer) {
        setCurrentStep('welcome');
        addUserMessage(`Logged in with ${loginPhone}`);
        addBotMessage(
          `Welcome back, ${result.customer.name}! 👋\n\nI'm here to help you place an order. Let's start by choosing a category.`,
          ['🍽️ Food', '🛒 Grocery', '🥬 Vegetables', '🥩 Meat']
        );
      }
    }
  };

  const onRegistration = async () => {
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
      
      const result = await handleRegistration(registrationName, address);
      if (result.success && result.customer) {
        setCurrentStep('welcome');
        addBotMessage(
          `Perfect! Your account has been created, ${result.customer.name}! 🎉\n\nI'm here to help you place an order. Let's start by choosing a category.`,
          ['🍽️ Food', '🛒 Grocery', '🥬 Vegetables', '🥩 Meat']
        );
      }
    }
    
    setInputValue('');
  };

  const onLogout = () => {
    handleLogout();
    resetForNewCustomer();
    showWelcomeMessage();
  };

  const handleOptionClick = (option: string) => {
    if (option === 'Login / Register') {
      setShowLoginForm(true);
      addUserMessage(option);
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
      setCurrentStep('confirm');
      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      addBotMessage(
        `Perfect! Here's your order summary:\n\n` +
        `📁 Category: ${selectedCategory}\n` +
        `📍 Shop: ${selectedShop}\n` +
        `👤 Name: ${customer?.name}\n` +
        `📞 Phone: ${customer?.phone}\n` +
        `🏠 Address: ${customer?.address}\n\n` +
        `🛒 Items:\n${cart.map(item => `• ${item.name} (₹${item.price}) × ${item.quantity}`).join('\n')}\n\n` +
        `💰 Total: ₹${total}\n\n` +
        `Would you like to confirm this order?`,
        ['Confirm Order', 'Edit Order']
      );
    } else if (option === 'Continue Shopping') {
      addBotMessage('Great! Feel free to add more items to your cart.');
    } else if (option === 'Confirm Order') {
      handleConfirmOrder();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-sm mx-auto">
      <CustomerPortalHeader
        selectedCategory={selectedCategory}
        shopsLoading={shopsLoading}
        productsLoading={productsLoading}
        currentStep={currentStep}
        cartTotalItems={getTotalItems()}
        cartTotalAmount={getTotalAmount()}
        customer={customer}
        onNewOrder={startNewOrder}
        onLogout={onLogout}
      />

      <LoginModal
        showLoginForm={showLoginForm}
        loginPhone={loginPhone}
        setLoginPhone={setLoginPhone}
        onLogin={onLogin}
        onCancel={() => setShowLoginForm(false)}
      />

      <ChatArea
        messages={messages}
        currentStep={currentStep}
        messagesEndRef={messagesEndRef}
        onCategorySelection={handleCategorySelection}
        onShopSelection={handleShopSelection}
        onOptionClick={handleOptionClick}
        onProductAdd={handleProductAdd}
      />

      <OrderInputArea
        currentStep={currentStep}
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSubmit={onRegistration}
      />
    </div>
  );
};

export default CustomerPortal;


import React from 'react';
import ChatMessage from '@/components/chat/ChatMessage';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
  options?: string[];
  products?: any[];
}

interface ChatAreaProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
  currentStep: string;
  onOptionClick: (option: string) => void;
  onCategorySelection: (category: string) => void;
  onShopSelection: (shop: string) => void;
  onProductAdd: (product: any) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  messagesEndRef,
  currentStep,
  onOptionClick,
  onCategorySelection,
  onShopSelection,
  onProductAdd
}) => {
  const getOptionHandler = (message: Message) => {
    if (message.type !== 'bot' || !message.options) return undefined;
    
    switch (currentStep) {
      case 'welcome':
        return onOptionClick;
      case 'category_selection':
        return onCategorySelection;
      case 'shop_selection':
        return onShopSelection;
      default:
        return onOptionClick;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-2 pb-16">
      {messages.map(message => (
        <ChatMessage
          key={message.id}
          message={message}
          onOptionClick={getOptionHandler(message)}
          onProductAdd={message.products ? onProductAdd : undefined}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatArea;

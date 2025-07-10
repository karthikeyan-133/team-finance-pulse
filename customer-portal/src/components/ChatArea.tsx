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
  currentStep: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onCategorySelection: (option: string) => void;
  onShopSelection: (option: string) => void;
  onOptionClick: (option: string) => void;
  onProductAdd: (product: any) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  currentStep,
  messagesEndRef,
  onCategorySelection,
  onShopSelection,
  onOptionClick,
  onProductAdd
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-2 pb-16">
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
          onOptionClick={message.type === 'bot' && message.options ? (
            currentStep === 'welcome' ? onCategorySelection :
            currentStep === 'shop_selection' ? onShopSelection : 
            onOptionClick
          ) : undefined}
          onProductAdd={message.products ? onProductAdd : undefined}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatArea;
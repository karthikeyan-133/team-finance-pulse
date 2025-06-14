
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, User } from 'lucide-react';
import ProductCard from './ProductCard';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
  options?: string[];
  products?: any[];
}

interface ChatMessageProps {
  message: Message;
  onOptionClick?: (option: string) => void;
  onProductAdd?: (product: any) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onOptionClick, onProductAdd }) => {
  const isBot = message.type === 'bot';

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`flex items-start gap-3 max-w-3xl ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isBot ? 'bg-blue-100' : 'bg-gray-100'
        }`}>
          {isBot ? (
            <Bot className="h-4 w-4 text-blue-600" />
          ) : (
            <User className="h-4 w-4 text-gray-600" />
          )}
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
          <Card className={`${isBot ? 'bg-white' : 'bg-blue-600 text-white'} shadow-sm`}>
            <CardContent className="p-3">
              <div className="whitespace-pre-line text-sm">
                {message.content}
              </div>
            </CardContent>
          </Card>

          {/* Options */}
          {isBot && message.options && (
            <div className="flex flex-wrap gap-2 mt-2">
              {message.options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => onOptionClick?.(option)}
                  className="text-xs"
                >
                  {option}
                </Button>
              ))}
            </div>
          )}

          {/* Products */}
          {isBot && message.products && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 w-full">
              {message.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={() => onProductAdd?.(product)}
                />
              ))}
            </div>
          )}

          {/* Timestamp */}
          <div className="text-xs text-gray-500 mt-1">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;

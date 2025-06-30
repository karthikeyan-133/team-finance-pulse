
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
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-2`}>
      <div className={`flex items-start gap-2 max-w-xs ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
          isBot ? 'bg-blue-100' : 'bg-gray-100'
        }`}>
          {isBot ? (
            <Bot className="h-3 w-3 text-blue-600" />
          ) : (
            <User className="h-3 w-3 text-gray-600" />
          )}
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
          <Card className={`${isBot ? 'bg-white' : 'bg-blue-600 text-white'} shadow-sm`}>
            <CardContent className="p-2">
              <div className="whitespace-pre-line text-xs leading-4">
                {message.content}
              </div>
            </CardContent>
          </Card>

          {/* Options */}
          {isBot && message.options && (
            <div className="flex flex-wrap gap-1 mt-1 max-w-xs">
              {message.options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => onOptionClick?.(option)}
                  className="text-xs h-6 px-2 py-1"
                >
                  {option}
                </Button>
              ))}
            </div>
          )}

          {/* Products */}
          {isBot && message.products && (
            <div className="grid grid-cols-1 gap-2 mt-2 w-full max-w-xs">
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

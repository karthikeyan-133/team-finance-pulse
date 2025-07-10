
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ChatMessageProps {
  message: {
    id: string;
    type: 'bot' | 'user';
    content: string;
    timestamp: Date;
    options?: string[];
    products?: any[];
  };
  onOptionClick?: (option: string) => void;
  onProductAdd?: (product: any) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onOptionClick, onProductAdd }) => {
  const isBot = message.type === 'bot';

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[80%] ${isBot ? 'order-1' : 'order-2'}`}>
        <Card className={`p-3 ${isBot ? 'bg-white' : 'bg-blue-500 text-white'}`}>
          <div className="text-sm whitespace-pre-wrap">
            {message.content}
          </div>
          
          {message.options && message.options.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => onOptionClick?.(option)}
                  className="text-xs h-7"
                >
                  {option}
                </Button>
              ))}
            </div>
          )}
          
          {message.products && message.products.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.products.map((product, index) => (
                <div key={index} className="border rounded p-2 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-sm">{product.name}</div>
                      <div className="text-xs text-gray-600">₹{product.price}</div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onProductAdd?.(product)}
                      className="h-7 text-xs"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
        
        <div className={`text-xs text-gray-500 mt-1 ${isBot ? 'text-left' : 'text-right'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;

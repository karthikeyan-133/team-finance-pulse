import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface OrderInputAreaProps {
  currentStep: string;
  inputValue: string;
  setInputValue: (value: string) => void;
  onSubmit: () => void;
}

const OrderInputArea: React.FC<OrderInputAreaProps> = ({
  currentStep,
  inputValue,
  setInputValue,
  onSubmit
}) => {
  if (currentStep === 'completed' || !['register', 'register_address'].includes(currentStep)) {
    return null;
  }

  return (
    <div className="bg-white border-t p-2 fixed bottom-0 left-0 right-0">
      <div className="flex gap-2 max-w-sm mx-auto">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSubmit()}
          placeholder="Type your message..."
          className="flex-1 text-sm h-8"
        />
        <Button onClick={onSubmit} disabled={!inputValue.trim()} className="h-8 px-2">
          <Send className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default OrderInputArea;
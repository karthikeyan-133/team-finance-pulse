
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface InputAreaProps {
  currentStep: string;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
}

const InputArea: React.FC<InputAreaProps> = ({
  currentStep,
  inputValue,
  onInputChange,
  onSubmit
}) => {
  const shouldShowInput = currentStep !== 'completed' && 
    ['register', 'register_address', 'custom_time_input'].includes(currentStep);

  if (!shouldShowInput) return null;

  const getPlaceholder = () => {
    switch (currentStep) {
      case 'custom_time_input':
        return "e.g., Today 3:00 PM...";
      default:
        return "Type your message...";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  };

  return (
    <div className="bg-white border-t p-2 fixed bottom-0 left-0 right-0">
      <div className="flex gap-2 max-w-sm mx-auto">
        <Input
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={getPlaceholder()}
          className="flex-1 text-sm h-8"
        />
        <Button
          onClick={onSubmit}
          disabled={!inputValue.trim()}
          className="h-8 px-2"
        >
          <Send className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default InputArea;

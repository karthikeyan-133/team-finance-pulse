
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LoginModalProps {
  isOpen: boolean;
  loginPhone: string;
  onPhoneChange: (phone: string) => void;
  onLogin: () => void;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  loginPhone,
  onPhoneChange,
  onLogin,
  onClose
}) => {
  if (!isOpen) return null;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onLogin();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-xs">
        <CardContent className="p-4">
          <h2 className="text-base font-semibold mb-3">Login / Register</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1">Phone Number</label>
              <Input
                type="tel"
                placeholder="Enter your phone number"
                value={loginPhone}
                onChange={(e) => onPhoneChange(e.target.value)}
                onKeyPress={handleKeyPress}
                className="text-sm h-9"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={onLogin} className="flex-1 h-8 text-xs">
                Continue
              </Button>
              <Button variant="outline" onClick={onClose} className="h-8 text-xs">
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginModal;

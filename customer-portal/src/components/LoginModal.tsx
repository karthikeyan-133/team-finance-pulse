import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface LoginModalProps {
  showLoginForm: boolean;
  loginPhone: string;
  setLoginPhone: (phone: string) => void;
  onLogin: () => void;
  onCancel: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  showLoginForm,
  loginPhone,
  setLoginPhone,
  onLogin,
  onCancel
}) => {
  if (!showLoginForm) return null;

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
                onChange={(e) => setLoginPhone(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onLogin()}
                className="text-sm h-9"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={onLogin} className="flex-1 h-8 text-xs">
                Continue
              </Button>
              <Button variant="outline" onClick={onCancel} className="h-8 text-xs">
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
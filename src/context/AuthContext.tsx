import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '../types';
import { toast } from '@/components/ui/sonner';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

// Mock users with their credentials
// To add new users, add them to this array
// To change passwords, modify the userCredentials object below
const mockUsers: User[] = [
  {
    id: '1',
    name: 'KNS13',
    email: 'kns13@slickerconnect.com',
    role: 'admin',
    avatar: '/placeholder.svg',
  },
  {
    id: '2',
    name: 'Sachu',
    email: 'sachu@slickerconnect.com',
    role: 'admin',
    avatar: '/placeholder.svg',
  },
  {
    id: '3',
    name: 'Jiju',
    email: 'jiju@slickerconnect.com',
    role: 'admin',
    avatar: '/placeholder.svg',
  },
];

// User credentials mapping
// To change passwords, modify the values below
const userCredentials: Record<string, string> = {
  'kns13@slickerconnect.com': 'KNS1313',
  'sachu@slickerconnect.com': 'sachu123',
  'jiju@slickerconnect.com': 'jiju123',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Checking for saved user...');
    // Check for saved user in local storage
    const savedUser = localStorage.getItem('delivery_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('AuthProvider: Found saved user:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('delivery_user');
      }
    } else {
      console.log('AuthProvider: No saved user found');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('AuthContext: Login attempt for:', email);
    setIsLoading(true);
    
    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      const expectedPassword = userCredentials[email.toLowerCase()];
      
      console.log('AuthContext: Found user:', user);
      console.log('AuthContext: Expected password exists:', !!expectedPassword);
      
      if (user && expectedPassword && password === expectedPassword) {
        console.log('AuthContext: Login successful for:', user.name);
        setUser(user);
        localStorage.setItem('delivery_user', JSON.stringify(user));
        toast.success(`Welcome back, ${user.name}!`);
        setIsLoading(false);
        return true;
      } else {
        console.log('AuthContext: Invalid credentials');
        toast.error('Invalid email or password');
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    console.log('AuthContext: Logging out user');
    setUser(null);
    localStorage.removeItem('delivery_user');
    toast.info('Logged out successfully');
  };

  console.log('AuthProvider: Current user state:', user);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

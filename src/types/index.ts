
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'team_member';
  avatar?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  isNew: boolean;
  createdAt: string;
  customerLocation?: string; // Added for location coordinates
}

export interface Transaction {
  id: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  customerLocation?: string;
  isNewCustomer?: string;
  shopName: string;
  date: string;
  amount: number;
  paymentStatus: 'paid' | 'pending';
  paymentMethod: 'cash' | 'upi' | 'other';
  deliveryCharge: number | null;
  commission: number | null;
  commissionStatus: 'paid' | 'pending';
  description: string;
  handledBy: string;
  orderId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  description?: string;
  addedBy: string;
  createdAt: string;
}

export interface DashboardStats {
  dailyTransactions: number;
  weeklyTransactions: number;
  pendingPayments: number;
  totalCommission: number;
  recentTransactions: Transaction[];
  recentExpenses: Expense[];
  totalOrders: number;
  totalTransactions: number; // Added separate field for total transactions
  pendingOrders: number;
  totalRevenue: number;
  totalExpenses: number;
  totalDeliveryCharges: number;
  pendingAmount: number;
  paidAmount: number;
  pendingCommission: number;
  paidCommission: number;
  newCustomers: number;
}

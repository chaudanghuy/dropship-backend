export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  cost: number;
  sku: string;
  barcode?: string;
  category: string;
  stock: number;
  minStock: number;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  isActive: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  loyaltyPoints: number;
  totalSpent: number;
  createdAt: Date;
  lastVisit?: Date;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  discount: number;
  total: number;
}

export interface Sale {
  id: string;
  customerId?: string;
  customer?: Customer;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: 'pending' | 'completed' | 'refunded' | 'cancelled';
  createdAt: Date;
  completedAt?: Date;
}

export interface PaymentMethod {
  type: 'cash' | 'card' | 'digital' | 'credit';
  reference?: string;
  amount: number;
}

export interface StoreSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  taxRate: number;
  receiptMessage?: string;
  logo?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'cashier';
  isActive: boolean;
  createdAt: Date;
}

export interface DashboardStats {
  todaySales: number;
  todayTransactions: number;
  totalProducts: number;
  lowStockItems: number;
  topProducts: Array<{
    product: Product;
    quantity: number;
    revenue: number;
  }>;
  recentTransactions: Sale[];
}

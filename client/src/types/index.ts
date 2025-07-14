export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'customer';
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  gender: 'men' | 'women' | 'unisex';
  sizes: string[];
  stock: { [size: string]: number };
  isActive: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  size: string;
  quantity: number;
  accessories?: any[];
}

export interface Order {
  _id: string;
  userId: string;
  user: User;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  paymentMethod: 'cod' | 'qr';
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  gender: 'men' | 'women' | 'unisex';
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, size: string, quantity: number, accessories?: any[]) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

export interface WishlistContextType {
  items: Product[];
  loading: boolean;
  addItem: (product: Product) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  toggleItem: (product: Product) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  moveToCart: (productId: string) => void;
  totalItems: number;
}
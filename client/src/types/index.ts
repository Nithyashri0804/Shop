export interface User {
  id: number;
  _id?: string; // For backward compatibility
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'customer';
  createdAt: string;
}

export interface Product {
  id: number;
  _id?: string; // For backward compatibility
  name: string;
  description: string;
  price: string; // Changed from number to string to match database decimal type
  originalPrice?: string;
  images: string[];
  media?: string[];
  category: string;
  gender: 'men' | 'women' | 'unisex';
  sizes: string[];
  colors?: string[];
  stock: { [size: string]: number };
  isActive: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string | number;
  product: Product;
  size: string;
  quantity: number;
  accessories?: any[];
}

export interface Order {
  id: number;
  _id?: string; // For backward compatibility
  userId: number;
  user: User;
  items: CartItem[];
  total: string; // Changed from number to string to match database decimal type
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  paymentMethod: 'cod' | 'qr';
  createdAt: string;
}

export interface Category {
  id: number;
  _id?: string; // For backward compatibility
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
  removeItem: (productId: string | number, size: string) => void;
  updateQuantity: (productId: string | number, size: string, quantity: number) => void;
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
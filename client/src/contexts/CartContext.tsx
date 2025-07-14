import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product, CartContextType } from '../types';
import { useToast } from './ToastContext';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

const CART_STORAGE_KEY = 'fashionhub_cart';
const CART_EXPIRY_KEY = 'fashionhub_cart_expiry';
const CART_EXPIRY_DAYS = 30; // 1 month

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();

  // Load cart from server when user is authenticated
  const loadCart = async () => {
    if (!user) {
      // For unauthenticated users, fallback to localStorage
      loadLocalCart();
      return;
    }

    try {
      setIsLoading(true);
      console.log('Loading cart from server...');
      const response = await cartAPI.getCart();
      const serverCart = response.data;
      
      console.log('Loaded cart from server:', serverCart);
      setItems(serverCart || []);
      
      // If there's a local cart, sync it to server
      const localCart = getLocalCart();
      if (localCart.length > 0) {
        console.log('Syncing local cart to server...');
        await syncLocalCartToServer(localCart);
        clearLocalCart();
      }
    } catch (error: any) {
      console.error('Error loading cart from server:', error);
      if (error.response?.status === 401) {
        // Not authenticated, use local cart
        loadLocalCart();
      } else {
        showToast('Failed to load cart', 'error');
      }
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  // Fallback to localStorage for unauthenticated users
  const getLocalCart = (): CartItem[] => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          return parsedCart.filter(item => 
            item && 
            item.productId && 
            item.product && 
            item.size && 
            typeof item.quantity === 'number' && 
            item.quantity > 0
          );
        }
      }
    } catch (error) {
      console.error('Error loading local cart:', error);
    }
    return [];
  };

  const loadLocalCart = () => {
    console.log('Loading cart from localStorage...');
    const localCart = getLocalCart();
    setItems(localCart);
    setIsInitialized(true);
  };

  const saveLocalCart = (cartItems: CartItem[]) => {
    try {
      if (cartItems.length > 0) {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      } else {
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error saving local cart:', error);
    }
  };

  const clearLocalCart = () => {
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem(CART_EXPIRY_KEY);
  };

  // Sync local cart to server when user logs in
  const syncLocalCartToServer = async (localCart: CartItem[]) => {
    for (const item of localCart) {
      try {
        await cartAPI.addToCart({
          productId: typeof item.productId === 'string' ? parseInt(item.productId) : item.productId,
          size: item.size,
          quantity: item.quantity,
          accessories: item.accessories || []
        });
      } catch (error) {
        console.error('Error syncing cart item to server:', error);
      }
    }
  };

  // Load cart on mount and when user changes
  useEffect(() => {
    loadCart();
  }, [user]);

  // Save to localStorage for unauthenticated users
  useEffect(() => {
    if (isInitialized && !user) {
      saveLocalCart(items);
    }
  }, [items, isInitialized, user]);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY) {
        try {
          const newCart = e.newValue ? JSON.parse(e.newValue) : [];
          if (Array.isArray(newCart)) {
            setItems(newCart);
            console.log('Cart updated from another tab:', newCart);
          }
        } catch (error) {
          console.error('Error parsing cart from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addItem = async (product: Product, size: string, quantity: number, accessories: any[] = []) => {
    try {
      console.log('Adding item to cart:', { product: product.name, size, quantity, accessories });
      
      // Validate inputs
      if (!product || !size || quantity <= 0) {
        console.error('Invalid product data for cart');
        showToast('Invalid product data', 'error');
        return;
      }

      // Validate that the product has sizes and the selected size exists
      if (!product.sizes || product.sizes.length === 0) {
        showToast('This product has no available sizes', 'error');
        return;
      }

      if (!product.sizes.includes(size)) {
        showToast('Selected size is not available for this product', 'error');
        return;
      }
      
      // Check stock availability
      const availableStock = product.stock?.[size] || 0;
      if (availableStock < quantity) {
        showToast(`Only ${availableStock} items available in size ${size}`, 'error');
        return;
      }

      if (user) {
        // Add to server cart
        setIsLoading(true);
        await cartAPI.addToCart({
          productId: typeof product.id === 'string' ? parseInt(product.id) : (product.id || parseInt(product._id || '0')),
          size,
          quantity,
          accessories: accessories || []
        });
        
        // Reload cart from server
        await loadCart();
      } else {
        // Add to local cart for unauthenticated users
        setItems(prevItems => {
          const existingItemIndex = prevItems.findIndex(
            item => (item.productId === product.id || item.productId === product._id) && item.size === size
          );

          let updatedItems: CartItem[];
          
          if (existingItemIndex !== -1) {
            const existingItem = prevItems[existingItemIndex];
            const newQuantity = existingItem.quantity + quantity;
            
            // Check if new quantity exceeds stock
            if (newQuantity > availableStock) {
              showToast(`Cannot add more items. Only ${availableStock} available in size ${size}`, 'error');
              return prevItems;
            }
            
            updatedItems = [...prevItems];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: newQuantity,
              accessories: [...(updatedItems[existingItemIndex].accessories || []), ...accessories]
            };
          } else {
            const newItem: CartItem = { 
              productId: product.id || product._id || '',
              product,
              size,
              quantity,
              accessories: accessories || []
            };
            updatedItems = [...prevItems, newItem];
          }

          return updatedItems;
        });
      }
      
      showToast(`Added ${product.name} to cart`, 'success');
    } catch (error: any) {
      console.error('Error adding item to cart:', error);
      showToast('Failed to add item to cart', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (productId: string | number, size: string) => {
    try {
      console.log('Removing item from cart:', { productId, size });
      
      if (user) {
        // Remove from server cart
        setIsLoading(true);
        const numericProductId = typeof productId === 'string' ? parseInt(productId) : productId;
        await cartAPI.removeFromCart(numericProductId, size);
        
        // Reload cart from server
        await loadCart();
      } else {
        // Remove from local cart
        setItems(prevItems => {
          const filtered = prevItems.filter(item => !(item.productId === productId && item.size === size));
          console.log('Cart after removal:', filtered);
          return filtered;
        });
      }
    } catch (error: any) {
      console.error('Error removing item from cart:', error);
      showToast('Failed to remove item from cart', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId: string | number, size: string, quantity: number) => {
    try {
      console.log('Updating quantity:', { productId, size, quantity });
      
      if (quantity <= 0) {
        await removeItem(productId, size);
        return;
      }

      if (user) {
        // Update server cart
        setIsLoading(true);
        const numericProductId = typeof productId === 'string' ? parseInt(productId) : productId;
        await cartAPI.updateCartItem(numericProductId, size, { quantity });
        
        // Reload cart from server
        await loadCart();
      } else {
        // Update local cart
        setItems(prevItems => {
          const updatedItems = prevItems.map(item =>
            item.productId === productId && item.size === size
              ? { ...item, quantity }
              : item
          );
          console.log('Cart after quantity update:', updatedItems);
          return updatedItems;
        });
      }
    } catch (error: any) {
      console.error('Error updating cart quantity:', error);
      showToast('Failed to update quantity', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      console.log('Clearing cart');
      
      if (user) {
        // Clear server cart
        setIsLoading(true);
        await cartAPI.clearCart();
      } else {
        // Clear local cart
        localStorage.removeItem(CART_STORAGE_KEY);
        localStorage.removeItem(CART_EXPIRY_KEY);
      }
      
      setItems([]);
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      showToast('Failed to clear cart', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    const productTotal = parseFloat(item.product.price) * item.quantity;
    const accessoriesTotal = (item.accessories || []).reduce((accSum: number, acc: any) => accSum + (acc.price * item.quantity), 0);
    return sum + productTotal + accessoriesTotal;
  }, 0);

  // Debug logging
  useEffect(() => {
    console.log('Cart state changed:', {
      itemCount: items.length,
      totalItems,
      totalPrice: totalPrice.toFixed(2),
      isInitialized
    });
  }, [items, totalItems, totalPrice, isInitialized]);

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
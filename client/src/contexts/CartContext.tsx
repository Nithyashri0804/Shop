import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product, CartContextType } from '../types';
import { useToast } from './ToastContext';

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

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { showToast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCart = () => {
      try {
        console.log('Loading cart from localStorage...');
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          console.log('Loaded cart from localStorage:', parsedCart);
          
          // Validate cart structure
          if (Array.isArray(parsedCart)) {
            const validItems = parsedCart.filter(item => 
              item && 
              item.productId && 
              item.product && 
              item.size && 
              typeof item.quantity === 'number' && 
              item.quantity > 0
            );
            
            setItems(validItems);
            console.log('Valid cart items loaded:', validItems);
          } else {
            console.warn('Invalid cart format in localStorage, clearing...');
            localStorage.removeItem(CART_STORAGE_KEY);
          }
        } else {
          console.log('No cart found in localStorage');
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem(CART_STORAGE_KEY);
      } finally {
        setIsInitialized(true);
      }
    };

    loadCart();
  }, []);

  // Save cart to localStorage whenever items change (but only after initialization)
  useEffect(() => {
    if (isInitialized) {
      try {
        console.log('Saving cart to localStorage:', items);
        if (items.length > 0) {
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        } else {
          localStorage.removeItem(CART_STORAGE_KEY);
        }
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [items, isInitialized]);

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

  const addItem = (product: Product, size: string, quantity: number, accessories: any[] = []) => {
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
    
    setItems(prevItems => {
      // Create a unique key for cart items including accessories
      const accessoriesKey = JSON.stringify(accessories?.sort((a, b) => a.id.localeCompare(b.id)) || []);
      const existingItemIndex = prevItems.findIndex(item => 
        item.productId === product._id && 
        item.size === size &&
        JSON.stringify((item.accessories || []).sort((a, b) => a.id.localeCompare(b.id))) === accessoriesKey
      );
      
      if (existingItemIndex !== -1) {
        const existingItem = prevItems[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;
        
        // Check if new quantity exceeds stock
        if (newQuantity > availableStock) {
          showToast(`Cannot add more items. Only ${availableStock} available in size ${size}`, 'error');
          return prevItems;
        }
        
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = { ...existingItem, quantity: newQuantity };
        console.log('Updated existing item quantity:', updatedItems[existingItemIndex]);
        return updatedItems;
      }
      
      const newItem: CartItem = { 
        productId: product._id, 
        product, 
        size, 
        quantity, 
        accessories: accessories || [] 
      };
      
      console.log('Adding new item to cart:', newItem);
      const newItems = [...prevItems, newItem];
      console.log('New cart state:', newItems);
      return newItems;
    });
  };

  const removeItem = (productId: string, size: string) => {
    console.log('Removing item from cart:', { productId, size });
    setItems(prevItems => {
      const filtered = prevItems.filter(item => !(item.productId === productId && item.size === size));
      console.log('Cart after removal:', filtered);
      return filtered;
    });
  };

  const updateQuantity = (productId: string, size: string, quantity: number) => {
    console.log('Updating quantity:', { productId, size, quantity });
    
    if (quantity <= 0) {
      removeItem(productId, size);
      return;
    }
    
    setItems(prevItems => {
      const updatedItems = prevItems.map(item =>
        item.productId === productId && item.size === size
          ? { ...item, quantity }
          : item
      );
      console.log('Cart after quantity update:', updatedItems);
      return updatedItems;
    });
  };

  const clearCart = () => {
    console.log('Clearing cart');
    setItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing cart from localStorage:', error);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    const productTotal = item.product.price * item.quantity;
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
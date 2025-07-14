import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, WishlistContextType } from '../types';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { wishlistAPI } from '../services/api';

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      // Load from localStorage for non-authenticated users
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        setItems(JSON.parse(savedWishlist));
      }
    }
  }, [user]);

  useEffect(() => {
    // Save to localStorage for non-authenticated users
    if (!user) {
      localStorage.setItem('wishlist', JSON.stringify(items));
    }
  }, [items, user]);

  const fetchWishlist = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await wishlistAPI.getWishlist();
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (product: Product) => {
    try {
      if (user) {
        await wishlistAPI.addToWishlist(product._id);
        setItems(prev => {
          const existingItem = prev.find(item => item._id === product._id);
          if (!existingItem) {
            showToast('Added to wishlist!', 'success');
            return [...prev, product];
          }
          return prev;
        });
      } else {
        // Handle local storage for non-authenticated users
        const existingItem = items.find(item => item._id === product._id);
        if (!existingItem) {
          setItems(prev => [...prev, product]);
          showToast('Added to wishlist!', 'success');
        }
      }
    } catch (error: any) {
      console.error('Wishlist add error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error adding to wishlist';
      showToast(errorMessage, 'error');
    }
  };

  const removeItem = async (productId: string) => {
    try {
      if (user) {
        await wishlistAPI.removeFromWishlist(productId);
        setItems(prev => {
          const filtered = prev.filter(item => item._id !== productId);
          showToast('Removed from wishlist', 'info');
          return filtered;
        });
      } else {
        // Handle local storage for non-authenticated users
        setItems(prev => prev.filter(item => item._id !== productId));
        showToast('Removed from wishlist', 'info');
      }
    } catch (error: any) {
      console.error('Wishlist remove error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error removing from wishlist';
      showToast(errorMessage, 'error');
    }
  };

  const toggleItem = async (product: Product) => {
    const isInWishlist = items.some(item => item._id === product._id);
    
    if (isInWishlist) {
      await removeItem(product._id);
    } else {
      await addItem(product);
    }
  };

  const clearWishlist = async () => {
    try {
      if (user) {
        await wishlistAPI.clearWishlist();
        setItems([]);
      } else {
        setItems([]);
        localStorage.removeItem('wishlist');
      }
      showToast('Wishlist cleared', 'info');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error clearing wishlist';
      showToast(errorMessage, 'error');
    }
  };

  const isInWishlist = (productId: string) => {
    return items.some(item => item._id === productId);
  };

  const moveToCart = (productId: string) => {
    // This will be handled by the component that uses this context
    // by calling cart.addItem and wishlist.removeItem
  };

  const value = {
    items,
    loading,
    addItem,
    removeItem,
    toggleItem,
    clearWishlist,
    isInWishlist,
    moveToCart,
    totalItems: items.length,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};
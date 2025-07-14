import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';

const Cart: React.FC = () => {
  const { items, updateQuantity, removeItem, totalPrice, totalItems } = useCart();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  // Wait for cart to initialize
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Give more time for cart to load
    
    return () => clearTimeout(timer);
  }, []);

  const getProductImageUrl = (product: any) => {
    // Check for media array first (new format)
    if (product.media && product.media.length > 0) {
      const media = product.media[0];
      if (typeof media === 'string') {
        if (media.startsWith('http') || media.startsWith('data:')) {
          return media;
        }
        return `http://localhost:5000/api/upload/media/${media}`;
      }
      if (media && typeof media === 'object') {
        if (media.dataUrl) return media.dataUrl;
        if (media._id) return `http://localhost:5000/api/upload/media/${media._id}`;
      }
    }
    
    // Check for images array (legacy format)
    if (product.images && product.images.length > 0) {
      const image = product.images[0];
      if (image.startsWith('http') || image.startsWith('data:')) {
        return image;
      }
      return `http://localhost:5000/api/upload/images/${image}`;
    }
    
    // Fallback to placeholder
    return 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=600';
  };

  const handleQuantityChange = (productId: string, size: string, newQuantity: number, maxStock: number) => {
    if (newQuantity <= 0) {
      if (window.confirm('Remove this item from cart?')) {
        removeItem(productId, size);
        showToast('Item removed from cart', 'info');
      }
      return;
    }
    
    if (newQuantity > maxStock) {
      showToast(`Only ${maxStock} items available`, 'error');
      return;
    }
    
    updateQuantity(productId, size, newQuantity);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="text-center">
          <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link
            to="/products"
            className="btn-primary"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {items.map((item) => (
            <div key={`${item.productId}-${item.size}`} className="card">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <img
                  src={getProductImageUrl(item.product)}
                  alt={item.product.name}
                  className="w-full sm:w-20 h-48 sm:h-20 object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.src = 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=600';
                  }}
                />
                
                <div className="flex-1 w-full sm:w-auto">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="mb-4 sm:mb-0">
                      <h3 className="font-semibold text-gray-800 text-base sm:text-lg">{item.product.name}</h3>
                      <p className="text-sm text-gray-600">{item.product.category}</p>
                      <p className="text-sm text-gray-600">Size: {item.size}</p>
                      {item.accessories && Array.isArray(item.accessories) && item.accessories.length > 0 && (
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Accessories:</span>
                          <div className="ml-2 mt-1 space-y-1">
                            {item.accessories.map((accessory, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-purple-50 rounded border border-purple-200">
                                <div className="flex items-center">
                                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                                  <span className="font-medium text-purple-700">{accessory.name}</span>
                                </div>
                                <span className="text-purple-600 font-medium">
                                  {accessory.price === 0 ? (
                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">Free</span>
                                  ) : (
                                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">+${accessory.price}</span>
                                  )}
                                </span>
                              </div>
                            ))}
                            <div className="text-xs text-purple-600 font-medium mt-1 pl-4">
                              Accessories Total: +${(item.accessories || []).reduce((sum: number, acc: any) => sum + acc.price, 0).toFixed(2)} per item
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="mt-2">
                        <p className="text-lg font-bold text-purple-600">
                          ${(item.product.price + (item.accessories || []).reduce((sum: number, acc: any) => sum + acc.price, 0)).toFixed(2)}
                        </p>
                        {item.accessories && item.accessories.some((acc: any) => acc.price > 0) && (
                          <p className="text-sm text-gray-500">
                            Base: ${item.product.price} + Accessories: ${(item.accessories || []).reduce((sum: number, acc: any) => sum + acc.price, 0).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:flex-col sm:items-end space-y-0 sm:space-y-3">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => {
                            const maxStock = item.product.stock?.[item.size] || 0;
                            handleQuantityChange(item.productId, item.size, item.quantity - 1, maxStock);
                          }}
                          className="p-3 hover:bg-gray-100 transition-colors touch-manipulation"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-4 py-3 font-medium">{item.quantity}</span>
                        <button
                          onClick={() => {
                            const maxStock = item.product.stock?.[item.size] || 0;
                            handleQuantityChange(item.productId, item.size, item.quantity + 1, maxStock);
                          }}
                          className="p-3 hover:bg-gray-100 transition-colors touch-manipulation"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-3 sm:space-x-0 sm:flex-col sm:items-end">
                        <div className="text-xs text-gray-500 sm:mb-2">
                          Stock: {item.product.stock?.[item.size] || 0}
                        </div>
                        
                        <button
                          onClick={() => removeItem(item.productId, item.size)}
                          className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors touch-manipulation"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Order Summary */}
        <div className="card h-fit">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
          
          <div className="space-y-3 mb-4 sm:mb-6">
            <div className="flex justify-between">
              <span>Items ({totalItems})</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <Link
            to="/checkout"
            className="btn-primary w-full text-center block mb-3"
          >
            Proceed to Checkout
          </Link>
          
          <Link
            to="/products"
            className="btn-secondary w-full text-center block"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
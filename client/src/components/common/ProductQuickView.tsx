import React, { useState } from 'react';
import { X, ShoppingCart, Heart, Star, Minus, Plus } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import MediaGallery from './MediaGallery';

interface ProductQuickViewProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

const ProductQuickView: React.FC<ProductQuickViewProps> = ({ product, isOpen, onClose }) => {
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const { addItem } = useCart();
  const { toggleItem: toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const { showToast } = useToast();

  React.useEffect(() => {
    if (product?.sizes?.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
    setSelectedAccessories([]);
  }, [product]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      showToast('Please select a size before adding to cart', 'error');
      return;
    }
    
    if (!product.sizes || product.sizes.length === 0) {
      showToast('This product has no available sizes', 'error');
      return;
    }
    
    const stock = product.stock?.[selectedSize] || 0;
    if (stock < quantity) {
      showToast(`Only ${stock} items available in size ${selectedSize}`, 'error');
      return;
    }

    // Get selected accessories
    const accessories = selectedAccessories.map(accessoryId => 
      product.accessories?.find((acc: any) => acc.id === accessoryId)
    ).filter(Boolean);

    addItem(product, selectedSize, quantity, accessories);
    showToast(`Added ${quantity} ${product.name} (${selectedSize}) to cart!`, 'success');
    onClose();
  };

  const handleToggleWishlist = () => {
    if (!user) {
      showToast('Please login to add items to wishlist', 'warning');
      return;
    }
    toggleWishlist(product);
  };

  if (!isOpen || !product) return null;

  const discount = product.originalPrice && product.originalPrice > product.price 
    ? Math.round((1 - product.price / product.originalPrice) * 100) 
    : 0;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      tabIndex={-1}
    >
      <div 
        className="bg-white rounded-xl sm:rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-top-2"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Product quick view"
      >
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Quick View</h2>
            <button
              onClick={onClose}
              className="p-3 hover:bg-gray-100 rounded-full transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close quick view"
            >
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Media Gallery */}
            <div>
              <MediaGallery 
                media={product.media || product.images || []} 
                productName={product.name}
              />
            </div>

            {/* Product Info */}
            <div className="space-y-4 sm:space-y-6">
              <div>
                <div className="text-sm text-purple-600 font-medium mb-2">{product.category}</div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">{product.name}</h1>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={`${
                          i < Math.floor(product.rating) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {product.rating} ({product.reviews?.length || 0} reviews)
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 mb-6">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900">${product.price}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="text-lg sm:text-xl text-gray-500 line-through">${product.originalPrice}</span>
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                        {discount}% OFF
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="prose prose-sm prose-gray text-sm sm:text-base">
                <p>{product.description}</p>
              </div>

              {/* Size Selection */}
              {product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0 && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-3">Size *</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {product.sizes.map((size: string) => {
                      const stock = product.stock?.[size] || 0;
                      const isAvailable = stock > 0;
                      
                      return (
                        <button
                          key={size}
                          onClick={() => isAvailable && setSelectedSize(size)}
                          disabled={!isAvailable}
                          className={`py-3 px-3 border rounded-lg font-medium transition-colors text-sm touch-manipulation ${
                            selectedSize === size
                              ? 'border-purple-600 bg-purple-50 text-purple-600 ring-2 ring-purple-200'
                              : isAvailable
                              ? 'border-gray-300 hover:border-gray-400'
                              : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {size}
                          {!isAvailable && <div className="text-xs">Out</div>}
                        </button>
                      );
                    })}
                  </div>
                  {!selectedSize && (
                    <p className="text-sm text-red-600 mt-2">* Please select a size</p>
                  )}
                </div>
              )}

              {/* Quantity */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3">Quantity</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-gray-100 transition-colors touch-manipulation"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 py-3 font-medium">{quantity}</span>
                    <button
                      onClick={() => {
                        const maxStock = product.stock?.[selectedSize] || 0;
                        setQuantity(Math.min(maxStock, quantity + 1));
                      }}
                      className="p-3 hover:bg-gray-100 transition-colors touch-manipulation"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  {selectedSize && (
                    <span className="text-sm text-gray-600">
                      {product.stock?.[selectedSize] || 0} available
                    </span>
                  )}
                </div>
              </div>

              {/* Accessories Selection */}
              {product.accessories && Array.isArray(product.accessories) && product.accessories.length > 0 && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-3">
                    Available Accessories
                    <span className="text-sm text-gray-500 font-normal ml-2">
                      ({selectedAccessories.length} selected)
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {product.accessories.map((accessory: any) => (
                      <label key={accessory.id} className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedAccessories.includes(accessory.id)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedAccessories.includes(accessory.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAccessories([...selectedAccessories, accessory.id]);
                              } else {
                                setSelectedAccessories(selectedAccessories.filter(id => id !== accessory.id));
                              }
                            }}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mr-3"
                          />
                          <div>
                            <div className="font-medium text-sm">{accessory.name}</div>
                            <div className="text-xs text-gray-600">
                              {accessory.price === 0 ? (
                                <span className="text-green-600 font-medium">Free</span>
                              ) : (
                                <span className="text-purple-600 font-medium">+${accessory.price}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {accessory.price === 0 ? (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                              Free
                            </span>
                          ) : (
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                              +${accessory.price}
                            </span>
                          )}
                          {selectedAccessories.includes(accessory.id) && (
                            <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                              ✓
                            </span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                  
                  {/* Quick Summary */}
                  {selectedAccessories.length > 0 && (
                    <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="text-sm font-medium text-purple-800">
                        {selectedAccessories.length} accessory/accessories selected
                      </div>
                      <div className="text-sm text-purple-700">
                        Additional cost: +${selectedAccessories.reduce((sum, accessoryId) => {
                          const accessory = product.accessories.find((acc: any) => acc.id === accessoryId);
                          return sum + (accessory ? accessory.price : 0);
                        }, 0).toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 sm:space-y-4">
                <button
                  onClick={handleAddToCart}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  <ShoppingCart size={20} />
                  <span>Add to Cart</span>
                </button>
                
                <button
                  onClick={handleToggleWishlist}
                  className={`w-full py-3 px-6 rounded-lg font-semibold border-2 transition-all duration-200 flex items-center justify-center space-x-2 touch-manipulation ${
                    isInWishlist(product._id)
                      ? 'border-red-500 bg-red-50 text-red-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Heart size={20} className={isInWishlist(product._id) ? 'fill-current' : ''} />
                  <span>{isInWishlist(product._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductQuickView;
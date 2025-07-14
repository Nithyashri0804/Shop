import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, Star, Grid, List, Package } from 'lucide-react';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Wishlist: React.FC = () => {
  const { items, loading, removeItem, clearWishlist, totalItems } = useWishlist();
  const { addItem: addToCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

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

  const handleMoveToCart = (product: any) => {
    // For move to cart, use the first available size
    const availableSize = product.sizes?.find((size: string) => {
      const stock = product.stock?.[size] || 0;
      return stock > 0;
    });
    
    if (!availableSize) {
      showToast('This product is out of stock', 'error');
      return;
    }
    
    addToCart(product, availableSize, 1);
    removeItem(product._id);
    showToast(`Moved ${product.name} to cart!`, 'success');
  };

  const handleSelectItem = (productId: string) => {
    setSelectedItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item._id));
    }
  };

  const handleRemoveSelected = async () => {
    if (selectedItems.length === 0) return;
    
    if (window.confirm(`Remove ${selectedItems.length} items from wishlist?`)) {
      for (const productId of selectedItems) {
        await removeItem(productId);
      }
      setSelectedItems([]);
    }
  };

  const handleMoveSelectedToCart = () => {
    if (selectedItems.length === 0) return;
    
    selectedItems.forEach(productId => {
      const product = items.find(item => item._id === productId);
      if (product) {
        handleMoveToCart(product);
      }
    });
    setSelectedItems([]);
  };

  const ProductCard = ({ product }: { product: any }) => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300">
      <div className="relative overflow-hidden">
        <input
          type="checkbox"
          checked={selectedItems.includes(product._id)}
          onChange={() => handleSelectItem(product._id)}
          className="absolute top-3 left-3 z-10 w-4 h-4 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500"
        />
        
        <img
          src={getProductImageUrl(product)}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.src = 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=600';
          }}
        />
        
        <div className="absolute top-3 right-3">
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
          <button 
            onClick={() => handleMoveToCart(product)}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
          >
            <ShoppingCart size={16} />
            <span>Move to Cart</span>
          </button>
          <button 
            onClick={() => removeItem(product._id)}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Trash2 size={16} />
            <span>Remove</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="text-sm text-gray-500 mb-1">{product.category}</div>
        <Link to={`/product/${product._id}`} className="block">
          <h3 className="font-semibold text-gray-800 hover:text-purple-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center mt-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={`${
                  i < Math.floor(product.rating) 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="text-sm text-gray-600 ml-2">({product.reviews?.length || 0})</span>
          </div>
        </div>
        
        {/* Add accessories display */}
        {product.accessories && product.accessories.length > 0 && (
          <div className="mt-2">
            <div className="text-sm text-gray-500 font-medium mb-1">Available Accessories:</div>
            <div className="flex flex-wrap gap-1">
              {product.accessories.slice(0, 3).map((accessory: any, index: number) => (
                <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full border border-purple-200">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-1"></span>
                  {accessory.name}
                  <span className="ml-1 font-medium">
                    {accessory.price === 0 ? '(Free)' : `(+$${accessory.price})`}
                  </span>
                </span>
              ))}
              {product.accessories.length > 3 && (
                <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded-full">
                  +{product.accessories.length - 3} more
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Select accessories during purchase
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-800">${product.price}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => handleMoveToCart(product)}
              className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
              title="Move to Cart"
            >
              <ShoppingCart size={16} />
            </button>
            <button 
              onClick={() => removeItem(product._id)}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove from Wishlist"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ProductListItem = ({ product }: { product: any }) => (
    <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-6">
      <input
        type="checkbox"
        checked={selectedItems.includes(product._id)}
        onChange={() => handleSelectItem(product._id)}
        className="w-4 h-4 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500"
      />
      
      <div className="flex-shrink-0">
        <img
          src={getProductImageUrl(product)}
          alt={product.name}
          className="w-24 h-24 object-cover rounded-lg"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.src = 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=600';
          }}
        />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">{product.category}</div>
            <Link to={`/product/${product._id}`} className="block">
              <h3 className="text-lg font-semibold text-gray-800 hover:text-purple-600 transition-colors">
                {product.name}
              </h3>
            </Link>
            <div className="flex items-center mt-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={`${
                      i < Math.floor(product.rating) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 ml-2">({product.reviews?.length || 0})</span>
            </div>
            
            {/* Add accessories display in list view */}
            {product.accessories && product.accessories.length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-gray-500 font-medium mb-1">Available Accessories:</div>
                <div className="flex flex-wrap gap-1">
                  {product.accessories.slice(0, 2).map((accessory: any, index: number) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-1"></span>
                      {accessory.name}
                      {accessory.price === 0 ? ' (Free)' : ` (+$${accessory.price})`}
                    </span>
                  ))}
                  {product.accessories.length > 2 && (
                    <span className="text-xs text-purple-600 font-medium">
                      +{product.accessories.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-800">${product.price}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
              )}
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <button 
                onClick={() => handleMoveToCart(product)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <ShoppingCart size={16} />
                <span>Move to Cart</span>
              </button>
              <button 
                onClick={() => removeItem(product._id)}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <Heart size={64} className="mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Your wishlist is empty</h1>
          <p className="text-gray-600 mb-8">Save items you love to your wishlist and shop them later.</p>
          <Link
            to="/products"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Wishlist</h1>
          <p className="text-gray-600 mt-2">{totalItems} item{totalItems !== 1 ? 's' : ''} saved</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedItems.length === items.length && items.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="ml-2 text-sm font-medium">
                Select All ({selectedItems.length} selected)
              </span>
            </label>
          </div>
          
          {selectedItems.length > 0 && (
            <div className="flex items-center space-x-3">
              <button
                onClick={handleMoveSelectedToCart}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <ShoppingCart size={16} />
                <span>Move to Cart ({selectedItems.length})</span>
              </button>
              <button
                onClick={handleRemoveSelected}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Trash2 size={16} />
                <span>Remove ({selectedItems.length})</span>
              </button>
            </div>
          )}
          
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
                clearWishlist();
                setSelectedItems([]);
              }
            }}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Products */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(product => (
            <ProductListItem key={product._id} product={product} />
          ))}
        </div>
      )}

      {/* Continue Shopping */}
      <div className="text-center mt-12">
        <Link
          to="/products"
          className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default Wishlist;
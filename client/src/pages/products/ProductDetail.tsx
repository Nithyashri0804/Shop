import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Minus, Plus, Truck, Shield, RotateCcw } from 'lucide-react';
import { productsAPI } from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useWishlist } from '../../contexts/WishlistContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MediaGallery from '../../components/common/MediaGallery';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { toggleItem: toggleWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getProduct(id!);
      console.log('=== FRONTEND PRODUCT DEBUG ===');
      console.log('Full product data:', response.data);
      console.log('Product accessories:', response.data.accessories);
      console.log('Accessories type:', typeof response.data.accessories);
      console.log('Accessories is array:', Array.isArray(response.data.accessories));
      console.log('Accessories length:', response.data.accessories?.length);
      console.log('=== END FRONTEND DEBUG ===');
      setProduct(response.data);
      
      if (response.data.sizes?.length > 0) {
        setSelectedSize(response.data.sizes[0]);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    // Check if product has sizes and none is selected
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      showToast('Please select a size before adding to cart', 'error');
      return;
    }
    
    // If no sizes available, show error
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
  };

  const handleToggleWishlist = () => {
    if (!user) {
      showToast('Please login to add items to wishlist', 'warning');
      return;
    }
    toggleWishlist(product);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please login to submit a review', 'warning');
      return;
    }

    try {
      await productsAPI.addReview(product._id, reviewData.rating, reviewData.comment);
      setShowReviewForm(false);
      setReviewData({ rating: 5, comment: '' });
      fetchProduct(); // Refresh to show new review
      showToast('Review submitted successfully!', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error submitting review', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Product not found</h1>
      </div>
    );
  }

  const discount = product.originalPrice && product.originalPrice > product.price 
    ? Math.round((1 - product.price / product.originalPrice) * 100) 
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Media */}
        <MediaGallery 
          media={product.media || product.images || []} 
          productName={product.name}
        />

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="text-sm text-purple-600 font-medium mb-2">{product.category}</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
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
              <span className="text-3xl font-bold text-gray-900">${product.price}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-xl text-gray-500 line-through">${product.originalPrice}</span>
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="prose prose-gray">
            <p>{product.description}</p>
          </div>

          {/* Size Selection */}
          {product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Size <span className="text-red-600">*</span> 
                <span className="text-sm text-gray-500 font-normal">(Required)</span>
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {product.sizes.map((size: string) => {
                  const stock = product.stock?.[size] || 0;
                  const isAvailable = stock > 0;
                  
                  return (
                    <button
                      key={size}
                      onClick={() => isAvailable && setSelectedSize(size)}
                      disabled={!isAvailable}
                      className={`py-3 px-4 border rounded-lg font-medium transition-colors ${
                        selectedSize === size
                          ? 'border-purple-600 bg-purple-50 text-purple-600 ring-2 ring-purple-200'
                          : isAvailable
                          ? 'border-gray-300 hover:border-gray-400'
                          : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {size}
                      {!isAvailable && <div className="text-xs">Out of Stock</div>}
                    </button>
                  );
                })}
              </div>
              {!selectedSize && (
                <p className="text-sm text-red-600 mt-2 font-medium">* Please select a size before adding to cart</p>
              )}
            </div>
          )}

          {/* Quantity */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Quantity</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button
                  onClick={() => {
                    const maxStock = product.stock?.[selectedSize] || 0;
                    setQuantity(Math.min(maxStock, quantity + 1));
                  }}
                  className="p-2 hover:bg-gray-100 transition-colors"
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
              <h3 className="text-lg font-semibold mb-3">
                Available Accessories 
                <span className="text-sm text-gray-500 font-normal ml-2">
                  ({selectedAccessories.length} selected)
                </span>
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Enhance your purchase with these optional accessories:
              </p>
              <div className="space-y-3">
                {product.accessories.map((accessory: any) => (
                  <label key={accessory.id} className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedAccessories.includes(accessory.id)
                      ? 'border-purple-500 bg-purple-50 shadow-md'
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
                        className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mr-4"
                      />
                      <div>
                        <div className="font-medium text-base">{accessory.name}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {accessory.price === 0 ? (
                            <span className="text-green-600 font-medium">Free</span>
                          ) : (
                            <span className="text-purple-600 font-medium">+${accessory.price}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {accessory.price === 0 ? (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          Free
                        </span>
                      ) : (
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                          +${accessory.price}
                        </span>
                      )}
                      {selectedAccessories.includes(accessory.id) && (
                        <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                          ✓ Added
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
              
              {/* Accessories Summary */}
              {selectedAccessories.length > 0 && (
                <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">Selected Accessories:</h4>
                  <div className="space-y-1">
                    {selectedAccessories.map(accessoryId => {
                      const accessory = product.accessories.find((acc: any) => acc.id === accessoryId);
                      return accessory ? (
                        <div key={accessoryId} className="flex justify-between text-sm">
                          <span className="text-purple-700">{accessory.name}</span>
                          <span className="font-medium text-purple-800">
                            {accessory.price === 0 ? 'Free' : `+$${accessory.price}`}
                          </span>
                        </div>
                      ) : null;
                    })}
                  </div>
                  <div className="border-t border-purple-200 mt-2 pt-2">
                    <div className="flex justify-between font-medium text-purple-800">
                      <span>Total Accessories:</span>
                      <span>
                        +${selectedAccessories.reduce((sum, accessoryId) => {
                          const accessory = product.accessories.find((acc: any) => acc.id === accessoryId);
                          return sum + (accessory ? accessory.price : 0);
                        }, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Show message if no accessories */}
          {(!product.accessories || !Array.isArray(product.accessories) || product.accessories.length === 0) ? (
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Accessories</h3>
              <p className="text-gray-600 text-center">
                No accessories available for this product.
              </p>
            </div>
          ) : null}

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleAddToCart}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <ShoppingCart size={20} />
              <span>Add to Cart</span>
            </button>
            
            <button
              onClick={handleToggleWishlist}
              className={`w-full py-4 px-6 rounded-lg font-semibold border-2 transition-all duration-200 flex items-center justify-center space-x-2 ${
                isInWishlist(product._id)
                  ? 'border-red-500 bg-red-50 text-red-600'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Heart size={20} className={isInWishlist(product._id) ? 'fill-current' : ''} />
              <span>{isInWishlist(product._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
            </button>
          </div>

          {/* Product Features */}
          <div className="border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <Truck className="text-purple-600" size={24} />
                <div>
                  <div className="font-medium">Free Shipping</div>
                  <div className="text-sm text-gray-600">On orders over $100</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <RotateCcw className="text-purple-600" size={24} />
                <div>
                  <div className="font-medium">Easy Returns</div>
                  <div className="text-sm text-gray-600">30-day return policy</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="text-purple-600" size={24} />
                <div>
                  <div className="font-medium">Secure Payment</div>
                  <div className="text-sm text-gray-600">100% secure checkout</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
          {user && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Write a Review
            </button>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <form onSubmit={handleSubmitReview} className="bg-gray-50 p-6 rounded-lg mb-8">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setReviewData({ ...reviewData, rating })}
                    className="text-2xl"
                  >
                    <Star
                      className={`${
                        rating <= reviewData.rating
                          ? 'text-yellow-400 fill-current': 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
              <textarea
                value={reviewData.comment}
                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                rows={4}
                placeholder="Share your experience with this product..."
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Submit Review
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Reviews List */}
        <div className="space-y-6">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((review: any, index: number) => (
              <div key={index} className="border-b border-gray-200 pb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{review.user?.name || 'Anonymous'}</div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={`${
                              i < review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review this product!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
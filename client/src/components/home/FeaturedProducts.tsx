import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { productsAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const FeaturedProducts: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await productsAPI.getProducts({ featured: true, limit: 4 });
      setFeaturedProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Featured Products
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of the most popular and trending items
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="relative overflow-hidden">
                  <img
                    src={getProductImageUrl(product)}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.src = 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=600';
                    }}
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 space-y-2">
                    {product.featured && (
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Featured
                      </span>
                    )}
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Sale
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors mb-2">
                      <Heart size={16} className="text-gray-600" />
                    </button>
                  </div>

                  {/* Quick Add Button */}
                  <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2">
                      <ShoppingCart size={16} />
                      <span>Quick Add</span>
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
                    </div>
                    <span className="text-sm text-gray-600 ml-2">({product.reviews?.length || 0})</span>
                  </div>

                  {/* Add accessories display */}
                  {product.accessories && Array.isArray(product.accessories) && product.accessories.length > 0 && (
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-800">${product.price}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                      )}
                    </div>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-green-600 font-medium">
                        {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            to="/products"
            className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
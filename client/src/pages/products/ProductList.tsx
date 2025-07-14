import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Filter, Grid, List, Package, X } from 'lucide-react';
import { productsAPI, categoriesAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useWishlist } from '../../contexts/WishlistContext';
import ProductQuickView from '../../components/common/ProductQuickView';

const ProductList: React.FC = () => {
  const { gender, category } = useParams();
  const [searchParams] = useSearchParams();
  const { addItem } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { toggleItem: toggleWishlist, isInWishlist } = useWishlist();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  
  const [filters, setFilters] = useState({
    category: category || '',
    gender: gender || '',
    priceRange: '',
    size: '',
    color: '',
    sortBy: 'newest',
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [filters, currentPage]);

  useEffect(() => {
    // Update filters when URL params change
    setFilters(prev => ({
      ...prev,
      category: category || '',
      gender: gender || '',
    }));
  }, [gender, category]);

  // Close filters on outside click (mobile)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters]);

  // Handle ESC key to close filters
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowFilters(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, []);

  // Prevent body scroll when filters are open on mobile
  useEffect(() => {
    if (showFilters) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showFilters]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const searchQuery = searchParams.get('q');
      const params = {
        page: currentPage,
        limit: 12,
        category: filters.category && filters.category !== 'All' ? filters.category : '',
        gender: filters.gender && filters.gender !== 'All' ? filters.gender : '',
        size: filters.size && filters.size !== 'All' ? filters.size : '',
        color: filters.color && filters.color !== 'All' ? filters.color : '',
        sortBy: filters.sortBy,
        search: searchQuery || '',
      };

      const response = await productsAPI.getProducts(params);
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const availableCategories = ['All', ...categories.filter(cat => cat.isActive).map(cat => cat.name)];
  const genderOptions = ['All', 'women', 'men', 'unisex'];
  const priceRanges = ['All', '$0-$50', '$50-$100', '$100-$200', '$200+'];
  const sizes = ['All', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = ['All', 'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Pink', 'Gray', 'Brown'];
  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
  ];

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

  const handleQuickAddToCart = (product: any) => {
    // For quick add, use the first available size
    const availableSize = product.sizes?.find((size: string) => {
      const stock = product.stock?.[size] || 0;
      return stock > 0;
    });
    
    if (!availableSize) {
      showToast('This product is out of stock', 'error');
      return;
    }
    
    addItem(product, availableSize, 1);
    showToast(`Added ${product.name} (${availableSize}) to cart!`, 'success');
  };

  const handleToggleWishlist = (productId: string) => {
    const product = products.find(p => p._id === productId);
    if (!product) return;
    
    if (!user) {
      showToast('Please login to add items to wishlist', 'warning');
      return;
    }
    
    toggleWishlist(product);
  };

  const ProductCard = ({ product }: { product: any }) => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300">
      <div className="relative overflow-hidden">
        <img
          src={getProductImageUrl(product)}
          alt={product.name}
          className="w-full h-48 sm:h-56 md:h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.src = 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=600';
          }}
        />
        
        <div className="absolute top-3 left-3">
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={() => handleToggleWishlist(product._id)}
            className={`p-2 rounded-full shadow-md transition-colors ${
              isInWishlist(product._id)
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
            aria-label={isInWishlist(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={16} className={isInWishlist(product._id) ? 'fill-current' : ''} />
          </button>
        </div>

        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="space-y-2">
            <button 
              onClick={() => setQuickViewProduct(product)}
              className="w-full bg-white text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2 font-medium text-sm"
            >
              <span>Quick View</span>
            </button>
            <button 
              onClick={() => handleQuickAddToCart(product)}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 text-sm"
            >
              <ShoppingCart size={16} />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="text-sm text-gray-500 mb-1">{product.category}</div>
        <Link to={`/product/${product._id}`} className="block">
          <h3 className="font-semibold text-gray-800 hover:text-purple-600 transition-colors line-clamp-2">
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
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg sm:text-xl font-bold text-gray-800">${product.price}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
            )}
          </div>
          {product.accessories && product.accessories.length > 0 && (
            <div className="text-xs text-purple-600 font-medium">
              +{product.accessories.length} accessories
            </div>
          )}
        </div>
        
        {/* Add accessories preview */}
        {product.accessories && Array.isArray(product.accessories) && product.accessories.length > 0 ? (
          <div className="mt-3">
            <div className="text-xs text-gray-500 font-medium mb-1">Available Accessories:</div>
            <div className="flex flex-wrap gap-1">
              {product.accessories.slice(0, 2).map((accessory: any, index: number) => (
                <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full border border-purple-200">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-1"></span>
                  {accessory.name}
                  {accessory.price === 0 ? ' (Free)' : ` (+$${accessory.price})`}
                </span>
              ))}
              {product.accessories.length > 2 && (
                <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded-full">
                  +{product.accessories.length - 2} more
                </span>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );

  const ProductListItem = ({ product }: { product: any }) => (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
      <div className="flex-shrink-0 w-full sm:w-auto">
        <img
          src={getProductImageUrl(product)}
          alt={product.name}
          className="w-full sm:w-24 h-48 sm:h-24 object-cover rounded-lg"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.src = 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=600';
          }}
        />
      </div>
      
      <div className="flex-1 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex-1">
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
              <div className="mt-2">
                <div className="text-xs text-gray-500 font-medium mb-1">Available Accessories:</div>
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
          </div>
          
          <div className="flex flex-col sm:text-right space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-800">${product.price}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setQuickViewProduct(product)}
                className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2 text-sm"
              >
                <span>Quick View</span>
              </button>
              <button 
                onClick={() => handleToggleWishlist(product._id)}
                className={`p-2 transition-colors rounded-lg ${
                  isInWishlist(product._id)
                    ? 'text-red-600 hover:text-red-700 bg-red-50'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
                aria-label={isInWishlist(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={16} className={isInWishlist(product._id) ? 'fill-current' : ''} />
              </button>
              <button 
                onClick={() => handleQuickAddToCart(product)}
                className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 text-sm"
              >
                <ShoppingCart size={16} />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {loading && (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="large" />
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar Overlay for Mobile */}
        {showFilters && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setShowFilters(false)} />
        )}

        {/* Filters Sidebar */}
        <div 
          ref={filtersRef}
          className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:relative lg:inset-auto lg:w-1/4 lg:transform-none lg:shadow-none lg:z-auto ${
            showFilters ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Product filters"
        >
          <div className="h-full overflow-y-auto">
            <div className="bg-white lg:rounded-lg lg:shadow-md p-4 sm:p-6 sticky top-0 border-b lg:border-b-0">
              <div className="flex items-center justify-between mb-4 lg:justify-start">
                <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Close filters"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                    className="form-input"
                  >
                    {availableCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    value={filters.gender}
                    onChange={(e) => setFilters({...filters, gender: e.target.value})}
                    className="form-input"
                  >
                    {genderOptions.map(gender => (
                      <option key={gender} value={gender}>{gender === 'All' ? 'All Genders' : gender.charAt(0).toUpperCase() + gender.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                    className="form-input"
                  >
                    {priceRanges.map(range => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                  <select
                    value={filters.size}
                    onChange={(e) => setFilters({...filters, size: e.target.value})}
                    className="form-input"
                  >
                    {sizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <select
                    value={filters.color}
                    onChange={(e) => setFilters({...filters, color: e.target.value})}
                    className="form-input"
                  >
                    {colors.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 sm:mt-6">
                <button
                  onClick={() => {
                    setFilters({
                      category: '',
                      gender: '',
                      priceRange: '',
                      size: '',
                      color: '',
                      sortBy: 'newest',
                    });
                    setCurrentPage(1);
                  }}
                  className="btn-secondary w-full"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                {gender && gender !== 'all' ? `${gender.charAt(0).toUpperCase() + gender.slice(1)}'s ` : ''}
                {category && category !== 'all' ? category : 'All Products'}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">Showing {products.length} products</p>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center space-x-2 px-3 sm:px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base touch-manipulation"
              >
                <Filter size={16} />
                <span>Filters</span>
              </button>
              
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                className="px-3 py-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm sm:text-base"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              
              <div className="hidden sm:flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                  aria-label="List view"
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid/List */}
          {!loading && (
            <>
              {viewMode === 'grid' ? (
                <div className="responsive-grid">
                  {products.map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {products.map(product => (
                    <ProductListItem key={product._id} product={product} />
                  ))}
                </div>
              )}

              {products.length === 0 && !loading && (
                <div className="text-center py-12 sm:py-16">
                  <Package size={64} className="mx-auto text-gray-400 mb-4" />
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">No products found</h2>
                  <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">Try adjusting your filters or search terms.</p>
                  <button
                    onClick={() => {
                      setFilters({
                        category: '',
                        gender: '',
                        priceRange: '',
                        size: '',
                        color: '',
                        sortBy: 'newest',
                      });
                      setCurrentPage(1);
                    }}
                    className="btn-primary"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-center mt-8 sm:mt-12">
              <nav className="flex items-center space-x-1 sm:space-x-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 font-medium text-sm sm:text-base touch-manipulation"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors font-medium text-sm sm:text-base touch-manipulation ${
                        page === currentPage 
                          ? 'bg-purple-600 text-white' 
                          : 'border border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 font-medium text-sm sm:text-base touch-manipulation"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
      
      {/* Quick View Modal */}
      <ProductQuickView
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};

export default ProductList;
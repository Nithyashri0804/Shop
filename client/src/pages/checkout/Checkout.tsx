import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, MapPin, Phone, User } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { ordersAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [shippingCost, setShippingCost] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    paymentMethod: 'cod' as 'cod' | 'qr'
  });

  // Delivery zones with different rates
  const deliveryZones = [
    { name: 'Local (Same City)', rate: 5, keywords: ['mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'hyderabad'] },
    { name: 'Metro Cities', rate: 15, keywords: ['pune', 'ahmedabad', 'surat', 'jaipur', 'lucknow', 'kanpur'] },
    { name: 'Tier 2 Cities', rate: 25, keywords: ['nagpur', 'indore', 'thane', 'bhopal', 'visakhapatnam', 'pimpri'] },
    { name: 'Remote Areas', rate: 50, keywords: [] } // Default for unmatched cities
  ];

  useEffect(() => {
    // Initialize form data with user info if available
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || '',
        phone: user.phone || ''
      }));
    }
    
    // Check if user is logged in and has items in cart
    const timer = setTimeout(() => {
      if (!user) {
        showToast('Please login to proceed with checkout', 'warning');
        navigate('/login');
        return;
      }
      
      if (!items || items.length === 0) {
        showToast('Your cart is empty', 'warning');
        navigate('/cart');
        return;
      }
      
      setPageLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [user, items, navigate, showToast]);

  useEffect(() => {
    if (!pageLoading) {
      calculateShippingCost();
    }
  }, [formData.city, formData.state, totalPrice, pageLoading]);

  const calculateShippingCost = () => {
    try {
      const city = formData.city.toLowerCase();
      const state = formData.state.toLowerCase();
      
      // Free shipping for orders over $100
      if (totalPrice >= 100) {
        setShippingCost(0);
        return;
      }

      // Find matching delivery zone
      for (const zone of deliveryZones) {
        if (zone.keywords.some(keyword => city.includes(keyword) || state.includes(keyword))) {
          setShippingCost(zone.rate);
          return;
        }
      }
      
      // Default to remote area rate
      setShippingCost(deliveryZones[deliveryZones.length - 1].rate);
    } catch (error) {
      console.error('Error calculating shipping cost:', error);
      setShippingCost(25); // Default shipping cost
    }
  };

  const getProductImageUrl = (product: any) => {
    try {
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
    } catch (error) {
      console.error('Error getting product image URL:', error);
      return 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=600';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const requiredFields = ['fullName', 'phone', 'street', 'city', 'state', 'zipCode'];
    
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]?.trim()) {
        showToast(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`, 'error');
        return false;
      }
    }
    
    // Validate phone number
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      showToast('Please enter a valid phone number', 'error');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Additional validation for cart items
    if (!items || items.length === 0) {
      showToast('Your cart is empty', 'error');
      navigate('/cart');
      return;
    }
    
    // Navigate to payment page with order data
    const orderData = {
      items: items.map(item => ({
        productId: item.productId,
        size: item.size,
        quantity: item.quantity,
        accessories: item.accessories || [],
        price: item.product.price
      })),
      shippingAddress: {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        street: formData.street.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        zipCode: formData.zipCode.trim(),
        country: formData.country
      },
      shippingCost: shippingCost
    };

    navigate('/payment', {
      state: {
        orderData,
        totalAmount: finalTotal
      }
    });
  };

  // Show loading state while checking auth/cart
  if (pageLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <LoadingSpinner size="large" />
            <p className="text-gray-600 mt-4">Loading checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  // This should not render if redirects are working properly
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please Login</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to proceed with checkout.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Cart is Empty</h1>
          <p className="text-gray-600 mb-6">Add some items to your cart before proceeding to checkout.</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const finalTotal = totalPrice + shippingCost;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Truck className="text-purple-600" size={24} />
                <h2 className="text-xl font-bold text-gray-800">Shipping Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User size={16} className="inline mr-1" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone size={16} className="inline mr-1" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin size={16} className="inline mr-1" />
                  Street Address *
                </label>
                <input
                  type="text"
                  name="street"
                  required
                  value={formData.street}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="House number, street name, area"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="Enter city"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="Enter state"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    required
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="Enter ZIP code"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="India">India</option>
                  <option value="USA">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="Canada">Canada</option>
                </select>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard className="text-purple-600" size={24} />
                <h2 className="text-xl font-bold text-gray-800">Payment Method</h2>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleInputChange}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Cash on Delivery</div>
                    <div className="text-sm text-gray-600">Pay when your order arrives</div>
                  </div>
                </label>
                
                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="qr"
                    checked={formData.paymentMethod === 'qr'}
                    onChange={handleInputChange}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">UPI/QR Code</div>
                    <div className="text-sm text-gray-600">Pay using UPI apps or scan QR code</div>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>Proceed to Payment</span>
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          {/* Items Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="flex items-center space-x-3">
                  <img
                    src={getProductImageUrl(item.product)}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.src = 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=600';
                    }}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product.name}</h4>
                    <p className="text-sm text-gray-600">Size: {item.size}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    {item.accessories && item.accessories.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        <span className="font-medium">Accessories:</span>
                        {item.accessories.map((accessory, index) => (
                          <div key={index} className="ml-2">
                            • {accessory.name} {accessory.price === 0 ? '(Free)' : `(+$${accessory.price})`}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="font-medium">
                    ${((item.product.price + (item.accessories || []).reduce((sum: number, acc: any) => sum + acc.price, 0)) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {shippingCost === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    `$${shippingCost.toFixed(2)}`
                  )}
                </span>
              </div>
              {totalPrice >= 100 && shippingCost === 0 && (
                <div className="text-sm text-green-600">
                  🎉 Free shipping on orders over $100!
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Delivery Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Truck className="text-purple-600" size={16} />
                <span>Estimated delivery: 3-7 business days</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium mb-2">Delivery Zones & Rates:</h4>
                <ul className="space-y-1 text-xs">
                  {deliveryZones.slice(0, -1).map((zone, index) => (
                    <li key={index}>
                      <span className="font-medium">{zone.name}:</span> ${zone.rate}
                    </li>
                  ))}
                  <li className="text-green-600 font-medium">
                    Free shipping on orders over $100
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
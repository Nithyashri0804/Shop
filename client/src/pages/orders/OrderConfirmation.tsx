import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { CheckCircle, Package, Truck, MapPin, CreditCard } from 'lucide-react';
import { ordersAPI } from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get order data from location state (for new orders)
  const stateOrderData = location.state?.orderData;
  const stateTotalAmount = location.state?.totalAmount;
  useEffect(() => {
    if (stateOrderData) {
      // Handle new order from payment page
      handleNewOrder();
    } else if (orderId) {
      // Handle existing order lookup
      fetchOrder();
    }
  }, [orderId, stateOrderData]);

  const handleNewOrder = async () => {
    try {
      setLoading(true);
      console.log('Creating order with data:', stateOrderData);
      
      const response = await ordersAPI.createOrder(stateOrderData);
      console.log('Order created successfully:', response.data);
      
      setOrder(response.data);
      clearCart(); // Clear cart after successful order creation
      setError(null);
    } catch (error: any) {
      console.error('Order creation error:', error);
      setError(error.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };
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

  const fetchOrder = async () => {
    try {
      if (!orderId) {
        console.error('No order ID provided');
        setError('No order ID provided');
        return;
      }
      
      console.log('Fetching order:', orderId);
      const response = await ordersAPI.getOrder(orderId);
      console.log('Order fetched successfully:', response.data);
      setOrder(response.data);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching order:', error);
      setError(error.response?.data?.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-red-500 mb-4">
            <Package size={64} className="mx-auto mb-4" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Order</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={fetchOrder}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
            <Link
              to="/orders"
              className="block w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              View All Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Order not found</h1>
        <p className="text-gray-600 mt-2">The order you're looking for doesn't exist or has been removed.</p>
        <Link 
          to="/orders" 
          className="inline-block mt-4 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
        >
          View All Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">
            Thank you for your purchase. Your order has been successfully placed.
            {order.paymentMethod === 'qr' && (
              <span className="block mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <span className="text-yellow-800 font-medium">⏳ Status: Pending Payment Verification</span>
                <span className="block text-sm text-yellow-700 mt-1">
                  We'll verify your payment within 2-4 hours and update your order status.
                </span>
              </span>
            )}
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
            <span className="text-sm text-gray-600">
              Order #{order._id.slice(-8).toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Package className="mr-2" size={20} />
                Order Status
              </h3>
              <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
                {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
              </span>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <CreditCard className="mr-2" size={20} />
                Payment Method
              </h3>
              <p className="text-gray-600">
                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI/QR Code'}
              </p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <MapPin className="mr-2" size={20} />
              Shipping Address
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.street}</p>
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
              </p>
              <p>{order.shippingAddress?.country}</p>
              <p className="mt-2 text-sm text-gray-600">
                Phone: {order.shippingAddress?.phone}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Order Items</h3>
            <div className="space-y-4">
              {order.items && order.items.length > 0 ? (
                order.items.map((item: any, index: number) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <img
                      src={getProductImageUrl(item.product)}
                      alt={item.product?.name || 'Product'}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.src = 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=600';
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product?.name || 'Unknown Product'}</h4>
                      <p className="text-sm text-gray-600">Size: {item.size}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      {item.accessories && item.accessories.length > 0 && (
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Accessories:</span>
                          <div className="ml-2 mt-1">
                            {item.accessories.map((accessory: any, accIndex: number) => (
                              <div key={accIndex} className="text-xs">
                                • {accessory.name} {accessory.price === 0 ? '(Free)' : `(+$${accessory.price})`}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                      <p className="text-sm text-gray-600">${item.price || 0} each</p>
                      {item.accessories && item.accessories.some((acc: any) => acc.price > 0) && (
                        <p className="text-xs text-gray-500">
                          +${((item.accessories || []).reduce((sum: number, acc: any) => sum + acc.price, 0) * item.quantity).toFixed(2)} accessories
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No items found in this order
                </div>
              )}
            </div>
          </div>

          {/* Order Total */}
          <div className="border-t mt-6 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Amount:</span>
              <span className="text-lg font-bold text-purple-600">
                ${order.totalAmount?.toFixed(2) || '0.00'}
              </span>
            </div>
            {order.shippingCost > 0 && (
              <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
                <span>Includes shipping: ${order.shippingCost.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Truck className="mr-2" size={20} />
            What's Next?
          </h3>
          {order.paymentMethod === 'qr' ? (
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• We'll verify your payment within 2-4 hours</li>
              <li>• You'll receive a confirmation email once payment is verified</li>
              <li>• Your order will be processed after payment verification</li>
              <li>• Estimated delivery: 3-7 business days after verification</li>
              <li>• Current status: "Pending Payment Verification"</li>
              <li>• Check your order status in "My Orders" section</li>
            </ul>
          ) : (
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• We'll send you an email confirmation shortly</li>
              <li>• Your order will be processed within 1-2 business days</li>
              <li>• You'll receive tracking information once your order ships</li>
              <li>• Estimated delivery: 3-7 business days</li>
              <li>• Please keep the exact amount ready for cash on delivery</li>
            </ul>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/orders"
            className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-center"
          >
            View All Orders
          </Link>
          <Link
            to="/products"
            className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
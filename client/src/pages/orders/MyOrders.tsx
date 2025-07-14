import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Eye, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import { ordersAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MyOrders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching user orders...');
      const response = await ordersAPI.getMyOrders();
      console.log('Orders fetched:', response.data);
      setOrders(response.data || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      setError(error.response?.data?.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getProductImageUrl = (product: any) => {
    if (!product) return 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=600';
    
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-yellow-500" size={20} />;
      case 'processing':
        return <Package className="text-blue-500" size={20} />;
      case 'shipped':
        return <Truck className="text-purple-500" size={20} />;
      case 'delivered':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'cancelled':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Package className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <LoadingSpinner size="large" />
            <p className="mt-4 text-gray-600">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <Package size={64} className="mx-auto text-red-400 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-4">Error Loading Orders</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchOrders}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-4">No orders yet</h2>
          <p className="text-gray-600 mb-8">You haven't placed any orders yet.</p>
          <Link
            to="/products"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.orderStatus)}
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                      </span>
                    </div>
                    <Link
                      to={`/order/${order._id}`}
                      className="text-purple-600 hover:text-purple-700 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                    >
                      <Eye size={20} />
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-semibold text-lg">${(order.totalAmount || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-medium">
                      {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI/QR Code'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Items</p>
                    <p className="font-medium">{order.items?.length || 0} item(s)</p>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="border-t pt-4">
                  <div className="flex items-center space-x-4 overflow-x-auto">
                    {order.items && order.items.length > 0 ? (
                      order.items.slice(0, 3).map((item: any, index: number) => (
                        <div key={index} className="flex-shrink-0 flex items-center space-x-3">
                          <img
                            src={getProductImageUrl(item.product)}
                            alt={item.product?.name || 'Product'}
                            className="w-12 h-12 object-cover rounded-lg"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              target.src = 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=600';
                            }}
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-800 truncate max-w-32">
                              {item.product?.name || 'Unknown Product'}
                            </p>
                            <p className="text-xs text-gray-600">
                              Size: {item.size} | Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500">No items found</div>
                    )}
                    {order.items && order.items.length > 3 && (
                      <div className="flex-shrink-0 text-sm text-gray-600">
                        +{order.items.length - 3} more
                      </div>
                    )}
                  </div>
                </div>

                {/* Tracking Information */}
                {order.trackingNumber && (
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center space-x-2">
                      <Truck className="text-purple-600" size={16} />
                      <span className="text-sm text-gray-600">Tracking Number:</span>
                      <span className="text-sm font-medium">{order.trackingNumber}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
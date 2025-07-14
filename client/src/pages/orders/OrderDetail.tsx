import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, Truck, MapPin, CreditCard, Clock, CheckCircle, XCircle } from 'lucide-react';
import { ordersAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const OrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching order details for:', orderId);
      const response = await ordersAPI.getOrder(orderId!);
      console.log('Order details fetched:', response.data);
      setOrder(response.data);
    } catch (error: any) {
      console.error('Error fetching order:', error);
      setError(error.response?.data?.message || 'Failed to load order details');
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

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100', text: 'text-yellow-800' };
      case 'processing':
        return { icon: Package, color: 'text-blue-500', bg: 'bg-blue-100', text: 'text-blue-800' };
      case 'shipped':
        return { icon: Truck, color: 'text-purple-500', bg: 'bg-purple-100', text: 'text-purple-800' };
      case 'delivered':
        return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100', text: 'text-green-800' };
      case 'cancelled':
        return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100', text: 'text-red-800' };
      default:
        return { icon: Package, color: 'text-gray-500', bg: 'bg-gray-100', text: 'text-gray-800' };
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <LoadingSpinner size="large" />
            <p className="mt-4 text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <Package size={64} className="mx-auto text-red-400 mb-4" />
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
              Back to Orders
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
        <Link to="/orders" className="text-purple-600 hover:text-purple-700 mt-4 inline-block">
          Back to Orders
        </Link>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.orderStatus);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link
            to="/orders"
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Order #{order._id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-gray-600">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <StatusIcon className={statusInfo.color} size={32} />
              <div>
                <h2 className="text-xl font-bold text-gray-800">Order Status</h2>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
                  {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                </span>
              </div>
            </div>
            
            {order.trackingNumber && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Tracking Number</p>
                <p className="font-medium">{order.trackingNumber}</p>
              </div>
            )}
          </div>
          
          {/* Order Progress Tracking */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-4">Order Progress</h4>
            <div className="flex items-center justify-between">
              <div className={`flex flex-col items-center ${
                ['pending', 'processing', 'shipped', 'delivered'].includes(order.orderStatus) 
                  ? 'text-green-600' : 'text-gray-400'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  ['pending', 'processing', 'shipped', 'delivered'].includes(order.orderStatus)
                    ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <CheckCircle size={20} />
                </div>
                <span className="text-xs mt-2 font-medium">Ordered</span>
                <span className="text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className={`flex-1 h-1 mx-4 ${
                ['processing', 'shipped', 'delivered'].includes(order.orderStatus)
                  ? 'bg-green-200' : 'bg-gray-200'
              }`}></div>
              
              <div className={`flex flex-col items-center ${
                ['processing', 'shipped', 'delivered'].includes(order.orderStatus)
                  ? 'text-green-600' : 'text-gray-400'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  ['processing', 'shipped', 'delivered'].includes(order.orderStatus)
                    ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <Package size={20} />
                </div>
                <span className="text-xs mt-2 font-medium">Processing</span>
                <span className="text-xs text-gray-500">
                  {['processing', 'shipped', 'delivered'].includes(order.orderStatus) ? 'Confirmed' : 'Pending'}
                </span>
              </div>
              
              <div className={`flex-1 h-1 mx-4 ${
                ['shipped', 'delivered'].includes(order.orderStatus)
                  ? 'bg-green-200' : 'bg-gray-200'
              }`}></div>
              
              <div className={`flex flex-col items-center ${
                ['shipped', 'delivered'].includes(order.orderStatus)
                  ? 'text-green-600' : 'text-gray-400'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  ['shipped', 'delivered'].includes(order.orderStatus)
                    ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <Truck size={20} />
                </div>
                <span className="text-xs mt-2 font-medium">Shipped</span>
                <span className="text-xs text-gray-500">
                  {['shipped', 'delivered'].includes(order.orderStatus) ? 'In Transit' : 'Pending'}
                </span>
              </div>
              
              <div className={`flex-1 h-1 mx-4 ${
                order.orderStatus === 'delivered' ? 'bg-green-200' : 'bg-gray-200'
              }`}></div>
              
              <div className={`flex flex-col items-center ${
                order.orderStatus === 'delivered' ? 'text-green-600' : 'text-gray-400'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  order.orderStatus === 'delivered' ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <CheckCircle size={20} />
                </div>
                <span className="text-xs mt-2 font-medium">Delivered</span>
                <span className="text-xs text-gray-500">
                  {order.orderStatus === 'delivered' ? 'Completed' : 'Pending'}
                </span>
              </div>
            </div>
            
            {order.trackingNumber && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Truck className="text-blue-600" size={20} />
                    <div>
                      <p className="font-medium text-blue-800">Tracking Number</p>
                      <p className="text-blue-600 font-mono">{order.trackingNumber}</p>
                    </div>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    Track Package
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <MapPin className="mr-2" size={20} />
              Shipping Address
            </h3>
            <div className="space-y-1">
              <p className="font-medium">{order.shippingAddress?.fullName || 'N/A'}</p>
              <p>{order.shippingAddress?.street || 'N/A'}</p>
              <p>
                {order.shippingAddress?.city || 'N/A'}, {order.shippingAddress?.state || 'N/A'} {order.shippingAddress?.zipCode || 'N/A'}
              </p>
              <p>{order.shippingAddress?.country || 'N/A'}</p>
              <p className="text-sm text-gray-600 mt-2">
                Phone: {order.shippingAddress?.phone || 'N/A'}
              </p>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <CreditCard className="mr-2" size={20} />
              Payment Information
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-medium">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI/QR Code'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span className={`font-medium ${
                  order.paymentStatus === 'completed' ? 'text-green-600' : 
                  order.paymentStatus === 'failed' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1) || 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Order Items</h3>
          <div className="space-y-4">
            {order.items && order.items.length > 0 ? (
              order.items.map((item: any, index: number) => (
                <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <img
                    src={getProductImageUrl(item.product)}
                    alt={item.product?.name || 'Product'}
                    className="w-20 h-20 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.src = 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=600';
                    }}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{item.product?.name || 'Unknown Product'}</h4>
                    <p className="text-sm text-gray-600">{item.product?.category || 'N/A'}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-600">Size: {item.size}</span>
                      <span className="text-sm text-gray-600">Quantity: {item.quantity}</span>
                    </div>
                    {item.accessories && item.accessories.length > 0 && (
                      <div className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Accessories:</span>
                        <div className="ml-2 mt-2 space-y-2">
                          {item.accessories.map((accessory: any, accIndex: number) => (
                            <div key={accIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                              <div className="flex items-center">
                                <span className="w-3 h-3 bg-purple-500 rounded-full mr-3"></span>
                                <span className="font-medium text-gray-700">{accessory.name}</span>
                              </div>
                              <span className="font-medium">
                                {accessory.price === 0 ? (
                                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">Free</span>
                                ) : (
                                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">+${accessory.price}</span>
                                )}
                              </span>
                            </div>
                          ))}
                          <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg">
                            <div className="text-sm font-medium text-purple-800">
                              ✓ Customer Selected Accessories Summary:
                            </div>
                            <div className="text-sm text-purple-700 mt-1">
                              • {item.accessories.length} accessory/accessories chosen
                              • Total accessories value: +${(item.accessories.reduce((sum: number, acc: any) => sum + acc.price, 0) * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-lg">${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                    <p className="text-sm text-gray-600">${item.price || 0} each</p>
                    {item.accessories && item.accessories.some((acc: any) => acc.price > 0) && (
                      <p className="text-xs text-gray-500">
                        +${(item.accessories.reduce((sum: number, acc: any) => sum + acc.price, 0) * item.quantity).toFixed(2)} accessories
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No items found in this order
              </div>
            )}
          </div>

          {/* Order Total */}
          <div className="border-t mt-6 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${((order.totalAmount || 0) - (order.shippingCost || 0)).toFixed(2)}</span>
              </div>
              {order.shippingCost > 0 && (
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>${(order.shippingCost || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${(order.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
import React, { useState, useEffect } from 'react';
import { Eye, Edit, Search, Filter, Package, Truck, CheckCircle, XCircle, CreditCard, Clock } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { ordersAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');

  const orderStatuses = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Package },
    { value: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: Package },
    { value: 'shipped', label: 'Shipped', color: 'bg-purple-100 text-purple-800', icon: Truck },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
  ];

  const paymentStatuses = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-800' },
  ];

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter, searchTerm]);

  // Helper function to get product image URL
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

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        status: statusFilter !== 'all' ? statusFilter : '',
      };
      const response = await ordersAPI.getAllOrders(params);
      setOrders(response.data.orders);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (orderId: string) => {
    try {
      const response = await ordersAPI.getOrder(orderId);
      setSelectedOrder(response.data);
      setShowOrderModal(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    
    try {
      await ordersAPI.updateOrderStatus(selectedOrder._id, newStatus, trackingNumber);
      setShowStatusModal(false);
      setShowOrderModal(false);
      setNewStatus('');
      setTrackingNumber('');
      fetchOrders();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error updating order status');
    }
  };

  const handleUpdatePaymentStatus = async () => {
    if (!selectedOrder || !newPaymentStatus) return;
    
    try {
      // Update payment status via API
      await ordersAPI.updateOrderPaymentStatus(selectedOrder._id, newPaymentStatus);
      setShowPaymentModal(false);
      setShowOrderModal(false);
      setNewPaymentStatus('');
      fetchOrders();
      alert('Payment status updated successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error updating payment status');
    }
  };

  const getStatusInfo = (status: string) => {
    return orderStatuses.find(s => s.value === status) || orderStatuses[0];
  };

  const filteredOrders = orders.filter(order =>
    order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
          <p className="text-gray-600 mt-2">Manage and track customer orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {orderStatuses.map((status) => {
            const count = orders.filter(order => order.orderStatus === status.value).length;
            const Icon = status.icon;
            
            return (
              <div key={status.value} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{status.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${status.color.replace('text-', 'text-').replace('bg-', 'bg-').replace('-100', '-50')}`}>
                    <Icon size={20} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search orders by ID, customer name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="all">All Statuses</option>
                {orderStatuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => {
                    const statusInfo = getStatusInfo(order.orderStatus);
                    
                    return (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #{order._id.slice(-8).toUpperCase()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{order.user?.name}</div>
                            <div className="text-sm text-gray-500">{order.user?.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.items?.length || 0} items
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${order.totalAmount?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              order.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                              order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1) || 'Pending'}
                            </span>
                            {order.paymentMethod === 'qr' && order.paymentStatus === 'pending' && (
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setNewPaymentStatus(order.paymentStatus || 'pending');
                                  setShowPaymentModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100 transition-colors"
                                title="Update Payment Status"
                              >
                                <CreditCard size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewOrder(order._id)}
                              className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-100 transition-colors"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setNewStatus(order.orderStatus);
                                setTrackingNumber(order.trackingNumber || '');
                                setShowStatusModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100 transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No orders found</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <nav className="flex items-center space-x-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
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
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </div>
        )}

        {/* Order Details Modal */}
        {showOrderModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">
                    Order #{selectedOrder._id.slice(-8).toUpperCase()}
                  </h2>
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Name:</span> {selectedOrder.user?.name}</p>
                      <p><span className="font-medium">Email:</span> {selectedOrder.user?.email}</p>
                      <p><span className="font-medium">Phone:</span> {selectedOrder.shippingAddress?.phone}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Order Details</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Status:</span> 
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusInfo(selectedOrder.orderStatus).color}`}>
                          {getStatusInfo(selectedOrder.orderStatus).label}
                        </span>
                      </p>
                      <p><span className="font-medium">Payment:</span> {selectedOrder.paymentMethod?.toUpperCase()}</p>
                      <p><span className="font-medium">Date:</span> {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                      {selectedOrder.trackingNumber && (
                        <p><span className="font-medium">Tracking:</span> {selectedOrder.trackingNumber}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p>{selectedOrder.shippingAddress?.fullName}</p>
                    <p>{selectedOrder.shippingAddress?.street}</p>
                    <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zipCode}</p>
                    <p>{selectedOrder.shippingAddress?.country}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {selectedOrder.items?.map((item: any, index: number) => (
                      <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <img
                          src={getProductImageUrl(item.product)}
                          alt={item.product?.name}
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.src = 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=600';
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product?.name}</h4>
                          <p className="text-sm text-gray-600">Size: {item.size}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          {item.accessories && item.accessories.length > 0 && (
                            <div className="text-sm text-gray-600 mt-2">
                              <span className="font-medium">Accessories:</span>
                              <div className="ml-2 mt-2 space-y-2">
                                {item.accessories.map((accessory: any, index: number) => (
                                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
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
                          <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                          <p className="text-sm text-gray-600">${item.price} each</p>
                          {item.accessories && item.accessories.some((acc: any) => acc.price > 0) && (
                            <p className="text-xs text-gray-500">
                              +${(item.accessories.reduce((sum: number, acc: any) => sum + acc.price, 0) * item.quantity).toFixed(2)} accessories
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total Amount:</span>
                      <span className="text-lg font-bold">${selectedOrder.totalAmount?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setNewStatus(selectedOrder.orderStatus);
                      setTrackingNumber(selectedOrder.trackingNumber || '');
                      setShowStatusModal(true);
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Update Status
                  </button>
                  {selectedOrder.paymentMethod === 'qr' && (
                    <button
                      onClick={() => {
                        setNewPaymentStatus(selectedOrder.paymentStatus || 'pending');
                        setShowPaymentModal(true);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Update Payment
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Update Modal */}
        {showStatusModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">Update Order Status</h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    {orderStatuses.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>

                {(newStatus === 'shipped' || newStatus === 'delivered') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tracking Number
                    </label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                      placeholder="Enter tracking number"
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateStatus}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Update Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Status Update Modal */}
        {showPaymentModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">Update Payment Status</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Order #{selectedOrder._id.slice(-8).toUpperCase()} - {selectedOrder.paymentMethod?.toUpperCase()}
                </p>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={newPaymentStatus}
                    onChange={(e) => setNewPaymentStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    {paymentStatuses.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Payment Verification Guide:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Check WhatsApp for payment screenshot</li>
                    <li>• Verify amount matches order total</li>
                    <li>• Confirm transaction ID/reference</li>
                    <li>• Mark as "Completed" only after verification</li>
                  </ul>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdatePaymentStatus}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Update Payment Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default OrderManagement;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Phone, 
  Edit, 
  Save, 
  X, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  XCircle,
  Eye,
  Settings,
  Shield,
  Plus,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { ordersAPI, authAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    primaryPhone: user?.phone || '',
    alternatePhones: [''] // Start with one empty alternate phone field
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await ordersAPI.getMyOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToast('Error loading orders', 'error');
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate name
    if (!profileData.name.trim()) {
      showToast('Name is required', 'error');
      return;
    }

    // Validate primary phone
    if (!profileData.primaryPhone.trim()) {
      showToast('Primary phone number is required', 'error');
      return;
    }

    // Validate phone format
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(profileData.primaryPhone.replace(/\s/g, ''))) {
      showToast('Please enter a valid primary phone number', 'error');
      return;
    }

    // Validate alternate phones
    const validAlternatePhones = profileData.alternatePhones.filter(phone => phone.trim());
    for (const phone of validAlternatePhones) {
      if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        showToast('Please enter valid alternate phone numbers', 'error');
        return;
      }
    }

    setLoading(true);

    try {
      // In a real app, you'd call the API to update profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsEditingProfile(false);
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      showToast('Error updating profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      showToast('Password changed successfully!', 'success');
    } catch (error) {
      showToast('Error changing password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addAlternatePhone = () => {
    if (profileData.alternatePhones.length < 3) {
      setProfileData({
        ...profileData,
        alternatePhones: [...profileData.alternatePhones, '']
      });
    } else {
      showToast('Maximum 3 alternate phone numbers allowed', 'warning');
    }
  };

  const removeAlternatePhone = (index: number) => {
    const newPhones = profileData.alternatePhones.filter((_, i) => i !== index);
    setProfileData({
      ...profileData,
      alternatePhones: newPhones.length > 0 ? newPhones : ['']
    });
  };

  const updateAlternatePhone = (index: number, value: string) => {
    const newPhones = [...profileData.alternatePhones];
    newPhones[index] = value;
    setProfileData({
      ...profileData,
      alternatePhones: newPhones
    });
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

  const tabs = [
    { id: 'profile', label: 'Profile Info', icon: User },
    { id: 'orders', label: 'Order History', icon: Package },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Settings }
  ];

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl sm:text-2xl font-bold text-purple-600">
                  {user?.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-white text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl font-bold">{user?.name}</h1>
                <p className="opacity-90 text-sm sm:text-base">{user?.email}</p>
                <p className="text-xs sm:text-sm opacity-75">
                  Member since {new Date(user?.createdAt || '').toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Sidebar Navigation */}
            <div className="lg:w-1/4 border-r border-gray-200">
              <nav className="p-4 sm:p-6">
                <ul className="space-y-1 sm:space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <li key={tab.id}>
                        <button
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center space-x-3 px-3 sm:px-4 py-3 rounded-lg text-left transition-colors touch-manipulation ${
                            activeTab === tab.id
                              ? 'bg-purple-50 text-purple-600 border-r-2 border-purple-600'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <Icon size={20} />
                          <span className="text-sm sm:text-base">{tab.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t">
                  <button
                    onClick={logout}
                    className="w-full flex items-center space-x-3 px-3 sm:px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors touch-manipulation"
                  >
                    <X size={20} />
                    <span className="text-sm sm:text-base">Logout</span>
                  </button>
                </div>
              </nav>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4 p-4 sm:p-6">
              {/* Profile Info Tab */}
              {activeTab === 'profile' && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Profile Information</h2>
                    <button
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      className="btn-primary flex items-center space-x-2 w-full sm:w-auto justify-center"
                    >
                      <Edit size={16} />
                      <span>{isEditingProfile ? 'Cancel' : 'Edit Profile'}</span>
                    </button>
                  </div>

                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    {/* Name Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User size={16} className="inline mr-2" />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        disabled={!isEditingProfile}
                        className="form-input"
                        placeholder="Enter your full name"
                      />
                    </div>

                    {/* Primary Phone Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone size={16} className="inline mr-2" />
                        Primary Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={profileData.primaryPhone}
                        onChange={(e) => setProfileData({...profileData, primaryPhone: e.target.value})}
                        disabled={!isEditingProfile}
                        className="form-input"
                        placeholder="+1 234 567 8900"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This will be used for order updates and delivery notifications
                      </p>
                    </div>

                    {/* Alternate Phone Numbers */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700">
                          <Phone size={16} className="inline mr-2" />
                          Alternate Phone Numbers
                        </label>
                        {isEditingProfile && profileData.alternatePhones.length < 3 && (
                          <button
                            type="button"
                            onClick={addAlternatePhone}
                            className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 text-sm font-medium"
                          >
                            <Plus size={16} />
                            <span>Add Number</span>
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        {profileData.alternatePhones.map((phone, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => updateAlternatePhone(index, e.target.value)}
                              disabled={!isEditingProfile}
                              className="form-input flex-1"
                              placeholder={`Alternate phone ${index + 1}`}
                            />
                            {isEditingProfile && profileData.alternatePhones.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeAlternatePhone(index)}
                                className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors touch-manipulation"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Add up to 3 alternate numbers for backup contact
                      </p>
                    </div>

                    {/* Email (Read-only) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="form-input bg-gray-50 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Email cannot be changed. Contact support if needed.
                      </p>
                    </div>

                    {isEditingProfile && (
                      <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="btn-secondary w-full sm:w-auto"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="btn-primary w-full sm:w-auto flex items-center justify-center space-x-2"
                        >
                          {loading ? <LoadingSpinner size="small" /> : <Save size={16} />}
                          <span>Save Changes</span>
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* Order History Tab */}
              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Order History</h2>
                  
                  {ordersLoading ? (
                    <div className="flex justify-center py-12">
                      <LoadingSpinner size="large" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package size={64} className="mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">No orders yet</h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-6">You haven't placed any orders yet.</p>
                      <Link
                        to="/products"
                        className="btn-primary"
                      >
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order._id} className="card">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-4 sm:space-y-0">
                            <div>
                              <h3 className="font-semibold text-gray-800">
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

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Total Amount</p>
                              <p className="font-semibold">${order.totalAmount?.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Payment</p>
                              <p className="font-medium text-sm">
                                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI/QR Code'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Items</p>
                              <p className="font-medium">{order.items?.length || 0}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Status</p>
                              <p className="font-medium text-sm">
                                {order.orderStatus === 'delivered' ? 'Delivered' : 
                                 order.orderStatus === 'shipped' ? 'In Transit' :
                                 order.orderStatus === 'processing' ? 'Processing' : 'Pending'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Security Settings</h2>
                  
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h3>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password *
                        </label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          className="form-input"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password *
                        </label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          className="form-input"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password *
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          className="form-input"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary flex items-center space-x-2"
                      >
                        {loading ? <LoadingSpinner size="small" /> : <Save size={16} />}
                        <span>Change Password</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Preferences</h2>
                  
                  <div className="space-y-6">
                    <div className="card">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Notifications</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-800">Order Updates</h4>
                            <p className="text-sm text-gray-600">Receive SMS and email updates about your orders</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-800">Promotional Offers</h4>
                            <p className="text-sm text-gray-600">Get notified about sales and special offers</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Preferences</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Preferred Contact Method
                          </label>
                          <select className="form-input">
                            <option value="primary">Primary Phone</option>
                            <option value="email">Email</option>
                            <option value="both">Both Phone and Email</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Best Time to Contact
                          </label>
                          <select className="form-input">
                            <option value="morning">Morning (9 AM - 12 PM)</option>
                            <option value="afternoon">Afternoon (12 PM - 6 PM)</option>
                            <option value="evening">Evening (6 PM - 9 PM)</option>
                            <option value="anytime">Anytime</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
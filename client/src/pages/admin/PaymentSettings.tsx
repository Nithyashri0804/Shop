import React, { useState, useEffect } from 'react';
import { Save, QrCode, CreditCard, MessageCircle, Settings, CheckCircle, AlertCircle, Upload, X } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { paymentSettingsAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PaymentSettings: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingQR, setUploadingQR] = useState(false);
  const [settings, setSettings] = useState({
    codEnabled: true,
    qrEnabled: true,
    upiId: '',
    businessName: 'AS Shreads',
    whatsappNumber: '+919876543210',
    qrCodeUrl: '',
    paymentInstructions: 'Scan QR and pay the exact amount. Send payment screenshot to our WhatsApp number for verification.'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      console.log('Fetching payment settings...');
      const response = await paymentSettingsAPI.getSettings();
      console.log('Payment settings fetched:', response.data);
      setSettings(response.data);
    } catch (error: unknown) {
      console.error(error);
      let errorMessage = 'An unexpected error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    console.log('=== PAYMENT SETTINGS SAVE DEBUG ===');
    console.log('Current settings:', settings);

    // Validation
    if (settings.qrEnabled && (!settings.upiId || !settings.upiId.trim())) {
      showToast('UPI ID is required when QR payment is enabled', 'error');
      return;
    }

    if (settings.qrEnabled && (!settings.businessName || !settings.businessName.trim())) {
      showToast('Business name is required when QR payment is enabled', 'error');
      return;
    }

    if (settings.qrEnabled && (!settings.whatsappNumber || !settings.whatsappNumber.trim())) {
      showToast('WhatsApp number is required for payment verification', 'error');
      return;
    }

    if (!settings.codEnabled && !settings.qrEnabled) {
      showToast('At least one payment method must be enabled', 'error');
      return;
    }

    console.log('Validation passed, attempting to save...');

    try {
      setSaving(true);
      const response = await paymentSettingsAPI.updateSettings(settings);
      console.log('Save response:', response);
      showToast('Payment settings updated successfully!', 'success');
    } catch (error: unknown) {
      console.error('=== PAYMENT SETTINGS ERROR ===');
      console.error('Full error object:', error);
      let errorMessage = 'Error updating payment settings';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      showToast(errorMessage, 'error');
    } finally {
      setSaving(false);
      console.log('=== END PAYMENT SETTINGS SAVE ===');
    }
  };
  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQRUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be less than 5MB', 'error');
      return;
    }

    setUploadingQR(true);

    try {
      // Convert to base64 for storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        handleInputChange('qrCodeUrl', base64String);
        setUploadingQR(false);
        showToast('QR code uploaded successfully!', 'success');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading QR code:', error);
      showToast('Error uploading QR code', 'error');
      setUploadingQR(false);
    }
  };

  const removeQRCode = () => {
    handleInputChange('qrCodeUrl', '');
    showToast('QR code removed', 'info');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="large" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Payment Settings</h1>
            <p className="text-gray-600 mt-2">Configure payment methods and QR code for customer payments</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center space-x-2"
          >
            {saving ? <LoadingSpinner size="small" /> : <Save size={20} />}
            <span>Save Settings</span>
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Payment Methods */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Settings className="mr-2" size={24} />
              Payment Methods
            </h2>

            <div className="space-y-6">
              {/* Cash on Delivery */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CreditCard className="text-green-600" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-800">Cash on Delivery</h3>
                    <p className="text-sm text-gray-600">Allow customers to pay when order arrives</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.codEnabled}
                    onChange={(e) => handleInputChange('codEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* UPI/QR Payment */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <QrCode className="text-blue-600" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-800">UPI/QR Payment</h3>
                    <p className="text-sm text-gray-600">Allow customers to pay via UPI/QR code</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.qrEnabled}
                    onChange={(e) => handleInputChange('qrEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>

            {/* Payment Status Alert */}
            <div className="mt-6">
              {!settings.codEnabled && !settings.qrEnabled ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="text-red-600 mr-2" size={20} />
                    <p className="text-red-800 font-medium">
                      ⚠️ Warning: All payment methods are disabled. Customers won't be able to place orders.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="text-green-600 mr-2" size={20} />
                    <p className="text-green-800 font-medium">
                      ✓ Payment methods configured successfully
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* UPI Configuration */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <QrCode className="mr-2" size={24} />
              UPI Configuration
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={settings.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="AS Shreads"
                  disabled={!settings.qrEnabled}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UPI ID *
                </label>
                <input
                  type="text"
                  value={settings.upiId}
                  onChange={(e) => handleInputChange('upiId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="yourupi@paytm"
                  disabled={!settings.qrEnabled}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Number *
                </label>
                <input
                  type="tel"
                  value={settings.whatsappNumber}
                  onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="+919876543210"
                  disabled={!settings.qrEnabled}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Include country code (e.g., +91 for India)
                </p>
              </div>
            </div>
          </div>

          {/* QR Code Upload */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">QR Code Image</h2>
            
            {settings.qrEnabled ? (
              <div className="space-y-4">
                {settings.qrCodeUrl ? (
                  <div className="relative">
                    <img
                      src={settings.qrCodeUrl}
                      alt="Payment QR Code"
                      className="w-48 h-48 object-cover rounded-lg border border-gray-300 mx-auto"
                    />
                    <div className="flex justify-center space-x-3 mt-4">
                      <label className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors cursor-pointer flex items-center space-x-2">
                        <Upload size={16} />
                        <span>Change QR Code</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleQRUpload(e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                      <button
                        onClick={removeQRCode}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                      >
                        <X size={16} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                    {uploadingQR ? (
                      <div className="flex flex-col items-center">
                        <LoadingSpinner size="large" />
                        <p className="text-gray-600 mt-4">Uploading QR code...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <QrCode className="text-gray-400 mb-4" size={48} />
                        <p className="text-gray-600 mb-2">Upload your QR code image</p>
                        <label className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors cursor-pointer">
                          <span>Choose File</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleQRUpload(e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                        <p className="text-sm text-gray-500 mt-2">PNG, JPG, JPEG up to 5MB</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-medium text-blue-800 mb-2">QR Code Guidelines:</h5>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Generate QR code from your UPI app (Google Pay, PhonePe, Paytm, etc.)</li>
                    <li>• Include business name: <strong>{settings.businessName}</strong></li>
                    <li>• Include UPI ID: <strong>{settings.upiId || 'yourupi@paytm'}</strong></li>
                    <li>• Test the QR code before uploading to ensure it works</li>
                    <li>• Use high-quality image for better scanning</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <QrCode size={48} className="mx-auto mb-4 opacity-50" />
                <p>Enable UPI/QR Payment to upload QR code</p>
              </div>
            )}
          </div>

          {/* Payment Instructions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <MessageCircle className="mr-2" size={24} />
              Payment Instructions
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructions for Customers
              </label>
              <textarea
                value={settings.paymentInstructions}
                onChange={(e) => handleInputChange('paymentInstructions', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                rows={4}
                placeholder="Scan QR and pay the exact amount. Send payment screenshot to our WhatsApp number."
                disabled={!settings.qrEnabled}
              />
            </div>

            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Payment Verification Process:</h4>
              <ol className="text-sm text-yellow-700 space-y-1">
                <li>1. Customer scans QR code and makes payment</li>
                <li>2. Customer sends payment screenshot via WhatsApp</li>
                <li>3. Admin verifies payment and updates order status</li>
                <li>4. Order proceeds to processing and shipping</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Payment Page Preview</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-4">Customer Payment Options</h3>
              
              {settings.codEnabled && (
                <div className="flex items-center p-3 border border-gray-300 rounded-lg mb-3">
                  <CreditCard className="text-green-600 mr-3" size={20} />
                  <div>
                    <div className="font-medium">Cash on Delivery</div>
                    <div className="text-sm text-gray-600">Pay when your order arrives</div>
                  </div>
                </div>
              )}
              
              {settings.qrEnabled && (
                <div className="flex items-center p-3 border border-gray-300 rounded-lg">
                  <QrCode className="text-blue-600 mr-3" size={20} />
                  <div>
                    <div className="font-medium">UPI/QR Code</div>
                    <div className="text-sm text-gray-600">Pay using UPI apps or scan QR code</div>
                  </div>
                </div>
              )}
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-4">QR Code Preview</h3>
              
              {settings.qrCodeUrl ? (
                <div className="text-center">
                  <img
                    src={settings.qrCodeUrl}
                    alt="Payment QR Code Preview"
                    className="w-32 h-32 mx-auto border border-gray-300 rounded-lg"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    {settings.businessName} - {settings.upiId}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <QrCode size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">QR code will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default PaymentSettings;
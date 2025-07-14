import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { QrCode, MessageCircle, Copy, CheckCircle, ArrowLeft, CreditCard } from 'lucide-react';
import { paymentSettingsAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [paymentSettings, setPaymentSettings] = useState<any>(null);
  const [copiedUPI, setCopiedUPI] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'cod' | 'qr'>('qr');

  // Get order data from location state
  const orderData = location.state?.orderData;
  const totalAmount = location.state?.totalAmount || 0;

  useEffect(() => {
    if (!orderData) {
      navigate('/checkout');
      return;
    }
    fetchPaymentSettings();
  }, [orderData, navigate]);

  const fetchPaymentSettings = async () => {
    try {
      const response = await paymentSettingsAPI.getSettings();
      setPaymentSettings(response.data);
      
      // Set default payment method based on what's enabled
      if (response.data.qrEnabled) {
        setSelectedMethod('qr');
      } else if (response.data.codEnabled) {
        setSelectedMethod('cod');
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error);
      showToast('Error loading payment options', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateUPIString = () => {
    if (!paymentSettings) return '';
    
    const { upiId, businessName } = paymentSettings;
    return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(businessName)}&am=${totalAmount}&cu=INR`;
  };

  const copyUPIString = async () => {
    try {
      await navigator.clipboard.writeText(generateUPIString());
      setCopiedUPI(true);
      showToast('UPI payment string copied!', 'success');
      setTimeout(() => setCopiedUPI(false), 3000);
    } catch (error) {
      showToast('Failed to copy UPI string', 'error');
    }
  };





  const handleWhatsAppContact = () => {
    if (!paymentSettings?.whatsappNumber) return;
    
    const message = encodeURIComponent(
      `Hi! I've made a payment of $${totalAmount} for my order. Please find the payment screenshot attached.`
    );
    const whatsappUrl = `https://wa.me/${paymentSettings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleProceedWithPayment = () => {
    // Navigate to order confirmation with payment method
    navigate('/order-confirmation', {
      state: {
        orderData: {
          ...orderData,
          paymentMethod: selectedMethod
        },
        totalAmount
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!paymentSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment Unavailable</h1>
          <p className="text-gray-600 mb-6">Payment options are currently being configured.</p>
          <button
            onClick={() => navigate('/checkout')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Checkout
          </button>
        </div>
      </div>
    );
  }

  const availableMethods = [];
  if (paymentSettings.codEnabled) {
    availableMethods.push({ id: 'cod', name: 'Cash on Delivery', icon: CreditCard });
  }
  if (paymentSettings.qrEnabled) {
    availableMethods.push({ id: 'qr', name: 'UPI/QR Payment', icon: QrCode });
  }

  if (availableMethods.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No Payment Methods Available</h1>
          <p className="text-gray-600 mb-6">All payment methods are currently disabled.</p>
          <button
            onClick={() => navigate('/checkout')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Checkout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <button
              onClick={() => navigate('/checkout')}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors mr-4"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Complete Payment</h1>
              <p className="text-gray-600">Total Amount: ${totalAmount}</p>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Select Payment Method</h2>
            
            <div className="space-y-3">
              {availableMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <label
                    key={method.id}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedMethod === method.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedMethod === method.id}
                      onChange={(e) => setSelectedMethod(e.target.value as 'cod' | 'qr')}
                      className="mr-3"
                    />
                    <Icon size={24} className="mr-3 text-purple-600" />
                    <span className="font-medium">{method.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Payment Details */}
          {selectedMethod === 'qr' && paymentSettings.qrEnabled && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <QrCode className="mr-2" size={24} />
                UPI/QR Payment
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* QR Code Section */}
                <div className="text-center">
                  <div className="bg-gray-100 p-6 rounded-lg mb-4">
                    {paymentSettings.qrCodeUrl ? (
                      <img
                        src={paymentSettings.qrCodeUrl}
                        alt="Payment QR Code"
                        className="w-48 h-48 mx-auto object-contain"
                      />
                    ) : (
                      <div className="w-48 h-48 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <QrCode size={48} className="mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-500">QR Code will appear here</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-800">Scan with any UPI app</p>
                    <p className="text-xs text-gray-600">{paymentSettings.businessName}</p>
                    <p className="text-xs text-gray-500">{paymentSettings.upiId}</p>
                  </div>
                </div>

                {/* Payment Instructions */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Payment Instructions:</h3>
                  <div className="space-y-3 text-sm text-gray-600">
                    <p>1. Scan the QR code with any UPI app</p>
                    <p>2. Pay the exact amount: ${totalAmount}</p>
                    <p>3. Take a screenshot of the payment confirmation</p>
                    <p>4. Send the screenshot via WhatsApp</p>
                    <p>5. Wait for payment verification (2-4 hours)</p>
                  </div>

                  {/* UPI String */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Or copy UPI payment string:
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={generateUPIString()}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                      />
                      <button
                        onClick={copyUPIString}
                        className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        {copiedUPI ? <CheckCircle size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                  
                    {/* Direct UPI Payment Link */}
<div className="mt-4 text-center">
  <a
    href={generateUPIString()}
    className="text-purple-600 underline text-sm font-medium hover:text-purple-800"
  >
    Click here to pay using UPI app
  </a>
  <p className="text-xs text-gray-500 mt-1">(Supported by PhonePe, Google Pay, Paytm, etc.)</p>
</div>


                  {/* WhatsApp Contact */}
                  <div className="mt-6">
                    <button
                      onClick={handleWhatsAppContact}
                      className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                    >
                      <MessageCircle size={20} />
                      <span>Send Payment Screenshot via WhatsApp</span>
                    </button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      WhatsApp: {paymentSettings.whatsappNumber}
                    </p>
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs text-yellow-800">
                        <strong>Important:</strong> Your order will be marked as "Pending Payment Verification" until we confirm your payment. This usually takes 2-4 hours during business hours.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Instructions */}
              {paymentSettings.paymentInstructions && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">{paymentSettings.paymentInstructions}</p>
                </div>
              )}
            </div>
          )}

          {selectedMethod === 'cod' && paymentSettings.codEnabled && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <CreditCard className="mr-2" size={24} />
                Cash on Delivery
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Payment Details:</h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Pay ${totalAmount} when your order arrives</li>
                    <li>• Please keep the exact amount ready</li>
                    <li>• Our delivery partner will collect the payment</li>
                    <li>• You can pay in cash only</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Cash on Delivery orders are subject to verification. 
                    We may call you to confirm your order details.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Proceed Button */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <button
              onClick={handleProceedWithPayment}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
            >
              {selectedMethod === 'cod' ? 'Confirm Order' : 'I have completed the payment'}
            </button>
            
            <p className="text-xs text-gray-500 text-center mt-3">
              By proceeding, you agree to our terms and conditions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
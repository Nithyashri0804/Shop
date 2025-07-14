import React, { useState, useRef } from 'react';
import { Upload, X, QrCode, Loader, CheckCircle } from 'lucide-react';

interface QRCodeUploadProps {
  currentQRUrl: string;
  onQRCodeChange: (url: string) => void;
  businessName: string;
  upiId: string;
}

const QRCodeUpload: React.FC<QRCodeUploadProps> = ({ 
  currentQRUrl, 
  onQRCodeChange, 
  businessName, 
  upiId 
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      // Convert to base64 for storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        onQRCodeChange(base64String);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading QR code:', error);
      alert('Error uploading QR code');
      setUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeQRCode = () => {
    onQRCodeChange('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-800">QR Code Image</h4>
        {currentQRUrl && (
          <button
            onClick={removeQRCode}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Remove QR Code
          </button>
        )}
      </div>

      {currentQRUrl ? (
        <div className="relative">
          <img
            src={currentQRUrl}
            alt="Payment QR Code"
            className="w-48 h-48 object-cover rounded-lg border border-gray-300 mx-auto"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black bg-opacity-50 text-white rounded-lg opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
          >
            <Upload size={24} className="mr-2" />
            Change QR Code
          </button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
          
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader className="animate-spin text-purple-600 mb-4" size={48} />
              <p className="text-gray-600">Uploading QR code...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <QrCode className="text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 mb-2">
                Drag and drop your QR code image here, or{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  browse files
                </button>
              </p>
              <p className="text-sm text-gray-500">
                PNG, JPG, JPEG up to 5MB
              </p>
            </div>
          )}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="font-medium text-blue-800 mb-2">QR Code Guidelines:</h5>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Generate QR code from your UPI app (Google Pay, PhonePe, Paytm, etc.)</li>
          <li>• Include business name: <strong>{businessName}</strong></li>
          <li>• Include UPI ID: <strong>{upiId}</strong></li>
          <li>• Test the QR code before uploading to ensure it works</li>
          <li>• Use high-quality image for better scanning</li>
        </ul>
      </div>
    </div>
  );
};

export default QRCodeUpload;
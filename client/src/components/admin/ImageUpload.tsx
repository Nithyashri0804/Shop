import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react';
import { uploadAPI } from '../../services/api';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  images, 
  onImagesChange, 
  maxImages = 10 
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImages = async (files: FileList) => {
    if (files.length === 0) return;

    // Check if adding these files would exceed the limit
    if (images.length + files.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    
    // Validate and add files
    const validFiles: File[] = [];
    Array.from(files).forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum size is 5MB`);
        return;
      }
      
      validFiles.push(file);
    });

    if (validFiles.length === 0) {
      setUploading(false);
      return;
    }

    // Add valid files to form data
    validFiles.forEach(file => {
      formData.append('images', file);
    });

    try {
      console.log('Uploading images...', validFiles.length);
      console.log('FormData entries:', Array.from(formData.entries()).map(([key, value]) => [key, value instanceof File ? value.name : value]));
      const response = await uploadAPI.uploadImages(formData);
      console.log('Upload response:', response.data);
      
      if (response.data && response.data.images) {
        const newImages = [...images, ...response.data.images];
        onImagesChange(newImages);
        console.log('Images updated:', newImages);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      
      let errorMessage = 'Error uploading images';
      
      if (error.response?.status === 401) {
        errorMessage = 'Please login as admin to upload images';
      } else if (error.response?.status === 403) {
        errorMessage = 'Admin access required to upload images';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data.message || 'Invalid file upload';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
      console.error('Detailed error:', error.response?.data || error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (index: number) => {
    const imageId = images[index];
    
    try {
      console.log('Deleting image:', imageId);
      await uploadAPI.deleteImage(imageId);
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
      console.log('Image deleted successfully');
    } catch (error: any) {
      console.error('Delete error:', error);
      // Still remove from UI even if deletion fails
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
      alert('Failed to delete image from server, but removed from form');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      uploadImages(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files) {
      uploadImages(e.dataTransfer.files);
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

  const getImageUrl = (imageId: string) => {
    // Check if it's already a full URL
    if (imageId.startsWith('http') || imageId.startsWith('data:')) {
      return imageId;
    }
    // Construct the API URL
    return `http://localhost:5000/api/upload/images/${imageId}`;
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
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
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {uploading ? (
          <div className="flex flex-col items-center">
            <Loader className="animate-spin text-purple-600 mb-4" size={48} />
            <p className="text-gray-600">Uploading images...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 mb-2">
              Drag and drop images here, or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                browse files
              </button>
            </p>
            <p className="text-sm text-gray-500">
              PNG, JPG, JPEG up to 5MB each. Maximum {maxImages} images.
            </p>
          </div>
        )}
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((imageId, index) => (
            <div key={imageId} className="relative group">
              <img
                src={getImageUrl(imageId)}
                alt={`Product ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border"
                onError={(e) => {
                  console.error('Image load error:', imageId);
                  const target = e.currentTarget as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBFcnJvcjwvdGV4dD48L3N2Zz4=';
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', imageId);
                }}
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X size={12} />
              </button>
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon size={48} className="mx-auto mb-4 text-gray-400" />
          <p>No images uploaded yet</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
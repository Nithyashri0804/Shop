import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  productName: string;
  className?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ 
  images, 
  productName, 
  className = '' 
}) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState(0);

  const openModal = (index: number) => {
    setModalImage(index);
    setShowModal(true);
  };

  const nextModalImage = () => {
    setModalImage((prev) => (prev + 1) % images.length);
  };

  const prevModalImage = () => {
    setModalImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') nextModalImage();
    if (e.key === 'ArrowLeft') prevModalImage();
  };

  const getImageUrl = (imageId: string) => {
    // Handle different image formats
    if (imageId.startsWith('http') || imageId.startsWith('data:')) {
      return imageId;
    }
    // If it starts with /api/, use it with full server URL
    if (imageId.startsWith('/api/')) {
      return `http://localhost:5000${imageId}`;
    }
    // Otherwise construct the API URL
    return `http://localhost:5000/api/upload/images/${imageId}`;
  };

  if (!images || images.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-2xl flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 bg-gray-300 rounded-lg mx-auto mb-2"></div>
          <p>No image available</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        {/* Main Image */}
        <div className="relative group">
          <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100 cursor-pointer">
            <img
              src={getImageUrl(images[selectedImage])}
              alt={`${productName} - Image ${selectedImage + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onClick={() => openModal(selectedImage)}
            />
          </div>
          
          {/* Zoom indicator */}
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn size={16} />
          </div>

          {/* Navigation arrows for main image */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setSelectedImage((prev) => (prev - 1 + images.length) % images.length)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setSelectedImage((prev) => (prev + 1) % images.length)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>
        
        {/* Thumbnail Grid */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-3">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`aspect-square overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                  selectedImage === index 
                    ? 'border-purple-600 ring-2 ring-purple-200' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img
                  src={getImageUrl(image)}
                  alt={`${productName} - Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="relative max-w-4xl max-h-full">
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X size={32} />
            </button>

            {/* Main modal image */}
            <img
              src={getImageUrl(images[modalImage])}
              alt={`${productName} - Image ${modalImage + 1}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevModalImage();
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-3 transition-all"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextModalImage();
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-3 transition-all"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full">
              {modalImage + 1} / {images.length}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-2 max-w-full overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalImage(index);
                    }}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      modalImage === index 
                        ? 'border-white' 
                        : 'border-transparent opacity-60 hover:opacity-80'
                    }`}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;
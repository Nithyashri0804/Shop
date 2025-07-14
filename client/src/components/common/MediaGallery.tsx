import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface MediaGalleryProps {
  media: any[];
  productName: string;
  className?: string;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ 
  media, 
  productName, 
  className = '' 
}) => {
  const [selectedMedia, setSelectedMedia] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalMedia, setModalMedia] = useState(0);
  const [videoStates, setVideoStates] = useState<{[key: number]: {playing: boolean, muted: boolean}}>({});

  const openModal = (index: number) => {
    setModalMedia(index);
    setShowModal(true);
  };

  const nextModalMedia = () => {
    setModalMedia((prev) => (prev + 1) % media.length);
  };

  const prevModalMedia = () => {
    setModalMedia((prev) => (prev - 1 + media.length) % media.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') nextModalMedia();
    if (e.key === 'ArrowLeft') prevModalMedia();
    if (e.key === 'Escape') setShowModal(false);
  };

  const getMediaUrl = (mediaItem: any) => {
    // Handle different media formats
    if (typeof mediaItem === 'string') {
      // If it's already a full URL, use it directly
      if (mediaItem.startsWith('http') || mediaItem.startsWith('data:')) {
        return mediaItem;
      }
      // If it starts with /api/, use it as is
      if (mediaItem.startsWith('/api/')) {
        return `http://localhost:5000${mediaItem}`;
      }
      // Otherwise construct the API URL
      return `http://localhost:5000/api/upload/media/${mediaItem}`;
    }
    
    // Handle media object format
    if (mediaItem && typeof mediaItem === 'object') {
      // Check for dataUrl first (base64 encoded)
      if (mediaItem.dataUrl) {
        return mediaItem.dataUrl;
      }
      // Check for direct URL
      if (mediaItem.url && (mediaItem.url.startsWith('http') || mediaItem.url.startsWith('data:'))) {
        return mediaItem.url;
      }
      // Use _id to construct API URL
      if (mediaItem._id) {
        return `http://localhost:5000/api/upload/media/${mediaItem._id}`;
      }
    }
    
    // Fallback to placeholder image
    return 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=600';
  };

  const isVideo = (mediaItem: any) => {
    if (typeof mediaItem === 'string') {
      return false; // Legacy images
    }
    return mediaItem.type === 'video' || mediaItem.mimetype?.startsWith('video/');
  };

  const toggleVideoPlay = (index: number, videoElement: HTMLVideoElement) => {
    const currentState = videoStates[index] || { playing: false, muted: true };
    
    if (currentState.playing) {
      videoElement.pause();
    } else {
      videoElement.play();
    }
    
    setVideoStates(prev => ({
      ...prev,
      [index]: { ...currentState, playing: !currentState.playing }
    }));
  };

  const toggleVideoMute = (index: number, videoElement: HTMLVideoElement) => {
    const currentState = videoStates[index] || { playing: false, muted: true };
    videoElement.muted = !currentState.muted;
    
    setVideoStates(prev => ({
      ...prev,
      [index]: { ...currentState, muted: !currentState.muted }
    }));
  };

  if (!media || media.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-2xl flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 bg-gray-300 rounded-lg mx-auto mb-2"></div>
          <p>No media available</p>
        </div>
      </div>
    );
  }

  const currentMedia = media[selectedMedia];
  const currentIsVideo = isVideo(currentMedia);

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        {/* Main Media */}
        <div className="relative group">
          <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100 cursor-pointer">
            {currentIsVideo ? (
              <div className="relative w-full h-full">
                <video
                  src={getMediaUrl(currentMedia)}
                  className="w-full h-full object-cover"
                  controls={false}
                  muted={videoStates[selectedMedia]?.muted !== false}
                  onPlay={() => setVideoStates(prev => ({
                    ...prev,
                    [selectedMedia]: { ...prev[selectedMedia], playing: true }
                  }))}
                  onPause={() => setVideoStates(prev => ({
                    ...prev,
                    [selectedMedia]: { ...prev[selectedMedia], playing: false }
                  }))}
                  onClick={() => openModal(selectedMedia)}
                />
                
                {/* Video Controls Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const video = e.currentTarget.parentElement?.parentElement?.querySelector('video') as HTMLVideoElement;
                      if (video) toggleVideoPlay(selectedMedia, video);
                    }}
                    className="bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-3 mr-2"
                  >
                    {videoStates[selectedMedia]?.playing ? <Pause size={24} /> : <Play size={24} />}
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const video = e.currentTarget.parentElement?.parentElement?.querySelector('video') as HTMLVideoElement;
                      if (video) toggleVideoMute(selectedMedia, video);
                    }}
                    className="bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-3"
                  >
                    {videoStates[selectedMedia]?.muted !== false ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                </div>
              </div>
            ) : (
              <img
                src={getMediaUrl(currentMedia)}
                alt={`${productName} - Media ${selectedMedia + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onClick={() => openModal(selectedMedia)}
              />
            )}
          </div>
          
          {/* Zoom/Play indicator */}
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            {currentIsVideo ? <Play size={16} /> : <ZoomIn size={16} />}
          </div>

          {/* Navigation arrows for main media */}
          {media.length > 1 && (
            <>
              <button
                onClick={() => setSelectedMedia((prev) => (prev - 1 + media.length) % media.length)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setSelectedMedia((prev) => (prev + 1) % media.length)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>
        
        {/* Thumbnail Grid */}
        {media.length > 1 && (
          <div className="grid grid-cols-4 gap-3">
            {media.map((mediaItem, index) => {
              const isVideoThumb = isVideo(mediaItem);
              
              return (
                <button
                  key={index}
                  onClick={() => setSelectedMedia(index)}
                  className={`aspect-square overflow-hidden rounded-lg border-2 transition-all duration-200 relative ${
                    selectedMedia === index 
                      ? 'border-purple-600 ring-2 ring-purple-200' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {isVideoThumb ? (
                    <div className="relative w-full h-full">
                      <video
                        src={getMediaUrl(mediaItem)}
                        className="w-full h-full object-cover"
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                        <Play size={12} className="text-white" />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={getMediaUrl(mediaItem)}
                      alt={`${productName} - Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>
              );
            })}
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
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
            >
              <X size={32} />
            </button>

            {/* Main modal media */}
            {isVideo(media[modalMedia]) ? (
              <video
                src={getMediaUrl(media[modalMedia])}
                className="max-w-full max-h-full object-contain"
                controls
                autoPlay
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <img
                src={getMediaUrl(media[modalMedia])}
                alt={`${productName} - Media ${modalMedia + 1}`}
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            )}

            {/* Navigation */}
            {media.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevModalMedia();
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-3 transition-all"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextModalMedia();
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-3 transition-all"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Media counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full">
              {modalMedia + 1} / {media.length}
            </div>

            {/* Thumbnail strip */}
            {media.length > 1 && (
              <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-2 max-w-full overflow-x-auto">
                {media.map((mediaItem, index) => {
                  const isVideoThumb = isVideo(mediaItem);
                  
                  return (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalMedia(index);
                      }}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all relative ${
                        modalMedia === index 
                          ? 'border-white' 
                          : 'border-transparent opacity-60 hover:opacity-80'
                      }`}
                    >
                      {isVideoThumb ? (
                        <div className="relative w-full h-full">
                          <video
                            src={getMediaUrl(mediaItem)}
                            className="w-full h-full object-cover"
                            muted
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                            <Play size={8} className="text-white" />
                          </div>
                        </div>
                      ) : (
                        <img
                          src={getMediaUrl(mediaItem)}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MediaGallery;
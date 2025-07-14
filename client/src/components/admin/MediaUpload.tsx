import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Video, Loader, Play } from 'lucide-react';
import { uploadAPI } from '../../services/api';

interface MediaUploadProps {
  media: string[];
  onMediaChange: (media: string[]) => void;
  maxFiles?: number;
}

const MediaUpload: React.FC<MediaUploadProps> = ({ 
  media, 
  onMediaChange, 
  maxFiles = 10 
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [mediaDetails, setMediaDetails] = useState<{[key: string]: any}>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMedia = async (files: FileList) => {
    if (files.length === 0) return;

    // Check if adding these files would exceed the limit
    if (media.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    
    // Validate and add files
    const validFiles: File[] = [];
    Array.from(files).forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        alert(`${file.name} is not an image or video file`);
        return;
      }
      
      // Validate file size (10MB for videos, 5MB for images)
      const maxSize = file.type.startsWith('video/') ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
      const maxSizeMB = file.type.startsWith('video/') ? '10MB' : '5MB';
      
      if (file.size > maxSize) {
        alert(`${file.name} is too large. Maximum size is ${maxSizeMB}`);
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
      formData.append('media', file);
    });

    try {
      console.log('Uploading media...', validFiles.length);
      const response = await uploadAPI.uploadMedia(formData);
      console.log('Upload response:', response.data);
      
      if (response.data && response.data.media) {
        const newMedia = [...media, ...response.data.media];
        onMediaChange(newMedia);
        console.log('Media updated:', newMedia);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      
      let errorMessage = 'Error uploading media files';
      
      if (error.response?.status === 401) {
        errorMessage = 'Please login as admin to upload media';
      } else if (error.response?.status === 403) {
        errorMessage = 'Admin access required to upload media';
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

  const removeMedia = async (index: number) => {
    const mediaId = media[index];
    
    try {
      console.log('Deleting media:', mediaId);
      await uploadAPI.deleteMedia(mediaId);
      const newMedia = media.filter((_, i) => i !== index);
      onMediaChange(newMedia);
      console.log('Media deleted successfully');
    } catch (error: any) {
      console.error('Delete error:', error);
      // Still remove from UI even if deletion fails
      const newMedia = media.filter((_, i) => i !== index);
      onMediaChange(newMedia);
      alert('Failed to delete media from server, but removed from form');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      uploadMedia(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files) {
      uploadMedia(e.dataTransfer.files);
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

  const getMediaUrl = (mediaId: string) => {
    // Check if it's already a full URL
    if (mediaId.startsWith('http') || mediaId.startsWith('data:')) {
      return mediaId;
    }
    // Construct the API URL
    return `http://localhost:5000/api/upload/media/${mediaId}`;
  };

  const isVideo = (mediaId: string) => {
    // This is a simple check - in a real app you'd store media type info
    return mediaDetails[mediaId]?.type === 'video' || 
           getMediaUrl(mediaId).includes('video') ||
           mediaId.includes('video');
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
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {uploading ? (
          <div className="flex flex-col items-center">
            <Loader className="animate-spin text-purple-600 mb-4" size={48} />
            <p className="text-gray-600">Uploading media files...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 mb-2">
              Drag and drop images and videos here, or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                browse files
              </button>
            </p>
            <p className="text-sm text-gray-500">
              Images: PNG, JPG, JPEG up to 5MB each<br/>
              Videos: MP4, MOV, AVI up to 10MB each<br/>
              Maximum {maxFiles} files total
            </p>
          </div>
        )}
      </div>

      {/* Media Preview Grid */}
      {media.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {media.map((mediaId, index) => (
            <div key={mediaId} className="relative group">
              {isVideo(mediaId) ? (
                <div className="relative w-full h-32 bg-gray-100 rounded-lg border overflow-hidden">
                  <video
                    src={getMediaUrl(mediaId)}
                    className="w-full h-full object-cover"
                    onLoadedMetadata={(e) => {
                      setMediaDetails(prev => ({
                        ...prev,
                        [mediaId]: { type: 'video', duration: e.currentTarget.duration }
                      }));
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <Play size={24} className="text-white" />
                  </div>
                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white px-1 py-0.5 rounded text-xs">
                    <Video size={12} className="inline mr-1" />
                    Video
                  </div>
                </div>
              ) : (
                <img
                  src={getMediaUrl(mediaId)}
                  alt={`Media ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border"
                  onError={(e) => {
                    console.error('Media load error:', mediaId);
                    const target = e.currentTarget as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5NZWRpYSBFcnJvcjwvdGV4dD48L3N2Zz4=';
                  }}
                  onLoad={() => {
                    setMediaDetails(prev => ({
                      ...prev,
                      [mediaId]: { type: 'image' }
                    }));
                  }}
                />
              )}
              
              <button
                type="button"
                onClick={() => removeMedia(index)}
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

      {media.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon size={48} className="mx-auto mb-4 text-gray-400" />
          <p>No media files uploaded yet</p>
        </div>
      )}
    </div>
  );
};

export default MediaUpload;
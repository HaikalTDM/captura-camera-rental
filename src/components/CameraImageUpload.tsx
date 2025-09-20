'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { 
  uploadMultipleCameraImages, 
  removeCameraImage, 
  setPrimaryCameraImage,
  type CameraImage 
} from '@/lib/api/camera-images';

interface CameraImageUploadProps {
  cameraId: string;
  existingImages: CameraImage[];
  onImagesUpdate: (images: CameraImage[]) => void;
  className?: string;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export default function CameraImageUpload({ 
  cameraId, 
  existingImages, 
  onImagesUpdate, 
  className = '' 
}: CameraImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'File must be an image';
    }
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return 'File size must be less than 5MB';
    }
    
    // Check file format
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Only JPG, PNG, and WebP files are allowed';
    }
    
    return null;
  };

  const handleFiles = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    
    // Validate all files first
    const validFiles: File[] = [];
    const invalidFiles: { file: File; error: string }[] = [];
    
    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        invalidFiles.push({ file, error });
      } else {
        validFiles.push(file);
      }
    });
    
    // Show validation errors
    if (invalidFiles.length > 0) {
      const errorMessages = invalidFiles.map(({ file, error }) => `${file.name}: ${error}`);
      alert(`Some files were rejected:\n${errorMessages.join('\n')}`);
    }
    
    if (validFiles.length === 0) return;
    
    // Initialize upload progress
    const initialProgress: UploadProgress[] = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading'
    }));
    
    setUploadProgress(initialProgress);
    setIsUploading(true);
    
    try {
      // Upload files
      const result = await uploadMultipleCameraImages(validFiles, cameraId);
      
      // Update progress for successful uploads
      setUploadProgress(prev => prev.map(item => {
        const success = result.success.find(s => s.file_size === item.file.size);
        const failed = result.failed.find(f => f.file.name === item.file.name);
        
        if (success) {
          return { ...item, progress: 100, status: 'success' };
        } else if (failed) {
          return { ...item, progress: 0, status: 'error', error: failed.error };
        }
        return item;
      }));
      
      // Update parent component with new images
      const updatedImages = [...existingImages, ...result.success];
      onImagesUpdate(updatedImages);
      
      // Show results
      if (result.success.length > 0) {
        setTimeout(() => {
          alert(`Successfully uploaded ${result.success.length} image(s)!`);
          setUploadProgress([]);
        }, 1000);
      }
      
      if (result.failed.length > 0) {
        const failedMessages = result.failed.map(({ file, error }) => `${file.name}: ${error}`);
        alert(`Failed to upload:\n${failedMessages.join('\n')}`);
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('An error occurred during upload. Please try again.');
      setUploadProgress([]);
    } finally {
      setIsUploading(false);
    }
  }, [cameraId, existingImages, onImagesUpdate]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    try {
      const success = await removeCameraImage(imageId);
      if (success) {
        const updatedImages = existingImages.filter(img => img.id !== imageId);
        onImagesUpdate(updatedImages);
        alert('Image deleted successfully!');
      } else {
        alert('Failed to delete image. Please try again.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('An error occurred while deleting the image.');
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      const success = await setPrimaryCameraImage(cameraId, imageId);
      if (success) {
        const updatedImages = existingImages.map(img => ({
          ...img,
          is_primary: img.id === imageId
        }));
        onImagesUpdate(updatedImages);
        alert('Primary image updated successfully!');
      } else {
        alert('Failed to set primary image. Please try again.');
      }
    } catch (error) {
      console.error('Set primary error:', error);
      alert('An error occurred while setting primary image.');
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <div className="space-y-4">
          <div className="text-4xl">📸</div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upload Camera Images
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop images here, or click to select files
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {isUploading ? 'Uploading...' : 'Select Images'}
            </button>
          </div>
          <p className="text-sm text-gray-500">
            Supports JPG, PNG, WebP • Max 5MB per file • Multiple files allowed
          </p>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Upload Progress</h4>
          {uploadProgress.map((item, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">{item.file.name}</span>
                <span className={`text-sm ${
                  item.status === 'success' ? 'text-green-600' : 
                  item.status === 'error' ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {item.status === 'success' ? '✅ Complete' : 
                   item.status === 'error' ? '❌ Failed' : '⏳ Uploading...'}
                </span>
              </div>
              {item.status === 'uploading' && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              )}
              {item.error && (
                <p className="text-sm text-red-600 mt-1">{item.error}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Current Images</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {existingImages
              .sort((a, b) => a.order_index - b.order_index)
              .map((image) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={image.image_url}
                      alt={image.alt_text || 'Camera image'}
                      fill
                      className="object-cover"
                    />
                    {image.is_primary && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                        Primary
                      </div>
                    )}
                  </div>
                  
                  {/* Image Actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                    {!image.is_primary && (
                      <button
                        onClick={() => handleSetPrimary(image.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium"
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteImage(image.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
      
      {existingImages.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🖼️</div>
          <p>No images uploaded yet. Add some images to showcase this camera!</p>
        </div>
      )}
    </div>
  );
}

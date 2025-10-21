'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import {
  getGalleryImages,
  getGalleryStats,
  addGalleryImage,
  toggleImageStatus as toggleStatus,
  deleteGalleryImage,
  uploadImage,
  type GalleryImage
} from '@/lib/api/gallery';

export default function MobileGalleryPage() {
  const router = useRouter();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'hidden'>('all');
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [newImage, setNewImage] = useState({
    customer: '',
    camera: '',
    location: '',
    alt: ''
  });

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [imagesData, statsData] = await Promise.all([
        getGalleryImages(),
        getGalleryStats()
      ]);
      setImages(imagesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading gallery data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB limit for mobile)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Compress image before setting
    const compressedFile = await compressImage(file);
    setSelectedImage(compressedFile);

    // Create preview URL
    const url = URL.createObjectURL(compressedFile);
    setPreviewUrl(url);
  };

  // Image compression function for faster loading
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions (max 1200px width)
          let width = img.width;
          let height = img.height;
          const maxWidth = 1200;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.8 // 80% quality
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const addImage = async () => {
    if (!selectedImage || !newImage.customer || !newImage.camera || !newImage.location) {
      toast.error('Please fill in all fields and select an image');
      return;
    }

    setIsUploading(true);
    try {
      const imageUrl = await uploadImage(selectedImage);
      if (!imageUrl) {
        toast.error('Failed to upload image. Please try again.');
        return;
      }

      const newImageData = {
        customer_name: newImage.customer,
        camera_used: newImage.camera,
        location: newImage.location,
        image_url: imageUrl,
        alt_text: newImage.alt || `${newImage.customer} with ${newImage.camera}`,
        upload_date: new Date().toISOString().split('T')[0]
      };

      const createdImage = await addGalleryImage(newImageData);
      if (createdImage) {
        await loadData();
        closeAddForm();
        toast.success('Image uploaded successfully! 🎉', {
          duration: 3000,
          icon: '✓',
        });
      } else {
        toast.error('Failed to save image data. Please try again.');
      }
    } catch (error) {
      console.error('Error adding image:', error);
      toast.error('An error occurred while uploading the image.');
    } finally {
      setIsUploading(false);
    }
  };

  const closeAddForm = () => {
    setShowAddForm(false);
    setSelectedImage(null);
    setPreviewUrl('');
    setIsDragOver(false);
    setNewImage({ customer: '', camera: '', location: '', alt: '' });
    document.body.style.overflow = 'auto';
  };

  const toggleImageStatus = async (id: string) => {
    try {
      const success = await toggleStatus(id);
      if (success) {
        await loadData();
        toast.success('Image status updated');
      } else {
        toast.error('Failed to update image status');
      }
    } catch (error) {
      console.error('Error toggling image status:', error);
      toast.error('An error occurred while updating the image');
    }
  };

  const deleteImage = async (id: string) => {
    if (confirm('Delete this image permanently?')) {
      try {
        const success = await deleteGalleryImage(id);
        if (success) {
          await loadData();
          toast.success('Image deleted successfully');
        } else {
          toast.error('Failed to delete image');
        }
      } catch (error) {
        console.error('Error deleting image:', error);
        toast.error('An error occurred while deleting the image');
      }
    }
  };

  const handleImageLoad = (imageId: string) => {
    setLoadedImages(prev => new Set(prev).add(imageId));
  };

  const filteredImages = images.filter(img => {
    if (filter === 'active') return img.is_active;
    if (filter === 'hidden') return !img.is_active;
    return true;
  });

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'} pb-24`}>
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Gallery
            </h1>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Manage carousel images
            </p>
          </div>
          <button
            onClick={() => {
              setShowAddForm(true);
              document.body.style.overflow = 'hidden';
            }}
            className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 transition-all duration-200 active:scale-95"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className={`${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl p-4 shadow-sm`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
              Total
            </p>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {stats.total}
            </p>
          </div>
          <div className={`${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl p-4 shadow-sm`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
              Active
            </p>
            <p className="text-2xl font-bold text-emerald-500">
              {stats.active}
            </p>
          </div>
          <div className={`${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl p-4 shadow-sm`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
              Hidden
            </p>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {stats.inactive}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className={`flex gap-2 p-1.5 ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-100'} rounded-xl`}>
          {(['all', 'active', 'hidden'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold capitalize transition-all duration-200 ${
                filter === tab
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                  : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Images Grid */}
      <div className="px-5 pb-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredImages.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredImages.map((image, index) => (
              <div
                key={image.id}
                className={`${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl overflow-hidden shadow-sm transition-all duration-200 active:scale-[0.98]`}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {/* Image */}
                <div className="aspect-[3/4] bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                  {/* Blur placeholder */}
                  {!loadedImages.has(image.id) && (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 animate-pulse" />
                  )}
                  
                  {/* Actual image - lazy loaded */}
                  <img
                    src={image.image_url}
                    alt={image.alt_text}
                    loading="lazy"
                    onLoad={() => handleImageLoad(image.id)}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                      loadedImages.has(image.id) ? 'opacity-100' : 'opacity-0'
                    } ${!image.is_active ? 'grayscale' : ''}`}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI2NyIgdmlld0JveD0iMCAwIDIwMCAyNjciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjY3IiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPgo=';
                    }}
                  />
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold shadow-lg ${
                      image.is_active
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-500 text-white'
                    }`}>
                      {image.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className={`font-bold text-sm mb-2 truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {image.customer_name}
                  </h3>
                  <div className={`space-y-1 text-xs mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    <p className="truncate">📷 {image.camera_used}</p>
                    <p className="truncate">📍 {image.location}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleImageStatus(image.id)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 active:scale-95 ${
                        image.is_active
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      }`}
                    >
                      {image.is_active ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => deleteImage(image.id)}
                      className="px-3 py-2 rounded-lg text-xs font-bold bg-red-100 text-red-800 hover:bg-red-200 transition-all duration-200 active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className={`w-20 h-20 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} flex items-center justify-center mx-auto mb-4`}>
              <svg className={`w-10 h-10 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              No {filter !== 'all' ? filter : ''} Images
            </h3>
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
              Upload customer photos to get started
            </p>
          </div>
        )}
      </div>

      {/* Add Image Modal */}
      {showAddForm && (
        <div 
          className="fixed inset-0 z-50 flex items-end animate-backdropFadeIn"
          onClick={closeAddForm}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>
          <div 
            className={`relative w-full ${isDarkMode ? 'bg-slate-900' : 'bg-white'} rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-modalSlideUp`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle Bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className={`w-10 h-1 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-300'}`}></div>
            </div>

            {/* Header */}
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Add New Image
              </h2>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Upload a customer photo for the carousel
              </p>
            </div>

            {/* Form */}
            <div className="p-6 space-y-5">
              {/* Image Upload */}
              <div>
                <label className={`block text-sm font-bold mb-2 uppercase tracking-wide ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Upload Image
                </label>
                <div
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 ${
                    isDragOver
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                      : isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-300 bg-slate-50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {previewUrl ? (
                    <div className="space-y-4">
                      <img src={previewUrl} alt="Preview" className="mx-auto h-48 w-auto rounded-xl shadow-lg" />
                      <button
                        onClick={() => {
                          setSelectedImage(null);
                          setPreviewUrl('');
                        }}
                        className="text-red-600 hover:text-red-700 text-sm font-bold"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <div>
                      <svg className={`mx-auto h-12 w-12 mb-3 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <span className={`block text-sm font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {isDragOver ? 'Drop image here' : 'Tap to upload or drag & drop'}
                        </span>
                        <span className={`block text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                          PNG, JPG up to 5MB
                        </span>
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-bold mb-2 uppercase tracking-wide ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={newImage.customer}
                    onChange={(e) => setNewImage({...newImage, customer: e.target.value})}
                    placeholder="e.g., Sarah"
                    className={`w-full p-4 rounded-xl border-2 outline-none text-base font-medium transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500' 
                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-bold mb-3 uppercase tracking-wide ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Camera Used
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Osmo Pocket 3 */}
                    <button
                      type="button"
                      onClick={() => setNewImage({...newImage, camera: 'Osmo Pocket 3'})}
                      className={`relative p-4 rounded-2xl border-2 transition-all duration-300 ${
                        newImage.camera === 'Osmo Pocket 3'
                          ? 'border-blue-500 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 shadow-lg shadow-blue-500/20 scale-105'
                          : isDarkMode 
                            ? 'border-slate-700 bg-slate-800/50 hover:border-slate-600 active:scale-95' 
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300 active:scale-95'
                      }`}
                      style={{
                        transform: newImage.camera === 'Osmo Pocket 3' ? 'scale(1.05)' : 'scale(1)',
                        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                      }}
                    >
                      {/* Selection Indicator */}
                      {newImage.camera === 'Osmo Pocket 3' && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50 animate-bounceIn">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      
                      <div className="flex flex-col items-center gap-2">
                        {/* Camera Icon */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          newImage.camera === 'Osmo Pocket 3'
                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30'
                            : isDarkMode ? 'bg-slate-700' : 'bg-slate-200'
                        }`}>
                          <svg className={`w-6 h-6 transition-colors duration-300 ${
                            newImage.camera === 'Osmo Pocket 3' ? 'text-white' : isDarkMode ? 'text-slate-400' : 'text-slate-600'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                        
                        {/* Camera Name */}
                        <div className="text-center">
                          <p className={`text-sm font-bold transition-colors duration-300 ${
                            newImage.camera === 'Osmo Pocket 3'
                              ? 'text-blue-500'
                              : isDarkMode ? 'text-white' : 'text-slate-900'
                          }`}>
                            Osmo
                          </p>
                          <p className={`text-xs font-semibold transition-colors duration-300 ${
                            newImage.camera === 'Osmo Pocket 3'
                              ? 'text-blue-400'
                              : isDarkMode ? 'text-slate-400' : 'text-slate-600'
                          }`}>
                            Pocket 3
                          </p>
                        </div>
                      </div>
                    </button>

                    {/* Action 5 Pro */}
                    <button
                      type="button"
                      onClick={() => setNewImage({...newImage, camera: 'Action 5 Pro'})}
                      className={`relative p-4 rounded-2xl border-2 transition-all duration-300 ${
                        newImage.camera === 'Action 5 Pro'
                          ? 'border-emerald-500 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 shadow-lg shadow-emerald-500/20 scale-105'
                          : isDarkMode 
                            ? 'border-slate-700 bg-slate-800/50 hover:border-slate-600 active:scale-95' 
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300 active:scale-95'
                      }`}
                      style={{
                        transform: newImage.camera === 'Action 5 Pro' ? 'scale(1.05)' : 'scale(1)',
                        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                      }}
                    >
                      {/* Selection Indicator */}
                      {newImage.camera === 'Action 5 Pro' && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/50 animate-bounceIn">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      
                      <div className="flex flex-col items-center gap-2">
                        {/* Camera Icon */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          newImage.camera === 'Action 5 Pro'
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30'
                            : isDarkMode ? 'bg-slate-700' : 'bg-slate-200'
                        }`}>
                          <svg className={`w-6 h-6 transition-colors duration-300 ${
                            newImage.camera === 'Action 5 Pro' ? 'text-white' : isDarkMode ? 'text-slate-400' : 'text-slate-600'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        
                        {/* Camera Name */}
                        <div className="text-center">
                          <p className={`text-sm font-bold transition-colors duration-300 ${
                            newImage.camera === 'Action 5 Pro'
                              ? 'text-emerald-500'
                              : isDarkMode ? 'text-white' : 'text-slate-900'
                          }`}>
                            Action
                          </p>
                          <p className={`text-xs font-semibold transition-colors duration-300 ${
                            newImage.camera === 'Action 5 Pro'
                              ? 'text-emerald-400'
                              : isDarkMode ? 'text-slate-400' : 'text-slate-600'
                          }`}>
                            5 Pro
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-bold mb-2 uppercase tracking-wide ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Location
                  </label>
                  <input
                    type="text"
                    value={newImage.location}
                    onChange={(e) => setNewImage({...newImage, location: e.target.value})}
                    placeholder="e.g., Kuala Lumpur"
                    className={`w-full p-4 rounded-xl border-2 outline-none text-base font-medium transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500' 
                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className={`p-6 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} flex gap-3`}>
              <button
                onClick={closeAddForm}
                className={`flex-1 py-4 rounded-xl font-bold text-base transition-all duration-200 active:scale-95 ${
                  isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={addImage}
                disabled={!selectedImage || !newImage.customer || !newImage.camera || !newImage.location || isUploading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-xl font-bold text-base transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  'Upload Image'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animated Toast Notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: isDarkMode ? '#1e293b' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#0f172a',
            border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '600',
            padding: '16px 20px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
            style: {
              border: '2px solid #10b981',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
            style: {
              border: '2px solid #ef4444',
            },
          },
        }}
      />
    </div>
  );
}


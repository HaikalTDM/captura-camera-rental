'use client';

import { useState, useEffect } from 'react';
import { type PhotographyGalleryImage } from '@/lib/api/photography-gallery';
import Link from 'next/link';
import ErrorBoundary from '@/components/ErrorBoundary';

// Component for auto-loading admin images
function AdminImageDisplay({ 
  imageId, 
  alt, 
  loadImageUrl, 
  cachedUrl,
  index = 0
}: {
  imageId: string;
  alt: string;
  loadImageUrl: (id: string) => Promise<string | null>;
  cachedUrl?: string;
  index?: number;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(cachedUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const loadImage = async () => {
    if (imageUrl || isLoading) return;
    
    setIsLoading(true);
    try {
      const url = await loadImageUrl(imageId);
      setImageUrl(url);
      if (!url) setError(true);
    } catch (err) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-load images with staggered delays
  useEffect(() => {
    if (cachedUrl) {
      setImageUrl(cachedUrl);
      return;
    }

    // Load images progressively with delays
    const delay = index * 500; // 500ms delay between each image
    const timer = setTimeout(() => {
      loadImage();
    }, delay);

    return () => clearTimeout(timer);
  }, [cachedUrl, index, imageId]);

  if (error) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-2">⚠️</div>
          <span className="text-gray-500 text-xs">Failed to load</span>
          <button 
            onClick={loadImage}
            className="block mt-1 text-blue-500 text-xs hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        {isLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d4af37] mx-auto mb-2"></div>
            <span className="text-gray-500 text-xs">Loading...</span>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-gray-400 mb-2">📷</div>
            <span className="text-gray-500 text-xs">Preparing to load...</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className="w-full h-full object-cover"
    />
  );
}

function AdminPhotographyGalleryContent() {
  const [images, setImages] = useState<PhotographyGalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'featured'>('all');
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingImage, setEditingImage] = useState<PhotographyGalleryImage | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: 'wedding' as 'wedding' | 'corporate' | 'graduation' | 'portrait' | 'event',
    photographer_name: '',
    location: '',
    shoot_date: '',
    is_featured: false,
    is_active: true
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadImages();
  }, []);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showEditModal) {
        handleCancelEdit();
      }
    };

    if (showEditModal) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showEditModal]);

  const loadImages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Use API endpoint with admin flag to get all images (metadata only)
      const response = await fetch('/api/photography/gallery-new?admin=true');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setImages(data.images || []);
    } catch (error) {
      console.error('Error loading gallery images:', error);
      setError('Failed to load gallery images. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadImageUrl = async (imageId: string) => {
    if (imageUrls[imageId]) return imageUrls[imageId]; // Already loaded
    
    try {
      const response = await fetch(`/api/photography/gallery-new/image/${imageId}`);
      if (response.ok) {
        const data = await response.json();
        setImageUrls(prev => {
          const newUrls = {
            ...prev,
            [imageId]: data.image_url
          };
          // Update progress
          const loadedCount = Object.keys(newUrls).length;
          const totalImages = images.length;
          setLoadingProgress(Math.round((loadedCount / totalImages) * 100));
          return newUrls;
        });
        return data.image_url;
      }
    } catch (error) {
      console.error('Error loading image URL:', error);
    }
    return null;
  };

  const handleToggleActive = async (id: string) => {
    console.log('Toggling active status for image:', id);
    try {
      const response = await fetch(`/api/photography/gallery-new/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'toggle_active' }),
      });
      
      if (response.ok) {
        await loadImages();
      } else {
        console.error('Failed to toggle active status');
      }
    } catch (error) {
      console.error('Error toggling image status:', error);
    }
  };

  const handleToggleFeatured = async (id: string) => {
    console.log('Toggling featured status for image:', id);
    try {
      const response = await fetch(`/api/photography/gallery-new/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'toggle_featured' }),
      });
      
      if (response.ok) {
        await loadImages();
      } else {
        console.error('Failed to toggle featured status');
      }
    } catch (error) {
      console.error('Error toggling featured status:', error);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      console.log('Deleting image:', id, title);
      try {
        const response = await fetch(`/api/photography/gallery-new/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          await loadImages();
        } else {
          console.error('Failed to delete image');
        }
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
  };

  const handleEdit = (image: PhotographyGalleryImage) => {
    console.log('Opening edit modal for image:', image.id, image.title);
    setEditingImage(image);
    setEditForm({
      title: image.title,
      description: image.description || '',
      category: image.category,
      photographer_name: image.photographer_name || '',
      location: image.location || '',
      shoot_date: image.shoot_date || '',
      is_featured: image.is_featured,
      is_active: image.is_active
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingImage) return;

    try {
      setIsSaving(true);
      const response = await fetch(`/api/photography/gallery-new/${editingImage.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          data: editForm
        }),
      });
      
      if (response.ok) {
        await loadImages();
        setShowEditModal(false);
        setEditingImage(null);
      } else {
        console.error('Failed to update image');
      }
    } catch (error) {
      console.error('Error updating image:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    console.log('Closing edit modal');
    setShowEditModal(false);
    setEditingImage(null);
    setEditForm({
      title: '',
      description: '',
      category: 'wedding',
      photographer_name: '',
      location: '',
      shoot_date: '',
      is_featured: false,
      is_active: true
    });
  };

  // Filter images based on current filter
  const filteredImages = images.filter(image => {
    switch (filter) {
      case 'active':
        return image.is_active;
      case 'inactive':
        return !image.is_active;
      case 'featured':
        return image.is_featured && image.is_active;
      default:
        return true;
    }
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      wedding: 'bg-pink-100 text-pink-800',
      corporate: 'bg-blue-100 text-blue-800',
      graduation: 'bg-purple-100 text-purple-800',
      portrait: 'bg-green-100 text-green-800',
      event: 'bg-orange-100 text-orange-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getAspectRatioIcon = (aspectRatio: string) => {
    switch (aspectRatio) {
      case 'portrait':
        return '📱';
      case 'landscape':
        return '🖥️';
      case 'square':
        return '⬜';
      default:
        return '📷';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading gallery images...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Gallery</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadImages}
              className="px-4 py-2 bg-[#d4af37] text-black font-semibold rounded-lg hover:bg-[#d4af37]/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Photography Gallery</h1>
              <p className="mt-2 text-gray-600">Manage your photography portfolio images</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link
                href="/admin/photography/gallery/upload"
                className="inline-flex items-center px-4 py-2 bg-[#d4af37] text-black font-semibold rounded-lg hover:bg-[#d4af37]/90 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Upload New Image
              </Link>
          </div>
        </div>
      </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Images</p>
                <p className="text-2xl font-semibold text-gray-900">{images.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-semibold text-gray-900">{images.filter(img => img.is_active).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Featured</p>
                <p className="text-2xl font-semibold text-gray-900">{images.filter(img => img.is_featured).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-semibold text-gray-900">{images.filter(img => !img.is_active).length}</p>
              </div>
            </div>
          </div>
            </div>

            {/* Filters */}
        <div className="mb-6">
              <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Images', count: images.length },
              { key: 'active', label: 'Active', count: images.filter(img => img.is_active).length },
              { key: 'inactive', label: 'Inactive', count: images.filter(img => !img.is_active).length },
              { key: 'featured', label: 'Featured', count: images.filter(img => img.is_featured).length }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === key
                    ? 'bg-[#d4af37] text-black'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* Loading Progress */}
        {images.length > 0 && loadingProgress < 100 && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">Loading Images...</span>
              <span className="text-sm text-blue-700">{loadingProgress}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Images are loading automatically one by one. You can still interact with loaded images.
            </p>
          </div>
        )}

        {/* Images Grid */}
        {filteredImages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Images Found</h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' 
                ? 'No images have been uploaded yet.' 
                : `No images match the "${filter}" filter.`
              }
            </p>
            {filter === 'all' && (
              <Link
                href="/admin/photography/gallery/upload"
                className="inline-flex items-center px-4 py-2 bg-[#d4af37] text-black font-semibold rounded-lg hover:bg-[#d4af37]/90 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                Upload First Image
              </Link>
            )}
              </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages.map((image, index) => (
              <div key={image.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Image */}
                <div className="relative aspect-square overflow-hidden">
                  <AdminImageDisplay 
                    imageId={image.id}
                    alt={image.alt_text || image.title}
                    loadImageUrl={loadImageUrl}
                    cachedUrl={imageUrls[image.id]}
                    index={index}
                  />
                  
                  {/* Status Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {image.is_featured && (
                      <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
                        ⭐ Featured
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                      image.is_active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {image.is_active ? 'Active' : 'Inactive'}
                    </span>
                    </div>

                  {/* Category Badge */}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${getCategoryColor(image.category)}`}>
                      {image.category}
                    </span>
                </div>
              </div>

                {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{image.title}</h3>
                    <span className="text-lg ml-2" title={`${image.aspect_ratio} aspect ratio`}>
                      {getAspectRatioIcon(image.aspect_ratio)}
                  </span>
                </div>
                
                  {image.description && (
                    <p className="text-gray-600 text-xs line-clamp-2 mb-3">{image.description}</p>
                  )}

                  {/* Metadata */}
                  <div className="space-y-1 text-xs text-gray-500 mb-4">
                    {image.photographer_name && (
                      <div>📸 {image.photographer_name}</div>
                    )}
                    {image.location && (
                      <div>📍 {image.location}</div>
                    )}
                    {image.shoot_date && (
                      <div>📅 {new Date(image.shoot_date).toLocaleDateString()}</div>
                    )}
        </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
            <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Edit button clicked for image:', image.id);
                        handleEdit(image);
                      }}
                      className="px-3 py-1 text-xs font-medium rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                    >
                      Edit
            </button>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Toggle active button clicked for image:', image.id);
                        handleToggleActive(image.id);
                      }}
                      className={`px-3 py-1 text-xs font-medium rounded ${
                        image.is_active
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {image.is_active ? 'Deactivate' : 'Activate'}
                  </button>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Toggle featured button clicked for image:', image.id);
                        handleToggleFeatured(image.id);
                      }}
                      className={`px-3 py-1 text-xs font-medium rounded ${
                        image.is_featured
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {image.is_featured ? 'Unfeature' : 'Feature'}
                  </button>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Delete button clicked for image:', image.id);
                        handleDelete(image.id, image.title);
                      }}
                      className="px-3 py-1 text-xs font-medium rounded bg-red-100 text-red-700 hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

        {/* Edit Modal */}
        {showEditModal && editingImage && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div 
                className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-white px-6 pt-6 pb-4">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Edit Image Details</h3>
                    <button onClick={handleCancelEdit} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                  <div className="space-y-4">
                  {/* Image Preview */}
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={editingImage.image_url}
                          alt={editingImage.title}
                          className="w-full h-full object-cover"
                    />
                  </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{editingImage.title}</h4>
                        <p className="text-sm text-gray-500">Current image preview</p>
                      </div>
                    </div>
                    
                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
                          placeholder="Enter image title"
                      />
                    </div>
                    
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                        <select 
                          value={editForm.category}
                          onChange={(e) => setEditForm({...editForm, category: e.target.value as any})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
                        >
                          <option value="wedding">Wedding</option>
                          <option value="corporate">Corporate</option>
                          <option value="graduation">Graduation</option>
                          <option value="portrait">Portrait</option>
                          <option value="event">Event</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        rows={3}
                        value={editForm.description}
                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
                        placeholder="Enter image description"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Photographer Name</label>
                        <input
                          type="text"
                          value={editForm.photographer_name}
                          onChange={(e) => setEditForm({...editForm, photographer_name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
                          placeholder="Enter photographer name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <input
                          type="text"
                          value={editForm.location}
                          onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
                          placeholder="Enter location"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Shoot Date</label>
                      <input 
                        type="date"
                        value={editForm.shoot_date}
                        onChange={(e) => setEditForm({...editForm, shoot_date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="is_featured"
                          checked={editForm.is_featured}
                          onChange={(e) => setEditForm({...editForm, is_featured: e.target.checked})}
                          className="h-4 w-4 text-[#d4af37] focus:ring-[#d4af37] border-gray-300 rounded"
                        />
                        <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-900">
                          Featured Image
                        </label>
                        </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="is_active"
                          checked={editForm.is_active}
                          onChange={(e) => setEditForm({...editForm, is_active: e.target.checked})}
                          className="h-4 w-4 text-[#d4af37] focus:ring-[#d4af37] border-gray-300 rounded"
                        />
                        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                          Active (Visible on website)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={isSaving || !editForm.title.trim()}
                    className="px-6 py-2 bg-[#d4af37] text-black font-semibold rounded-lg hover:bg-[#d4af37]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
    </div>
  );
}

export default function AdminPhotographyGalleryPage() {
  return (
    <ErrorBoundary>
      <AdminPhotographyGalleryContent />
    </ErrorBoundary>
  );
}
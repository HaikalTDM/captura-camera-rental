'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Using the existing gallery images structure
import { galleryImages as publicGalleryImages, type GalleryImage } from '@/components/PhotographyGallery';

interface AdminGalleryImage extends GalleryImage {
  uploadedBy: string;
  uploadDate: string;
  fileSize: number;
  dimensions: string;
  isPublic: boolean;
  clientId?: string;
  eventId?: string;
}

interface GalleryStats {
  totalImages: number;
  publicImages: number;
  privateImages: number;
  totalStorage: number;
  categoryCounts: Record<string, number>;
}

export default function GalleryManagement() {
  const [mounted, setMounted] = useState(false);
  const [images, setImages] = useState<AdminGalleryImage[]>([]);
  const [stats, setStats] = useState<GalleryStats>({
    totalImages: 0,
    publicImages: 0,
    privateImages: 0,
    totalStorage: 0,
    categoryCounts: {}
  });
  
  const [selectedCategory, setSelectedCategory] = useState<'all' | GalleryImage['category']>('all');
  const [selectedVisibility, setSelectedVisibility] = useState<'all' | 'public' | 'private'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<AdminGalleryImage | null>(null);

  // Convert public gallery images to admin format with mock data
  useEffect(() => {
    const adminImages: AdminGalleryImage[] = publicGalleryImages.map((img, index) => ({
      ...img,
      uploadedBy: 'Photography Admin',
      uploadDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      fileSize: Math.floor(Math.random() * 5000000) + 1000000, // 1-6MB
      dimensions: img.aspect === 'portrait' ? '1080x1350' : img.aspect === 'landscape' ? '1350x1080' : '1080x1080',
      isPublic: Math.random() > 0.3, // 70% public
      clientId: Math.random() > 0.5 ? `client-${index + 1}` : undefined,
      eventId: Math.random() > 0.5 ? `event-${index + 1}` : undefined
    }));
    
    setImages(adminImages);
    
    // Calculate stats
    const totalImages = adminImages.length;
    const publicImages = adminImages.filter(img => img.isPublic).length;
    const privateImages = totalImages - publicImages;
    const totalStorage = adminImages.reduce((sum, img) => sum + img.fileSize, 0);
    const categoryCounts = adminImages.reduce((acc, img) => {
      acc[img.category] = (acc[img.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    setStats({
      totalImages,
      publicImages,
      privateImages,
      totalStorage,
      categoryCounts
    });
    
    setMounted(true);
  }, []);

  const filteredImages = images.filter(image => {
    const matchesCategory = selectedCategory === 'all' || image.category === selectedCategory;
    const matchesVisibility = selectedVisibility === 'all' || 
      (selectedVisibility === 'public' && image.isPublic) ||
      (selectedVisibility === 'private' && !image.isPublic);
    const matchesSearch = image.alt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesVisibility && matchesSearch;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  const selectAllImages = () => {
    setSelectedImages(filteredImages.map(img => img.id.toString()));
  };

  const clearSelection = () => {
    setSelectedImages([]);
  };

  const toggleImageVisibility = (imageId: string) => {
    setImages(prev => prev.map(img => 
      img.id.toString() === imageId 
        ? { ...img, isPublic: !img.isPublic }
        : img
    ));
  };

  const deleteSelectedImages = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedImages.length} image(s)?`)) {
      setImages(prev => prev.filter(img => !selectedImages.includes(img.id.toString())));
      setSelectedImages([]);
    }
  };

  const bulkToggleVisibility = (makePublic: boolean) => {
    setImages(prev => prev.map(img => 
      selectedImages.includes(img.id.toString())
        ? { ...img, isPublic: makePublic }
        : img
    ));
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gallery management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gallery Management</h1>
              <p className="text-sm text-gray-500 mt-1">Upload, organize, and manage your photography portfolio</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/photography/gallery/upload"
                className="px-4 py-2 bg-[#d4af37] text-black font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-[#d4af37]/90 transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Upload Photos</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Gallery Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide">Total Images</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalImages}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide">Public</p>
                <p className="text-3xl font-bold text-green-600">{stats.publicImages}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide">Private</p>
                <p className="text-3xl font-bold text-orange-600">{stats.privateImages}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide">Storage Used</p>
                <p className="text-2xl font-bold text-purple-600">{formatFileSize(stats.totalStorage)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide">Categories</p>
                <p className="text-3xl font-bold text-[#d4af37]">{Object.keys(stats.categoryCounts).length}</p>
              </div>
              <div className="w-12 h-12 bg-[#d4af37]/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
          <div className="flex flex-col space-y-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search images by title, description, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex flex-wrap gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
                >
                  <option value="all">All Categories</option>
                  <option value="wedding">Wedding ({stats.categoryCounts.wedding || 0})</option>
                  <option value="corporate">Corporate ({stats.categoryCounts.corporate || 0})</option>
                  <option value="graduation">Graduation ({stats.categoryCounts.graduation || 0})</option>
                  <option value="portrait">Portrait ({stats.categoryCounts.portrait || 0})</option>
                  <option value="event">Event ({stats.categoryCounts.event || 0})</option>
                </select>

                <select
                  value={selectedVisibility}
                  onChange={(e) => setSelectedVisibility(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
                >
                  <option value="all">All Images</option>
                  <option value="public">Public Only</option>
                  <option value="private">Private Only</option>
                </select>
              </div>

              {/* Selection Actions */}
              {selectedImages.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{selectedImages.length} selected</span>
                  <button
                    onClick={() => bulkToggleVisibility(true)}
                    className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-md hover:bg-green-200"
                  >
                    Make Public
                  </button>
                  <button
                    onClick={() => bulkToggleVisibility(false)}
                    className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-md hover:bg-orange-200"
                  >
                    Make Private
                  </button>
                  <button
                    onClick={deleteSelectedImages}
                    className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-md hover:bg-red-200"
                  >
                    Delete
                  </button>
                  <button
                    onClick={clearSelection}
                    className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-md hover:bg-gray-200"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Bulk Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={selectAllImages}
                className="text-sm text-[#d4af37] hover:text-[#d4af37]/80"
              >
                Select All ({filteredImages.length})
              </button>
              <p className="text-sm text-gray-500">
                Showing {filteredImages.length} of {images.length} images
              </p>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredImages.map((image) => (
            <div 
              key={image.id}
              className={`group relative bg-white rounded-xl shadow-sm border-2 transition-all duration-300 hover:shadow-lg ${
                selectedImages.includes(image.id.toString()) 
                  ? 'border-[#d4af37] ring-2 ring-[#d4af37]/20' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Selection Checkbox */}
              <div className="absolute top-3 left-3 z-10">
                <input
                  type="checkbox"
                  checked={selectedImages.includes(image.id.toString())}
                  onChange={() => toggleImageSelection(image.id.toString())}
                  className="w-5 h-5 text-[#d4af37] bg-white border-gray-300 rounded focus:ring-[#d4af37] focus:ring-2"
                />
              </div>

              {/* Visibility Toggle */}
              <div className="absolute top-3 right-3 z-10">
                <button
                  onClick={() => toggleImageVisibility(image.id.toString())}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    image.isPublic 
                      ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                      : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                  }`}
                  title={image.isPublic ? 'Public - Click to make private' : 'Private - Click to make public'}
                >
                  {image.isPublic ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Image */}
              <div 
                className={`relative overflow-hidden rounded-t-xl cursor-pointer ${
                  image.aspect === 'portrait' 
                    ? 'aspect-[3/4]' 
                    : image.aspect === 'landscape' 
                    ? 'aspect-[4/3]' 
                    : 'aspect-square'
                }`}
                onClick={() => {
                  setSelectedImage(image);
                  setShowImageModal(true);
                }}
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 text-sm truncate">
                    {image.title || image.alt}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    image.category === 'wedding' ? 'bg-pink-100 text-pink-800' :
                    image.category === 'corporate' ? 'bg-blue-100 text-blue-800' :
                    image.category === 'graduation' ? 'bg-purple-100 text-purple-800' :
                    image.category === 'portrait' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {image.category}
                  </span>
                </div>
                
                <div className="space-y-1 text-xs text-gray-500">
                  <p>{image.dimensions} • {formatFileSize(image.fileSize)}</p>
                  <p>Uploaded {new Date(image.uploadDate).toLocaleDateString()}</p>
                  {image.clientId && <p>Client ID: {image.clientId}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredImages.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
            <p className="text-gray-500 mb-4">No images match your current filters.</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-4 py-2 bg-[#d4af37] text-black font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-[#d4af37]/90 transition-colors"
            >
              Upload Your First Photo
            </button>
          </div>
        )}
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowUploadModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Upload Photos</h3>
                  <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#d4af37] transition-colors">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-lg font-medium text-gray-900 mb-2">Drop your photos here</p>
                  <p className="text-sm text-gray-500 mb-4">or click to browse your files</p>
                  <button className="px-6 py-2 bg-[#d4af37] text-black font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-[#d4af37]/90 transition-colors">
                    Select Photos
                  </button>
                  <p className="text-xs text-gray-400 mt-4">Supports: JPG, PNG, HEIC • Max 10MB per file</p>
                </div>

                {/* Upload Options */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]">
                      <option value="wedding">Wedding</option>
                      <option value="corporate">Corporate</option>
                      <option value="graduation">Graduation</option>
                      <option value="portrait">Portrait</option>
                      <option value="event">Event</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]">
                      <option value="public">Public (Show on website)</option>
                      <option value="private">Private (Admin only)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client ID (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g., ahmad-siti-wedding-2024"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
                  />
                  <p className="text-xs text-gray-500 mt-1">Link photos to a specific client for private galleries</p>
                </div>
              </div>
              
              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button className="px-6 py-2 bg-[#d4af37] text-black font-bold rounded-lg hover:bg-[#d4af37]/90">
                  Start Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Detail Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-black bg-opacity-90" onClick={() => setShowImageModal(false)}></div>
            
            <div className="inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">Image Details</h3>
                  <button onClick={() => setShowImageModal(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                  {/* Image Preview */}
                  <div className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={selectedImage.url}
                      alt={selectedImage.alt}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  {/* Image Info */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <input 
                        type="text" 
                        defaultValue={selectedImage.title || selectedImage.alt}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea 
                        rows={3}
                        defaultValue={selectedImage.description}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select 
                          defaultValue={selectedImage.category}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
                        >
                          <option value="wedding">Wedding</option>
                          <option value="corporate">Corporate</option>
                          <option value="graduation">Graduation</option>
                          <option value="portrait">Portrait</option>
                          <option value="event">Event</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
                        <select 
                          defaultValue={selectedImage.isPublic ? 'public' : 'private'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
                        >
                          <option value="public">Public</option>
                          <option value="private">Private</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Client ID</label>
                      <input 
                        type="text" 
                        defaultValue={selectedImage.clientId || ''}
                        placeholder="e.g., ahmad-siti-wedding-2024"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
                      />
                    </div>
                    
                    {/* Technical Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Technical Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Dimensions:</span>
                          <p className="font-medium">{selectedImage.dimensions}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">File Size:</span>
                          <p className="font-medium">{formatFileSize(selectedImage.fileSize)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Uploaded:</span>
                          <p className="font-medium">{new Date(selectedImage.uploadDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Uploaded By:</span>
                          <p className="font-medium">{selectedImage.uploadedBy}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex space-x-3">
                      <button className="flex-1 px-4 py-2 bg-[#d4af37] text-black font-bold rounded-lg hover:bg-[#d4af37]/90">
                        Save Changes
                      </button>
                      <button className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50">
                        Delete Image
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

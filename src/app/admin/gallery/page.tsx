'use client';

import { useState, useEffect } from 'react';
import {
  getGalleryImages,
  getGalleryStats,
  addGalleryImage,
  toggleImageStatus as toggleStatus,
  deleteGalleryImage,
  uploadImage,
  type GalleryImage
} from '../../../lib/api/gallery';

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [newImage, setNewImage] = useState({
    customer: '',
    camera: '',
    location: '',
    alt: ''
  });

  // Load images and stats on component mount
  useEffect(() => {
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

  const processFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (10MB limit for Supabase)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setSelectedImage(file);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
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
      alert('Please fill in all fields and select an image');
      return;
    }

    setIsUploading(true);
    try {
      // Upload image to Supabase Storage
      const imageUrl = await uploadImage(selectedImage);
      if (!imageUrl) {
        alert('Failed to upload image. Please try again.');
        return;
      }

      // Add image record to database
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
        // Refresh data
        await loadData();
        setShowAddForm(false);
        setSelectedImage(null);
        setPreviewUrl('');
        setIsDragOver(false);
        setNewImage({ customer: '', camera: '', location: '', alt: '' });
        alert('Image uploaded successfully!');
      } else {
        alert('Failed to save image data. Please try again.');
      }
    } catch (error) {
      console.error('Error adding image:', error);
      alert('An error occurred while uploading the image.');
    } finally {
      setIsUploading(false);
    }
  };

  const toggleImageStatus = async (id: string) => {
    try {
      const success = await toggleStatus(id);
      if (success) {
        await loadData(); // Refresh from database
      } else {
        alert('Failed to update image status');
      }
    } catch (error) {
      console.error('Error toggling image status:', error);
      alert('An error occurred while updating the image');
    }
  };

  const deleteImage = async (id: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      try {
        const success = await deleteGalleryImage(id);
        if (success) {
          await loadData(); // Refresh from database
          alert('Image deleted successfully');
        } else {
          alert('Failed to delete image');
        }
      } catch (error) {
        console.error('Error deleting image:', error);
        alert('An error occurred while deleting the image');
      }
    }
  };

  const activeImages = images.filter(img => img.is_active);
  const inactiveImages = images.filter(img => !img.is_active);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gallery Management</h1>
          <p className="text-gray-600 mt-2">Manage customer photos displayed on the main website carousel</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          + Add New Image
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Images</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{isLoading ? '...' : stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">📸</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Active Images</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{isLoading ? '...' : stats.active}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Hidden Images</p>
              <p className="text-3xl font-bold text-gray-600 mt-2">{isLoading ? '...' : stats.inactive}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">👁️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Image Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Add New Gallery Image</h2>
              <p className="text-gray-600 mt-1">Upload a customer photo to display on the main website</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">Upload Image</label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragOver
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {previewUrl ? (
                    <div className="space-y-4">
                      <img src={previewUrl} alt="Preview" className="mx-auto h-48 w-auto rounded-lg shadow-md" />
                      <button
                        onClick={() => {
                          setSelectedImage(null);
                          setPreviewUrl('');
                        }}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <div>
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="mt-4">
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <span className={`mt-2 block text-sm font-medium ${isDragOver ? 'text-blue-600' : 'text-gray-900'}`}>
                            {isDragOver ? 'Drop image here' : 'Click to upload or drag and drop'}
                          </span>
                          <span className="mt-1 block text-xs text-gray-500">
                            PNG, JPG, GIF up to 5MB
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
                    </div>
                  )}
                </div>
              </div>

              {/* Image Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">Customer Name</label>
                  <input
                    type="text"
                    value={newImage.customer}
                    onChange={(e) => setNewImage({...newImage, customer: e.target.value})}
                    placeholder="e.g., Sarah"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">Camera Used</label>
                  <select
                    value={newImage.camera}
                    onChange={(e) => setNewImage({...newImage, camera: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="">Select camera</option>
                    <option value="Osmo Pocket 3">Osmo Pocket 3</option>
                    <option value="Action 5 Pro">Action 5 Pro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">Location</label>
                  <input
                    type="text"
                    value={newImage.location}
                    onChange={(e) => setNewImage({...newImage, location: e.target.value})}
                    placeholder="e.g., Kuala Lumpur"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">Alt Text (Optional)</label>
                  <input
                    type="text"
                    value={newImage.alt}
                    onChange={(e) => setNewImage({...newImage, alt: e.target.value})}
                    placeholder="Auto-generated if empty"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder:text-gray-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setSelectedImage(null);
                  setPreviewUrl('');
                  setIsDragOver(false);
                  setNewImage({ customer: '', camera: '', location: '', alt: '' });
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-800 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addImage}
                disabled={!selectedImage || !newImage.customer || !newImage.camera || !newImage.location || isUploading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  'Add Image'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Images Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Active Images ({activeImages.length})</h2>
        <p className="text-gray-600 mb-6">These images are currently displayed on the main website carousel</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activeImages.map((image) => (
            <div key={image.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
              <div className="aspect-[3/4] bg-gray-100 relative">
                <img
                  src={image.image_url}
                  alt={image.alt_text}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBDMTA4LjI4NCA3MCA5NS4yODQgNzAgMTAwIDcwWk0xMDAgMTMwQzEwOC4yODQgMTMwIDkxLjcxNiAxMzAgMTAwIDEzMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDEwQzI1LjUyMjggMTAgMzAgMTQuNDc3MiAzMCAyMEMzMCAyNS41MjI4IDI1LjUyMjggMzAgMjAgMzBDMTQuNDc3MiAzMCAxMCAyNS41MjI4IDEwIDIwQzEwIDE0LjQ3NzIgMTQuNDc3MiAxMCAyMCAxMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cjwvc3ZnPgo=';
                  }}
                />
                <div className="absolute top-2 right-2">
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    Active
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{image.customer_name}</h3>
                <div className="space-y-1 text-sm text-gray-600 mb-4">
                  <p><span className="font-medium">Camera:</span> {image.camera_used}</p>
                  <p><span className="font-medium">Location:</span> {image.location}</p>
                  <p><span className="font-medium">Uploaded:</span> {new Date(image.upload_date).toLocaleDateString()}</p>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleImageStatus(image.id)}
                    className="flex-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Hide
                  </button>
                  <button
                    onClick={() => deleteImage(image.id)}
                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {activeImages.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📸</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Images</h3>
            <p className="text-gray-600 mb-4">Upload some customer photos to display on your website</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Add First Image
            </button>
          </div>
        )}
      </div>

      {/* Hidden Images Section */}
      {inactiveImages.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Hidden Images ({inactiveImages.length})</h2>
          <p className="text-gray-600 mb-6">These images are not displayed on the website but are saved in your gallery</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {inactiveImages.map((image) => (
              <div key={image.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow opacity-75">
                <div className="aspect-[3/4] bg-gray-100 relative">
                  <img
                    src={image.image_url}
                    alt={image.alt_text}
                    className="w-full h-full object-cover grayscale"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBDMTA4LjI4NCA3MCA5NS4yODQgNzAgMTAwIDcwWk0xMDAgMTMwQzEwOC4yODQgMTMwIDkxLjcxNiAxMzAgMTAwIDEzMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDEwQzI1LjUyMjggMTAgMzAgMTQuNDc3MiAzMCAyMEMzMCAyNS41MjI4IDI1LjUyMjggMzAgMjAgMzBDMTQuNDc3MiAzMCAxMCAyNS41MjI4IDEwIDIwQzEwIDE0LjQ3NzIgMTQuNDc3MiAxMCAyMCAxMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cjwvc3ZnPgo=';
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Hidden
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{image.customer_name}</h3>
                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                    <p><span className="font-medium">Camera:</span> {image.camera_used}</p>
                    <p><span className="font-medium">Location:</span> {image.location}</p>
                    <p><span className="font-medium">Uploaded:</span> {new Date(image.upload_date).toLocaleDateString()}</p>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleImageStatus(image.id)}
                      className="flex-1 bg-green-100 hover:bg-green-200 text-green-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Show
                    </button>
                    <button
                      onClick={() => deleteImage(image.id)}
                      className="flex-1 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

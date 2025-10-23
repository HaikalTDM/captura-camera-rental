'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAllCameras, createCameraRecord, updateCamera, deleteCamera, getAllBookings } from '@/lib/api/bookings';
import { uploadImage } from '@/lib/api/gallery';
import type { Camera, Booking } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function MobileCameraManagementPage() {
  const router = useRouter();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    type: 'action' as Camera['type'],
    daily_rate: 0,
    weekly_rate: 0,
    monthly_rate: 0,
    deposit_amount: 100,
    description: '',
    specifications: {},
    image_url: '',
    is_available: true,
    total_quantity: 1,
    available_quantity: 1,
    display_order: 999,
    condition: 'excellent' as Camera['condition'],
    serial_number: '',
    purchase_price: 0,
    location: 'Kuala Lumpur',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [camerasData, bookingsData] = await Promise.all([
        getAllCameras(),
        getAllBookings()
      ]);
      
      console.log('🔍 RAW data from getAllCameras():');
      console.table(camerasData.map(c => ({ 
        name: c.name, 
        display_order: c.display_order 
      })));
      
      // Sort cameras by display_order
      const sortedCameras = [...camerasData].sort((a, b) => {
        const orderA = a.display_order ?? 999;
        const orderB = b.display_order ?? 999;
        console.log(`Comparing: "${a.name}" (${orderA}) vs "${b.name}" (${orderB}) = ${orderA - orderB}`);
        return orderA - orderB;
      });
      
      console.log('📸 SORTED cameras:');
      console.table(sortedCameras.map(c => ({ 
        name: c.name, 
        display_order: c.display_order 
      })));
      
      setCameras(sortedCameras);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load cameras');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCamera = async () => {
    if (!formData.name || !formData.model || !formData.brand) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const newCamera = await createCameraRecord(formData);
      if (newCamera) {
        setCameras([...cameras, newCamera]);
        toast.success(`${formData.name} added successfully! 🎉`);
        resetForm();
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Error adding camera:', error);
      toast.error('Failed to add camera');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCamera = async () => {
    if (!selectedCamera) return;

    setIsSubmitting(true);
    try {
      const updated = await updateCamera(selectedCamera.id, formData);
      if (updated) {
        setCameras(cameras.map(c => c.id === selectedCamera.id ? updated : c));
        toast.success('Camera updated successfully!');
        resetForm();
        setSelectedCamera(null);
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Error updating camera:', error);
      toast.error('Failed to update camera');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCamera = async (camera: Camera) => {
    if (!confirm(`Delete ${camera.name}? This cannot be undone.`)) return;

    try {
      const success = await deleteCamera(camera.id);
      if (success) {
        setCameras(cameras.filter(c => c.id !== camera.id));
        toast.success('Camera deleted');
      }
    } catch (error) {
      console.error('Error deleting camera:', error);
      toast.error('Failed to delete camera');
    }
  };

  const openEditModal = (camera: Camera) => {
    setSelectedCamera(camera);
    setFormData({
      name: camera.name,
      brand: camera.brand,
      model: camera.model,
      type: camera.type,
      daily_rate: camera.daily_rate,
      weekly_rate: camera.weekly_rate,
      monthly_rate: camera.monthly_rate,
      deposit_amount: camera.deposit_amount,
      description: camera.description,
      specifications: camera.specifications,
      image_url: camera.image_url,
      is_available: camera.is_available,
      total_quantity: camera.total_quantity,
      available_quantity: camera.available_quantity,
      display_order: camera.display_order || 999,
      condition: camera.condition || 'excellent',
      serial_number: camera.serial_number || '',
      purchase_price: camera.purchase_price || 0,
      location: camera.location || 'Kuala Lumpur',
      notes: camera.notes || ''
    });
    setImagePreview(camera.image_url || null);
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      model: '',
      type: 'action',
      daily_rate: 0,
      weekly_rate: 0,
      monthly_rate: 0,
      deposit_amount: 100,
      description: '',
      specifications: {},
      image_url: '',
      is_available: true,
      total_quantity: 1,
      available_quantity: 1,
      display_order: 999,
      condition: 'excellent',
      serial_number: '',
      purchase_price: 0,
      location: 'Kuala Lumpur',
      notes: ''
    });
    setSelectedCamera(null);
    setImagePreview(null);
  };

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
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
            0.85 // 85% quality for cameras
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setIsUploadingImage(true);
    try {
      // Compress image first
      const compressedFile = await compressImage(file);
      
      // Upload compressed image
      const imageUrl = await uploadImage(compressedFile);
      if (imageUrl) {
        setFormData({ ...formData, image_url: imageUrl });
        setImagePreview(imageUrl);
        toast.success('✅ Image uploaded successfully!');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error uploading image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const getCameraMetrics = (cameraId: string) => {
    const cameraBookings = bookings.filter(b => b.camera_id === cameraId);
    const completedBookings = cameraBookings.filter(b => b.status === 'completed');
    const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.final_payment_amount || 0), 0);
    
    return {
      totalBookings: cameraBookings.length,
      totalRevenue: totalRevenue
    };
  };

  const stats = {
    total: cameras.length,
    available: cameras.filter(c => c.is_available && c.available_quantity > 0).length,
    rented: cameras.filter(c => c.available_quantity === 0).length,
    maintenance: cameras.filter(c => !c.is_available).length
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-black to-slate-900 text-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-black flex-1 text-center">Camera Management</h1>
          <div className="w-10"></div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center">
            <div className="text-2xl font-black">{stats.total}</div>
            <div className="text-xs text-slate-300 font-semibold">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-green-400">{stats.available}</div>
            <div className="text-xs text-slate-300 font-semibold">Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-blue-400">{stats.rented}</div>
            <div className="text-xs text-slate-300 font-semibold">Rented</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-yellow-400">{stats.maintenance}</div>
            <div className="text-xs text-slate-300 font-semibold">Maintenance</div>
          </div>
        </div>
      </div>

      {/* Add Button */}
      <div className="p-4">
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="w-full bg-black text-white font-black py-4 rounded-xl hover:scale-105 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add New Camera</span>
        </button>
      </div>

      {/* Camera List */}
      <div className="px-4 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl h-40 animate-pulse"></div>
            ))}
          </div>
        ) : cameras.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
            </div>
            <p className="text-slate-600 font-bold">No cameras yet</p>
            <p className="text-sm text-slate-500 mt-1">Add your first camera to get started</p>
          </div>
        ) : (
          cameras.map((camera) => {
            const metrics = getCameraMetrics(camera.id);
            return (
              <div 
                key={camera.id} 
                className="relative bg-white rounded-xl shadow-md p-4 border-2 border-slate-200 hover:border-slate-300 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-black">{camera.name}</h3>
                    <p className="text-sm text-slate-600 font-semibold">{camera.brand} • {camera.model}</p>
                    <p className="text-xs text-slate-500 mt-1">ID: {camera.id}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-xs font-black ${
                    camera.is_available && camera.available_quantity > 0
                      ? 'bg-green-100 text-green-800'
                      : camera.available_quantity === 0
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {camera.is_available && camera.available_quantity > 0
                      ? 'Available'
                      : camera.available_quantity === 0
                      ? 'Rented'
                      : 'Unavailable'
                    }
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-3 gap-3 mb-3 bg-slate-50 rounded-lg p-3">
                  <div>
                    <div className="text-xs text-slate-500 font-semibold">Daily</div>
                    <div className="text-sm font-black text-black">RM{camera.daily_rate}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-semibold">Weekly</div>
                    <div className="text-sm font-black text-black">RM{camera.weekly_rate}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-semibold">Monthly</div>
                    <div className="text-sm font-black text-black">RM{camera.monthly_rate}</div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-blue-50 rounded-lg p-2">
                    <div className="text-xs text-blue-600 font-semibold">Total Bookings</div>
                    <div className="text-lg font-black text-blue-900">{metrics.totalBookings}</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2">
                    <div className="text-xs text-green-600 font-semibold">Revenue</div>
                    <div className="text-lg font-black text-green-900">RM{metrics.totalRevenue}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(camera)}
                    className="flex-1 bg-black text-white font-bold py-2 rounded-lg hover:scale-105 transition-all active:scale-95 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCamera(camera)}
                    className="px-4 bg-red-100 text-red-600 font-bold py-2 rounded-lg hover:bg-red-200 transition-all active:scale-95 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end animate-fadeIn" onClick={() => !isSubmitting && setShowAddModal(false)}>
          <div
            className="bg-white w-full max-h-[90vh] overflow-y-auto rounded-t-3xl animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-black">
                {selectedCamera ? 'Edit Camera' : 'Add New Camera'}
              </h2>
              <button
                onClick={() => !isSubmitting && setShowAddModal(false)}
                className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <div className="p-4 space-y-4">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-black text-black mb-2">Camera Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., DJI Osmo Pocket 3 Creator Combo"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent text-black font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-black text-black mb-2">Brand *</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    placeholder="e.g., DJI"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent text-black font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-black mb-2">Model *</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    placeholder="e.g., Osmo Pocket 3"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent text-black font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-black text-black mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as Camera['type']})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent text-black font-semibold bg-white"
                  >
                    <option value="action">Action</option>
                    <option value="mirrorless">Mirrorless</option>
                    <option value="dslr">DSLR</option>
                    <option value="compact">Compact</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-black text-black mb-2">Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({...formData, condition: e.target.value as Camera['condition']})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent text-black font-semibold bg-white"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="needs_repair">Needs Repair</option>
                  </select>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-black text-black">Pricing (RM)</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Daily Rate</label>
                    <input
                      type="number"
                      value={formData.daily_rate}
                      onChange={(e) => setFormData({...formData, daily_rate: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-black text-black font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Weekly Rate</label>
                    <input
                      type="number"
                      value={formData.weekly_rate}
                      onChange={(e) => setFormData({...formData, weekly_rate: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-black text-black font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Monthly Rate</label>
                    <input
                      type="number"
                      value={formData.monthly_rate}
                      onChange={(e) => setFormData({...formData, monthly_rate: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-black text-black font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Deposit</label>
                    <input
                      type="number"
                      value={formData.deposit_amount}
                      onChange={(e) => setFormData({...formData, deposit_amount: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-black text-black font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Inventory */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-black text-black">Inventory</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Total Quantity</label>
                    <input
                      type="number"
                      value={formData.total_quantity}
                      onChange={(e) => setFormData({...formData, total_quantity: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-black text-black font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Available</label>
                    <input
                      type="number"
                      value={formData.available_quantity}
                      onChange={(e) => setFormData({...formData, available_quantity: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-black text-black font-semibold"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_available"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
                    className="w-5 h-5 text-black rounded focus:ring-2 focus:ring-black"
                  />
                  <label htmlFor="is_available" className="text-sm font-bold text-black">
                    Camera is available for rent
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-black text-black mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  placeholder="Describe the camera features and what's included..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent text-black font-semibold resize-none"
                />
              </div>

              {/* Optional Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-black text-black mb-2">Serial Number</label>
                  <input
                    type="text"
                    value={formData.serial_number}
                    onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-black text-black font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-black mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-black text-black font-semibold"
                  />
                </div>
                
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-black text-black mb-2">Camera Image</label>
                  
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="mb-3 relative">
                      <img
                        src={imagePreview}
                        alt="Camera preview"
                        className="w-full h-48 object-cover rounded-xl border-2 border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData({ ...formData, image_url: '' });
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all shadow-lg"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  <label className={`
                    block w-full px-4 py-8 border-2 border-dashed rounded-xl cursor-pointer transition-all
                    ${isUploadingImage ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:border-black hover:bg-slate-50'}
                  `}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploadingImage}
                      className="hidden"
                    />
                    <div className="text-center">
                      {isUploadingImage ? (
                        <>
                          <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-2"></div>
                          <p className="text-sm font-bold text-blue-600">Uploading...</p>
                        </>
                      ) : (
                        <>
                          <svg className="w-12 h-12 mx-auto mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <p className="text-sm font-bold text-black mb-1">
                            {imagePreview ? 'Change Image' : 'Upload Camera Image'}
                          </p>
                          <p className="text-xs text-slate-500">
                            Click to browse • Max 5MB • JPG, PNG, WEBP
                          </p>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-slate-200 -mx-4 px-4">
                <button
                  onClick={selectedCamera ? handleUpdateCamera : handleAddCamera}
                  disabled={isSubmitting}
                  className="w-full bg-black text-white font-black py-4 rounded-xl hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : selectedCamera ? 'Update Camera' : 'Add Camera'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
}

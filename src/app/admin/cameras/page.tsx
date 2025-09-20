'use client';

import { useState, useEffect } from 'react';
import { getAllCameras, getAllBookings } from '@/lib/api/bookings';
import type { Camera, Booking } from '@/lib/supabase';
import Link from 'next/link';

export default function CamerasPage() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCamera, setNewCamera] = useState({
    name: '',
    brand: '',
    model: '',
    type: 'action' as Camera['type'],
    daily_rate: 0,
    weekly_rate: 0,
    monthly_rate: 0,
    deposit_amount: 0,
    description: '',
    specifications: {},
    image_url: ''
  });

  useEffect(() => {
    loadCamerasData();
  }, []);

  const loadCamerasData = async () => {
    setIsLoading(true);
    try {
      const [camerasData, bookingsData] = await Promise.all([
        getAllCameras(),
        getAllBookings()
      ]);
      setCameras(camerasData);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading cameras data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addCamera = async () => {
    try {
      const cameraData = {
        ...newCamera,
        is_available: true,
        total_quantity: 1,
        available_quantity: 1
      };

      // In a real app, you would call createCamera API here
      // const newCameraRecord = await createCamera(cameraData);

      // For now, just add to local state (this should be replaced with API call)
      const camera: Camera = {
        id: `CAM${String(cameras.length + 1).padStart(3, '0')}`,
        ...cameraData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setCameras([...cameras, camera]);
      setNewCamera({
        name: '',
        brand: '',
        model: '',
        type: 'action' as Camera['type'],
        daily_rate: 0,
        weekly_rate: 0,
        monthly_rate: 0,
        deposit_amount: 0,
        description: '',
        specifications: {},
        image_url: ''
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding camera:', error);
    }
  };

  const updateCameraAvailability = (cameraId: string, isAvailable: boolean) => {
    setCameras(prev => prev.map(camera =>
      camera.id === cameraId ? { ...camera, is_available: isAvailable } : camera
    ));
  };

  const getStatusColor = (isAvailable: boolean, availableQuantity: number) => {
    if (!isAvailable) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    if (availableQuantity === 0) {
      return 'bg-blue-100 text-blue-800 border-blue-200'; // All rented
    }
    return 'bg-green-100 text-green-800 border-green-200'; // Available
  };

  const getStatusText = (isAvailable: boolean, availableQuantity: number, totalQuantity: number) => {
    if (!isAvailable) return 'Unavailable';
    if (availableQuantity === 0) return 'All Rented';
    if (availableQuantity < totalQuantity) return `${availableQuantity}/${totalQuantity} Available`;
    return 'Available';
  };



  // Get current rental info for each camera
  const getCameraRentalInfo = (cameraId: string) => {
    const activeBooking = bookings.find(
      booking => booking.camera_id === cameraId && booking.status === 'active'
    );
    return activeBooking;
  };

  const statusCounts = {
    available: cameras.filter(c => c.status === 'available').length,
    rented: cameras.filter(c => c.status === 'rented').length,
    maintenance: cameras.filter(c => c.status === 'maintenance').length,
    reserved: cameras.filter(c => c.status === 'reserved').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Camera Inventory</h1>
            <p className="text-blue-100 text-lg">Manage your camera equipment and availability</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <p className="text-blue-100 text-sm">Total Cameras</p>
            <p className="text-2xl font-bold">{cameras.length}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Available</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{statusCounts.available}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Rented</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{statusCounts.rented}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📷</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Maintenance</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{statusCounts.maintenance}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🔧</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Reserved</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{statusCounts.reserved}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Camera Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          ➕ Add New Camera
        </button>
      </div>

      {/* Add Camera Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Camera</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Camera Name</label>
              <input
                type="text"
                value={newCamera.name}
                onChange={(e) => setNewCamera({...newCamera, name: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="e.g., DJI Osmo Pocket 3 Creator Combo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
              <input
                type="text"
                value={newCamera.model}
                onChange={(e) => setNewCamera({...newCamera, model: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="e.g., Osmo Pocket 3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Daily Rate (RM)</label>
              <input
                type="number"
                value={newCamera.dailyRate}
                onChange={(e) => setNewCamera({...newCamera, dailyRate: Number(e.target.value)})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="50"
              />
            </div>

          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={addCamera}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Add Camera
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Cameras Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cameras.map((camera) => {
          const rentalInfo = getCameraRentalInfo(camera.id);
          return (
            <div key={camera.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{camera.name}</h3>
                  <p className="text-gray-700">{camera.model}</p>
                  <p className="text-sm text-gray-600">ID: {camera.id}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(camera.is_available, camera.available_quantity)}`}>
                    {getStatusText(camera.is_available, camera.available_quantity, camera.total_quantity)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Daily Rate</p>
                  <p className="text-lg font-semibold text-gray-900">RM{camera.daily_rate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Quantity</p>
                  <p className="text-lg font-semibold text-gray-900">{camera.available_quantity}/{camera.total_quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Maintenance</p>
                  <p className="text-sm text-gray-900">{camera.lastMaintenance}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Revenue</p>
                  <p className="text-lg font-semibold text-green-600">RM{camera.totalRentals * camera.dailyRate}</p>
                </div>
              </div>

              {rentalInfo && (
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-blue-900">Currently rented by:</p>
                  <p className="text-blue-800">{rentalInfo.customerName}</p>
                  <p className="text-sm text-blue-600">Return: {rentalInfo.endDate}</p>
                </div>
              )}

              <div className="flex gap-2">
                <select
                  value={camera.status}
                  onChange={(e) => updateCameraStatus(camera.id, e.target.value as Camera['status'])}
                  className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="available">Available</option>
                  <option value="rented">Rented</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="reserved">Reserved</option>
                </select>
                <Link
                  href={`/admin/cameras/${camera.id}`}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Details
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

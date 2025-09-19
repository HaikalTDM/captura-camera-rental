'use client';

import { useState } from 'react';
import { mockCameras, mockBookings, type Camera } from '@/data/mockAdminData';
import Link from 'next/link';

export default function CamerasPage() {
  const [cameras, setCameras] = useState<Camera[]>(mockCameras);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCamera, setNewCamera] = useState({
    name: '',
    model: '',
    dailyRate: 0,
    condition: 'excellent' as Camera['condition']
  });

  const addCamera = () => {
    const camera: Camera = {
      id: `CAM${String(cameras.length + 1).padStart(3, '0')}`,
      ...newCamera,
      status: 'available',
      lastMaintenance: new Date().toISOString().split('T')[0],
      totalRentals: 0
    };
    setCameras([...cameras, camera]);
    setNewCamera({ name: '', model: '', dailyRate: 0, condition: 'excellent' });
    setShowAddForm(false);
  };

  const updateCameraStatus = (cameraId: string, newStatus: Camera['status']) => {
    setCameras(prev => prev.map(camera => 
      camera.id === cameraId ? { ...camera, status: newStatus } : camera
    ));
  };

  const getStatusColor = (status: Camera['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'rented': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reserved': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConditionColor = (condition: Camera['condition']) => {
    switch (condition) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get current rental info for each camera
  const getCameraRentalInfo = (cameraId: string) => {
    const activeBooking = mockBookings.find(
      booking => booking.cameraId === cameraId && booking.status === 'active'
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., DJI Osmo Pocket 3 Creator Combo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
              <input
                type="text"
                value={newCamera.model}
                onChange={(e) => setNewCamera({...newCamera, model: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Osmo Pocket 3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Daily Rate (RM)</label>
              <input
                type="number"
                value={newCamera.dailyRate}
                onChange={(e) => setNewCamera({...newCamera, dailyRate: Number(e.target.value)})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
              <select
                value={newCamera.condition}
                onChange={(e) => setNewCamera({...newCamera, condition: e.target.value as Camera['condition']})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
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
                  <p className="text-gray-600">{camera.model}</p>
                  <p className="text-sm text-gray-500">ID: {camera.id}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(camera.status)}`}>
                    {camera.status}
                  </span>
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getConditionColor(camera.condition)}`}>
                    {camera.condition}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Daily Rate</p>
                  <p className="text-lg font-semibold text-gray-900">RM{camera.dailyRate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Rentals</p>
                  <p className="text-lg font-semibold text-gray-900">{camera.totalRentals}</p>
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

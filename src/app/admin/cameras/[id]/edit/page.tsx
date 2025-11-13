'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCameraById, updateCamera, deleteCamera, getAllAccessories, linkAccessoryToCamera, removeAccessoryFromCamera } from '@/lib/api/bookings';
import type { Camera, Accessory } from '@/lib/supabase';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';

export default function EditCameraPage() {
  const params = useParams();
  const router = useRouter();
  const cameraId = params.id as string;

  const [camera, setCamera] = useState<Camera | null>(null);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'accessories' | 'maintenance'>('details');

  const [formData, setFormData] = useState({
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
    image_url: '',
    condition: 'excellent' as Camera['condition'],
    serial_number: '',
    purchase_date: '',
    purchase_price: 0,
    warranty_expiry: '',
    location: 'Main Storage',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, [cameraId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cameraData, accessoriesData] = await Promise.all([
        getCameraById(cameraId),
        getAllAccessories()
      ]);

      if (cameraData) {
        setCamera(cameraData);
        setFormData({
          name: cameraData.name || '',
          brand: cameraData.brand || '',
          model: cameraData.model || '',
          type: cameraData.type || 'action',
          daily_rate: cameraData.daily_rate || 0,
          weekly_rate: cameraData.weekly_rate || 0,
          monthly_rate: cameraData.monthly_rate || 0,
          deposit_amount: cameraData.deposit_amount || 0,
          description: cameraData.description || '',
          specifications: cameraData.specifications || {},
          image_url: cameraData.image_url || '',
          condition: cameraData.condition || 'excellent',
          serial_number: cameraData.serial_number || '',
          purchase_date: cameraData.purchase_date || '',
          purchase_price: cameraData.purchase_price || 0,
          warranty_expiry: cameraData.warranty_expiry || '',
          location: cameraData.location || 'Main Storage',
          notes: cameraData.notes || ''
        });
      }
      setAccessories(accessoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!camera) return;

    setIsSaving(true);
    try {
      // Clean up the form data to handle empty date strings and unique constraints
      const cleanedFormData = {
        ...formData,
        // Convert empty date strings to null for PostgreSQL
        purchase_date: formData.purchase_date || null,
        warranty_expiry: formData.warranty_expiry || null,
        // Convert empty serial number to null to avoid unique constraint violation
        serial_number: formData.serial_number?.trim() || null,
        // Ensure numeric fields are properly formatted
        daily_rate: Number(formData.daily_rate) || 0,
        weekly_rate: Number(formData.weekly_rate) || 0,
        monthly_rate: Number(formData.monthly_rate) || 0,
        deposit_amount: Number(formData.deposit_amount) || 0,
        purchase_price: Number(formData.purchase_price) || 0
      };

      const updatedCamera = await updateCamera(camera.id, cleanedFormData);
      if (updatedCamera) {
        router.push(`/admin/cameras/${camera.id}`);
      }
    } catch (error: any) {
      console.error('Error updating camera:', error);

      // Handle specific database errors
      if (error?.code === '23505') {
        if (error?.details?.includes('serial_number')) {
          alert('Error: This serial number is already in use. Please use a unique serial number or leave it empty.');
        } else {
          alert('Error: Duplicate value detected. Please check your input and try again.');
        }
      } else {
        alert('Error updating camera. Please check all fields and try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleAccessoryToggle = async (accessoryId: string, isIncluded: boolean) => {
    if (!camera) return;

    try {
      if (isIncluded) {
        await linkAccessoryToCamera(camera.id, accessoryId, true, 1);
      } else {
        await removeAccessoryFromCamera(camera.id, accessoryId);
      }
      // Reload data to reflect changes
      loadData();
    } catch (error) {
      console.error('Error updating accessory:', error);
    }
  };

  const handleDelete = async () => {
    if (!camera) return;

    setIsDeleting(true);
    try {
      const success = await deleteCamera(camera.id);
      if (success) {
        alert('Camera deleted successfully!');
        router.push('/admin/cameras');
      } else {
        alert('Failed to delete camera. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting camera:', error);
      alert('Error deleting camera. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!camera) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Camera Not Found</h1>
        <Link href="/admin/cameras" className="text-blue-600 hover:text-blue-800">
          ← Back to Cameras
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Camera</h1>
          <p className="text-gray-700 mt-1">Update camera details and manage accessories</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          <Link
            href={`/admin/cameras/${camera.id}`}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'details', name: 'Camera Details', icon: '📷' },
            { id: 'accessories', name: 'Accessories', icon: '🔧' },
            { id: 'maintenance', name: 'Maintenance', icon: '⚙️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              {tab.icon} {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        {activeTab === 'details' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900">Camera Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Camera Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="DJI Osmo Pocket 3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="DJI"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Osmo Pocket 3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as Camera['type']})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="action">Action Camera</option>
                  <option value="mirrorless">Mirrorless</option>
                  <option value="dslr">DSLR</option>
                  <option value="compact">Compact</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Daily Rate (RM)</label>
                <input
                  type="number"
                  value={formData.daily_rate || ''}
                  onChange={(e) => setFormData({...formData, daily_rate: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="50"
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Rate (RM)</label>
                <input
                  type="number"
                  value={formData.weekly_rate || ''}
                  onChange={(e) => setFormData({...formData, weekly_rate: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="300"
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Rate (RM)</label>
                <input
                  type="number"
                  value={formData.monthly_rate || ''}
                  onChange={(e) => setFormData({...formData, monthly_rate: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="1000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Deposit Amount (RM)</label>
              <input
                type="number"
                value={formData.deposit_amount || ''}
                onChange={(e) => setFormData({...formData, deposit_amount: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="200"
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Detailed description of the camera..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="https://example.com/camera-image.jpg"
              />
            </div>
          </div>
        )}

        {activeTab === 'accessories' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900">Manage Accessories</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accessories.map((accessory) => {
                const isLinked = camera.camera_accessories?.some(ca => ca.accessory_id === accessory.id);
                
                return (
                  <div key={accessory.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{accessory.name}</h4>
                        <p className="text-sm text-gray-700">{accessory.type}</p>
                        <p className="text-sm font-medium text-green-600">RM{accessory.daily_rate}/day</p>
                      </div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isLinked}
                          onChange={(e) => handleAccessoryToggle(accessory.id, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Include</span>
                      </label>
                    </div>
                    {accessory.description && (
                      <p className="text-xs text-gray-700">{accessory.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900">Maintenance & Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData({...formData, condition: e.target.value as Camera['condition']})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="needs_repair">Needs Repair</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Serial Number</label>
                <input
                  type="text"
                  value={formData.serial_number}
                  onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="SN123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Date</label>
                <input
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Price (RM)</label>
                <input
                  type="number"
                  value={formData.purchase_price || ''}
                  onChange={(e) => setFormData({...formData, purchase_price: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="2000"
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Warranty Expiry</label>
                <input
                  type="date"
                  value={formData.warranty_expiry}
                  onChange={(e) => setFormData({...formData, warranty_expiry: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Storage Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Main Storage"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Additional notes about this camera..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Delete Camera</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>

            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-medium mb-2">
                Are you sure you want to delete <span className="font-bold">{camera.name}</span>?
              </p>
              <p className="text-xs text-red-600">
                This will permanently remove the camera from your inventory. All associated data will be deleted.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Camera
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

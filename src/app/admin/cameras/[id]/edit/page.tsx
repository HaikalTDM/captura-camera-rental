'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import {
  deleteCamera,
  getAllAccessories,
  getCameraById,
  linkAccessoryToCamera,
  removeAccessoryFromCamera,
  updateCamera,
} from '@/lib/api/bookings';
import type { Accessory, Camera } from '@/lib/supabase';
import { AnimatedToastContainer, useAnimatedToast } from '@/components/ui/animated-toast';

type EditTab = 'details' | 'accessories' | 'maintenance';

export default function EditCameraPage() {
  const params = useParams();
  const router = useRouter();
  const cameraId = params.id as string;
  const { toasts, success, error, removeToast } = useAnimatedToast();

  const [camera, setCamera] = useState<Camera | null>(null);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<EditTab>('details');

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
    notes: '',
  });

  const fieldClasses =
    'w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm font-semibold text-stone-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-white/20 focus:ring-0';
  const labelClasses = 'mb-2 block text-sm font-semibold text-stone-300';
  const sectionClasses = 'rounded-3xl border border-white/5 bg-zinc-900/70 p-6 shadow-lg';

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [cameraData, accessoriesData] = await Promise.all([
        getCameraById(cameraId),
        getAllAccessories(),
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
          notes: cameraData.notes || '',
        });
      }

      setAccessories(accessoriesData);
    } catch (loadError) {
      console.error('Error loading data:', loadError);
      error('Unable to load camera', 'The camera details could not be loaded right now.');
    } finally {
      setIsLoading(false);
    }
  }, [cameraId, error]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleSave = async () => {
    if (!camera) return;

    setIsSaving(true);
    try {
      const cleanedFormData = {
        ...formData,
        purchase_date: formData.purchase_date || null,
        warranty_expiry: formData.warranty_expiry || null,
        serial_number: formData.serial_number?.trim() || null,
        daily_rate: Number(formData.daily_rate) || 0,
        weekly_rate: Number(formData.weekly_rate) || 0,
        monthly_rate: Number(formData.monthly_rate) || 0,
        deposit_amount: Number(formData.deposit_amount) || 0,
        purchase_price: Number(formData.purchase_price) || 0,
      };

      const updatedCamera = await updateCamera(camera.id, cleanedFormData);

      if (!updatedCamera) {
        error('Update failed', 'The camera was not updated. Please try again.');
        return;
      }

      success('Camera updated', 'Your changes were saved successfully.');
      router.push(`/admin/cameras/${camera.id}`);
    } catch (saveError: unknown) {
      console.error('Error updating camera:', saveError);

      const databaseError = saveError as { code?: string; details?: string };

      if (databaseError?.code === '23505') {
        if (databaseError?.details?.includes('serial_number')) {
          error('Duplicate serial number', 'This serial number is already in use. Please use a unique serial number or leave it empty.');
        } else {
          error('Duplicate value detected', 'Please check your input and try again.');
        }
      } else {
        error('Error updating camera', 'Please check all fields and try again.');
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

      await loadData();
      success('Accessories updated', 'The linked accessories were refreshed.');
    } catch (toggleError) {
      console.error('Error updating accessory:', toggleError);
      error('Accessory update failed', 'Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!camera) return;

    setIsDeleting(true);
    try {
      const deleted = await deleteCamera(camera.id);
      if (!deleted) {
        error('Delete failed', 'Failed to delete camera. Please try again.');
        return;
      }

      success('Camera deleted', 'The camera was removed from inventory.');
      router.push('/admin/cameras');
    } catch (deleteError) {
      console.error('Error deleting camera:', deleteError);
      error('Error deleting camera', 'Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <AnimatedToastContainer toasts={toasts} onClose={removeToast} />
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-orange-400" />
      </div>
    );
  }

  if (!camera) {
    return (
      <div className="py-12 text-center">
        <AnimatedToastContainer toasts={toasts} onClose={removeToast} />
        <h1 className="mb-4 text-2xl font-bold text-stone-100">Camera Not Found</h1>
        <Link href="/admin/cameras" className="text-orange-400 transition-colors hover:text-orange-300">
          ← Back to Cameras
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatedToastContainer toasts={toasts} onClose={removeToast} />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-orange-400/80">Fleet Editor</p>
          <h1 className="mt-2 text-3xl font-bold text-stone-100">Edit Camera</h1>
          <p className="mt-1 text-stone-400">Update camera details, linked gear, and maintenance information.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 rounded-xl bg-red-500 px-6 py-2.5 text-white transition-colors hover:bg-red-600"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
          <Link
            href={`/admin/cameras/${camera.id}`}
            className="rounded-xl bg-zinc-700 px-6 py-2.5 text-white transition-colors hover:bg-zinc-600"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-xl bg-orange-500 px-6 py-2.5 font-semibold text-black transition-colors hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="border-b border-white/10">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'details', name: 'Camera Details', icon: '📷' },
            { id: 'accessories', name: 'Accessories', icon: '🔧' },
            { id: 'maintenance', name: 'Maintenance', icon: '⚙️' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as EditTab)}
              className={`border-b-2 px-1 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-orange-400 text-stone-100'
                  : 'border-transparent text-zinc-500 hover:border-white/10 hover:text-stone-300'
              }`}
            >
              {tab.icon} {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div className={sectionClasses}>
        {activeTab === 'details' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-stone-100">Camera Information</h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className={labelClasses}>Camera Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={fieldClasses}
                  placeholder="DJI Osmo Pocket 3"
                />
              </div>

              <div>
                <label className={labelClasses}>Brand</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className={fieldClasses}
                  placeholder="DJI"
                />
              </div>

              <div>
                <label className={labelClasses}>Model</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className={fieldClasses}
                  placeholder="Osmo Pocket 3"
                />
              </div>

              <div>
                <label className={labelClasses}>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Camera['type'] })}
                  className={fieldClasses}
                >
                  <option value="action">Action Camera</option>
                  <option value="mirrorless">Mirrorless</option>
                  <option value="dslr">DSLR</option>
                  <option value="compact">Compact</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <label className={labelClasses}>Daily Rate (RM)</label>
                <input
                  type="number"
                  value={formData.daily_rate || ''}
                  onChange={(e) => setFormData({ ...formData, daily_rate: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                  className={fieldClasses}
                  placeholder="50"
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <label className={labelClasses}>Weekly Rate (RM)</label>
                <input
                  type="number"
                  value={formData.weekly_rate || ''}
                  onChange={(e) => setFormData({ ...formData, weekly_rate: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                  className={fieldClasses}
                  placeholder="300"
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <label className={labelClasses}>Monthly Rate (RM)</label>
                <input
                  type="number"
                  value={formData.monthly_rate || ''}
                  onChange={(e) => setFormData({ ...formData, monthly_rate: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                  className={fieldClasses}
                  placeholder="1000"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className={labelClasses}>Deposit Amount (RM)</label>
              <input
                type="number"
                value={formData.deposit_amount || ''}
                onChange={(e) => setFormData({ ...formData, deposit_amount: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                className={fieldClasses}
                placeholder="200"
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <label className={labelClasses}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className={fieldClasses}
                placeholder="Detailed description of the camera..."
              />
            </div>

            <div>
              <label className={labelClasses}>Image URL</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className={fieldClasses}
                placeholder="https://example.com/camera-image.jpg"
              />
            </div>
          </div>
        )}

        {activeTab === 'accessories' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-stone-100">Manage Accessories</h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {accessories.map((accessory) => {
                const isLinked = camera.camera_accessories?.some((ca) => ca.accessory_id === accessory.id);

                return (
                  <div key={accessory.id} className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-stone-100">{accessory.name}</h4>
                        <p className="text-sm text-zinc-400">{accessory.type}</p>
                        <p className="text-sm font-medium text-green-500">RM{accessory.daily_rate}/day</p>
                      </div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isLinked}
                          onChange={(e) => void handleAccessoryToggle(accessory.id, e.target.checked)}
                          className="rounded border-white/10 bg-zinc-900 text-orange-400 focus:ring-orange-400"
                        />
                        <span className="ml-2 text-sm text-stone-300">Include</span>
                      </label>
                    </div>

                    {accessory.description && (
                      <p className="text-xs text-zinc-500">{accessory.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-stone-100">Maintenance & Details</h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className={labelClasses}>Condition</label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value as Camera['condition'] })}
                  className={fieldClasses}
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="needs_repair">Needs Repair</option>
                </select>
              </div>

              <div>
                <label className={labelClasses}>Serial Number</label>
                <input
                  type="text"
                  value={formData.serial_number}
                  onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                  className={fieldClasses}
                  placeholder="SN123456789"
                />
              </div>

              <div>
                <label className={labelClasses}>Purchase Date</label>
                <input
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                  className={fieldClasses}
                />
              </div>

              <div>
                <label className={labelClasses}>Purchase Price (RM)</label>
                <input
                  type="number"
                  value={formData.purchase_price || ''}
                  onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                  className={fieldClasses}
                  placeholder="2000"
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <label className={labelClasses}>Warranty Expiry</label>
                <input
                  type="date"
                  value={formData.warranty_expiry}
                  onChange={(e) => setFormData({ ...formData, warranty_expiry: e.target.value })}
                  className={fieldClasses}
                />
              </div>

              <div>
                <label className={labelClasses}>Storage Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className={fieldClasses}
                  placeholder="Main Storage"
                />
              </div>
            </div>

            <div>
              <label className={labelClasses}>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className={fieldClasses}
                placeholder="Additional notes about this camera..."
              />
            </div>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15">
                <Trash2 className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-stone-100">Delete Camera</h3>
                <p className="text-sm text-zinc-400">This action cannot be undone</p>
              </div>
            </div>

            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
              <p className="mb-2 text-sm font-medium text-red-200">
                Are you sure you want to delete <span className="font-bold">{camera.name}</span>?
              </p>
              <p className="text-xs text-red-300">
                This will permanently remove the camera from your inventory. All associated data will be deleted.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 rounded-xl bg-zinc-800 px-4 py-3 font-semibold text-stone-100 transition-colors hover:bg-zinc-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
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

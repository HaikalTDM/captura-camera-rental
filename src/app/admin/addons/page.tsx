'use client';

import { useState, useEffect } from 'react';
import { 
  addOnsData, 
  addOnCategories, 
  getActiveAddOns, 
  getActiveCategories,
  formatPrice,
  addNewAddOn,
  updateAddOn,
  deleteAddOn,
  toggleAddOnStatus,
  type AddOn,
  type AddOnCategory
} from '@/data/addons';

export default function AddOnsAdminPage() {
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [categories] = useState<AddOnCategory[]>(addOnCategories);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editForm, setEditForm] = useState<Partial<AddOn>>({});

  useEffect(() => {
    setAddOns([...addOnsData]);
  }, []);

  const handleEdit = (addOn: AddOn) => {
    setIsEditing(addOn.id);
    setEditForm(addOn);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setIsEditing(null);
    setEditForm({
      name: '',
      price: 0,
      description: '',
      category: 'extras',
      isActive: true,
      sortOrder: addOns.length + 1,
      icon: ''
    });
  };

  const handleSave = () => {
    if (isCreating) {
      if (editForm.name && editForm.price && editForm.description) {
        const newAddOn = addNewAddOn(editForm as Omit<AddOn, 'id' | 'createdAt' | 'updatedAt'>);
        setAddOns([...addOnsData]);
        setIsCreating(false);
        setEditForm({});
      }
    } else if (isEditing) {
      updateAddOn(isEditing, editForm);
      setAddOns([...addOnsData]);
      setIsEditing(null);
      setEditForm({});
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this add-on?')) {
      deleteAddOn(id);
      setAddOns([...addOnsData]);
    }
  };

  const handleToggleStatus = (id: string) => {
    toggleAddOnStatus(id);
    setAddOns([...addOnsData]);
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || categoryId;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Add-Ons Management</h1>
                <p className="text-gray-600 mt-1">Manage photography package add-ons and enhancements</p>
              </div>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-[#d4af37] text-black font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-[#d4af37]/90 transition-colors"
              >
                Add New Add-On
              </button>
            </div>
          </div>

          {/* Create/Edit Form */}
          {(isCreating || isEditing) && (
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {isCreating ? 'Create New Add-On' : 'Edit Add-On'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
                    placeholder="Add-on name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (RM)</label>
                  <input
                    type="number"
                    value={editForm.price || 0}
                    onChange={(e) => setEditForm({ ...editForm, price: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={editForm.category || ''}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value as AddOn['category'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                  <select
                    value={editForm.icon || ''}
                    onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
                  >
                    <option value="">No icon</option>
                    <option value="clock">🕐 Clock</option>
                    <option value="video">🎬 Video</option>
                    <option value="fast-forward">⚡ Fast Forward</option>
                    <option value="zap">🚀 Zap</option>
                    <option value="image">📸 Image</option>
                    <option value="book">📖 Book</option>
                    <option value="plane">🚁 Plane</option>
                    <option value="broadcast">📡 Broadcast</option>
                    <option value="heart">💕 Heart</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={editForm.sortOrder || 0}
                    onChange={(e) => setEditForm({ ...editForm, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
                    placeholder="1"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editForm.isActive || false}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Active</label>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
                  placeholder="Describe the add-on service..."
                />
              </div>
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-[#d4af37] text-black font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-[#d4af37]/90 transition-colors"
                >
                  {isCreating ? 'Create' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setIsEditing(null);
                    setEditForm({});
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Add-Ons List */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Add-On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sort Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {addOns.map((addOn) => (
                  <tr key={addOn.id} className={!addOn.isActive ? 'opacity-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {addOn.icon && (
                          <span className="mr-3 text-lg">
                            {addOn.icon === 'clock' && '🕐'}
                            {addOn.icon === 'video' && '🎬'}
                            {addOn.icon === 'fast-forward' && '⚡'}
                            {addOn.icon === 'zap' && '🚀'}
                            {addOn.icon === 'image' && '📸'}
                            {addOn.icon === 'book' && '📖'}
                            {addOn.icon === 'plane' && '🚁'}
                            {addOn.icon === 'broadcast' && '📡'}
                            {addOn.icon === 'heart' && '💕'}
                          </span>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{addOn.name}</div>
                          <div className="text-sm text-gray-500">{addOn.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {getCategoryName(addOn.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatPrice(addOn.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(addOn.id)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          addOn.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {addOn.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {addOn.sortOrder}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(addOn)}
                          className="text-[#d4af37] hover:text-[#d4af37]/80"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(addOn.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Statistics */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-[#d4af37]">{addOns.length}</div>
                <div className="text-sm text-gray-600">Total Add-Ons</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{addOns.filter(a => a.isActive).length}</div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{addOns.filter(a => !a.isActive).length}</div>
                <div className="text-sm text-gray-600">Inactive</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Live Preview</h2>
            <p className="text-gray-600 mt-1">How add-ons appear to customers</p>
          </div>
          <div className="p-6">
            <div className="space-y-8">
              {getActiveCategories().map((category) => {
                const categoryAddOns = getActiveAddOns().filter(addon => addon.category === category.id);
                
                if (categoryAddOns.length === 0) return null;
                
                return (
                  <div key={category.id} className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-black mb-2 font-serif">{category.name}</h3>
                      <p className="text-gray-600">{category.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {categoryAddOns.map((addOn) => (
                        <div
                          key={addOn.id}
                          className="bg-white rounded-xl border-2 border-gray-200 p-4"
                        >
                          <div className="flex items-center space-x-3 mb-2">
                            {addOn.icon && (
                              <div className="w-8 h-8 bg-[#d4af37]/10 rounded-lg flex items-center justify-center">
                                <span className="text-[#d4af37] text-sm">
                                  {addOn.icon === 'clock' && '🕐'}
                                  {addOn.icon === 'video' && '🎬'}
                                  {addOn.icon === 'fast-forward' && '⚡'}
                                  {addOn.icon === 'zap' && '🚀'}
                                  {addOn.icon === 'image' && '📸'}
                                  {addOn.icon === 'book' && '📖'}
                                  {addOn.icon === 'plane' && '🚁'}
                                  {addOn.icon === 'broadcast' && '📡'}
                                  {addOn.icon === 'heart' && '💕'}
                                </span>
                              </div>
                            )}
                            <h4 className="font-bold text-black">{addOn.name}</h4>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{addOn.description}</p>
                          <div className="text-lg font-bold text-[#d4af37]">{formatPrice(addOn.price)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

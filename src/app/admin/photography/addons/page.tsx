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

export default function PhotographyAddOnsPage() {
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
      if (editForm.name && editForm.price !== undefined) {
        const newAddOn = addNewAddOn(editForm as Omit<AddOn, 'id'>);
        setAddOns(prev => [...prev, newAddOn]);
        setIsCreating(false);
        setEditForm({});
      }
    } else if (isEditing) {
      const updated = updateAddOn(isEditing, editForm);
      if (updated) {
        setAddOns(prev => prev.map(item => item.id === isEditing ? updated : item));
        setIsEditing(null);
        setEditForm({});
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(null);
    setIsCreating(false);
    setEditForm({});
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this add-on?')) {
      deleteAddOn(id);
      setAddOns(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    const updated = toggleAddOnStatus(id);
    if (updated) {
      setAddOns(prev => prev.map(item => item.id === id ? updated : item));
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || categoryId;
  };

  const getIconForCategory = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.icon || '📦';
  };

  const getIconForAddOn = (addOn: AddOn) => {
    if (addOn.icon) return addOn.icon;
    return getIconForCategory(addOn.category);
  };

  const groupedAddOns = categories.map(category => ({
    ...category,
    addOns: addOns.filter(addOn => addOn.category === category.id)
  }));

  const activeAddOns = addOns.filter(addOn => addOn.isActive).length;
  const totalRevenuePotential = addOns
    .filter(addOn => addOn.isActive)
    .reduce((sum, addOn) => sum + addOn.price, 0);

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-black mb-4 font-serif">Package Add-ons</h1>
            <div className="w-16 h-px bg-[#d4af37] mx-auto mb-4"></div>
            <p className="text-black/60 text-lg max-w-2xl mx-auto">
              Manage photography package enhancements and extras
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-[#d4af37]/20 hover:border-[#d4af37] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-black/60 uppercase tracking-wide font-medium">Total Add-ons</p>
                <p className="text-3xl font-bold text-black">{addOns.length}</p>
              </div>
              <div className="w-12 h-12 bg-[#d4af37]/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-[#d4af37]/20 hover:border-[#d4af37] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-black/60 uppercase tracking-wide font-medium">Active Add-ons</p>
                <p className="text-3xl font-bold text-black">{activeAddOns}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-[#d4af37]/20 hover:border-[#d4af37] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-black/60 uppercase tracking-wide font-medium">Revenue Potential</p>
                <p className="text-3xl font-bold text-black">RM{totalRevenuePotential.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-black font-serif">Manage Add-ons</h2>
          <button
            onClick={handleCreate}
            className="px-6 py-3 bg-[#d4af37] text-black font-medium rounded-lg hover:bg-[#d4af37]/90 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add New Add-on</span>
          </button>
        </div>

        {/* Create/Edit Form */}
        {(isCreating || isEditing) && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-[#d4af37]/20 mb-8">
            <h3 className="text-xl font-bold text-black mb-4 font-serif">
              {isCreating ? 'Create New Add-on' : 'Edit Add-on'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Name</label>
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
                  placeholder="Add-on name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Price (RM)</label>
                <input
                  type="number"
                  value={editForm.price || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Category</label>
                <select
                  value={editForm.category || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Icon (Emoji)</label>
                <input
                  type="text"
                  value={editForm.icon || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, icon: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
                  placeholder="📸"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-black mb-2">Description</label>
                <textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
                  placeholder="Describe this add-on..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editForm.isActive || false}
                  onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-[#d4af37] focus:ring-[#d4af37] border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-black">
                  Active (visible to customers)
                </label>
              </div>
            </div>

            <div className="flex items-center space-x-4 mt-6">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-[#d4af37] text-black font-medium rounded-lg hover:bg-[#d4af37]/90 transition-colors"
              >
                {isCreating ? 'Create Add-on' : 'Update Add-on'}
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Add-ons by Category */}
        <div className="space-y-8">
          {groupedAddOns.map(category => (
            <div key={category.id} className="bg-white rounded-xl shadow-lg border border-[#d4af37]/20">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-black font-serif">{category.name}</h3>
                    <p className="text-black/60">{category.description}</p>
                  </div>
                  <div className="ml-auto">
                    <span className="px-3 py-1 bg-[#d4af37]/20 text-[#d4af37] text-sm font-medium rounded-full">
                      {category.addOns.length} items
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {category.addOns.length === 0 ? (
                  <div className="text-center py-8 text-black/60">
                    <span className="text-4xl mb-4 block">{category.icon}</span>
                    <p>No add-ons in this category yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.addOns.map(addOn => (
                      <div
                        key={addOn.id}
                        className={`p-4 border rounded-lg transition-all duration-300 ${
                          addOn.isActive
                            ? 'border-[#d4af37]/30 bg-white hover:border-[#d4af37] hover:shadow-md'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getIconForAddOn(addOn)}</span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              addOn.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-200 text-gray-700'
                            }`}>
                              {addOn.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleEdit(addOn)}
                              className="p-1 text-gray-400 hover:text-[#d4af37] transition-colors"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleToggleStatus(addOn.id)}
                              className={`p-1 transition-colors ${
                                addOn.isActive
                                  ? 'text-gray-400 hover:text-yellow-600'
                                  : 'text-gray-400 hover:text-green-600'
                              }`}
                              title={addOn.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {addOn.isActive ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.275 4.057-5.065 7-9.543 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(addOn.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <h4 className="font-semibold text-black mb-2">{addOn.name}</h4>
                        <p className="text-black/60 text-sm mb-3 line-clamp-2">{addOn.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-[#d4af37]">
                            {formatPrice(addOn.price)}
                          </span>
                          <span className="text-xs text-black/40">
                            Sort: {addOn.sortOrder}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

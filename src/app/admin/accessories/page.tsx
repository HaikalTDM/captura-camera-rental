'use client';

import { useState, useEffect } from 'react';
import { getAllAccessories, createAccessory, updateAccessory, deleteAccessory } from '@/lib/api/bookings';
import type { Accessory } from '@/lib/supabase';
import Link from 'next/link';

export default function AccessoriesPage() {
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccessory, setEditingAccessory] = useState<Accessory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const [formData, setFormData] = useState({
    name: '',
    type: 'battery' as Accessory['type'],
    brand: '',
    model: '',
    description: '',
    daily_rate: 0,
    weekly_rate: 0,
    monthly_rate: 0,
    deposit_amount: 0,
    total_quantity: 1,
    available_quantity: 1,
    specifications: {},
    image_url: ''
  });

  useEffect(() => {
    loadAccessories();
  }, []);

  const loadAccessories = async () => {
    setIsLoading(true);
    try {
      const data = await getAllAccessories();
      setAccessories(data);
    } catch (error) {
      console.error('Error loading accessories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'battery',
      brand: '',
      model: '',
      description: '',
      daily_rate: 0,
      weekly_rate: 0,
      monthly_rate: 0,
      deposit_amount: 0,
      total_quantity: 1,
      available_quantity: 1,
      specifications: {},
      image_url: ''
    });
    setEditingAccessory(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingAccessory) {
        const updated = await updateAccessory(editingAccessory.id, formData);
        if (updated) {
          setAccessories(prev => prev.map(acc => acc.id === editingAccessory.id ? updated : acc));
        }
      } else {
        const created = await createAccessory({
          ...formData,
          is_available: true
        });
        if (created) {
          setAccessories(prev => [...prev, created]);
        }
      }
      resetForm();
      loadAccessories(); // Refresh the list
    } catch (error) {
      console.error('Error saving accessory:', error);
      alert('Error saving accessory. Please try again.');
    }
  };

  const handleEdit = (accessory: Accessory) => {
    setFormData({
      name: accessory.name,
      type: accessory.type,
      brand: accessory.brand || '',
      model: accessory.model || '',
      description: accessory.description || '',
      daily_rate: accessory.daily_rate,
      weekly_rate: accessory.weekly_rate,
      monthly_rate: accessory.monthly_rate,
      deposit_amount: accessory.deposit_amount,
      total_quantity: accessory.total_quantity,
      available_quantity: accessory.available_quantity,
      specifications: accessory.specifications || {},
      image_url: accessory.image_url || ''
    });
    setEditingAccessory(accessory);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this accessory?')) return;
    
    try {
      const success = await deleteAccessory(id);
      if (success) {
        setAccessories(prev => prev.filter(acc => acc.id !== id));
      }
    } catch (error) {
      console.error('Error deleting accessory:', error);
      alert('Error deleting accessory. Please try again.');
    }
  };

  const filteredAccessories = accessories.filter(accessory => {
    const matchesSearch = accessory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         accessory.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (accessory.brand && accessory.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || accessory.type === filterType;
    return matchesSearch && matchesType;
  });

  const accessoryTypes = ['battery', 'memory_card', 'tripod', 'case', 'charger', 'filter', 'lens', 'other'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Accessories Management</h1>
          <p className="text-gray-700 mt-1">Manage your camera accessories inventory</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Accessory
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search accessories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">All Types</option>
              {accessoryTypes.map(type => (
                <option key={type} value={type}>
                  {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {editingAccessory ? 'Edit Accessory' : 'Add New Accessory'}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-600 hover:text-gray-800"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Accessory Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Extra Battery Pack"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as Accessory['type']})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                >
                  {accessoryTypes.map(type => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
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
                  placeholder="DJI-BATTERY-001"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Daily Rate (RM)</label>
                <input
                  type="number"
                  value={formData.daily_rate || ''}
                  onChange={(e) => setFormData({...formData, daily_rate: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="10.00"
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
                  placeholder="60.00"
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
                  placeholder="200.00"
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deposit (RM)</label>
                <input
                  type="number"
                  value={formData.deposit_amount || ''}
                  onChange={(e) => setFormData({...formData, deposit_amount: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="50.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Quantity</label>
                <input
                  type="number"
                  value={formData.total_quantity}
                  onChange={(e) => setFormData({...formData, total_quantity: parseInt(e.target.value) || 1})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="1"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Quantity</label>
                <input
                  type="number"
                  value={formData.available_quantity}
                  onChange={(e) => setFormData({...formData, available_quantity: parseInt(e.target.value) || 1})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="1"
                  min="0"
                  max={formData.total_quantity}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="High capacity battery for extended recording..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="https://example.com/accessory-image.jpg"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {editingAccessory ? 'Update Accessory' : 'Add Accessory'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Accessories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAccessories.map((accessory) => (
          <div key={accessory.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{accessory.name}</h3>
                <p className="text-gray-700 capitalize">{accessory.type.replace('_', ' ')}</p>
                {accessory.brand && (
                  <p className="text-sm text-gray-600">{accessory.brand} {accessory.model}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(accessory)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(accessory.id)}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Daily Rate:</span>
                <span className="text-sm font-medium text-gray-900">RM{accessory.daily_rate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Quantity:</span>
                <span className="text-sm font-medium text-gray-900">
                  {accessory.available_quantity}/{accessory.total_quantity}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`text-sm font-medium ${
                  accessory.is_available && accessory.available_quantity > 0
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {accessory.is_available && accessory.available_quantity > 0 ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>

            {accessory.description && (
              <p className="text-xs text-gray-600 mt-2">{accessory.description}</p>
            )}
          </div>
        ))}
      </div>

      {filteredAccessories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No accessories found. Add your first accessory to get started!</p>
        </div>
      )}
    </div>
  );
}

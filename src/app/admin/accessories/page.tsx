'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  CheckCircle2,
  PackagePlus,
  Pencil,
  Search,
  Trash2,
  Wrench,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getAllAccessories, createAccessory, updateAccessory, deleteAccessory } from '@/lib/api/bookings';
import type { Accessory } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/useIsMobile';
import MobileAccessories from '@/components/admin/MobileAccessories';

const accessoryTypes = ['battery', 'memory_card', 'tripod', 'case', 'charger', 'filter', 'lens', 'other'];

function formatAccessoryType(type: string) {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getAccessoryStatusTone(isAvailable: boolean, availableQuantity: number) {
  if (isAvailable && availableQuantity > 0) {
    return 'border-[#30412f] bg-[#1f2b20] text-emerald-200';
  }

  return 'border-[#503130] bg-[#2a1b1a] text-rose-200';
}

export default function AccessoriesPage() {
  const isMobile = useIsMobile(768);
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
    image_url: '',
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
      image_url: '',
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
          setAccessories((prev) => prev.map((accessory) => accessory.id === editingAccessory.id ? updated : accessory));
        }
      } else {
        const created = await createAccessory({
          ...formData,
          is_available: true,
        });
        if (created) {
          setAccessories((prev) => [...prev, created]);
        }
      }

      resetForm();
      loadAccessories();
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
      image_url: accessory.image_url || '',
    });
    setEditingAccessory(accessory);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this accessory?')) return;

    try {
      const success = await deleteAccessory(id);
      if (success) {
        setAccessories((prev) => prev.filter((accessory) => accessory.id !== id));
      }
    } catch (error) {
      console.error('Error deleting accessory:', error);
      alert('Error deleting accessory. Please try again.');
    }
  };

  const filteredAccessories = accessories.filter((accessory) => {
    const matchesSearch =
      accessory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      accessory.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (accessory.brand && accessory.brand.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === 'all' || accessory.type === filterType;
    return matchesSearch && matchesType;
  });

  const accessoryStats = useMemo(() => {
    const available = accessories.filter((accessory) => accessory.is_available && accessory.available_quantity > 0).length;
    const unavailable = accessories.filter((accessory) => !accessory.is_available || accessory.available_quantity === 0).length;
    const totalUnits = accessories.reduce((sum, accessory) => sum + accessory.total_quantity, 0);
    const totalDailyValue = accessories.reduce((sum, accessory) => sum + accessory.daily_rate * accessory.total_quantity, 0);

    return {
      total: accessories.length,
      available,
      unavailable,
      totalUnits,
      totalDailyValue,
    };
  }, [accessories]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#c96b2c]"></div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <MobileAccessories
        accessories={accessories}
        filteredAccessories={filteredAccessories}
        accessoryTypes={accessoryTypes}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        showAddForm={showAddForm}
        setShowAddForm={setShowAddForm}
        editingAccessory={editingAccessory}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        resetForm={resetForm}
        formatAccessoryType={formatAccessoryType}
        getAccessoryStatusTone={getAccessoryStatusTone}
        accessoryStats={accessoryStats}
      />
    );
  }

  return (
    <div className="space-y-6 px-2 pb-8 xl:px-0">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_340px]"
      >
        <Card className="rounded-[30px] border border-[#2d2722] bg-[radial-gradient(circle_at_top,_rgba(201,107,44,0.12),_transparent_42%),linear-gradient(180deg,#1c1713_0%,#141210_100%)] shadow-[0_30px_80px_rgba(0,0,0,0.34)]">
          <CardContent className="p-6 md:p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#43372d] bg-[#1d1814] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-300">
                  <Box className="h-3.5 w-3.5 text-orange-300" />
                  Accessory desk
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-tight text-stone-50">Accessories Management</h1>
                  <p className="max-w-2xl text-sm leading-6 text-stone-400">
                    Manage your rental add-ons, keep stock clean, and maintain pricing for every accessory in one calmer inventory view.
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setShowAddForm(true)}
                className="h-11 gap-2 rounded-xl bg-[#c96b2c] text-black hover:bg-[#d97a39]"
              >
                <PackagePlus className="h-4 w-4" />
                Add Accessory
              </Button>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-[#2f2924] bg-[#171411] p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Visible accessories</p>
                <p className="mt-3 text-3xl font-semibold text-stone-50">{filteredAccessories.length}</p>
                <p className="mt-2 text-sm text-stone-400">Items currently shown after the active search and type filter.</p>
              </div>
              <div className="rounded-2xl border border-[#2f2924] bg-[#171411] p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Total units</p>
                <p className="mt-3 text-3xl font-semibold text-stone-50">{accessoryStats.totalUnits}</p>
                <p className="mt-2 text-sm text-stone-400">Combined stock count across the accessory inventory.</p>
              </div>
              <div className="rounded-2xl border border-[#3f3125] bg-[#241b14] p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Daily value</p>
                <p className="mt-3 text-3xl font-semibold text-stone-50">RM{accessoryStats.totalDailyValue.toFixed(0)}</p>
                <p className="mt-2 text-sm text-stone-400">Daily rental value represented by your total accessory stock.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[30px] border border-[#2d2722] bg-[#171411] shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
          <CardHeader className="border-b border-[#26211d] pb-4">
            <CardTitle className="text-lg text-stone-50">Inventory Notes</CardTitle>
            <CardDescription className="text-stone-400">
              A quick read on accessory stock health before you edit the catalog.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            <div className="rounded-2xl border border-[#2c2621] bg-[#1d1a17] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Available accessories</p>
              <p className="mt-2 text-2xl font-semibold text-stone-50">{accessoryStats.available}</p>
              <p className="mt-1 text-sm text-stone-400">Ready to be attached to a booking right now.</p>
            </div>
            <div className="rounded-2xl border border-[#2c2621] bg-[#1d1a17] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Unavailable items</p>
              <p className="mt-2 text-2xl font-semibold text-stone-50">{accessoryStats.unavailable}</p>
              <p className="mt-1 text-sm text-stone-400">Items with no available stock or manually marked unavailable.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
      >
        <Card className="rounded-[24px] border border-[#2c2722] bg-[#171411] shadow-[0_20px_45px_rgba(0,0,0,0.24)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Catalog items</p>
                <p className="mt-3 text-3xl font-semibold text-stone-50">{accessoryStats.total}</p>
                <p className="mt-1 text-sm text-stone-400">Distinct accessory records in the system.</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#26211d] text-stone-300">
                <Box className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border border-[#2c2722] bg-[#171411] shadow-[0_20px_45px_rgba(0,0,0,0.24)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Available</p>
                <p className="mt-3 text-3xl font-semibold text-stone-50">{accessoryStats.available}</p>
                <p className="mt-1 text-sm text-stone-400">Stock with live availability remaining.</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1f2b20] text-emerald-300">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border border-[#3a2d22] bg-[#1c1511] shadow-[0_20px_45px_rgba(0,0,0,0.24)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Unavailable</p>
                <p className="mt-3 text-3xl font-semibold text-stone-50">{accessoryStats.unavailable}</p>
                <p className="mt-1 text-sm text-stone-400">Out-of-stock or manually disabled accessories.</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#302219] text-orange-300">
                <Wrench className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border border-[#2c2722] bg-[#171411] shadow-[0_20px_45px_rgba(0,0,0,0.24)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Type filters</p>
                <p className="mt-3 text-3xl font-semibold text-stone-50">{accessoryTypes.length}</p>
                <p className="mt-1 text-sm text-stone-400">Accessory categories available in the current catalog.</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#241b14] text-orange-300">
                <Search className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card className="rounded-[28px] border border-[#2c2722] bg-[#171411] shadow-[0_24px_55px_rgba(0,0,0,0.28)]">
          <CardContent className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_240px]">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                Search accessories
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                <input
                  type="text"
                  placeholder="Search accessories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-[#322b26] bg-[#11100f] pl-11 pr-4 text-sm text-stone-100 outline-none transition-colors placeholder:text-stone-500 focus:border-[#c96b2c]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                Type filter
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="h-12 w-full rounded-2xl border border-[#322b26] bg-[#11100f] px-4 text-sm text-stone-100 outline-none transition-colors focus:border-[#c96b2c]"
              >
                <option value="all">All types</option>
                {accessoryTypes.map((type) => (
                  <option key={type} value={type}>
                    {formatAccessoryType(type)}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[30px] border border-[#2c2722] bg-[#171411] shadow-[0_30px_70px_rgba(0,0,0,0.32)]"
        >
          <div className="border-b border-[#26211d] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-stone-50">
                  {editingAccessory ? 'Edit Accessory' : 'Add New Accessory'}
                </h2>
                <p className="mt-1 text-sm text-stone-400">
                  Keep pricing, stock, and accessory details aligned with the rental workflow.
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={resetForm}
                className="h-10 w-10 rounded-2xl border-[#3a3129] bg-[#191613] text-stone-200 hover:bg-[#221d18]"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-300">Accessory Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-2xl border border-[#322b26] bg-[#11100f] p-3 text-stone-100 outline-none transition-colors focus:border-[#c96b2c]"
                  placeholder="Extra Battery Pack"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-300">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Accessory['type'] })}
                  className="w-full rounded-2xl border border-[#322b26] bg-[#11100f] p-3 text-stone-100 outline-none transition-colors focus:border-[#c96b2c]"
                  required
                >
                  {accessoryTypes.map((type) => (
                    <option key={type} value={type}>
                      {formatAccessoryType(type)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-300">Brand</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full rounded-2xl border border-[#322b26] bg-[#11100f] p-3 text-stone-100 outline-none transition-colors focus:border-[#c96b2c]"
                  placeholder="DJI"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-300">Model</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full rounded-2xl border border-[#322b26] bg-[#11100f] p-3 text-stone-100 outline-none transition-colors focus:border-[#c96b2c]"
                  placeholder="DJI-BATTERY-001"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-300">Daily Rate (RM)</label>
                <input
                  type="number"
                  value={formData.daily_rate || ''}
                  onChange={(e) => setFormData({ ...formData, daily_rate: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                  className="w-full rounded-2xl border border-[#322b26] bg-[#11100f] p-3 text-stone-100 outline-none transition-colors focus:border-[#c96b2c]"
                  placeholder="10.00"
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-300">Weekly Rate (RM)</label>
                <input
                  type="number"
                  value={formData.weekly_rate || ''}
                  onChange={(e) => setFormData({ ...formData, weekly_rate: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                  className="w-full rounded-2xl border border-[#322b26] bg-[#11100f] p-3 text-stone-100 outline-none transition-colors focus:border-[#c96b2c]"
                  placeholder="60.00"
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-300">Monthly Rate (RM)</label>
                <input
                  type="number"
                  value={formData.monthly_rate || ''}
                  onChange={(e) => setFormData({ ...formData, monthly_rate: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                  className="w-full rounded-2xl border border-[#322b26] bg-[#11100f] p-3 text-stone-100 outline-none transition-colors focus:border-[#c96b2c]"
                  placeholder="200.00"
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-300">Deposit (RM)</label>
                <input
                  type="number"
                  value={formData.deposit_amount || ''}
                  onChange={(e) => setFormData({ ...formData, deposit_amount: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                  className="w-full rounded-2xl border border-[#322b26] bg-[#11100f] p-3 text-stone-100 outline-none transition-colors focus:border-[#c96b2c]"
                  placeholder="50.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-300">Total Quantity</label>
                <input
                  type="number"
                  value={formData.total_quantity}
                  onChange={(e) => setFormData({ ...formData, total_quantity: parseInt(e.target.value) || 1 })}
                  className="w-full rounded-2xl border border-[#322b26] bg-[#11100f] p-3 text-stone-100 outline-none transition-colors focus:border-[#c96b2c]"
                  min="1"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-300">Available Quantity</label>
                <input
                  type="number"
                  value={formData.available_quantity}
                  onChange={(e) => setFormData({ ...formData, available_quantity: parseInt(e.target.value) || 1 })}
                  className="w-full rounded-2xl border border-[#322b26] bg-[#11100f] p-3 text-stone-100 outline-none transition-colors focus:border-[#c96b2c]"
                  min="0"
                  max={formData.total_quantity}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-300">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full rounded-2xl border border-[#322b26] bg-[#11100f] p-3 text-stone-100 outline-none transition-colors focus:border-[#c96b2c]"
                placeholder="High capacity battery for extended recording..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-300">Image URL</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full rounded-2xl border border-[#322b26] bg-[#11100f] p-3 text-stone-100 outline-none transition-colors focus:border-[#c96b2c]"
                placeholder="https://example.com/accessory-image.jpg"
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                className="h-11 rounded-2xl bg-[#c96b2c] text-black hover:bg-[#d97a39]"
              >
                {editingAccessory ? 'Update Accessory' : 'Add Accessory'}
              </Button>
              <Button
                type="button"
                onClick={resetForm}
                variant="outline"
                className="h-11 rounded-2xl border-[#3a3129] bg-[#191613] text-stone-200 hover:bg-[#221d18]"
              >
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="rounded-[30px] border border-[#2c2722] bg-[#171411] shadow-[0_30px_70px_rgba(0,0,0,0.32)]">
          <CardHeader className="border-b border-[#26211d] pb-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <CardTitle className="text-xl text-stone-50">Accessory Inventory</CardTitle>
                <CardDescription className="mt-1 text-stone-400">
                  Item-by-item pricing, stock, and direct catalog actions.
                </CardDescription>
              </div>
              <div className="rounded-full border border-[#39312a] bg-[#1a1714] px-3 py-1.5 text-sm text-stone-300">
                {filteredAccessories.length} shown
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            {filteredAccessories.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#312924] bg-[#171411]">
                  <Box className="h-6 w-6 text-stone-500" />
                </div>
                <p className="mt-4 text-lg font-medium text-stone-100">No accessories found</p>
                <p className="mt-1 text-sm text-stone-500">
                  Try widening the search or add your first accessory to get started.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredAccessories.map((accessory) => (
                  <div
                    key={accessory.id}
                    className="rounded-[26px] border border-[#2d2722] bg-[#12100f] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-stone-50">{accessory.name}</h3>
                        <p className="text-sm text-stone-400 capitalize">{accessory.type.replace('_', ' ')}</p>
                        {accessory.brand && (
                          <p className="text-sm text-stone-500">{accessory.brand} {accessory.model}</p>
                        )}
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${getAccessoryStatusTone(accessory.is_available, accessory.available_quantity)}`}>
                        {accessory.is_available && accessory.available_quantity > 0 ? 'Available' : 'Unavailable'}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-[#2b2520] bg-[#171411] p-4">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Daily rate</p>
                        <p className="mt-2 text-2xl font-semibold text-stone-50">RM{accessory.daily_rate}</p>
                      </div>
                      <div className="rounded-2xl border border-[#2b2520] bg-[#171411] p-4">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Quantity</p>
                        <p className="mt-2 text-2xl font-semibold text-stone-50">
                          {accessory.available_quantity}/{accessory.total_quantity}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center justify-between text-stone-400">
                        <span>Weekly</span>
                        <span className="font-medium text-stone-100">RM{accessory.weekly_rate}</span>
                      </div>
                      <div className="flex items-center justify-between text-stone-400">
                        <span>Monthly</span>
                        <span className="font-medium text-stone-100">RM{accessory.monthly_rate}</span>
                      </div>
                      <div className="flex items-center justify-between text-stone-400">
                        <span>Deposit</span>
                        <span className="font-medium text-stone-100">RM{accessory.deposit_amount}</span>
                      </div>
                    </div>

                    {accessory.description && (
                      <p className="mt-4 text-sm leading-6 text-stone-400">{accessory.description}</p>
                    )}

                    <div className="mt-5 flex gap-3">
                      <Button
                        onClick={() => handleEdit(accessory)}
                        variant="outline"
                        className="flex-1 h-11 rounded-2xl border-[#3a3129] bg-[#171411] text-stone-200 hover:bg-[#221d18]"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(accessory.id)}
                        variant="outline"
                        className="flex-1 h-11 rounded-2xl border-[#4a2d2d] bg-[#1e1515] text-rose-200 hover:border-[#7a3e3e] hover:bg-[#281818] hover:text-rose-100"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

'use client';

import type { Dispatch, FormEvent, SetStateAction } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Box,
  PackagePlus,
  Pencil,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import type { Accessory } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type AccessoryFormData = {
  name: string;
  type: Accessory['type'];
  brand: string;
  model: string;
  description: string;
  daily_rate: number;
  weekly_rate: number;
  monthly_rate: number;
  deposit_amount: number;
  total_quantity: number;
  available_quantity: number;
  specifications: Record<string, unknown>;
  image_url: string;
};

interface MobileAccessoriesProps {
  accessories: Accessory[];
  filteredAccessories: Accessory[];
  accessoryTypes: string[];
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  filterType: string;
  setFilterType: Dispatch<SetStateAction<string>>;
  showAddForm: boolean;
  setShowAddForm: Dispatch<SetStateAction<boolean>>;
  editingAccessory: Accessory | null;
  formData: AccessoryFormData;
  setFormData: Dispatch<SetStateAction<AccessoryFormData>>;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void | Promise<void>;
  handleEdit: (accessory: Accessory) => void;
  handleDelete: (id: string) => void | Promise<void>;
  resetForm: () => void;
  formatAccessoryType: (type: string) => string;
  getAccessoryStatusTone: (isAvailable: boolean, availableQuantity: number) => string;
  accessoryStats: {
    total: number;
    available: number;
    unavailable: number;
    totalUnits: number;
    totalDailyValue: number;
  };
}

export default function MobileAccessories({
  accessories,
  filteredAccessories,
  accessoryTypes,
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  showAddForm,
  setShowAddForm,
  editingAccessory,
  formData,
  setFormData,
  handleSubmit,
  handleEdit,
  handleDelete,
  resetForm,
  formatAccessoryType,
  getAccessoryStatusTone,
  accessoryStats,
}: MobileAccessoriesProps) {
  return (
    <div className="space-y-4 px-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-[#332b25] bg-[radial-gradient(circle_at_top_left,_rgba(201,107,44,0.18),_transparent_45%),linear-gradient(135deg,#1b1714_0%,#171411_60%,#141210_100%)] p-4 shadow-[0_20px_45px_rgba(0,0,0,0.35)]"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#5a4328] bg-[#332316]">
              <Box className="h-5 w-5 text-orange-300" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-stone-100">Accessories</h1>
              <p className="text-xs text-stone-400">{accessories.length} catalog items</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm((current) => !current)}
            className="flex items-center gap-2 rounded-xl bg-[#c96b2c] px-3 py-2 text-sm font-semibold text-stone-950 active:scale-95"
          >
            {showAddForm ? <X className="h-4 w-4" /> : <PackagePlus className="h-4 w-4" />}
            {showAddForm ? 'Close' : 'Add'}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-[#332b25] bg-[#1f1a16] px-3 py-3 text-center">
            <p className="text-lg font-bold text-orange-300">{accessoryStats.available}</p>
            <p className="text-[10px] text-stone-500">Available</p>
          </div>
          <div className="rounded-xl border border-[#332b25] bg-[#1f1a16] px-3 py-3 text-center">
            <p className="text-lg font-bold text-stone-200">{accessoryStats.totalUnits}</p>
            <p className="text-[10px] text-stone-500">Units</p>
          </div>
          <div className="rounded-xl border border-[#332b25] bg-[#1f1a16] px-3 py-3 text-center">
            <p className="text-lg font-bold text-orange-200">RM{accessoryStats.totalDailyValue.toFixed(0)}</p>
            <p className="text-[10px] text-stone-500">Daily value</p>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border border-[#2c2722] bg-[#171411] shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
          <CardContent className="space-y-3 p-4">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                Search
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search accessories..."
                  className="h-11 w-full rounded-2xl border border-[#322b26] bg-[#11100f] pl-11 pr-4 text-sm text-stone-100 outline-none placeholder:text-stone-500 focus:border-[#c96b2c]"
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
                className="h-11 w-full rounded-2xl border border-[#322b26] bg-[#11100f] px-4 text-sm text-stone-100 outline-none focus:border-[#c96b2c]"
              >
                <option value="all">All types</option>
                {accessoryTypes.map((type) => (
                  <option key={type} value={type}>
                    {formatAccessoryType(type)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-[#2c2722] bg-[#1b1714] p-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">Shown</p>
                <p className="mt-2 text-xl font-semibold text-stone-100">{filteredAccessories.length}</p>
              </div>
              <div className="rounded-xl border border-[#2c2722] bg-[#1b1714] p-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">Unavailable</p>
                <p className="mt-2 text-xl font-semibold text-stone-100">{accessoryStats.unavailable}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence initial={false}>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="border border-[#2c2722] bg-[#171411] shadow-[0_24px_55px_rgba(0,0,0,0.3)]">
              <CardContent className="p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-stone-100">
                      {editingAccessory ? 'Edit accessory' : 'Add accessory'}
                    </h2>
                    <p className="text-xs text-stone-400">Keep stock and pricing ready for fast booking add-ons.</p>
                  </div>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#3a3129] bg-[#191613] text-stone-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-stone-300">Accessory Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData((current) => ({ ...current, name: e.target.value }))}
                      className="w-full rounded-2xl border border-[#322b26] bg-[#11100f] p-3 text-stone-100 outline-none focus:border-[#c96b2c]"
                      placeholder="Extra Battery Pack"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-stone-300">Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) =>
                          setFormData((current) => ({ ...current, type: e.target.value as Accessory['type'] }))
                        }
                        className="w-full rounded-2xl border border-[#322b26] bg-[#11100f] p-3 text-stone-100 outline-none focus:border-[#c96b2c]"
                      >
                        {accessoryTypes.map((type) => (
                          <option key={type} value={type}>
                            {formatAccessoryType(type)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-stone-300">Brand</label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => setFormData((current) => ({ ...current, brand: e.target.value }))}
                        className="w-full rounded-2xl border border-[#322b26] bg-[#11100f] p-3 text-stone-100 outline-none focus:border-[#c96b2c]"
                        placeholder="DJI"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-stone-300">Daily rate</label>
                      <input
                        type="number"
                        value={formData.daily_rate || ''}
                        onChange={(e) =>
                          setFormData((current) => ({
                            ...current,
                            daily_rate: e.target.value === '' ? 0 : parseFloat(e.target.value),
                          }))
                        }
                        className="w-full rounded-2xl border border-[#322b26] bg-[#11100f] p-3 text-stone-100 outline-none focus:border-[#c96b2c]"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-stone-300">Deposit</label>
                      <input
                        type="number"
                        value={formData.deposit_amount || ''}
                        onChange={(e) =>
                          setFormData((current) => ({
                            ...current,
                            deposit_amount: e.target.value === '' ? 0 : parseFloat(e.target.value),
                          }))
                        }
                        className="w-full rounded-2xl border border-[#322b26] bg-[#11100f] p-3 text-stone-100 outline-none focus:border-[#c96b2c]"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-stone-300">Total qty</label>
                      <input
                        type="number"
                        value={formData.total_quantity}
                        onChange={(e) =>
                          setFormData((current) => ({ ...current, total_quantity: parseInt(e.target.value, 10) || 1 }))
                        }
                        className="w-full rounded-2xl border border-[#322b26] bg-[#11100f] p-3 text-stone-100 outline-none focus:border-[#c96b2c]"
                        min="1"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-stone-300">Available qty</label>
                      <input
                        type="number"
                        value={formData.available_quantity}
                        onChange={(e) =>
                          setFormData((current) => ({
                            ...current,
                            available_quantity: parseInt(e.target.value, 10) || 1,
                          }))
                        }
                        className="w-full rounded-2xl border border-[#322b26] bg-[#11100f] p-3 text-stone-100 outline-none focus:border-[#c96b2c]"
                        min="0"
                        max={formData.total_quantity}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-stone-300">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData((current) => ({ ...current, description: e.target.value }))}
                      rows={3}
                      className="w-full rounded-2xl border border-[#322b26] bg-[#11100f] p-3 text-stone-100 outline-none focus:border-[#c96b2c]"
                      placeholder="Useful notes for this accessory..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1 rounded-2xl bg-[#c96b2c] text-stone-950 hover:bg-[#d97a39]">
                      {editingAccessory ? 'Update' : 'Save'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      className="flex-1 rounded-2xl border-[#3a3129] bg-[#191613] text-stone-200 hover:bg-[#221d18]"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {filteredAccessories.length === 0 ? (
          <Card className="border border-[#2c2722] bg-[#171411] shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
            <CardContent className="px-4 py-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#312924] bg-[#171411]">
                <Box className="h-5 w-5 text-stone-500" />
              </div>
              <p className="mt-4 text-base font-medium text-stone-100">No accessories found</p>
              <p className="mt-1 text-sm text-stone-500">Try a different search or add a new catalog item.</p>
            </CardContent>
          </Card>
        ) : (
          filteredAccessories.map((accessory, index) => (
            <motion.div
              key={accessory.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.04, 0.25) }}
            >
              <Card className="border border-[#2c2722] bg-[#171411] shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-stone-100">{accessory.name}</h3>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-500">
                        {formatAccessoryType(accessory.type)}
                      </p>
                      {(accessory.brand || accessory.model) && (
                        <p className="mt-1 truncate text-sm text-stone-400">
                          {[accessory.brand, accessory.model].filter(Boolean).join(' ')}
                        </p>
                      )}
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${getAccessoryStatusTone(accessory.is_available, accessory.available_quantity)}`}
                    >
                      {accessory.is_available && accessory.available_quantity > 0 ? 'Available' : 'Unavailable'}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-[#2c2722] bg-[#1b1714] p-3">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">Daily</p>
                      <p className="mt-2 text-lg font-semibold text-stone-100">RM{accessory.daily_rate}</p>
                    </div>
                    <div className="rounded-xl border border-[#2c2722] bg-[#1b1714] p-3">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">Stock</p>
                      <p className="mt-2 text-lg font-semibold text-stone-100">
                        {accessory.available_quantity}/{accessory.total_quantity}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5 text-sm">
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
                    <p className="mt-3 text-sm leading-6 text-stone-400">{accessory.description}</p>
                  )}

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(accessory)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#332b25] bg-[#1f1a16] py-3 text-sm font-semibold text-stone-200 active:scale-95"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(accessory.id)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#4a2d2d] bg-[#1e1515] py-3 text-sm font-semibold text-rose-200 active:scale-95"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {!showAddForm && (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#c96b2c] text-stone-950 shadow-[0_18px_45px_rgba(201,107,44,0.35)] active:scale-95"
        >
          <PackagePlus className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}

'use client';

import type { Dispatch, SetStateAction } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  ImagePlus,
  Images,
  MapPin,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import type { GalleryImage } from '@/lib/api/gallery';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MobileGalleryProps {
  images: GalleryImage[];
  activeImages: GalleryImage[];
  inactiveImages: GalleryImage[];
  stats: {
    total: number;
    active: number;
    inactive: number;
  };
  showAddForm: boolean;
  setShowAddForm: Dispatch<SetStateAction<boolean>>;
  selectedImage: File | null;
  setSelectedImage: Dispatch<SetStateAction<File | null>>;
  previewUrl: string;
  setPreviewUrl: Dispatch<SetStateAction<string>>;
  isDragOver: boolean;
  setIsDragOver: Dispatch<SetStateAction<boolean>>;
  isUploading: boolean;
  newImage: {
    customer: string;
    camera: string;
    location: string;
    alt: string;
  };
  setNewImage: Dispatch<
    SetStateAction<{
      customer: string;
      camera: string;
      location: string;
      alt: string;
    }>
  >;
  handleImageSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  resetUploadState: () => void;
  addImage: () => void | Promise<void>;
  toggleImageStatus: (id: string) => void | Promise<void>;
  deleteImage: (id: string) => void | Promise<void>;
}

type MobileGallerySection = {
  key: string;
  title: string;
  description: string;
  images: GalleryImage[];
  badgeLabel: string;
  badgeClasses: string;
  imageTone: string;
  actionLabel: string;
  actionClasses: string;
  emptyTitle: string;
  emptyText: string;
  actionIcon: typeof Eye | typeof EyeOff;
};

export default function MobileGallery({
  images,
  activeImages,
  inactiveImages,
  stats,
  showAddForm,
  setShowAddForm,
  selectedImage,
  setSelectedImage,
  previewUrl,
  setPreviewUrl,
  isDragOver,
  isUploading,
  newImage,
  setNewImage,
  handleImageSelect,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  resetUploadState,
  addImage,
  toggleImageStatus,
  deleteImage,
}: MobileGalleryProps) {
  const sections: MobileGallerySection[] = [
    {
      key: 'active',
      title: `Active Images (${activeImages.length})`,
      description: 'Visible on the public website right now.',
      images: activeImages,
      badgeLabel: 'Active',
      badgeClasses: 'border-[#30412f] bg-[#1f2b20] text-emerald-200',
      imageTone: 'grayscale-0',
      actionLabel: 'Hide',
      actionClasses: 'border-[#4b3723] bg-[#2b2117] text-orange-200',
      emptyTitle: 'No Active Images',
      emptyText: 'Upload some customer photos to bring the site gallery to life.',
      actionIcon: EyeOff,
    },
    {
      key: 'hidden',
      title: `Hidden Images (${inactiveImages.length})`,
      description: 'Saved in the archive but not shown on the website.',
      images: inactiveImages,
      badgeLabel: 'Hidden',
      badgeClasses: 'border-[#3a3129] bg-[#221f1b] text-stone-300',
      imageTone: 'grayscale',
      actionLabel: 'Show',
      actionClasses: 'border-[#30412f] bg-[#1f2b20] text-emerald-200',
      emptyTitle: 'No Hidden Images',
      emptyText: 'Disabled gallery items will appear here when you hide them.',
      actionIcon: Eye,
    },
  ];

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
              <Images className="h-5 w-5 text-orange-300" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-stone-100">Gallery</h1>
              <p className="text-xs text-stone-400">{images.length} saved website images</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm((current) => !current)}
            className="flex items-center gap-2 rounded-xl bg-[#c96b2c] px-3 py-2 text-sm font-semibold text-stone-950 active:scale-95"
          >
            {showAddForm ? <X className="h-4 w-4" /> : <ImagePlus className="h-4 w-4" />}
            {showAddForm ? 'Close' : 'Add'}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-[#332b25] bg-[#1f1a16] px-3 py-3 text-center">
            <p className="text-lg font-bold text-orange-300">{stats.total}</p>
            <p className="text-[10px] text-stone-500">Total</p>
          </div>
          <div className="rounded-xl border border-[#332b25] bg-[#1f1a16] px-3 py-3 text-center">
            <p className="text-lg font-bold text-emerald-200">{stats.active}</p>
            <p className="text-[10px] text-stone-500">Active</p>
          </div>
          <div className="rounded-xl border border-[#332b25] bg-[#1f1a16] px-3 py-3 text-center">
            <p className="text-lg font-bold text-stone-200">{stats.inactive}</p>
            <p className="text-[10px] text-stone-500">Hidden</p>
          </div>
        </div>
      </motion.div>

      {showAddForm && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border border-[#2c2722] bg-[#171411] shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
            <CardContent className="space-y-4 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-stone-100">Add gallery image</h2>
                  <p className="text-xs text-stone-400">Upload a customer image and attach the basic metadata.</p>
                </div>
                <button
                  type="button"
                  onClick={resetUploadState}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#3a3129] bg-[#191613] text-stone-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div
                className={`rounded-2xl border-2 border-dashed p-4 text-center transition-colors ${
                  isDragOver
                    ? 'border-[#c96b2c] bg-[#241b14]'
                    : 'border-[#3a3129] bg-[#11100f] hover:border-[#5a4a3f]'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {previewUrl ? (
                  <div className="space-y-3">
                    <div className="relative mx-auto aspect-[3/4] max-w-[220px] overflow-hidden rounded-2xl border border-[#312924]">
                      <Image src={previewUrl} alt="Preview" fill unoptimized className="object-cover" />
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedImage(null);
                        setPreviewUrl('');
                      }}
                      className="rounded-2xl border-[#4a2d2d] bg-[#1e1515] text-rose-200 hover:border-[#7a3e3e] hover:bg-[#281818]"
                    >
                      Remove image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#312924] bg-[#171411]">
                      <Upload className="h-5 w-5 text-stone-500" />
                    </div>
                    <div>
                      <label htmlFor="mobile-gallery-upload" className="cursor-pointer">
                        <span className={`block text-sm font-medium ${isDragOver ? 'text-orange-300' : 'text-stone-100'}`}>
                          {isDragOver ? 'Drop image here' : 'Tap to upload or drag here'}
                        </span>
                        <span className="mt-1 block text-xs text-stone-500">PNG, JPG, GIF up to 10MB</span>
                      </label>
                      <input
                        id="mobile-gallery-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={newImage.customer}
                  onChange={(e) => setNewImage((current) => ({ ...current, customer: e.target.value }))}
                  placeholder="Customer name"
                  className="w-full rounded-2xl border border-[#322b26] bg-[#11100f] p-3 text-stone-100 outline-none focus:border-[#c96b2c]"
                />
                <select
                  value={newImage.camera}
                  onChange={(e) => setNewImage((current) => ({ ...current, camera: e.target.value }))}
                  className="w-full rounded-2xl border border-[#322b26] bg-[#11100f] p-3 text-stone-100 outline-none focus:border-[#c96b2c]"
                >
                  <option value="">Select camera</option>
                  <option value="Osmo Pocket 3">Osmo Pocket 3</option>
                  <option value="Action 5 Pro">Action 5 Pro</option>
                </select>
                <input
                  type="text"
                  value={newImage.location}
                  onChange={(e) => setNewImage((current) => ({ ...current, location: e.target.value }))}
                  placeholder="Location"
                  className="w-full rounded-2xl border border-[#322b26] bg-[#11100f] p-3 text-stone-100 outline-none focus:border-[#c96b2c]"
                />
                <input
                  type="text"
                  value={newImage.alt}
                  onChange={(e) => setNewImage((current) => ({ ...current, alt: e.target.value }))}
                  placeholder="Alt text (optional)"
                  className="w-full rounded-2xl border border-[#322b26] bg-[#11100f] p-3 text-stone-100 outline-none focus:border-[#c96b2c]"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={resetUploadState}
                  variant="outline"
                  className="flex-1 rounded-2xl border-[#3a3129] bg-[#191613] text-stone-200 hover:bg-[#221d18]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={addImage}
                  disabled={!selectedImage || !newImage.customer || !newImage.camera || !newImage.location || isUploading}
                  className="flex-1 rounded-2xl bg-[#c96b2c] text-stone-950 hover:bg-[#d97a39] disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Add Image'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {sections.map((section, index) => (
        <motion.div
          key={section.key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(index * 0.05, 0.2) }}
          className="space-y-3"
        >
          <div className="rounded-2xl border border-[#2c2722] bg-[#171411] px-4 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-stone-100">{section.title}</h2>
                <p className="mt-1 text-sm text-stone-400">{section.description}</p>
              </div>
              <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${section.badgeClasses}`}>
                {section.images.length}
              </span>
            </div>
          </div>

          {section.images.length > 0 ? (
            section.images.map((image) => {
              const ActionIcon = section.actionIcon;

              return (
                <Card key={image.id} className="overflow-hidden border border-[#2c2722] bg-[#171411] shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
                  <div className="relative aspect-[4/5] bg-[#12100f]">
                    <Image
                      src={image.image_url}
                      alt={image.alt_text}
                      fill
                      unoptimized
                      className={`object-cover ${section.imageTone}`}
                    />
                    <div className="absolute right-3 top-3">
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${section.badgeClasses}`}>
                        {section.badgeLabel}
                      </span>
                    </div>
                  </div>

                  <CardContent className="space-y-3 p-4">
                    <div>
                      <h3 className="text-base font-semibold text-stone-100">{image.customer_name}</h3>
                      <div className="mt-2 space-y-1.5 text-sm text-stone-400">
                        <div className="flex items-center gap-2">
                          <Images className="h-4 w-4 text-stone-500" />
                          <span>{image.camera_used}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-stone-500" />
                          <span>{image.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Upload className="h-4 w-4 text-stone-500" />
                          <span>{new Date(image.upload_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => toggleImageStatus(image.id)}
                        variant="outline"
                        className={`rounded-2xl border ${section.actionClasses}`}
                      >
                        <ActionIcon className="mr-2 h-4 w-4" />
                        {section.actionLabel}
                      </Button>
                      <Button
                        onClick={() => deleteImage(image.id)}
                        variant="outline"
                        className="rounded-2xl border-[#4a2d2d] bg-[#1e1515] text-rose-200 hover:border-[#7a3e3e] hover:bg-[#281818] hover:text-rose-100"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="border border-[#2c2722] bg-[#171411] shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
              <CardContent className="px-4 py-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#312924] bg-[#12100f]">
                  <Images className="h-6 w-6 text-stone-500" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-stone-100">{section.emptyTitle}</h3>
                <p className="mt-2 text-sm text-stone-500">{section.emptyText}</p>
                {section.key === 'active' && (
                  <Button
                    onClick={() => setShowAddForm(true)}
                    className="mt-5 rounded-2xl bg-[#c96b2c] text-stone-950 hover:bg-[#d97a39]"
                  >
                    Add First Image
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      ))}

      {!showAddForm && (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#c96b2c] text-stone-950 shadow-[0_18px_45px_rgba(201,107,44,0.35)] active:scale-95"
        >
          <ImagePlus className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}

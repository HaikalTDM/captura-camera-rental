'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useIsMobile } from '@/hooks/useIsMobile';
import {
  getGalleryImages,
  getGalleryStats,
  addGalleryImage,
  toggleImageStatus as toggleStatus,
  deleteGalleryImage,
  uploadImage,
  type GalleryImage,
} from '../../../lib/api/gallery';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MobileGallery from '@/components/admin/MobileGallery';
import { AnimatedToastContainer, useAnimatedToast } from '@/components/ui/animated-toast';

export default function GalleryPage() {
  const isMobile = useIsMobile(768);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const {
    toasts,
    success: showSuccess,
    error: showError,
    warning: showWarning,
    removeToast,
  } = useAnimatedToast();
  const [newImage, setNewImage] = useState({
    customer: '',
    camera: '',
    location: '',
    alt: '',
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [imagesData, statsData] = await Promise.all([
        getGalleryImages(),
        getGalleryStats(),
      ]);
      setImages(imagesData);
      setStats(statsData);
    } catch (loadError) {
      console.error('Error loading gallery data:', loadError);
      showError('Failed to load gallery', 'Please refresh and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showWarning('Invalid file type', 'Please select an image file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showWarning('File too large', 'File size must be less than 10MB.');
      return;
    }

    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const resetUploadState = () => {
    setShowAddForm(false);
    setSelectedImage(null);
    setPreviewUrl('');
    setIsDragOver(false);
    setNewImage({ customer: '', camera: '', location: '', alt: '' });
  };

  const addImage = async () => {
    if (!selectedImage || !newImage.customer || !newImage.camera || !newImage.location) {
      showWarning('Missing details', 'Please fill in all fields and select an image.');
      return;
    }

    setIsUploading(true);
    try {
      const imageUrl = await uploadImage(selectedImage);
      if (!imageUrl) {
        showError('Upload failed', 'Please try again.');
        return;
      }

      const newImageData = {
        customer_name: newImage.customer,
        camera_used: newImage.camera,
        location: newImage.location,
        image_url: imageUrl,
        alt_text: newImage.alt || `${newImage.customer} with ${newImage.camera}`,
        upload_date: new Date().toISOString().split('T')[0],
      };

      const createdImage = await addGalleryImage(newImageData);
      if (createdImage) {
        await loadData();
        resetUploadState();
        showSuccess('Image uploaded', `${createdImage.customer_name} is now in the gallery.`);
      } else {
        showError('Failed to save image data', 'Please try again.');
      }
    } catch (uploadError) {
      console.error('Error adding image:', uploadError);
      showError('Upload failed', 'An unexpected error occurred while uploading the image.');
    } finally {
      setIsUploading(false);
    }
  };

  const toggleImageStatus = async (id: string) => {
    try {
      const toggleSuccess = await toggleStatus(id);
      if (toggleSuccess) {
        await loadData();
        successToast('Gallery visibility updated', 'The website display status has been updated.');
      } else {
        showError('Failed to update image status', 'Please try again.');
      }
    } catch (toggleError) {
      console.error('Error toggling image status:', toggleError);
      showError('Update failed', 'An error occurred while updating the image.');
    }
  };

  const deleteImage = async (id: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      try {
        const deleteSuccess = await deleteGalleryImage(id);
        if (deleteSuccess) {
          const deletedName = images.find((image) => image.id === id)?.customer_name || 'Image';
          await loadData();
          showSuccess('Image deleted', `${deletedName} was removed from the gallery.`);
        } else {
          showError('Failed to delete image', 'Please try again.');
        }
      } catch (deleteError) {
        console.error('Error deleting image:', deleteError);
        showError('Delete failed', 'An error occurred while deleting the image.');
      }
    }
  };

  const successToast = (message: string, description: string) => {
    showSuccess(message, description);
  };

  const activeImages = useMemo(() => images.filter((image) => image.is_active), [images]);
  const inactiveImages = useMemo(() => images.filter((image) => !image.is_active), [images]);

  const gallerySections = [
    {
      key: 'active',
      title: `Active Images (${activeImages.length})`,
      description: 'These images are currently displayed on the main website carousel.',
      images: activeImages,
      badgeLabel: 'Active',
      badgeClasses: 'border-[#30412f] bg-[#1f2b20] text-emerald-200',
      sectionTone: 'border-[#2c2722] bg-[#171411]',
      imageTone: 'grayscale-0',
      actionLabel: 'Hide',
      actionIcon: EyeOff,
      actionClasses: 'border-[#4b3723] bg-[#2b2117] text-orange-200 hover:border-[#c96b2c] hover:bg-[#352617]',
      emptyTitle: 'No Active Images',
      emptyText: 'Upload some customer photos to display on your website.',
    },
    {
      key: 'inactive',
      title: `Hidden Images (${inactiveImages.length})`,
      description: 'These images are saved in your gallery but are not currently displayed on the website.',
      images: inactiveImages,
      badgeLabel: 'Hidden',
      badgeClasses: 'border-[#3a3129] bg-[#221f1b] text-stone-300',
      sectionTone: 'border-[#2c2722] bg-[#171411]',
      imageTone: 'grayscale',
      actionLabel: 'Show',
      actionIcon: Eye,
      actionClasses: 'border-[#30412f] bg-[#1f2b20] text-emerald-200 hover:border-[#4c8b5b] hover:bg-[#253527]',
      emptyTitle: 'No Hidden Images',
      emptyText: 'Hidden gallery items will appear here once you disable them from the website.',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[#c96b2c]"></div>
          <p className="mt-4 text-stone-500">Loading gallery management...</p>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <MobileGallery
        images={images}
        activeImages={activeImages}
        inactiveImages={inactiveImages}
        stats={stats}
        showAddForm={showAddForm}
        setShowAddForm={setShowAddForm}
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        previewUrl={previewUrl}
        setPreviewUrl={setPreviewUrl}
        isDragOver={isDragOver}
        setIsDragOver={setIsDragOver}
        isUploading={isUploading}
        newImage={newImage}
        setNewImage={setNewImage}
        handleImageSelect={handleImageSelect}
        handleDragOver={handleDragOver}
        handleDragLeave={handleDragLeave}
        handleDrop={handleDrop}
        resetUploadState={resetUploadState}
        addImage={addImage}
        toggleImageStatus={toggleImageStatus}
        deleteImage={deleteImage}
      />
    );
  }

  return (
    <>
      <AnimatedToastContainer toasts={toasts} onClose={removeToast} />
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
                  <Images className="h-3.5 w-3.5 text-orange-300" />
                  Gallery desk
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-tight text-stone-50">Gallery Management</h1>
                  <p className="max-w-2xl text-sm leading-6 text-stone-400">
                    Curate customer moments for the public site, keep your live carousel fresh, and control what stays visible without leaving the admin shell.
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setShowAddForm(true)}
                className="h-11 gap-2 rounded-xl bg-[#c96b2c] text-black hover:bg-[#d97a39]"
              >
                <ImagePlus className="h-4 w-4" />
                Add New Image
              </Button>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-[#2f2924] bg-[#171411] p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Total images</p>
                <p className="mt-3 text-3xl font-semibold text-stone-50">{stats.total}</p>
                <p className="mt-2 text-sm text-stone-400">Every saved gallery image currently in the CMS.</p>
              </div>
              <div className="rounded-2xl border border-[#2f2924] bg-[#171411] p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Active images</p>
                <p className="mt-3 text-3xl font-semibold text-stone-50">{stats.active}</p>
                <p className="mt-2 text-sm text-stone-400">Images actively visible on the live website carousel.</p>
              </div>
              <div className="rounded-2xl border border-[#3f3125] bg-[#241b14] p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Hidden images</p>
                <p className="mt-3 text-3xl font-semibold text-stone-50">{stats.inactive}</p>
                <p className="mt-2 text-sm text-stone-400">Saved items kept off the site but available for reuse later.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[30px] border border-[#2d2722] bg-[#171411] shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
          <CardHeader className="border-b border-[#26211d] pb-4">
            <CardTitle className="text-lg text-stone-50">Gallery Notes</CardTitle>
            <CardDescription className="text-stone-400">
              A quick read before you upload or hide content.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            <div className="rounded-2xl border border-[#2c2621] bg-[#1d1a17] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Upload workflow</p>
              <p className="mt-2 text-sm leading-6 text-stone-300">
                Upload a single customer image, attach camera and location metadata, and publish it straight to the website carousel.
              </p>
            </div>
            <div className="rounded-2xl border border-[#2c2621] bg-[#1d1a17] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Visibility control</p>
              <p className="mt-2 text-sm leading-6 text-stone-300">
                Hidden images stay in the gallery archive, so you can bring them back later without uploading again.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[30px] border border-[#2d2722] bg-[#171411] shadow-[0_30px_80px_rgba(0,0,0,0.42)]"
          >
            <div className="border-b border-[#26211d] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-stone-50">Add New Gallery Image</h2>
                  <p className="mt-1 text-stone-400">Upload a customer photo to display on the main website.</p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={resetUploadState}
                  className="h-10 w-10 rounded-2xl border-[#3a3129] bg-[#191613] text-stone-200 hover:bg-[#221d18]"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-6 p-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-300">Upload Image</label>
                <div
                  className={`rounded-[24px] border-2 border-dashed p-6 text-center transition-colors ${
                    isDragOver
                      ? 'border-[#c96b2c] bg-[#241b14]'
                      : 'border-[#3a3129] bg-[#11100f] hover:border-[#5a4a3f]'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {previewUrl ? (
                    <div className="space-y-4">
                      <div className="relative mx-auto h-64 max-w-sm overflow-hidden rounded-2xl border border-[#312924]">
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedImage(null);
                          setPreviewUrl('');
                        }}
                        className="h-10 rounded-2xl border-[#4a2d2d] bg-[#1e1515] text-rose-200 hover:border-[#7a3e3e] hover:bg-[#281818]"
                      >
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#312924] bg-[#171411]">
                        <Upload className="h-6 w-6 text-stone-500" />
                      </div>
                      <div className="mt-4">
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <span className={`block text-sm font-medium ${isDragOver ? 'text-orange-300' : 'text-stone-100'}`}>
                            {isDragOver ? 'Drop image here' : 'Click to upload or drag and drop'}
                          </span>
                          <span className="mt-1 block text-xs text-stone-500">
                            PNG, JPG, GIF up to 10MB
                          </span>
                        </label>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-300">Customer Name</label>
                  <input
                    type="text"
                    value={newImage.customer}
                    onChange={(e) => setNewImage({ ...newImage, customer: e.target.value })}
                    placeholder="e.g., Sarah"
                    className="admin-dark-input"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-300">Camera Used</label>
                  <select
                    value={newImage.camera}
                    onChange={(e) => setNewImage({ ...newImage, camera: e.target.value })}
                    className="admin-dark-select"
                  >
                    <option value="">Select camera</option>
                    <option value="Osmo Pocket 3">Osmo Pocket 3</option>
                    <option value="Action 5 Pro">Action 5 Pro</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-300">Location</label>
                  <input
                    type="text"
                    value={newImage.location}
                    onChange={(e) => setNewImage({ ...newImage, location: e.target.value })}
                    placeholder="e.g., Kuala Lumpur"
                    className="admin-dark-input"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-300">Alt Text (Optional)</label>
                  <input
                    type="text"
                    value={newImage.alt}
                    onChange={(e) => setNewImage({ ...newImage, alt: e.target.value })}
                    placeholder="Auto-generated if empty"
                    className="admin-dark-input"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#26211d] p-6">
              <Button
                onClick={resetUploadState}
                variant="outline"
                className="h-11 rounded-2xl border-[#3a3129] bg-[#191613] text-stone-200 hover:bg-[#221d18]"
              >
                Cancel
              </Button>
              <Button
                onClick={addImage}
                disabled={!selectedImage || !newImage.customer || !newImage.camera || !newImage.location || isUploading}
                className="h-11 rounded-2xl bg-[#c96b2c] text-black hover:bg-[#d97a39] disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black"></div>
                    Uploading...
                  </>
                ) : (
                  'Add Image'
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {gallerySections.map((section, index) => (
        <motion.div
          key={section.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + index * 0.05 }}
          className="space-y-6"
        >
          <Card className={`rounded-[30px] border shadow-[0_30px_70px_rgba(0,0,0,0.32)] ${section.sectionTone}`}>
            <CardHeader className="border-b border-[#26211d] pb-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <CardTitle className="text-xl text-stone-50">{section.title}</CardTitle>
                  <CardDescription className="mt-1 text-stone-400">{section.description}</CardDescription>
                </div>
                <div className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${section.badgeClasses}`}>
                  {section.images.length} items
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              {section.images.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {section.images.map((image) => {
                    const ActionIcon = section.actionIcon;

                    return (
                      <div
                        key={image.id}
                        className="overflow-hidden rounded-[26px] border border-[#2d2722] bg-[#12100f] shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
                      >
                        <div className="relative aspect-[3/4] bg-[#171411]">
                          <Image
                            src={image.image_url}
                            alt={image.alt_text}
                            fill
                            unoptimized
                            className={`object-cover ${section.imageTone}`}
                          />
                          <div className="absolute right-3 top-3">
                            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${section.badgeClasses}`}>
                              {section.badgeLabel}
                            </span>
                          </div>
                        </div>

                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-stone-50">{image.customer_name}</h3>
                          <div className="mt-3 space-y-2 text-sm text-stone-400">
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

                          <div className="mt-4 flex gap-2">
                            <Button
                              onClick={() => toggleImageStatus(image.id)}
                              variant="outline"
                              className={`flex-1 h-10 rounded-2xl border ${section.actionClasses}`}
                            >
                              <ActionIcon className="mr-2 h-4 w-4" />
                              {section.actionLabel}
                            </Button>
                            <Button
                              onClick={() => deleteImage(image.id)}
                              variant="outline"
                              className="flex-1 h-10 rounded-2xl border-[#4a2d2d] bg-[#1e1515] text-rose-200 hover:border-[#7a3e3e] hover:bg-[#281818] hover:text-rose-100"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#312924] bg-[#171411]">
                    <Images className="h-8 w-8 text-stone-500" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-stone-50">{section.emptyTitle}</h3>
                  <p className="mt-2 text-stone-400">{section.emptyText}</p>
                  {section.key === 'active' && (
                    <Button
                      onClick={() => setShowAddForm(true)}
                      className="mt-6 h-11 rounded-2xl bg-[#c96b2c] text-black hover:bg-[#d97a39]"
                    >
                      Add First Image
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
      </div>
    </>
  );
}

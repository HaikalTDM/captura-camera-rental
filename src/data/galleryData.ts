export interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  customer: string;
  camera: string;
  location: string;
  uploadDate: string;
  isActive: boolean;
}

// Default gallery data
const defaultGalleryImages: GalleryImage[] = [
  {
    id: 1,
    src: "/api/placeholder/300/400",
    alt: "Customer with DJI Osmo Pocket 3",
    customer: "Sarah",
    camera: "Osmo Pocket 3",
    location: "Kuala Lumpur",
    uploadDate: "2024-01-15",
    isActive: true
  },
  {
    id: 2,
    src: "/api/placeholder/300/400",
    alt: "Customer with DJI Action 5 Pro",
    customer: "Marcus",
    camera: "Action 5 Pro",
    location: "Langkawi",
    uploadDate: "2024-01-14",
    isActive: true
  },
  {
    id: 3,
    src: "/api/placeholder/300/400",
    alt: "Customer with camera equipment",
    customer: "Lisa",
    camera: "Osmo Pocket 3",
    location: "Penang",
    uploadDate: "2024-01-13",
    isActive: true
  },
  {
    id: 4,
    src: "/api/placeholder/300/400",
    alt: "Adventure photography",
    customer: "Ahmad",
    camera: "Action 5 Pro",
    location: "Cameron Highlands",
    uploadDate: "2024-01-12",
    isActive: false
  },
  {
    id: 5,
    src: "/api/placeholder/300/400",
    alt: "Travel photography",
    customer: "Mei Lin",
    camera: "Osmo Pocket 3",
    location: "Genting Highlands",
    uploadDate: "2024-01-11",
    isActive: true
  },
  {
    id: 6,
    src: "/api/placeholder/300/400",
    alt: "Beach photography",
    customer: "David",
    camera: "Action 5 Pro",
    location: "Redang Island",
    uploadDate: "2024-01-10",
    isActive: true
  },
  {
    id: 7,
    src: "/api/placeholder/300/400",
    alt: "City photography",
    customer: "Priya",
    camera: "Osmo Pocket 3",
    location: "Johor Bahru",
    uploadDate: "2024-01-09",
    isActive: true
  },
  {
    id: 8,
    src: "/api/placeholder/300/400",
    alt: "Nature photography",
    customer: "Rahman",
    camera: "Action 5 Pro",
    location: "Taman Negara",
    uploadDate: "2024-01-08",
    isActive: true
  }
];

// Storage key for localStorage
const STORAGE_KEY = 'captura_gallery_images';

// Load images from localStorage or use defaults
const loadGalleryImages = (): GalleryImage[] => {
  if (typeof window === 'undefined') return defaultGalleryImages;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : defaultGalleryImages;
    }
  } catch (error) {
    console.error('Error loading gallery images:', error);
  }

  return defaultGalleryImages;
};

// Save images to localStorage
const saveGalleryImages = (images: GalleryImage[]): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
    // Trigger storage event for cross-tab updates
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEY,
      newValue: JSON.stringify(images)
    }));
  } catch (error) {
    console.error('Error saving gallery images:', error);
  }
};

// Get current gallery images
export const getGalleryImages = (): GalleryImage[] => {
  return loadGalleryImages();
};

// Helper functions for gallery management
export const getActiveImages = (): GalleryImage[] => {
  return getGalleryImages().filter(image => image.isActive);
};

export const getInactiveImages = (): GalleryImage[] => {
  return getGalleryImages().filter(image => !image.isActive);
};

export const addGalleryImage = (imageData: Omit<GalleryImage, 'id' | 'uploadDate'>): GalleryImage => {
  const currentImages = getGalleryImages();
  const newImage: GalleryImage = {
    ...imageData,
    id: currentImages.length > 0 ? Math.max(...currentImages.map(img => img.id)) + 1 : 1,
    uploadDate: new Date().toISOString().split('T')[0]
  };

  const updatedImages = [newImage, ...currentImages];
  saveGalleryImages(updatedImages);
  return newImage;
};

export const updateGalleryImage = (id: number, updates: Partial<GalleryImage>): boolean => {
  const currentImages = getGalleryImages();
  const index = currentImages.findIndex(img => img.id === id);
  if (index !== -1) {
    currentImages[index] = { ...currentImages[index], ...updates };
    saveGalleryImages(currentImages);
    return true;
  }
  return false;
};

export const deleteGalleryImage = (id: number): boolean => {
  const currentImages = getGalleryImages();
  const index = currentImages.findIndex(img => img.id === id);
  if (index !== -1) {
    currentImages.splice(index, 1);
    saveGalleryImages(currentImages);
    return true;
  }
  return false;
};

export const toggleImageStatus = (id: number): boolean => {
  const currentImages = getGalleryImages();
  const image = currentImages.find(img => img.id === id);
  if (image) {
    image.isActive = !image.isActive;
    saveGalleryImages(currentImages);
    return true;
  }
  return false;
};

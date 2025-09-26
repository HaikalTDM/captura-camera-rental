// Admin-editable add-ons data structure
// This file will be replaced with database calls in the future

export interface AddOn {
  id: string;
  name: string;
  price: number; // Store as number for calculations
  description: string;
  category: 'time' | 'delivery' | 'extras' | 'premium';
  isActive: boolean;
  sortOrder: number;
  icon?: string; // Optional icon identifier
  createdAt: string;
  updatedAt: string;
}

export interface AddOnCategory {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

// Admin-editable categories
export const addOnCategories: AddOnCategory[] = [
  {
    id: 'time',
    name: 'Time Extensions',
    description: 'Additional coverage hours and extended services',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'delivery',
    name: 'Delivery & Processing',
    description: 'Fast delivery and processing options',
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'extras',
    name: 'Physical Products',
    description: 'Prints, albums, and tangible items',
    sortOrder: 3,
    isActive: true
  },
  {
    id: 'premium',
    name: 'Premium Services',
    description: 'Special and premium photography services',
    sortOrder: 4,
    isActive: true
  }
];

// Admin-editable add-ons
export const addOnsData: AddOn[] = [
  {
    id: 'additional-hour',
    name: 'Additional Hour',
    price: 100,
    description: 'Extend your coverage with additional hours of professional photography.',
    category: 'time',
    isActive: true,
    sortOrder: 1,
    icon: 'clock',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'overtime-coverage',
    name: 'Overtime Coverage (per hour)',
    price: 120,
    description: 'Extended coverage beyond standard package hours with premium rates.',
    category: 'time',
    isActive: true,
    sortOrder: 2,
    icon: 'clock',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'same-day-edit',
    name: 'Same Day Edit Video',
    price: 300,
    description: 'Quick highlight video ready for your reception or social media sharing.',
    category: 'delivery',
    isActive: true,
    sortOrder: 1,
    icon: 'video',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'rush-delivery',
    name: 'Rush Delivery (48 hours)',
    price: 200,
    description: 'Get your professionally edited photos delivered within 48 hours.',
    category: 'delivery',
    isActive: true,
    sortOrder: 2,
    icon: 'fast-forward',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'express-delivery',
    name: 'Express Delivery (24 hours)',
    price: 350,
    description: 'Premium express delivery with edited photos in just 24 hours.',
    category: 'delivery',
    isActive: true,
    sortOrder: 3,
    icon: 'zap',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'physical-prints',
    name: 'Physical Photo Prints (50 pieces)',
    price: 150,
    description: 'High-quality physical prints of your favorite photos professionally printed.',
    category: 'extras',
    isActive: true,
    sortOrder: 1,
    icon: 'image',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'photo-album',
    name: 'Premium Photo Album',
    price: 400,
    description: 'Professionally designed and bound photo album featuring your best moments.',
    category: 'extras',
    isActive: true,
    sortOrder: 2,
    icon: 'book',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'canvas-prints',
    name: 'Canvas Prints (3 pieces)',
    price: 250,
    description: 'Gallery-quality canvas prints perfect for home or office display.',
    category: 'extras',
    isActive: true,
    sortOrder: 3,
    icon: 'image',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'drone-coverage',
    name: 'Drone Coverage',
    price: 250,
    description: 'Stunning aerial shots and cinematic drone footage of your venue and surroundings.',
    category: 'premium',
    isActive: true,
    sortOrder: 1,
    icon: 'plane',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'live-streaming',
    name: 'Live Streaming Setup',
    price: 500,
    description: 'Professional live streaming setup for remote family and friends.',
    category: 'premium',
    isActive: true,
    sortOrder: 2,
    icon: 'broadcast',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'engagement-session',
    name: 'Pre-Wedding Engagement Session',
    price: 300,
    description: 'Separate engagement photo session to capture your love story.',
    category: 'premium',
    isActive: true,
    sortOrder: 3,
    icon: 'heart',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Helper functions for admin operations
export const getActiveAddOns = (): AddOn[] => {
  return addOnsData.filter(addon => addon.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
};

export const getAddOnsByCategory = (category: string): AddOn[] => {
  return addOnsData
    .filter(addon => addon.category === category && addon.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
};

export const getActiveCategories = (): AddOnCategory[] => {
  return addOnCategories.filter(cat => cat.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
};

// Format price for display
export const formatPrice = (price: number): string => {
  return `RM${price.toLocaleString()}`;
};

// Admin functions (will be replaced with API calls)
export const addNewAddOn = (addon: Omit<AddOn, 'id' | 'createdAt' | 'updatedAt'>): AddOn => {
  const newAddOn: AddOn = {
    ...addon,
    id: `addon-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  addOnsData.push(newAddOn);
  return newAddOn;
};

export const updateAddOn = (id: string, updates: Partial<AddOn>): AddOn | null => {
  const index = addOnsData.findIndex(addon => addon.id === id);
  if (index === -1) return null;
  
  addOnsData[index] = {
    ...addOnsData[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  return addOnsData[index];
};

export const deleteAddOn = (id: string): boolean => {
  const index = addOnsData.findIndex(addon => addon.id === id);
  if (index === -1) return false;
  
  addOnsData.splice(index, 1);
  return true;
};

export const toggleAddOnStatus = (id: string): AddOn | null => {
  const addon = addOnsData.find(addon => addon.id === id);
  if (!addon) return null;
  
  return updateAddOn(id, { isActive: !addon.isActive });
};

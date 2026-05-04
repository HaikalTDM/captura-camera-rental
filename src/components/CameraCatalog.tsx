'use client';

import { useEffect, useState } from 'react';
import { getPublicCameras } from '@/lib/api/bookings';
import { Camera, CustomerDetails } from '@/types';
import { getDiscountThreshold, getExtendedDailyRate } from '@/lib/cameraPricing';
import CameraCard from './CameraCard';
import SpecsBottomSheet from './SpecsBottomSheet';
import BookingBottomSheet from './BookingBottomSheet';
import RentalKitBottomSheet from './RentalKitBottomSheet';

interface RentalCamera extends Camera {
  tags?: string[];
  tidyCalPath?: string;
}

interface CameraCatalogProps {
  onBookCamera: (
    camera: Camera,
    startDate?: Date,
    endDate?: Date,
    totalCost?: number,
    customerDetails?: CustomerDetails,
    totalDays?: number,
    dailyRate?: number
  ) => void;
  variant?: 'default' | 'dark';
  initialOpenRentalKit?: boolean;
}

const RENTAL_KIT_STORAGE_KEY = 'captura_rental_kit_ids';
const RENTAL_KIT_EVENT = 'captura-rental-kit-updated';

const getStaticImages = (cameraName: string) => {
  const name = cameraName.toLowerCase();

  if (name.includes('insta360') && name.includes('x5')) {
    return {
      main: '/images/Insta360-X5.webp',
      variant: '/images/Insta360-X5-1.webp',
    };
  }

  if (name.includes('canon') && name.includes('r50')) {
    return {
      main: '/images/R50.png',
      variant: '/images/R50-1.png',
    };
  }

  if (name.includes('osmo') && name.includes('pocket')) {
    return {
      main: '/images/osmo-pocket-31.jpg',
      variant: '/images/osmo_pocket_3_creator_combo.jpg',
    };
  }

  if (name.includes('action') && name.includes('5')) {
    return {
      main: '/images/dji-action-5-pro1.jpg',
      variant: '/images/osmo_action_5_pro_adventure_combo.jpg',
    };
  }

  if (name.includes('action')) {
    return {
      main: '/images/dji-action-5-pro1.jpg',
      variant: '/images/osmo_action_5_pro_adventure_combo.jpg',
    };
  }

  if (name.includes('osmo')) {
    return {
      main: '/images/osmo-pocket-31.jpg',
      variant: '/images/osmo_pocket_3_creator_combo.jpg',
    };
  }

  if (name.includes('fujifilm') || name.includes('fuji')) {
    return {
      main: '/images/fujifilm_xt30.png',
      variant: '/images/fujifilm_xt30.png',
    };
  }

  return {
    main: '/images/osmo-pocket-31.jpg',
    variant: '/images/osmo_pocket_3_creator_combo.jpg',
  };
};

const getTags = (cameraName: string): string[] => {
  const name = cameraName.toLowerCase();
  if (name.includes('pocket')) return ['Vlogging', 'Travel', 'Compact'];
  if (name.includes('action')) return ['Diving', 'Sports', 'Waterproof'];
  if (name.includes('insta360')) return ['360', 'Creative', 'Travel'];
  if (name.includes('canon') || name.includes('sony')) return ['Photography', 'Portrait', 'Pro'];
  return ['Professional', 'Rental'];
};

export default function CameraCatalog({
  onBookCamera,
  variant = 'default',
  initialOpenRentalKit = false,
}: CameraCatalogProps) {
  const [cameras, setCameras] = useState<RentalCamera[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCameraForSpecs, setSelectedCameraForSpecs] = useState<Camera | null>(null);
  const [isSpecsModalOpen, setIsSpecsModalOpen] = useState(false);
  const [selectedCameraForBooking, setSelectedCameraForBooking] = useState<Camera | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [rentalKit, setRentalKit] = useState<Camera[]>([]);
  const [isRentalKitOpen, setIsRentalKitOpen] = useState(false);
  const [storedRentalKitIds, setStoredRentalKitIds] = useState<string[]>([]);
  const [hasLoadedStoredKit, setHasLoadedStoredKit] = useState(false);

  const isDark = variant === 'dark';
  const isKitFull = rentalKit.length >= 3;

  useEffect(() => {
    loadCameras();
  }, []);

  useEffect(() => {
    try {
      const rawValue = window.localStorage.getItem(RENTAL_KIT_STORAGE_KEY);
      if (!rawValue) {
        setHasLoadedStoredKit(true);
        return;
      }

      const parsed = JSON.parse(rawValue);
      if (Array.isArray(parsed)) {
        setStoredRentalKitIds(parsed.filter((value): value is string => typeof value === 'string'));
      }
    } catch (error) {
      console.error('Error restoring rental kit:', error);
    } finally {
      setHasLoadedStoredKit(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedStoredKit || cameras.length === 0) return;

    setRentalKit((current) => {
      if (current.length > 0) return current;

      const restored = storedRentalKitIds
        .map((cameraId) => cameras.find((camera) => camera.id === cameraId))
        .filter((camera): camera is Camera => Boolean(camera))
        .slice(0, 3);

      return restored;
    });
  }, [cameras, hasLoadedStoredKit, storedRentalKitIds]);

  useEffect(() => {
    if (!initialOpenRentalKit || !hasLoadedStoredKit) return;
    if (rentalKit.length === 0) return;

    setIsRentalKitOpen(true);
  }, [hasLoadedStoredKit, initialOpenRentalKit, rentalKit]);

  useEffect(() => {
    if (!hasLoadedStoredKit) return;

    try {
      const rentalKitIds = rentalKit.map((camera) => camera.id);
      window.localStorage.setItem(RENTAL_KIT_STORAGE_KEY, JSON.stringify(rentalKitIds));
      window.dispatchEvent(new CustomEvent(RENTAL_KIT_EVENT, { detail: { count: rentalKitIds.length } }));
    } catch (error) {
      console.error('Error saving rental kit:', error);
    }
  }, [hasLoadedStoredKit, rentalKit]);

  const loadCameras = async () => {
    try {
      const dbCameras = await getPublicCameras();
      const availableCameras = dbCameras.filter((camera) => camera.is_available);
      const sortedCameras = [...availableCameras].sort((a, b) => {
        const orderA = a.display_order ?? 999;
        const orderB = b.display_order ?? 999;
        return orderA - orderB;
      });

      const convertedCameras: Camera[] = sortedCameras.map((dbCamera) => {
        const cameraImages = getStaticImages(dbCamera.name);
        const cameraTags = getTags(dbCamera.name);
        const primaryImage = dbCamera.image_url || cameraImages.main;
        const imageFallbacks = [primaryImage, cameraImages.main, cameraImages.variant].filter(
          (image, index, images) => Boolean(image) && images.indexOf(image) === index
        );

        const baseCameraInfo: Camera & { tags?: string[] } = {
          id: dbCamera.id,
          name: dbCamera.name,
          description: dbCamera.description || 'Professional camera equipment for your creative projects.',
          image: primaryImage,
          images: imageFallbacks,
          dailyRate: dbCamera.daily_rate,
          discountRate: getExtendedDailyRate(dbCamera),
          discountThreshold: getDiscountThreshold(dbCamera),
          features: [
            `${dbCamera.type.charAt(0).toUpperCase() + dbCamera.type.slice(1)} Camera`,
            `RM${dbCamera.daily_rate}/day rental`,
            'Professional grade equipment',
            'Includes basic accessories',
            'Full insurance coverage',
            'Technical support included',
          ],
          specifications: typeof dbCamera.specifications === 'object' ? dbCamera.specifications : {},
          tidyCalPath: `haikaltdm46/${dbCamera.id}`,
          tags: cameraTags,
        };

        if (dbCamera.name.toLowerCase().includes('fujifilm')) {
          baseCameraInfo.variants = [
            {
              id: 'kit-lens',
              name: 'Basic Kit Lens',
              dailyRate: 100,
              discountRate: 90,
            },
            {
              id: '18-50mm',
              name: '18-50mm Lens',
              dailyRate: 130,
              discountRate: 120,
            },
          ];
        }

        return baseCameraInfo;
      });

      setCameras(convertedCameras);
    } catch (error) {
      console.error('Error loading cameras:', error);
      setCameras([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewSpecs = (camera: Camera) => {
    setSelectedCameraForSpecs(camera);
    setIsSpecsModalOpen(true);
  };

  const handleCloseSpecsModal = () => {
    setIsSpecsModalOpen(false);
    setTimeout(() => {
      setSelectedCameraForSpecs(null);
    }, 300);
  };

  const handleBookNow = (camera: Camera) => {
    setSelectedCameraForBooking(camera);
    setIsBookingModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setTimeout(() => {
      setSelectedCameraForBooking(null);
    }, 300);
  };

  const handleAddToKit = (camera: Camera) => {
    setRentalKit((current) => {
      if (current.some((item) => item.id === camera.id) || current.length >= 3) {
        return current;
      }

      return [...current, camera];
    });
  };

  const handleRemoveFromKit = (cameraId: string) => {
    setRentalKit((current) => current.filter((camera) => camera.id !== cameraId));
  };

  const handleClearRentalKit = () => {
    setRentalKit([]);
  };

  const handleOpenRentalKit = () => {
    if (rentalKit.length > 0) {
      setIsRentalKitOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className={`text-sm font-bold ${isDark ? 'text-zinc-500' : 'text-slate-600'}`}>Loading cameras...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 text-center sm:text-left">
          <h2 className={`mb-2 text-3xl font-black tracking-tight sm:text-4xl ${isDark ? 'text-white' : 'text-black'}`}>
            Available for Rent
          </h2>
          <p className={`text-sm font-semibold sm:text-base ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
            Professional equipment · Ready to ship · RM100 deposit
          </p>
        </div>

        <div className={`mb-8 flex flex-col gap-4 rounded-3xl border p-4 sm:flex-row sm:items-center sm:justify-between ${isDark ? 'border-white/5 bg-zinc-900/70' : 'border-slate-200 bg-slate-50'}`}>
          <div>
            <p className={`text-[11px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-orange-400/80' : 'text-orange-600'}`}>
              Rental Kit
            </p>
            <h3 className={`mt-1 text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Need more than one camera?
            </h3>
            <p className={`mt-1 max-w-2xl text-sm font-semibold ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              Add up to 3 cameras into one clean request. Same dates, one smoother checkout.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenRentalKit}
            disabled={rentalKit.length === 0}
            className={`rounded-2xl px-5 py-3 text-sm font-black transition-colors ${rentalKit.length > 0
              ? isDark
                ? 'bg-white text-black hover:bg-zinc-200'
                : 'bg-slate-900 text-white hover:bg-slate-800'
              : isDark
                ? 'cursor-not-allowed bg-zinc-900 text-zinc-600'
                : 'cursor-not-allowed bg-slate-200 text-slate-400'
              }`}
          >
            {rentalKit.length > 0 ? `Open Rental Kit (${rentalKit.length})` : 'Build Your Rental Kit'}
          </button>
        </div>

        {cameras.length === 0 ? (
          <div className={`rounded-2xl border-2 py-16 text-center ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-slate-50'}`}>
            <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${isDark ? 'bg-white/5' : 'bg-slate-200'}`}>
              <svg className={`h-10 w-10 ${isDark ? 'text-zinc-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
            </div>
            <p className={`text-base font-bold ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>No cameras available</p>
            <p className={`mt-1 text-sm font-semibold ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>Check back soon.</p>
          </div>
        ) : (
          <>
            <div className="hidden max-w-5xl mx-auto gap-6 md:grid md:grid-cols-2">
              {cameras.map((camera, index) => (
                <div key={camera.id} className="animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
                  <CameraCard
                    camera={camera}
                    onBookNow={handleBookNow}
                    onAddToKit={handleAddToKit}
                    onViewSpecs={handleViewSpecs}
                    variant={variant}
                    tags={camera.tags}
                    isInKit={rentalKit.some((item) => item.id === camera.id)}
                    canAddToKit={!isKitFull || rentalKit.some((item) => item.id === camera.id)}
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pb-24 md:hidden">
              {cameras.map((camera, index) => (
                <div key={camera.id} className="w-full animate-fadeIn" style={{ animationDelay: `${index * 50}ms` }}>
                  <CameraCard
                    camera={camera}
                    onBookNow={handleBookNow}
                    onAddToKit={handleAddToKit}
                    onViewSpecs={handleViewSpecs}
                    variant={variant}
                    tags={camera.tags}
                    isInKit={rentalKit.some((item) => item.id === camera.id)}
                    canAddToKit={!isKitFull || rentalKit.some((item) => item.id === camera.id)}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <SpecsBottomSheet
        camera={selectedCameraForSpecs}
        isOpen={isSpecsModalOpen}
        onClose={handleCloseSpecsModal}
      />

      {selectedCameraForBooking && (
        <BookingBottomSheet
          camera={selectedCameraForBooking}
          isOpen={isBookingModalOpen}
          onClose={handleCloseBookingModal}
          onBookNow={onBookCamera}
        />
      )}

      <RentalKitBottomSheet
        cameras={rentalKit}
        isOpen={isRentalKitOpen}
        onClose={() => setIsRentalKitOpen(false)}
        onRemoveCamera={handleRemoveFromKit}
        onClearKit={handleClearRentalKit}
      />

      {rentalKit.length > 0 && (
        <div className="fixed inset-x-0 bottom-24 z-[180] px-4 sm:bottom-4">
          <div className={`mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${isDark ? 'border-white/10 bg-zinc-950/95' : 'border-slate-200 bg-white/95'}`}>
            <div className="min-w-0">
              <p className={`text-[11px] font-black uppercase tracking-[0.25em] ${isDark ? 'text-orange-400/80' : 'text-orange-600'}`}>
                Your Rental Kit
              </p>
              <p className={`mt-1 truncate text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {rentalKit.map((camera) => camera.name).join(' · ')}
              </p>
              <p className={`text-xs font-semibold ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                {rentalKit.length}/3 cameras selected
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={handleClearRentalKit}
                className={`rounded-xl px-3 py-2 text-xs font-black uppercase tracking-[0.2em] transition-colors ${isDark ? 'text-zinc-500 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleOpenRentalKit}
                className={`rounded-xl px-4 py-3 text-sm font-black transition-colors ${isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
              >
                Open Kit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

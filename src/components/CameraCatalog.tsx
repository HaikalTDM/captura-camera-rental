import { useState, useEffect } from 'react';
import { getAllCameras } from '@/lib/api/bookings';
import type { Camera as DBCamera } from '@/lib/supabase';
import { Camera, CustomerDetails } from '@/types';
import CameraCard from './CameraCard';
import SpecsBottomSheet from './SpecsBottomSheet';
import BookingBottomSheet from './BookingBottomSheet';

// Extend Camera type locally for the rental view
interface RentalCamera extends Camera {
  tags?: string[];
  tidyCalPath?: string;
}

interface CameraCatalogProps {
  onBookCamera: (camera: Camera, startDate?: Date, endDate?: Date, totalCost?: number, customerDetails?: CustomerDetails, totalDays?: number, dailyRate?: number) => void;
  variant?: 'default' | 'dark';
}

export default function CameraCatalog({ onBookCamera, variant = 'default' }: CameraCatalogProps) {
  const [cameras, setCameras] = useState<RentalCamera[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCameraForSpecs, setSelectedCameraForSpecs] = useState<Camera | null>(null);
  const [isSpecsModalOpen, setIsSpecsModalOpen] = useState(false);
  const [selectedCameraForBooking, setSelectedCameraForBooking] = useState<Camera | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const isDark = variant === 'dark';

  useEffect(() => {
    loadCameras();
  }, []);

  const handleViewSpecs = (camera: Camera) => {
    setSelectedCameraForSpecs(camera);
    setIsSpecsModalOpen(true);
  };

  const handleCloseSpecsModal = () => {
    setIsSpecsModalOpen(false);
    setTimeout(() => {
      setSelectedCameraForSpecs(null);
    }, 300); // Wait for animation to finish
  };

  const handleBookNow = (camera: Camera) => {
    setSelectedCameraForBooking(camera);
    setIsBookingModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setTimeout(() => {
      setSelectedCameraForBooking(null);
    }, 300); // Wait for animation to finish
  };

  const loadCameras = async () => {
    try {
      const dbCameras = await getAllCameras();

      console.log('🎬 RAW cameras from database:');
      console.table(dbCameras.map(c => ({
        name: c.name,
        display_order: c.display_order,
        is_available: c.is_available
      })));

      const availableCameras = dbCameras.filter(cam => cam.is_available);

      console.log('🔄 Before sort:');
      console.table(availableCameras.map(c => ({
        name: c.name,
        display_order: c.display_order,
        type: typeof c.display_order
      })));

      const sortedCameras = [...availableCameras].sort((a, b) => {
        const orderA = a.display_order ?? 999;
        const orderB = b.display_order ?? 999;
        const result = orderA - orderB;
        console.log(`Sort: "${a.name}" (${orderA}) vs "${b.name}" (${orderB}) = ${result}`);
        return result;
      });

      console.log('🎯 SORTED cameras (final order):');
      console.table(sortedCameras.map(c => ({
        name: c.name,
        display_order: c.display_order
      })));

      const convertedCameras: Camera[] = sortedCameras.map(dbCamera => {
        const getStaticImages = (cameraName: string) => {
          const name = cameraName.toLowerCase();

          // Insta360 X5
          if (name.includes('insta360') && name.includes('x5')) {
            return {
              main: '/images/Insta360-X5.webp',
              variant: '/images/Insta360-X5-1.webp'
            };
          }
          // Canon R50
          else if (name.includes('canon') && name.includes('r50')) {
            return {
              main: '/images/R50.png',
              variant: '/images/R50-1.png'
            };
          }
          // DJI Osmo Pocket 3
          else if (name.includes('osmo') && name.includes('pocket')) {
            return {
              main: '/images/osmo-pocket-31.jpg',
              variant: '/images/osmo_pocket_3_creator_combo.jpg'
            };
          }
          // DJI Action 5 Pro
          else if (name.includes('action') && name.includes('5')) {
            return {
              main: '/images/dji-action-5-pro1.jpg',
              variant: '/images/osmo_action_5_pro_adventure_combo.jpg'
            };
          }
          // Generic Action Camera
          else if (name.includes('action')) {
            return {
              main: '/images/dji-action-5-pro1.jpg',
              variant: '/images/osmo_action_5_pro_adventure_combo.jpg'
            };
          }
          // Generic Osmo Camera
          else if (name.includes('osmo')) {
            return {
              main: '/images/osmo-pocket-31.jpg',
              variant: '/images/osmo_pocket_3_creator_combo.jpg'
            };
          }
          // Fujifilm
          else if (name.includes('fujifilm') || name.includes('fuji')) {
            return {
              main: '/images/fujifilm_xt30.png',
              variant: '/images/fujifilm_xt30.png'
            };
          }
          // Default fallback
          return {
            main: '/images/osmo-pocket-31.jpg',
            variant: '/images/osmo_pocket_3_creator_combo.jpg'
          };
        };

        const getTags = (cameraName: string): string[] => {
          const name = cameraName.toLowerCase();
          if (name.includes('pocket')) return ['Vlogging', 'Travel', 'Compact'];
          if (name.includes('action')) return ['Diving', 'Sports', 'Waterproof'];
          if (name.includes('insta360')) return ['360°', 'Creative', 'Travel'];
          if (name.includes('canon') || name.includes('sony')) return ['Photography', 'Portrait', 'Pro'];
          return ['Professional', 'Rental'];
        };

        const cameraImages = getStaticImages(dbCamera.name);
        const cameraTags = getTags(dbCamera.name);

        const baseCameraInfo: Camera & { tags?: string[] } = {
          id: dbCamera.id,
          name: dbCamera.name,
          description: dbCamera.description || 'Professional camera equipment for your creative projects.',
          image: cameraImages.main,
          images: [cameraImages.variant],
          dailyRate: dbCamera.daily_rate,
          discountRate: dbCamera.weekly_rate ? Math.round(dbCamera.weekly_rate / 7) : dbCamera.daily_rate * 0.9,
          discountThreshold: dbCamera.discount_threshold,
          features: [
            `${dbCamera.type.charAt(0).toUpperCase() + dbCamera.type.slice(1)} Camera`,
            `RM${dbCamera.daily_rate}/day rental`,
            'Professional grade equipment',
            'Includes basic accessories',
            'Full insurance coverage',
            'Technical support included'
          ],
          specifications: typeof dbCamera.specifications === 'object' ? dbCamera.specifications : {},
          tidyCalPath: `haikaltdm46/${dbCamera.id}`,
          tags: cameraTags
        };

        if (dbCamera.name.toLowerCase().includes('fujifilm')) {
          baseCameraInfo.variants = [
            {
              id: 'kit-lens',
              name: 'Basic Kit Lens',
              dailyRate: 100,
              discountRate: 90
            },
            {
              id: '18-50mm',
              name: '18-50mm Lens',
              dailyRate: 130,
              discountRate: 120
            }
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

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-600 mb-4"></div>
          <p className={`font-bold text-sm ${isDark ? 'text-zinc-500' : 'text-slate-600'}`}>Loading cameras...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-6">
        {/* Clean Header - Rental Focus */}
        <div className="mb-10 text-center sm:text-left">
          <h2 className={`text-3xl sm:text-4xl font-black mb-2 tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
            Available for Rent
          </h2>
          <p className={`text-sm sm:text-base font-semibold ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
            Professional equipment • Ready to ship • RM100 deposit
          </p>
        </div>

        {cameras.length === 0 ? (
          <div className={`text-center py-16 rounded-2xl border-2 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-white/5' : 'bg-slate-200'}`}>
              <svg className={`w-10 h-10 ${isDark ? 'text-zinc-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
            </div>
            <p className={`text-base font-bold ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>No cameras available</p>
            <p className={`text-sm font-semibold mt-1 ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>Check back soon!</p>
          </div>
        ) : (
          <>
            {/* Desktop: Grid */}
            <div className="hidden md:grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {cameras.map((camera, index) => (
                <div
                  key={camera.id}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CameraCard
                    camera={camera}
                    onBookNow={handleBookNow}
                    onViewSpecs={handleViewSpecs}
                    variant={variant}
                    tags={camera.tags}
                  />
                </div>
              ))}
            </div>

            {/* Mobile: 2x2 Grid (New Layout) */}
            <div className="md:hidden grid grid-cols-2 gap-3 pb-20">
              {cameras.map((camera, index) => (
                <div
                  key={camera.id}
                  className="w-full animate-fadeIn"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CameraCard
                    camera={camera}
                    onBookNow={handleBookNow}
                    onViewSpecs={handleViewSpecs}
                    variant={variant}
                    tags={camera.tags}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Specs Modal - Full Screen Overlay */}
      <SpecsBottomSheet
        camera={selectedCameraForSpecs}
        isOpen={isSpecsModalOpen}
        onClose={handleCloseSpecsModal}
      />

      {/* Booking Modal - Full Screen Overlay */}
      {selectedCameraForBooking && (
        <BookingBottomSheet
          camera={selectedCameraForBooking}
          isOpen={isBookingModalOpen}
          onClose={handleCloseBookingModal}
          onBookNow={onBookCamera}
        />
      )}
    </>
  );
}

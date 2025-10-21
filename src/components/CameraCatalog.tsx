'use client';

import { useState, useEffect } from 'react';
import { getAllCameras } from '@/lib/api/bookings';
import type { Camera as DBCamera } from '@/lib/supabase';
import { Camera, CustomerDetails } from '@/types';
import CameraCard from './CameraCard';
import CameraSpecsModal from './CameraSpecsModal';

interface CameraCatalogProps {
  onBookCamera: (camera: Camera, startDate?: Date, endDate?: Date, totalCost?: number, customerDetails?: CustomerDetails, totalDays?: number, dailyRate?: number) => void;
}

export default function CameraCatalog({ onBookCamera }: CameraCatalogProps) {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCameraForSpecs, setSelectedCameraForSpecs] = useState<Camera | null>(null);
  const [isSpecsModalOpen, setIsSpecsModalOpen] = useState(false);

  useEffect(() => {
    loadCameras();
  }, []);

  const handleViewSpecs = (camera: Camera) => {
    setSelectedCameraForSpecs(camera);
    setIsSpecsModalOpen(true);
  };

  const handleCloseSpecsModal = () => {
    setIsSpecsModalOpen(false);
    setSelectedCameraForSpecs(null);
  };

  const loadCameras = async () => {
    try {
      const dbCameras = await getAllCameras();
      // Debug logging removed for production

      // Convert database cameras to frontend camera format with static images
      const convertedCameras: Camera[] = dbCameras
        .filter(cam => cam.is_available) // Show all cameras in inventory (users can book for future dates even if currently rented)
        .map(dbCamera => {
          // Map camera names to static image files with specific variants
          const getStaticImages = (cameraName: string) => {
            const name = cameraName.toLowerCase();
            if (name.includes('osmo') && name.includes('pocket')) {
              return {
                main: '/images/osmo-pocket-31.jpg',
                variant: '/images/osmo_pocket_3_creator_combo.jpg'
              };
            } else if (name.includes('action') && name.includes('5')) {
              return {
                main: '/images/dji-action-5-pro1.jpg',
                variant: '/images/osmo_action_5_pro_adventure_combo.jpg'
              };
            } else if (name.includes('action')) {
              return {
                main: '/images/dji-action-5-pro1.jpg',
                variant: '/images/osmo_action_5_pro_adventure_combo.jpg'
              };
            } else if (name.includes('osmo')) {
              return {
                main: '/images/osmo-pocket-31.jpg',
                variant: '/images/osmo_pocket_3_creator_combo.jpg'
              };
            }
            return {
              main: '/images/osmo-pocket-31.jpg',
              variant: '/images/osmo_pocket_3_creator_combo.jpg'
            };
          };

          const cameraImages = getStaticImages(dbCamera.name);

          return {
            id: dbCamera.id,
            name: dbCamera.name,
            description: dbCamera.description || 'Professional camera equipment for your creative projects.',
            image: cameraImages.main,
            images: [cameraImages.variant], // Only include the variant image, not the main image again
            dailyRate: dbCamera.daily_rate,
            discountRate: dbCamera.weekly_rate ? Math.round(dbCamera.weekly_rate / 7) : dbCamera.daily_rate * 0.9, // Calculate discount rate
            features: [
              `${dbCamera.type.charAt(0).toUpperCase() + dbCamera.type.slice(1)} Camera`,
              `RM${dbCamera.daily_rate}/day rental`,
              'Professional grade equipment',
              'Includes basic accessories',
              'Full insurance coverage',
              'Technical support included'
            ],
            specifications: typeof dbCamera.specifications === 'object' ? dbCamera.specifications : {},
            tidyCalPath: `haikaltdm46/${dbCamera.id}` // Use camera ID for TidyCal path
          };
        });

      setCameras(convertedCameras);
    } catch (error) {
      console.error('Error loading cameras:', error);
      // Fallback to empty array if database fails
      setCameras([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section id="cameras" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-slate-600 font-medium">Loading available cameras...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="cameras" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Available Cameras
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
            Choose from our selection of professional cameras. All equipment is regularly maintained
            and comes with full insurance coverage.
          </p>
        </div>

        {cameras.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 text-lg font-medium">No cameras available at the moment. Please check back later!</p>
          </div>
        ) : (
          <>
            {/* Desktop: All cameras side-by-side (no scrolling!) */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {cameras.map((camera) => (
                <CameraCard
                  key={camera.id}
                  camera={camera}
                  onBookNow={onBookCamera}
                  onViewSpecs={handleViewSpecs}
                />
              ))}
            </div>

            {/* Mobile: Horizontal Scroll Carousel */}
            <div className="md:hidden">
              {/* Camera Counter */}
              <div className="text-center mb-4">
                <p className="text-sm text-slate-600 font-semibold">
                  Swipe to browse {cameras.length} camera{cameras.length > 1 ? 's' : ''} →
                </p>
              </div>

              {/* Horizontal Scroll Container */}
              <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                <div className="flex gap-4 pb-4" style={{ width: `${cameras.length * 100}%`, maxWidth: `${cameras.length * 320}px` }}>
                  {cameras.map((camera, index) => (
                    <div 
                      key={camera.id} 
                      className="flex-shrink-0" 
                      style={{ 
                        width: 'calc(100vw - 48px)', 
                        maxWidth: '400px',
                        animationDelay: `${index * 100}ms`
                      }}
                    >
                      <CameraCard
                        camera={camera}
                        onBookNow={onBookCamera}
                        onViewSpecs={handleViewSpecs}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Scroll Indicators */}
              <div className="flex justify-center gap-2 mt-4">
                {cameras.map((_, index) => (
                  <div
                    key={index}
                    className="w-2 h-2 rounded-full bg-slate-300"
                    aria-label={`Camera ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </>
        )}
        
        {/* Additional Info */}
        <div className="mt-16 bg-slate-50 rounded-2xl p-8 shadow-lg border border-slate-200">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-black mb-2">What's Included</h3>
            <p className="text-slate-600 font-medium">Every rental comes with everything you need</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-black mb-2">Complete Kit</h4>
              <p className="text-slate-600 text-sm font-medium">Camera, batteries, charger, memory card, and carrying case</p>
            </div>
            
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-black mb-2">24/7 Support</h4>
              <p className="text-slate-600 text-sm font-medium">Technical support and troubleshooting throughout your rental</p>
            </div>
            
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-slate-900 to-black rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-black mb-2">Full Insurance</h4>
              <p className="text-slate-600 text-sm font-medium">All equipment is fully insured for your peace of mind</p>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Specifications Modal */}
      <CameraSpecsModal
        camera={selectedCameraForSpecs}
        isOpen={isSpecsModalOpen}
        onClose={handleCloseSpecsModal}
      />
    </section>
  );
}

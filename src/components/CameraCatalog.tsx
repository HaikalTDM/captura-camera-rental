'use client';

import { useState, useEffect } from 'react';
import { getAllCameras } from '@/lib/api/bookings';
import type { Camera as DBCamera } from '@/lib/supabase';
import { Camera, CustomerDetails } from '@/types';
import CameraCard from './CameraCard';
import SpecsBottomSheet from './SpecsBottomSheet';

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
    setTimeout(() => {
      setSelectedCameraForSpecs(null);
    }, 300); // Wait for animation to finish
  };

  const loadCameras = async () => {
    try {
      const dbCameras = await getAllCameras();

      const convertedCameras: Camera[] = dbCameras
        .filter(cam => cam.is_available)
        .map(dbCamera => {
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
            images: [cameraImages.variant],
            dailyRate: dbCamera.daily_rate,
            discountRate: dbCamera.weekly_rate ? Math.round(dbCamera.weekly_rate / 7) : dbCamera.daily_rate * 0.9,
            features: [
              `${dbCamera.type.charAt(0).toUpperCase() + dbCamera.type.slice(1)} Camera`,
              `RM${dbCamera.daily_rate}/day rental`,
              'Professional grade equipment',
              'Includes basic accessories',
              'Full insurance coverage',
              'Technical support included'
            ],
            specifications: typeof dbCamera.specifications === 'object' ? dbCamera.specifications : {},
            tidyCalPath: `haikaltdm46/${dbCamera.id}`
          };
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
          <p className="text-slate-600 font-bold text-sm">Loading cameras...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-6">
        {/* Minimal Header - App Style */}
        <div className="mb-8">
          <h2 className="text-2xl font-black text-black mb-2">
            Available Cameras
          </h2>
          <p className="text-sm text-slate-600 font-semibold">
            Professional equipment • Fully maintained
          </p>
        </div>

        {cameras.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-slate-200">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
            </div>
            <p className="text-slate-600 text-base font-bold">No cameras available</p>
            <p className="text-sm text-slate-500 font-semibold mt-1">Check back soon!</p>
          </div>
        ) : (
          <>
            {/* Desktop: Side-by-side grid */}
            <div className="hidden md:grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {cameras.map((camera, index) => (
                <div 
                  key={camera.id}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CameraCard
                    camera={camera}
                    onBookNow={onBookCamera}
                    onViewSpecs={handleViewSpecs}
                  />
                </div>
              ))}
            </div>

            {/* Mobile: Horizontal Scroll Carousel */}
            <div className="md:hidden">
              {/* Swipe Indicator */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="flex gap-1.5">
                  {cameras.map((_, index) => (
                    <div
                      key={index}
                      className="w-2 h-2 rounded-full bg-slate-300 animate-pulse"
                      style={{ animationDelay: `${index * 200}ms` }}
                      aria-label={`Camera ${index + 1}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-500 font-bold">Swipe →</span>
              </div>

              {/* Horizontal Scroll Container */}
              <div className="overflow-x-auto scrollbar-hide -mx-6 px-6">
                <div className="flex gap-4 pb-4">
                  {cameras.map((camera, index) => (
                    <div 
                      key={camera.id} 
                      className="flex-shrink-0 w-[calc(100vw-48px)] max-w-[400px] animate-fadeIn" 
                      style={{ animationDelay: `${index * 100}ms` }}
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
    </>
  );
}

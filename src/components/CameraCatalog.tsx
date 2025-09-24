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
        .filter(cam => cam.is_available && cam.available_quantity > 0) // Only show available cameras
        .map(dbCamera => {
          // Map camera names to static image files
          const getStaticImage = (cameraName: string) => {
            const name = cameraName.toLowerCase();
            if (name.includes('osmo') && name.includes('pocket')) {
              return '/images/osmo-pocket-31.jpg';
            } else if (name.includes('action') && name.includes('5')) {
              return '/images/dji-action-5-pro1.jpg';
            } else if (name.includes('action')) {
              return '/images/dji-action-5-pro1.jpg'; // Default action camera
            } else if (name.includes('osmo')) {
              return '/images/osmo-pocket-31.jpg'; // Default osmo camera
            }
            return '/images/osmo-pocket-31.jpg'; // Fallback to a real camera image
          };

          const staticImage = getStaticImage(dbCamera.name);

          return {
            id: dbCamera.id,
            name: dbCamera.name,
            description: dbCamera.description || 'Professional camera equipment for your creative projects.',
            image: staticImage,
            images: [staticImage],
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
      <section id="cameras" className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading available cameras...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="cameras" className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-500 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-pink-500 rounded-full animate-ping"></div>
        <div className="absolute bottom-40 right-1/3 w-14 h-14 bg-green-500 rounded-full animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            📷 Available Cameras 🎬
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from our selection of professional cameras. All equipment is regularly maintained
            and comes with accessories for your creative projects.
          </p>
        </div>

        {cameras.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No cameras available at the moment. Please check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {cameras.map((camera) => (
              <CameraCard
                key={camera.id}
                camera={camera}
                onBookNow={onBookCamera}
                onViewSpecs={handleViewSpecs}
              />
            ))}
          </div>
        )}
        
        {/* Additional Info */}
        <div className="mt-16 bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-xl border border-white/20">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">What's Included</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Complete Kit</h4>
              <p className="text-gray-600 text-sm">Camera, batteries, charger, memory card, and carrying case</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">24/7 Support</h4>
              <p className="text-gray-600 text-sm">Technical support and troubleshooting throughout your rental</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Insured Equipment</h4>
              <p className="text-gray-600 text-sm">All equipment is fully insured for your peace of mind</p>
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

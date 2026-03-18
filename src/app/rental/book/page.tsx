'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPublicCameras } from '@/lib/api/bookings';
import type { PublicCamera as DBCamera } from '@/lib/api/bookings';

export default function BookPage() {
  const router = useRouter();
  const [cameras, setCameras] = useState<DBCamera[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<DBCamera | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCameras();
  }, []);

  const loadCameras = async () => {
    try {
      const data = await getPublicCameras();
      
      const available = data.filter(c => c.is_available);
      
      setCameras(available);
      if (available.length > 0) {
        setSelectedCamera(available[0]);
      }
    } catch (error) {
      console.error('Error loading cameras:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCamera = (camera: DBCamera) => {
    setSelectedCamera(camera);
  };

  const handleBookNow = () => {
    // Navigate to cameras page with booking modal
    router.push('/rental/cameras');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-black text-white pt-16 pb-8 px-6">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-black mb-2">Book a Camera</h1>
          <p className="text-sm text-slate-300 font-semibold">
            Select your camera and reserve your dates
          </p>
        </div>
      </div>

      {/* Camera Selection */}
      <section className="py-8 px-6">
        <div className="max-w-lg mx-auto">
          <h2 className="text-lg font-black text-black mb-4">Choose Your Camera</h2>
          
          <div className="space-y-3">
            {cameras.map((camera) => (
              <button
                key={camera.id}
                onClick={() => handleSelectCamera(camera)}
                className={`w-full bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 overflow-hidden text-left ${
                  selectedCamera?.id === camera.id
                    ? 'border-black scale-[1.02]'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex gap-4 p-4">
                  {/* Camera Icon */}
                  <div className="w-20 h-20 bg-slate-100 rounded-xl flex-shrink-0 flex items-center justify-center">
                    <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                  </div>

                  {/* Camera Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-base font-black text-black">{camera.name}</h3>
                        <p className="text-xs text-slate-600 font-semibold mt-0.5 line-clamp-2">{camera.description}</p>
                      </div>
                      {selectedCamera?.id === camera.id && (
                        <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-black text-white px-3 py-1.5 rounded-lg">
                        <span className="text-sm font-black">RM{camera.daily_rate}</span>
                        <span className="text-xs font-bold text-slate-300">/day</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs text-slate-600 font-bold">Available</span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Selected Camera Summary */}
      {selectedCamera && (
        <section className="py-8 px-6 bg-white">
          <div className="max-w-lg mx-auto">
            <h2 className="text-lg font-black text-black mb-4">Your Selection</h2>
            
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 border-2 border-slate-200 mb-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-black text-black mb-1">{selectedCamera.name}</h3>
                  <p className="text-sm text-slate-600 font-semibold">{selectedCamera.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-3 border border-slate-200">
                  <div className="text-xs text-slate-500 font-bold mb-1">Daily Rate</div>
                  <div className="text-xl font-black text-black">RM{selectedCamera.daily_rate}</div>
                </div>
                <div className="bg-white rounded-xl p-3 border border-slate-200">
                  <div className="text-xs text-slate-500 font-bold mb-1">Weekly Rate</div>
                  <div className="text-xl font-black text-black">RM{selectedCamera.weekly_rate || selectedCamera.daily_rate * 7}</div>
                </div>
              </div>
            </div>

            {/* Book Button */}
            <button
              onClick={handleBookNow}
              className="w-full bg-black text-white font-black py-5 px-6 rounded-2xl hover:scale-105 transition-all duration-300 active:scale-95 shadow-2xl"
            >
              Continue to Booking →
            </button>

            {/* Info */}
            <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-black text-slate-900 mb-1">What's Next?</h4>
                  <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                    Select your rental dates, provide your details, and we'll confirm your booking within 24 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Quick Contact */}
      <section className="py-8 px-6">
        <div className="max-w-lg mx-auto">
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6">
            <h3 className="text-lg font-black mb-2">Need Help?</h3>
            <p className="text-sm text-white/90 font-semibold mb-4">
              Chat with us on WhatsApp for instant support
            </p>
            <a
              href="https://wa.me/60177464121"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-green-600 font-black px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300 active:scale-95"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}


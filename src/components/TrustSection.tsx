'use client';

import { useState, useEffect } from 'react';

export default function TrustSection() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const testimonials = [
    {
      name: "Content Creator",
      role: "Professional Creator",
      text: "Professional equipment with excellent quality. The cameras are well-maintained and perfect for content creation projects.",
      rating: 5,
      camera: "Professional Camera"
    },
    {
      name: "Event Photographer",
      role: "Photography Professional",
      text: "Reliable service with fair pricing. The booking process is smooth and the equipment quality is outstanding.",
      rating: 5,
      camera: "Professional Camera"
    },
    {
      name: "Video Creator",
      role: "Digital Creator",
      text: "Quick and easy rental process. The cameras deliver excellent results for professional video projects.",
      rating: 5,
      camera: "Professional Camera"
    }
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section id="reviews" className="py-16 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-16 h-16 bg-yellow-400 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-12 h-12 bg-orange-400 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-10 h-10 bg-red-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-32 right-1/3 w-14 h-14 bg-yellow-500 rounded-full animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Trust Stats */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-4 sm:px-8 sm:py-4 shadow-xl border border-white/20 max-w-full">
              {/* Mobile: Stack vertically, Desktop: Horizontal */}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                {/* 5 Star Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="relative">
                        <svg
                          className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 animate-pulse"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {/* Sparkle effect */}
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full animate-ping opacity-75"></div>
                      </div>
                    ))}
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">5.0</span>
                </div>

                {/* Divider - Hidden on mobile */}
                <div className="hidden sm:block w-px h-8 bg-gray-300"></div>

                {/* Booking Count */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <span className="text-2xl sm:text-3xl animate-bounce">📷</span>
                    <div className="absolute -top-2 -right-2 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-center sm:text-left">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">30+</div>
                    <div className="text-sm text-gray-600">Happy Customers</div>
                  </div>
                </div>

                {/* Divider - Hidden on mobile */}
                <div className="hidden sm:block w-px h-8 bg-gray-300"></div>

                {/* Trusted Badge */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <span className="text-2xl sm:text-3xl">🏆</span>
                    <div className="absolute inset-0 animate-ping">
                      <span className="text-2xl sm:text-3xl opacity-30">✨</span>
                    </div>
                  </div>
                  <div className="text-center sm:text-left">
                    <div className="text-lg font-bold text-gray-900">Trusted</div>
                    <div className="text-sm text-gray-600">Service</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            ⭐ Trusted by 30+ Happy Customers ⭐
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join our growing community of satisfied customers who trust CAPTURA for their professional camera rental needs
          </p>
        </div>

        {/* Testimonial Carousel */}
        <div className="max-w-4xl mx-auto">
          <div
            className={`transform transition-all duration-700 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
            key={currentTestimonial}
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
              {/* Sparkle decorations */}
              <div className="absolute top-4 right-4 text-yellow-400 animate-pulse">✨</div>
              <div className="absolute bottom-4 left-4 text-yellow-400 animate-pulse" style={{ animationDelay: '0.5s' }}>⭐</div>
              <div className="absolute top-1/2 right-8 text-yellow-400 animate-bounce" style={{ animationDelay: '1s' }}>💫</div>

              <div className="text-center">
                {/* Quote */}
                <div className="text-6xl text-gray-400 mb-4">"</div>
                <p className="text-xl text-gray-800 leading-relaxed mb-6 italic">
                  {testimonials[currentTestimonial].text}
                </p>

                {/* Rating Stars */}
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-6 h-6 text-yellow-400 animate-pulse"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Customer Info */}
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg animate-pulse">
                    {testimonials[currentTestimonial].name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">{testimonials[currentTestimonial].name}</div>
                    <div className="text-sm text-gray-600">{testimonials[currentTestimonial].role}</div>
                    <div className="text-xs text-blue-600 font-medium">📷 {testimonials[currentTestimonial].camera}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial Indicators */}
          <div className="flex justify-center mt-6 gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentTestimonial === index
                    ? 'bg-yellow-400 scale-125 animate-pulse'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg border border-white/20 hover:scale-105 transition-transform duration-300">
            <div className="text-4xl mb-3 animate-bounce">🛡️</div>
            <h3 className="font-bold text-gray-900 mb-2">Fully Insured</h3>
            <p className="text-sm text-gray-600">All equipment covered for your peace of mind</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg border border-white/20 hover:scale-105 transition-transform duration-300">
            <div className="text-4xl mb-3 animate-pulse">⚡</div>
            <h3 className="font-bold text-gray-900 mb-2">Quick Response</h3>
            <p className="text-sm text-gray-600">Fast WhatsApp booking and instant confirmation</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg border border-white/20 hover:scale-105 transition-transform duration-300">
            <div className="text-4xl mb-3 animate-bounce" style={{ animationDelay: '0.5s' }}>🎯</div>
            <h3 className="font-bold text-gray-900 mb-2">Professional Grade</h3>
            <p className="text-sm text-gray-600">Top-quality cameras maintained to perfection</p>
          </div>
        </div>
      </div>
    </section>
  );
}

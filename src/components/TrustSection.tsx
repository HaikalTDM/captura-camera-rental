'use client';

import { useState, useEffect } from 'react';

export default function TrustSection() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Sarah L.",
      role: "Content Creator",
      text: "The Osmo Pocket 3 delivered stunning 4K footage for my vlog. Professional equipment at an affordable price!",
      rating: 5,
      camera: "Osmo Pocket 3"
    },
    {
      name: "Ahmad K.",
      role: "Event Photographer",
      text: "Reliable service with fair pricing. The booking process was smooth and the equipment quality was outstanding.",
      rating: 5,
      camera: "Action 5 Pro"
    },
    {
      name: "Li Wei",
      role: "Video Creator",
      text: "Quick and easy rental process. The cameras delivered excellent results for my professional video projects.",
      rating: 5,
      camera: "Osmo Pocket 3"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section id="reviews" className="py-16 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
            Join 500+ satisfied creators who trust CAPTURA for their projects
          </p>
        </div>

        {/* Testimonial Carousel */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="transition-opacity duration-500" key={currentTestimonial}>
            <div className="bg-slate-50 rounded-2xl shadow-lg border border-slate-200 p-8 sm:p-12">
              <div className="text-center">
                {/* Rating Stars */}
                <div className="flex justify-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-6 h-6 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-xl text-slate-800 leading-relaxed mb-8 font-medium">
                  "{testimonials[currentTestimonial].text}"
                </p>

                {/* Customer Info */}
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {testimonials[currentTestimonial].name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-black">{testimonials[currentTestimonial].name}</div>
                    <div className="text-sm text-slate-600 font-medium">{testimonials[currentTestimonial].role}</div>
                    <div className="text-xs text-blue-600 font-semibold mt-1">{testimonials[currentTestimonial].camera}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial Indicators */}
          <div className="flex justify-center mt-6 gap-3">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentTestimonial === index
                    ? 'bg-blue-500 w-8'
                    : 'bg-slate-300 w-2 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Trust Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-slate-200">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-bold text-black mb-2">Fully Insured</h3>
            <p className="text-sm text-slate-600 font-medium">All equipment covered for your peace of mind</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-slate-200">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-bold text-black mb-2">Quick Response</h3>
            <p className="text-sm text-slate-600 font-medium">Fast booking and instant confirmation via WhatsApp</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-slate-200">
            <div className="w-14 h-14 bg-gradient-to-br from-slate-900 to-black rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="font-bold text-black mb-2">Professional Grade</h3>
            <p className="text-sm text-slate-600 font-medium">Top-quality cameras maintained to perfection</p>
          </div>
        </div>
      </div>
    </section>
  );
}

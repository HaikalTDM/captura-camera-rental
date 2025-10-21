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
      camera: "Osmo Pocket 3",
      project: "Travel Vlog Series",
      verified: true
    },
    {
      name: "Ahmad K.",
      role: "Event Photographer",
      text: "Reliable service with fair pricing. The booking process was smooth and the equipment quality was outstanding.",
      rating: 5,
      camera: "Action 5 Pro",
      project: "Wedding Coverage",
      verified: true
    },
    {
      name: "Li Wei",
      role: "Video Creator",
      text: "Quick and easy rental process. The cameras delivered excellent results for my professional video projects.",
      rating: 5,
      camera: "Osmo Pocket 3",
      project: "Commercial Shoot",
      verified: true
    },
    {
      name: "Priya M.",
      role: "Social Media Manager",
      text: "Perfect for creating engaging content. The stabilization is incredible and makes my Instagram stories look so professional!",
      rating: 5,
      camera: "Action 5 Pro",
      project: "Brand Content",
      verified: true
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section id="reviews" className="py-20 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 rounded-full px-4 py-2 mb-4">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            <span className="text-sm font-black text-blue-700">TRUSTED BY CREATORS</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black text-black mb-4">
            Real Reviews,
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Real Results
            </span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-semibold">
            Join 500+ satisfied creators who trust CAPTURA for their projects
          </p>
        </div>

        {/* Testimonial Carousel */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="transition-all duration-700" key={currentTestimonial}>
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 sm:p-12 relative overflow-hidden">
              {/* Decorative Quote Icon */}
              <div className="absolute top-8 left-8 opacity-5">
                <svg className="w-32 h-32 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
              </div>

              <div className="relative z-10">
                {/* Verified Badge */}
                {testimonials[currentTestimonial].verified && (
                  <div className="flex justify-center mb-6">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full px-4 py-2 shadow-lg">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-black uppercase tracking-wide">Verified Booking</span>
                    </div>
                  </div>
                )}

                {/* Rating Stars */}
                <div className="flex justify-center mb-8">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-7 h-7 text-yellow-400 drop-shadow-lg"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-2xl sm:text-3xl text-slate-800 leading-relaxed mb-10 font-semibold text-center max-w-3xl mx-auto">
                  "{testimonials[currentTestimonial].text}"
                </p>

                {/* Customer Info */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-500/30">
                      {testimonials[currentTestimonial].name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <div className="font-black text-black text-lg">{testimonials[currentTestimonial].name}</div>
                      <div className="text-sm text-slate-600 font-semibold">{testimonials[currentTestimonial].role}</div>
                    </div>
                  </div>
                  
                  <div className="hidden sm:block h-12 w-px bg-slate-300"></div>
                  
                  <div className="text-center sm:text-left">
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Project</div>
                    <div className="text-sm text-slate-700 font-bold">{testimonials[currentTestimonial].project}</div>
                    <div className="text-xs text-blue-600 font-bold mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      </svg>
                      {testimonials[currentTestimonial].camera}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial Indicators */}
          <div className="flex justify-center mt-8 gap-3">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`h-3 rounded-full transition-all duration-300 ${
                  currentTestimonial === index
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 w-12 shadow-lg shadow-blue-500/30'
                    : 'bg-slate-300 w-3 hover:bg-slate-400 hover:w-6'
                }`}
                aria-label={`View testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Trust Stats - App Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg border-2 border-emerald-200 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-black text-black mb-2 text-lg">Fully Insured</h3>
            <p className="text-sm text-slate-600 font-semibold leading-relaxed">All equipment covered for your peace of mind</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg border-2 border-blue-200 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-black text-black mb-2 text-lg">Instant Response</h3>
            <p className="text-sm text-slate-600 font-semibold leading-relaxed">Fast booking confirmation via WhatsApp</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg border-2 border-purple-200 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-purple-500/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="font-black text-black mb-2 text-lg">Pro Quality</h3>
            <p className="text-sm text-slate-600 font-semibold leading-relaxed">Maintained to perfection by experts</p>
          </div>

          <div className="bg-white rounded-2xl p-6 text-center shadow-lg border-2 border-slate-200 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-900 to-black rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-black text-black mb-2 text-lg">24/7 Support</h3>
            <p className="text-sm text-slate-600 font-semibold leading-relaxed">Technical help whenever you need it</p>
          </div>
        </div>
      </div>
    </section>
  );
}

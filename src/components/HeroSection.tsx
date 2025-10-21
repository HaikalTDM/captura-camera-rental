'use client';

export default function HeroSection() {
  const scrollToCameras = () => {
    const camerasSection = document.getElementById('cameras');
    if (camerasSection) {
      camerasSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* App-Style Hero Section - Minimal & Clean */}
      <section className="bg-black relative overflow-hidden min-h-[60vh] flex items-center justify-center">
        {/* Subtle Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-900 to-black opacity-90"></div>
        
        <div className="max-w-7xl mx-auto px-6 py-20 relative z-10 text-center">
          {/* Status Badge - App Style */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-full px-5 py-2.5 mb-8 shadow-lg shadow-emerald-500/20 animate-fadeIn">
            <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></span>
            <span className="text-sm font-black text-emerald-100 uppercase tracking-wider">Available Now</span>
          </div>

          {/* Minimal Headline - App Style */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
            Rent Premium
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              DJI Cameras
            </span>
          </h1>
          
          {/* Simple Subtitle */}
          <p className="text-xl sm:text-2xl text-slate-300 mb-12 font-semibold max-w-2xl mx-auto">
            Professional equipment from <span className="text-white font-black">RM45/day</span>
          </p>

          {/* Single CTA - App Style */}
          <button
            onClick={scrollToCameras}
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:shadow-2xl hover:shadow-blue-500/50 text-white font-black py-6 px-12 rounded-2xl text-lg transition-all duration-300 active:scale-[0.95] inline-flex items-center gap-3 group relative overflow-hidden shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Browse Cameras
            <svg className="w-5 h-5 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {/* Trust Indicators - Minimal */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-slate-400">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-black text-white">20+ Rentals</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <span className="text-sm font-black text-white">4.9 Rating</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-sm font-black text-white">Insured</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Info Cards - App Style */}
      <section className="bg-slate-50 -mt-12 relative z-20">
        <div className="max-w-7xl mx-auto px-6 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-slate-200 hover:scale-105 transition-all duration-300 group animate-fadeIn" style={{ animationDelay: '0ms' }}>
              <div className="w-14 h-14 bg-gradient-to-br from-slate-900 to-black rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
              </div>
              <h3 className="text-base font-black text-slate-900 mb-1.5">Pro Cameras</h3>
              <p className="text-sm text-slate-600 font-semibold leading-snug">4K/60fps • 10-bit • Gimbal</p>
            </div>
            
            {/* Card 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-blue-200 hover:scale-105 transition-all duration-300 group animate-fadeIn" style={{ animationDelay: '100ms' }}>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-base font-black text-slate-900 mb-1.5">From RM45</h3>
              <p className="text-sm text-slate-600 font-semibold leading-snug">Daily • Weekly • Monthly</p>
            </div>
            
            {/* Card 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-emerald-200 hover:scale-105 transition-all duration-300 group animate-fadeIn" style={{ animationDelay: '200ms' }}>
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-base font-black text-slate-900 mb-1.5">Full Insurance</h3>
              <p className="text-sm text-slate-600 font-semibold leading-snug">All equipment covered</p>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-purple-200 hover:scale-105 transition-all duration-300 group animate-fadeIn" style={{ animationDelay: '300ms' }}>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-base font-black text-slate-900 mb-1.5">Fast Delivery</h3>
              <p className="text-sm text-slate-600 font-semibold leading-snug">Same-day in KL area</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

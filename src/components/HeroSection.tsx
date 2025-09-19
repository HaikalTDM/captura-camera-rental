'use client';

export default function HeroSection() {
  const scrollToCameras = () => {
    const camerasSection = document.getElementById('cameras');
    if (camerasSection) {
      camerasSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-slate-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-blue-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-40 right-1/3 w-14 h-14 bg-slate-500 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-gray-500 rounded-full animate-bounce"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 relative z-10">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              CAPTURA
            </span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
            🎥 Premium Camera Rental for Your Creative Vision 🎬
          </p>
          <p className="text-base sm:text-lg text-gray-300 mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
            Rent professional-grade cameras for your projects. From content creation to adventure filming,
            we provide top-quality equipment at affordable daily rates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
            <button
              onClick={scrollToCameras}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl min-h-[48px]"
            >
              Browse Cameras
            </button>
            <div className="text-sm sm:text-base text-gray-400 text-center">
              Starting from <span className="text-green-400 font-semibold">RM45/day</span> ✨
            </div>
          </div>
        </div>
      </div>
      
      {/* Features */}
      <div className="bg-white/5 border-t border-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse shadow-lg border border-white/20 backdrop-blur-sm">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Professional Quality</h3>
              <p className="text-gray-400">Top-tier cameras with 4K recording and advanced stabilization</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse shadow-lg border border-white/20 backdrop-blur-sm">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Affordable Rates</h3>
              <p className="text-gray-300">Competitive daily rates with discounts for longer rentals</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse shadow-lg border border-white/20 backdrop-blur-sm">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
              <p className="text-gray-300">Simple online booking with instant confirmation</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

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
      {/* Main Hero Section */}
      <section className="bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <div className="text-center">
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-black mb-4 sm:mb-6 leading-tight">
              Rent Professional
              <br />
              <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                Cameras in KL
              </span>
            </h1>
            
            {/* Subheading */}
            <p className="text-lg sm:text-xl md:text-2xl text-slate-700 mb-6 sm:mb-8 max-w-3xl mx-auto font-medium">
              Daily rental from RM45 • Free delivery • Full insurance
            </p>
            
            {/* CTA Button */}
            <button
              onClick={scrollToCameras}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-xl hover:shadow-blue-500/30 text-white font-bold py-5 px-10 rounded-xl text-lg transition-all duration-200 shadow-lg active:scale-95 min-h-[56px] inline-flex items-center justify-center gap-2"
            >
              Browse Available Cameras
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
            
            {/* Trust Badge */}
            <div className="mt-8 flex items-center justify-center gap-2 text-slate-600">
              <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm sm:text-base font-semibold">Trusted by 500+ creators in KL</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-900 to-black rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Professional Quality</h3>
              <p className="text-slate-600 font-medium">Top-tier cameras with 4K recording and 3-axis stabilization</p>
            </div>
            
            {/* Feature 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Flexible Rates</h3>
              <p className="text-slate-600 font-medium">Competitive daily rates with discounts for longer rentals</p>
            </div>
            
            {/* Feature 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Full Insurance</h3>
              <p className="text-slate-600 font-medium">All equipment covered with comprehensive insurance</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

'use client';

import { useEffect } from 'react';

export default function TikTokEmbed() {
  useEffect(() => {
    // Load TikTok embed script if not already loaded
    if (!document.querySelector('script[src*="tiktok.com/embed.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://www.tiktok.com/embed.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              📱 Follow Us on TikTok
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Check out our latest camera rental content, behind-the-scenes footage, and customer highlights on TikTok!
            </p>
          </div>

          {/* TikTok Embed */}
          <div className="flex justify-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 max-w-2xl w-full">
              <div className="flex justify-center">
                <blockquote 
                  className="tiktok-embed" 
                  cite="https://www.tiktok.com/@captura.my" 
                  data-unique-id="captura.my" 
                  data-embed-type="creator" 
                  style={{ maxWidth: '780px', minWidth: '288px' }}
                >
                  <section>
                    <a 
                      target="_blank" 
                      rel="noopener noreferrer"
                      href="https://www.tiktok.com/@captura.my?refer=creator_embed"
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      @captura.my
                    </a>
                  </section>
                </blockquote>
              </div>
              
              {/* Call to Action */}
              <div className="mt-8 text-center">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
                  <h3 className="text-xl font-bold mb-3">
                    🎬 See Our Camera Rentals in Action!
                  </h3>
                  <p className="text-purple-100 mb-4">
                    Watch real customers using our cameras for amazing content creation
                  </p>
                  <a
                    href="https://www.tiktok.com/@captura.my"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                    Follow @captura.my
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { getPhotographyGalleryImages, type PhotographyGalleryImage } from '@/lib/api/photography-gallery';

const categoryLabels: Record<string, { label: string; color: string }> = {
  'wedding': { label: 'Wedding', color: 'bg-[#d4af37]/10 text-[#a08520]' },
  'corporate': { label: 'Corporate', color: 'bg-blue-50 text-blue-700' },
  'graduation': { label: 'Graduation', color: 'bg-purple-50 text-purple-700' },
  'portrait': { label: 'Portrait', color: 'bg-emerald-50 text-emerald-700' },
  'event': { label: 'Event', color: 'bg-amber-50 text-amber-700' },
};

export default function StudioGalleryPage() {
  const [filter, setFilter] = useState<string>('all');
  const [images, setImages] = useState<PhotographyGalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await getPhotographyGalleryImages();
      if (mounted) {
        setImages(data);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filtered = filter === 'all' ? images : images.filter((g) => g.category === filter);

  return (
    <div className="p-6 sm:p-8 lg:p-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 mb-1">Gallery</h1>
          <p className="text-stone-400 text-sm">
            {loading ? 'Loading...' : `${images.length} ${images.length === 1 ? 'item' : 'items'} in portfolio`}
          </p>
        </div>
        <button className="px-4 py-2.5 bg-[#d4af37] text-black font-semibold text-sm rounded-lg hover:bg-[#d4af37]/90 transition-all inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload
        </button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { value: 'all', label: 'All' },
          { value: 'wedding', label: 'Wedding' },
          { value: 'corporate', label: 'Corporate' },
          { value: 'graduation', label: 'Graduation' },
          { value: 'portrait', label: 'Portrait' },
          { value: 'event', label: 'Event' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              filter === f.value
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white text-stone-500 border-stone-200 hover:text-stone-700 hover:border-stone-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-stone-200/80 rounded-xl overflow-hidden shadow-sm">
              <div className="aspect-video bg-stone-100 animate-pulse"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-stone-100 rounded animate-pulse"></div>
                <div className="h-3 bg-stone-50 rounded animate-pulse w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-stone-200/80 rounded-xl py-16 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 bg-stone-50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-stone-500 text-sm">No items in this category yet.</p>
          <p className="text-stone-400 text-xs mt-1">Upload work via the photography admin panel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="bg-white border border-stone-200/80 rounded-xl overflow-hidden hover:border-stone-300 transition-all group shadow-sm">
              <div className="aspect-video bg-stone-100 flex items-center justify-center relative overflow-hidden">
                {item.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image_url}
                    alt={item.alt_text || item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <svg className="w-8 h-8 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
                {item.is_featured && (
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-[#d4af37] text-black text-[9px] font-bold uppercase rounded">
                    Featured
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-stone-900 text-sm font-medium mb-2 truncate">{item.title}</h3>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${categoryLabels[item.category]?.color ?? 'bg-stone-100 text-stone-600'}`}>
                    {categoryLabels[item.category]?.label ?? item.category}
                  </span>
                  <span className="text-stone-400 text-xs">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

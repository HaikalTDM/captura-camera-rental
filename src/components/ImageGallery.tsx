'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
  mainImage: string;
  galleryImages?: string[];
  alt: string;
  className?: string;
}

export default function ImageGallery({ 
  mainImage, 
  galleryImages = [], 
  alt, 
  className = "" 
}: ImageGalleryProps) {
  const [currentImage, setCurrentImage] = useState(mainImage);
  const allImages = [mainImage, ...galleryImages];

  return (
    <div className={`image-gallery ${className}`}>
      {/* Main Image Display */}
      <div className="relative w-full h-48 sm:h-52 md:h-48 bg-gray-100 rounded-lg overflow-hidden mb-3">
        <Image
          src={currentImage}
          alt={alt}
          fill
          className="object-contain transition-all duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
        />
        
        {/* Image Counter */}
        {allImages.length > 1 && (
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {allImages.indexOf(currentImage) + 1} / {allImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {allImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(image)}
              className={`
                relative flex-shrink-0 w-14 h-10 sm:w-16 sm:h-12 rounded border-2 overflow-hidden transition-all duration-200
                ${currentImage === image
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <Image
                src={image}
                alt={`${alt} view ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}


    </div>
  );
}

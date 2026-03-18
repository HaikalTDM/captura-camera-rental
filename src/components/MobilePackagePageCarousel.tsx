'use client';

import { useState, useRef, useEffect } from 'react';
import WhatsAppButton from '@/components/WhatsAppButton';
import type { WhatsAppMessage } from '@/utils/whatsapp';

interface Package {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  duration: string;
  features: string[];
  isPopular?: boolean;
  isRecommended?: boolean;
  description: string;
  idealFor: string[];
  addOns?: string[];
}

interface MobilePackagePageCarouselProps {
  packages: Package[];
  type: 'main' | 'second';
  addOns: AddOn[];
  onPackageSelect?: (packageId: string) => void;
  selectedPackage?: string | null;
}

interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  icon?: string;
}

export default function MobilePackagePageCarousel({ 
  packages, 
  type, 
  addOns, 
  onPackageSelect, 
  selectedPackage 
}: MobilePackagePageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [showAddOns, setShowAddOns] = useState(false);
  const autoSlideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset carousel to first slide when type or packages change
  useEffect(() => {
    setCurrentIndex(0);
  }, [type, packages]);

  // Auto-slide functionality
  useEffect(() => {
    if (!isPaused && packages.length > 1) {
      autoSlideRef.current = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % packages.length);
      }, 4000); // 4 seconds for packages (longer than gallery)
    }

    return () => {
      if (autoSlideRef.current) {
        clearTimeout(autoSlideRef.current);
      }
    };
  }, [currentIndex, isPaused, packages.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % packages.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + packages.length) % packages.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 1000);
  };

  // Touch/swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const diff = startX - currentX;
    
    if (Math.abs(diff) > 50) {
      e.preventDefault();
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      setIsDragging(false);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setTimeout(() => setIsPaused(false), 1000);
  };

  // Add-on management
  const toggleAddOn = (addOnId: string) => {
    setSelectedAddOns(prev => 
      prev.includes(addOnId) 
        ? prev.filter(id => id !== addOnId)
        : [...prev, addOnId]
    );
  };

  // Price calculation
  const getCurrentPackage = () => packages[currentIndex];
  
  const calculateTotal = () => {
    const currentPackage = getCurrentPackage();
    const basePrice = parseFloat(currentPackage.price.replace('RM', ''));
    const addOnsTotal = selectedAddOns.reduce((total, addOnId) => {
      const addOn = addOns.find(a => a.id === addOnId);
      return total + (addOn ? addOn.price : 0);
    }, 0);
    return basePrice + addOnsTotal;
  };

  const formatPrice = (price: number) => `RM${price.toFixed(0)}`;

  // WhatsApp message with package and add-ons
  const getWhatsAppMessage = (): WhatsAppMessage => {
    const currentPackage = getCurrentPackage();
    const selectedAddOnDetails = selectedAddOns.map(id => {
      const addOn = addOns.find(a => a.id === id);
      return addOn ? `• ${addOn.name} (+RM${addOn.price})` : '';
    }).filter(Boolean);

    const total = calculateTotal();
    
    let message = `Hi! I'd like to book the following:\n\n`;
    message += `📸 Package: ${currentPackage.name} (${currentPackage.price})\n`;
    message += `⏱️ Duration: ${currentPackage.duration}\n\n`;
    
    if (selectedAddOnDetails.length > 0) {
      message += `🎁 Add-ons:\n${selectedAddOnDetails.join('\n')}\n\n`;
    }
    
    message += `💰 Total: ${formatPrice(total)}\n\n`;
    message += `Please let me know about availability and next steps for booking!`;
    
    return {
      type: 'custom',
      context: message,
      packageName: currentPackage.name,
      packagePrice: currentPackage.price,
      addOns: selectedAddOnDetails,
      totalPrice: total
    };
  };

  // Handle package selection/deselection
  const handlePackageSelect = (pkg: Package) => {
    if (onPackageSelect) {
      // Toggle selection: if already selected, deselect it
      const newSelection = selectedPackage === pkg.id ? null : pkg.id;
      onPackageSelect(newSelection);
      
      // If deselecting, hide add-ons and clear selected add-ons
      if (newSelection === null) {
        setShowAddOns(false);
        setSelectedAddOns([]);
        setIsPaused(false); // Resume auto-slide
      } else {
        setShowAddOns(true);
        setIsPaused(true); // Pause auto-slide when user is customizing
      }
    }
  };

  return (
    <div className="lg:hidden mb-12 sm:mb-20">
      {/* Carousel Container */}
      <div
        className="relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {packages.map((pkg) => (
            <div key={pkg.id} className="w-full flex-shrink-0 px-4">
              <div className={`bg-white rounded-2xl shadow-xl border-2 overflow-hidden h-auto transition-all duration-300 ${
                pkg.isPopular 
                  ? 'border-[#d4af37] ring-4 ring-[#d4af37]/20' 
                  : 'border-gray-200'
              }`}>
                
                {/* Popular Badge */}
                {pkg.isPopular && (
                  <div className="bg-[#d4af37] text-black px-4 py-2 text-center">
                    <span className="text-sm font-bold uppercase tracking-wider">Most Popular</span>
                  </div>
                )}

                {/* Recommended Badge */}
                {pkg.isRecommended && !pkg.isPopular && (
                  <div className="bg-black text-white px-4 py-2 text-center">
                    <span className="text-xs font-bold uppercase tracking-wider">Recommended</span>
                  </div>
                )}

                {/* Package Content */}
                <div className="p-6">
                  {/* Package Header */}
                  <div className="text-center mb-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-black mb-2 font-serif">
                      {pkg.name}
                    </h3>
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      {pkg.originalPrice && (
                        <span className="text-base text-gray-400 line-through">{pkg.originalPrice}</span>
                      )}
                      <span className="text-3xl sm:text-4xl font-bold text-[#d4af37]">{pkg.price}</span>
                    </div>
                    <div className="text-gray-600 text-sm font-medium">{pkg.duration}</div>
                  </div>

                  {/* Package Description */}
                  <p className="text-gray-600 text-center mb-4 text-sm leading-relaxed">
                    {pkg.description}
                  </p>

                  {/* Ideal For - Compact */}
                  <div className="mb-4">
                    <h4 className="font-bold text-black mb-2 uppercase tracking-wide text-xs">Ideal For:</h4>
                    <div className="flex flex-wrap gap-1">
                      {pkg.idealFor.slice(0, 3).map((item, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {item}
                        </span>
                      ))}
                      {pkg.idealFor.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                          +{pkg.idealFor.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Key Features - Limited */}
                  <div className="mb-6">
                    <h4 className="font-bold text-black mb-3 uppercase tracking-wide text-xs">Key Features:</h4>
                    <ul className="space-y-2">
                      {pkg.features.slice(0, 4).map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-[#d4af37] rounded-full mt-1.5 flex-shrink-0"></div>
                          <span className="text-gray-700 text-xs leading-relaxed">{feature}</span>
                        </li>
                      ))}
                      {pkg.features.length > 4 && (
                        <li className="text-xs text-gray-500 italic">
                          +{pkg.features.length - 4} more features included
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {/* Select Package Button */}
                    <button
                      onClick={() => handlePackageSelect(pkg)}
                      className={`w-full py-3 px-6 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 ${
                        selectedPackage === pkg.id
                          ? 'bg-[#d4af37] text-black hover:bg-[#b8941f]'
                          : 'bg-gray-100 text-black hover:bg-gray-200'
                      }`}
                    >
                      {selectedPackage === pkg.id ? '✓ Selected (Tap to Deselect)' : 'Select Package'}
                    </button>

                    {/* Add-ons Button - Show only if package is selected */}
                    {selectedPackage === pkg.id && (
                      <button
                        onClick={() => setShowAddOns(!showAddOns)}
                        className="w-full py-3 px-6 rounded-xl font-bold text-sm uppercase tracking-wider bg-black text-white hover:bg-gray-800 transition-all duration-300"
                      >
                        {showAddOns ? 'Hide Add-ons' : `Add-ons (${selectedAddOns.length})`}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6 px-4">
        <div className="flex space-x-1">
          {packages.map((_, index) => (
            <div
              key={index}
              className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden cursor-pointer"
              onClick={() => goToSlide(index)}
            >
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? 'bg-[#d4af37] animate-pulse'
                    : index < currentIndex
                    ? 'bg-[#d4af37]'
                    : 'bg-gray-200'
                }`}
                style={{
                  width: index === currentIndex ? '100%' : index < currentIndex ? '100%' : '0%'
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Package Counter */}
      <div className="text-center mt-4">
        <span className="text-sm text-gray-500 font-medium">
          {currentIndex + 1} of {packages.length} packages
        </span>
      </div>

      {/* Add-ons Section - Show only if package is selected and add-ons are visible */}
      {selectedPackage && showAddOns && (
        <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mx-4">
          <h3 className="text-lg font-bold text-black mb-4 text-center">Enhance Your Package</h3>
          
          <div className="space-y-3 mb-6">
            {addOns.slice(0, 6).map((addOn) => (
              <div
                key={addOn.id}
                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-300 ${
                  selectedAddOns.includes(addOn.id)
                    ? 'border-[#d4af37] bg-[#d4af37]/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{addOn.icon || '🎁'}</span>
                    <div>
                      <h4 className="text-sm font-bold text-black">{addOn.name}</h4>
                      <p className="text-xs text-gray-600">{addOn.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-bold text-[#d4af37]">+RM{addOn.price}</span>
                  <button
                    onClick={() => toggleAddOn(addOn.id)}
                    className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                      selectedAddOns.includes(addOn.id)
                        ? 'bg-[#d4af37] border-[#d4af37]'
                        : 'border-gray-300 hover:border-[#d4af37]'
                    }`}
                  >
                    {selectedAddOns.includes(addOn.id) && (
                      <svg className="w-3 h-3 text-black mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Summary - Show only if package is selected */}
      {selectedPackage && (
        <div className="mt-6 bg-[#d4af37] rounded-2xl shadow-xl p-6 mx-4">
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-black mb-2">Booking Summary</h3>
            <div className="text-2xl font-bold text-black">
              Total: {formatPrice(calculateTotal())}
            </div>
            {selectedAddOns.length > 0 && (
              <div className="text-sm text-black/70 mt-1">
                Base: {getCurrentPackage().price} + {selectedAddOns.length} add-on{selectedAddOns.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          <WhatsAppButton
            message={getWhatsAppMessage()}
            className="w-full bg-black text-white py-4 px-6 rounded-xl font-bold text-center uppercase tracking-wider hover:bg-gray-800 transition-all duration-300 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.687"/>
            </svg>
            Book Now via WhatsApp
          </WhatsAppButton>
        </div>
      )}
    </div>
  );
}

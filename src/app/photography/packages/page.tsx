'use client';

import { useState } from 'react';
import PhotographyNavigation from '@/components/PhotographyNavigation';
import { getActiveAddOns, getActiveCategories, formatPrice, type AddOn } from '@/data/addons';
import WhatsAppButton from '@/components/WhatsAppButton';
import { quickContact } from '@/utils/whatsapp';

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

// AddOn interface is now imported from @/data/addons

const mainShooterPackages: Package[] = [
  {
    id: 'private-event',
    name: 'Private Event',
    price: 'RM250',
    duration: '1 Hour Coverage',
    description: 'Perfect for intimate gatherings, small celebrations, and personal milestones.',
    idealFor: ['Birthday parties', 'Small gatherings', 'Personal celebrations', 'Intimate events'],
    features: [
      '1 Hour Professional Coverage',
      'Unlimited High-Resolution Shots',
      'Professional Editing & Color Grading',
      'Online Gallery Access',
      'Google Drive Delivery',
      'Basic Retouching Included',
      '48-Hour Preview Delivery'
    ]
  },
  {
    id: 'tunang',
    name: 'Tunang (Engagement)',
    price: 'RM350',
    duration: '2 Hours Coverage',
    description: 'Capture the joy and excitement of your engagement ceremony with cinematic elegance.',
    idealFor: ['Engagement ceremonies', 'Ring ceremonies', 'Family gatherings', 'Traditional events'],
    features: [
      '2 Hours Professional Coverage',
      'Unlimited High-Resolution Shots',
      'Professional Editing & Color Grading',
      'Traditional & Modern Shots',
      'Family Group Photos',
      'Online Gallery Access',
      'Google Drive Delivery',
      'Advanced Retouching',
      '24-Hour Preview Delivery'
    ]
  },
  {
    id: 'nikah',
    name: 'Nikah (Solemnization)',
    price: 'RM450',
    duration: '3 Hours Coverage',
    description: 'Document the sacred moments of your nikah ceremony with respectful, professional photography.',
    idealFor: ['Nikah ceremonies', 'Religious ceremonies', 'Legal ceremonies', 'Traditional weddings'],
    features: [
      '3 Hours Professional Coverage',
      'Ceremony Documentation',
      'Outdoor Session Included',
      'Unlimited High-Resolution Shots',
      'Professional Editing & Color Grading',
      'Traditional & Artistic Shots',
      'Family & Guest Coverage',
      'Online Gallery Access',
      'Google Drive Delivery',
      'Premium Retouching',
      'Same-Day Preview Available'
    ],
    isPopular: true
  },
  {
    id: 'sanding',
    name: 'Sanding (Reception)',
    price: 'RM650',
    duration: '5 Hours Coverage',
    description: 'Comprehensive coverage of your wedding reception with full event documentation.',
    idealFor: ['Wedding receptions', 'Large celebrations', 'Multi-cultural events', 'Grand celebrations'],
    features: [
      '5 Hours Professional Coverage',
      'Full Reception Documentation',
      'Outdoor Session Included',
      'Unlimited High-Resolution Shots',
      'Professional Editing & Color Grading',
      'Ceremony & Party Coverage',
      'Guest Candid Moments',
      'Detail Shots & Decorations',
      'Online Gallery Access',
      'Google Drive Delivery',
      'Premium Retouching',
      'Priority Processing'
    ],
    isRecommended: true
  },
  {
    id: 'combo-nikah-sanding',
    name: 'Combo: Nikah + Sanding',
    price: 'RM950',
    originalPrice: 'RM1,100',
    duration: 'Full Day Coverage',
    description: 'Complete wedding day coverage from nikah to reception. Best value for full ceremonies.',
    idealFor: ['Complete weddings', 'Traditional ceremonies', 'Multi-event celebrations', 'Full documentation'],
    features: [
      'Full Day Professional Coverage',
      'Nikah Ceremony Coverage',
      'Reception Event Coverage',
      'Multiple Outdoor Sessions',
      'Unlimited High-Resolution Shots',
      'Professional Editing & Color Grading',
      'Complete Event Documentation',
      'Guest & Family Coverage',
      'Detail & Decoration Shots',
      'Online Gallery Access',
      'Google Drive Delivery',
      'Premium Retouching',
      'Priority Processing',
      'Complimentary Consultation'
    ],
    isPopular: true,
    isRecommended: true
  }
];

const secondShooterPackages: Package[] = [
  {
    id: 'nikah-second',
    name: 'Nikah (Second Shooter)',
    price: 'RM250',
    duration: '2 Hours Coverage',
    description: 'Additional perspective and coverage for your nikah ceremony with a second photographer.',
    idealFor: ['Multi-angle coverage', 'Large ceremonies', 'Complex setups', 'Additional perspectives'],
    features: [
      '2 Hours Additional Coverage',
      'Alternative Angles & Perspectives',
      'Unlimited High-Resolution Shots',
      'Professional Editing & Color Grading',
      'Coordinated with Main Shooter',
      'Online Gallery Access',
      'Google Drive Delivery',
      'Standard Retouching'
    ]
  },
  {
    id: 'sanding-second',
    name: 'Sanding (Second Shooter)',
    price: 'RM450',
    duration: '4 Hours Coverage',
    description: 'Comprehensive second shooter coverage for wedding receptions and large events.',
    idealFor: ['Large receptions', 'Multi-location events', 'Guest coverage', 'Candid moments'],
    features: [
      '4 Hours Additional Coverage',
      'Guest & Candid Moments',
      'Alternative Angles & Perspectives',
      'Unlimited High-Resolution Shots',
      'Professional Editing & Color Grading',
      'Detail & Background Shots',
      'Coordinated with Main Shooter',
      'Online Gallery Access',
      'Google Drive Delivery',
      'Premium Retouching'
    ],
    isPopular: true
  },
  {
    id: 'combo-second',
    name: 'Combo: Nikah + Sanding (Second)',
    price: 'RM550',
    originalPrice: 'RM700',
    duration: 'Full Day Additional Coverage',
    description: 'Complete second shooter coverage for full wedding day documentation.',
    idealFor: ['Complete coverage', 'Large weddings', 'Multiple locations', 'Comprehensive documentation'],
    features: [
      'Full Day Additional Coverage',
      'Nikah & Reception Coverage',
      'Guest & Family Documentation',
      'Alternative Angles & Perspectives',
      'Unlimited High-Resolution Shots',
      'Professional Editing & Color Grading',
      'Candid & Behind-Scenes',
      'Detail & Decoration Focus',
      'Coordinated with Main Shooter',
      'Online Gallery Access',
      'Google Drive Delivery',
      'Premium Retouching',
      'Priority Processing'
    ],
    isRecommended: true
  }
];

// Add-ons are now loaded from the admin-editable data source

// Helper function to render icons
const getIconForAddOn = (iconType: string) => {
  const icons: Record<string, string> = {
    clock: '🕐',
    video: '🎬',
    'fast-forward': '⚡',
    zap: '🚀',
    image: '📸',
    book: '📖',
    plane: '🚁',
    broadcast: '📡',
    heart: '💕'
  };
  return icons[iconType] || '⭐';
};

export default function PackagesPage() {
  const [activeTab, setActiveTab] = useState<'main' | 'second'>('main');
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  const currentPackages = activeTab === 'main' ? mainShooterPackages : secondShooterPackages;
  const addOns = getActiveAddOns(); // Load from admin-editable data
  const categories = getActiveCategories();

  const toggleAddOn = (addOnId: string) => {
    setSelectedAddOns(prev => 
      prev.includes(addOnId) 
        ? prev.filter(id => id !== addOnId)
        : [...prev, addOnId]
    );
  };

  const calculateTotal = () => {
    const packagePrice = selectedPackage 
      ? currentPackages.find(pkg => pkg.id === selectedPackage)?.price.replace('RM', '').replace(',', '') || '0'
      : '0';
    
    const addOnTotal = selectedAddOns.reduce((total, addOnId) => {
      const addOn = addOns.find(ao => ao.id === addOnId);
      return total + (addOn ? addOn.price : 0);
    }, 0);

    return parseInt(packagePrice) + addOnTotal;
  };

  const handleBookPackage = (packageId: string) => {
    const pkg = currentPackages.find(p => p.id === packageId);
    const message = `Hi! I'm interested in booking the ${pkg?.name} package (${pkg?.price}). Can you provide more details and check availability?`;
    window.open(`https://wa.me/60177464121?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Photography Navigation */}
      <PhotographyNavigation />

      {/* Packages Header */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-7xl font-bold text-black mb-6 font-serif">
              Photography Packages
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-[#d4af37] to-[#b8941f] mx-auto mb-8 rounded-full"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Professional photography packages designed for every occasion. 
              From intimate gatherings to grand celebrations, we capture your moments with cinematic excellence.
            </p>
          </div>

          {/* Package Type Tabs */}
          <div className="flex justify-center mb-12">
            <div className="bg-gray-100 rounded-full p-2 inline-flex">
              <button
                onClick={() => setActiveTab('main')}
                className={`px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest transition-all duration-300 ${
                  activeTab === 'main'
                    ? 'bg-[#d4af37] text-black shadow-lg'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Main Shooter
              </button>
              <button
                onClick={() => setActiveTab('second')}
                className={`px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest transition-all duration-300 ${
                  activeTab === 'second'
                    ? 'bg-[#d4af37] text-black shadow-lg'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Second Shooter
              </button>
            </div>
          </div>

          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {currentPackages.map((pkg) => (
              <div
                key={pkg.id}
                className={`group relative bg-white rounded-2xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                  pkg.isPopular 
                    ? 'border-[#d4af37] ring-4 ring-[#d4af37]/20' 
                    : 'border-gray-200 hover:border-[#d4af37]'
                } ${selectedPackage === pkg.id ? 'ring-4 ring-[#d4af37]/40 border-[#d4af37]' : ''}`}
              >
                {/* Popular Badge */}
                {pkg.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-[#d4af37] text-black px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider">
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Recommended Badge */}
                {pkg.isRecommended && !pkg.isPopular && (
                  <div className="absolute -top-4 right-4">
                    <div className="bg-black text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                      Recommended
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Package Header */}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-black mb-2 font-serif">{pkg.name}</h3>
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      {pkg.originalPrice && (
                        <span className="text-lg text-gray-400 line-through">{pkg.originalPrice}</span>
                      )}
                      <span className="text-4xl font-bold text-[#d4af37]">{pkg.price}</span>
                    </div>
                    <div className="text-gray-600 font-medium">{pkg.duration}</div>
                  </div>

                  {/* Package Description */}
                  <p className="text-gray-600 text-center mb-6 leading-relaxed">{pkg.description}</p>

                  {/* Ideal For */}
                  <div className="mb-6">
                    <h4 className="font-bold text-black mb-3 uppercase tracking-wide text-sm">Ideal For:</h4>
                    <div className="flex flex-wrap gap-2">
                      {pkg.idealFor.map((item, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="mb-8">
                    <h4 className="font-bold text-black mb-4 uppercase tracking-wide text-sm">What's Included:</h4>
                    <ul className="space-y-3">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-[#d4af37] rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={() => setSelectedPackage(selectedPackage === pkg.id ? null : pkg.id)}
                      className={`w-full py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all duration-300 ${
                        selectedPackage === pkg.id
                          ? 'bg-[#d4af37] text-black'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {selectedPackage === pkg.id ? 'Selected' : 'Select Package'}
                    </button>
                    
                    <WhatsAppButton
                      message={{
                        type: 'package',
                        context: 'booking',
                        packageName: pkg.name,
                        packagePrice: pkg.price,
                        pageSource: 'packages-page'
                      }}
                      variant="secondary"
                      size="md"
                      className="w-full"
                      analytics={`package-booking-${pkg.id}`}
                    >
                      Book Now
                    </WhatsAppButton>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add-Ons Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-black mb-4 font-serif">Enhance Your Package</h2>
              <div className="w-16 h-px bg-[#d4af37] mx-auto mb-6"></div>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Add extra services to make your photography experience even more special.
              </p>
            </div>

            {/* Organized by Categories */}
            <div className="space-y-12">
              {categories.map((category) => {
                const categoryAddOns = addOns.filter(addon => addon.category === category.id);
                
                if (categoryAddOns.length === 0) return null;
                
                return (
                  <div key={category.id} className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-black mb-2 font-serif">{category.name}</h3>
                      <p className="text-gray-600">{category.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoryAddOns.map((addOn) => (
                        <div
                          key={addOn.id}
                          className={`relative bg-white rounded-xl border-2 p-6 transition-all duration-300 hover:shadow-lg cursor-pointer ${
                            selectedAddOns.includes(addOn.id)
                              ? 'border-[#d4af37] bg-[#d4af37]/5 shadow-lg'
                              : 'border-gray-200 hover:border-[#d4af37]'
                          }`}
                          onClick={() => toggleAddOn(addOn.id)}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                {addOn.icon && (
                                  <div className="w-8 h-8 bg-[#d4af37]/10 rounded-lg flex items-center justify-center">
                                    <span className="text-[#d4af37] text-sm">
                                      {getIconForAddOn(addOn.icon)}
                                    </span>
                                  </div>
                                )}
                                <h4 className="font-bold text-black">{addOn.name}</h4>
                              </div>
                              <p className="text-gray-600 text-sm mb-3 leading-relaxed">{addOn.description}</p>
                              <div className="text-2xl font-bold text-[#d4af37]">{formatPrice(addOn.price)}</div>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                              selectedAddOns.includes(addOn.id)
                                ? 'border-[#d4af37] bg-[#d4af37] scale-110'
                                : 'border-gray-300 hover:border-[#d4af37]'
                            }`}>
                              {selectedAddOns.includes(addOn.id) && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                          
                          {selectedAddOns.includes(addOn.id) && (
                            <div className="mt-4 pt-4 border-t border-[#d4af37]/20">
                              <div className="flex items-center text-[#d4af37] text-sm font-medium">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Added to your package
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Package Calculator */}
          {selectedPackage && (
            <div className="bg-gray-50 rounded-2xl p-8 mb-20">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-black mb-4 font-serif">Your Package Summary</h3>
                <div className="w-16 h-px bg-[#d4af37] mx-auto"></div>
              </div>

              <div className="max-w-2xl mx-auto">
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="font-medium text-black">
                      {currentPackages.find(pkg => pkg.id === selectedPackage)?.name}
                    </span>
                    <span className="font-bold text-[#d4af37]">
                      {currentPackages.find(pkg => pkg.id === selectedPackage)?.price}
                    </span>
                  </div>
                  
                  {selectedAddOns.map(addOnId => {
                    const addOn = addOns.find(ao => ao.id === addOnId);
                    return addOn ? (
                      <div key={addOnId} className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-700">{addOn.name}</span>
                        <span className="font-medium text-gray-900">{formatPrice(addOn.price)}</span>
                      </div>
                    ) : null;
                  })}
                </div>

                <div className="flex justify-between items-center py-4 border-t-2 border-[#d4af37] mb-6">
                  <span className="text-xl font-bold text-black">Total</span>
                  <span className="text-3xl font-bold text-[#d4af37]">RM{calculateTotal()}</span>
                </div>

                <WhatsAppButton
                  message={{
                    type: 'package',
                    context: 'booking',
                    packageName: currentPackages.find(p => p.id === selectedPackage)?.name || 'Selected Package',
                    packagePrice: currentPackages.find(p => p.id === selectedPackage)?.price || '',
                    addOns: selectedAddOns.map(id => addOns.find(ao => ao.id === id)?.name).filter(Boolean) as string[],
                    totalPrice: calculateTotal(),
                    pageSource: 'package-calculator'
                  }}
                  variant="primary"
                  size="lg"
                  className="w-full"
                  analytics="package-calculator-booking"
                >
                  Book This Package - RM{calculateTotal()}
                </WhatsAppButton>
              </div>
            </div>
          )}

          {/* FAQ Section */}
          <div className="text-center">
            <h2 className="text-4xl font-bold text-black mb-4 font-serif">Questions About Packages?</h2>
            <div className="w-16 h-px bg-[#d4af37] mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Need clarification on our packages or want to discuss custom requirements? We're here to help.
            </p>
            <WhatsAppButton
              message={{
                type: 'custom',
                context: "Hi! I have questions about your photography packages. Can you help me choose the right one?",
                pageSource: 'packages-consultation'
              }}
              variant="secondary"
              size="lg"
              analytics="package-consultation"
            >
              Get Package Consultation
            </WhatsAppButton>
          </div>
        </div>
      </section>
    </div>
  );
}
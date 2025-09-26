'use client';

import { useState, useEffect } from 'react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onSubmit: (bookingData: BookingFormData) => void;
}

export interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  photographyType: 'wedding' | 'engagement' | 'graduation' | 'event' | 'corporate' | 'private-session';
  notes: string;
  selectedDate: Date;
}

const photographyTypes = [
  { value: 'wedding', label: 'Wedding' },
  { value: 'engagement', label: 'Engagement' },
  { value: 'graduation', label: 'Graduation' },
  { value: 'event', label: 'Event' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'private-session', label: 'Private Session' }
];

export default function BookingModal({ isOpen, onClose, selectedDate, onSubmit }: BookingModalProps) {
  const [formData, setFormData] = useState<Omit<BookingFormData, 'selectedDate'>>({
    name: '',
    email: '',
    phone: '',
    photographyType: 'wedding',
    notes: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        photographyType: 'wedding',
        notes: ''
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\+]?[\d\s\-\(\)]{8,}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingData: BookingFormData = {
        ...formData,
        selectedDate
      };
      
      await onSubmit(bookingData);
    } catch (error) {
      console.error('Booking submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Auto-progress through steps based on completion
    const updatedData = { ...formData, [field]: value };
    
    // Step 1: Service Details (Photography Type)
    if (updatedData.photographyType && currentStep < 2) {
      setCurrentStep(2);
    }
    
    // Step 2: Your Information (Name, Email, Phone)
    if (updatedData.name && updatedData.email && updatedData.phone && currentStep < 3) {
      setCurrentStep(3);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !selectedDate) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl transform animate-slideUp overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-black to-gray-900 text-white p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold font-serif mb-2">Book Your Session</h2>
              <p className="text-white/80">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              disabled={isSubmitting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      step <= currentStep
                        ? 'bg-[#d4af37] text-black'
                        : 'bg-white/20 text-white/60'
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-12 h-0.5 mx-2 transition-all duration-300 ${
                        step < currentStep ? 'bg-[#d4af37]' : 'bg-white/20'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <span className="text-white/60 text-sm">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          
          {/* Step Labels */}
          <div className="flex justify-between text-xs text-white/60 uppercase tracking-wider">
            <span className={currentStep >= 1 ? 'text-[#d4af37]' : ''}>Service Details</span>
            <span className={currentStep >= 2 ? 'text-[#d4af37]' : ''}>Your Information</span>
            <span className={currentStep >= 3 ? 'text-[#d4af37]' : ''}>Confirmation</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Photography Type */}
          <div>
            <label className="block text-sm font-bold text-black mb-3 uppercase tracking-widest">
              Photography Type *
            </label>
            <select
              value={formData.photographyType}
              onChange={(e) => handleInputChange('photographyType', e.target.value as any)}
              className="w-full px-4 py-4 border-2 border-[#d4af37]/20 rounded-xl focus:border-[#d4af37] focus:outline-none transition-colors text-lg bg-white text-black"
              disabled={isSubmitting}
            >
              {photographyTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Name and Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-black mb-3 uppercase tracking-widest">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none transition-colors text-lg text-black ${
                  errors.name 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-[#d4af37]/20 focus:border-[#d4af37]'
                }`}
                placeholder="Your full name"
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-3 uppercase tracking-widest">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none transition-colors text-lg text-black ${
                  errors.email 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-[#d4af37]/20 focus:border-[#d4af37]'
                }`}
                placeholder="your@email.com"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-bold text-black mb-3 uppercase tracking-widest">
              Phone Number *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none transition-colors text-lg text-black ${
                errors.phone 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-[#d4af37]/20 focus:border-[#d4af37]'
              }`}
              placeholder="+60 12-345 6789"
              disabled={isSubmitting}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.phone}
              </p>
            )}
          </div>

          {/* Special Notes */}
          <div>
            <label className="block text-sm font-bold text-black mb-3 uppercase tracking-widest">
              Special Requests or Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={4}
              className="w-full px-4 py-4 border-2 border-[#d4af37]/20 rounded-xl focus:border-[#d4af37] focus:outline-none transition-colors text-lg resize-none text-black"
              placeholder="Any special requests, preferred style, location details, or other notes..."
              disabled={isSubmitting}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 px-8 border-2 border-black/20 text-black font-bold text-lg uppercase tracking-widest rounded-xl hover:bg-black/5 transition-all duration-300"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-4 px-8 bg-[#d4af37] text-black font-bold text-lg uppercase tracking-widest rounded-xl hover:bg-[#d4af37]/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.687"/>
                  </svg>
                  Confirm Booking
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
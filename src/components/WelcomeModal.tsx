'use client';

import { useState, useEffect } from 'react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDontShowAgain: () => void;
}

export default function WelcomeModal({ isOpen, onClose, onDontShowAgain }: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showDontShowAgain, setShowDontShowAgain] = useState(false);

  const steps = [
    {
      icon: "🎬",
      title: "Welcome to CAPTURA",
      subtitle: "Professional Camera Rental Platform",
      description: "Rent premium cameras for your creative projects with our seamless booking system.",
      animation: "bounce"
    },
    {
      icon: "📱",
      title: "WhatsApp Booking Process",
      subtitle: "Direct Communication, No Online Payment",
      description: "Your booking details will be sent directly to our WhatsApp for personalized service and confirmation.",
      animation: "pulse"
    },
    {
      icon: "💬",
      title: "How It Works",
      subtitle: "Simple 4-Step Process",
      description: "1. Select dates → 2. Accept terms → 3. Enter details → 4. Send to WhatsApp",
      animation: "wiggle"
    },
    {
      icon: "✨",
      title: "Ready to Start?",
      subtitle: "Let's Find Your Perfect Camera",
      description: "Payment and final confirmation will be handled through our WhatsApp communication.",
      animation: "glow"
    }
  ];

  useEffect(() => {
    if (isOpen && currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 3000);
      return () => clearTimeout(timer);
    } else if (isOpen && currentStep === steps.length - 1) {
      setShowDontShowAgain(true);
    }
  }, [isOpen, currentStep, steps.length]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        // Close modal if clicking on backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl transform transition-all duration-500 scale-100 animate-modal-enter my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Background */}
        <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 text-white overflow-hidden">
          {/* Floating Particles */}
          <div className="absolute inset-0">
            <div className="absolute top-4 left-4 w-2 h-2 bg-white rounded-full animate-float-1 opacity-60"></div>
            <div className="absolute top-8 right-8 w-1 h-1 bg-white rounded-full animate-float-2 opacity-40"></div>
            <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-white rounded-full animate-float-3 opacity-50"></div>
            <div className="absolute bottom-4 right-4 w-1 h-1 bg-white rounded-full animate-float-1 opacity-30"></div>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index <= currentStep ? 'bg-white' : 'bg-white bg-opacity-30'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Main Icon with Animation */}
          <div className="text-center mb-6">
            <div className={`text-6xl mb-4 inline-block animate-${currentStepData.animation}`}>
              {currentStepData.icon}
            </div>
            <h2 className="text-2xl font-bold mb-2 animate-slide-up">
              {currentStepData.title}
            </h2>
            <p className="text-blue-100 text-sm font-medium animate-slide-up-delay">
              {currentStepData.subtitle}
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8">
          <p className="text-gray-700 text-center leading-relaxed mb-8 animate-fade-in">
            {currentStepData.description}
          </p>

          {/* Special Features for Step 3 */}
          {currentStep === 2 && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg animate-scale-in">
                <div className="text-2xl mb-2">📅</div>
                <div className="text-xs font-medium text-gray-700">Select Dates</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg animate-scale-in-delay">
                <div className="text-2xl mb-2">📋</div>
                <div className="text-xs font-medium text-gray-700">Accept Terms</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg animate-scale-in-delay-2">
                <div className="text-2xl mb-2">👤</div>
                <div className="text-xs font-medium text-gray-700">Enter Details</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg animate-scale-in-delay-3">
                <div className="text-2xl mb-2">💬</div>
                <div className="text-xs font-medium text-gray-700">Send WhatsApp</div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {currentStep === steps.length - 1 ? (
              <>
                <button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg animate-button-glow"
                >
                  🚀 Start Booking Now
                </button>
                
                {showDontShowAgain && (
                  <div className="flex items-center justify-center space-x-2 animate-fade-in-slow">
                    <input
                      type="checkbox"
                      id="dontShowAgain"
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      onChange={(e) => {
                        if (e.target.checked) {
                          onDontShowAgain();
                        }
                      }}
                    />
                    <label htmlFor="dontShowAgain" className="text-sm text-gray-600">
                      Don't show this again
                    </label>
                  </div>
                )}
              </>
            ) : (
              <div className="flex justify-between items-center">
                <button
                  onClick={onClose}
                  className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  Skip
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentStep(steps.length - 1)}
                    className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Skip to End
                  </button>
                  <button
                    onClick={() => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white to-transparent opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500 to-transparent opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
      </div>
    </div>
  );
}

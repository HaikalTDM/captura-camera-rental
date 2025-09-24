'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BookingStepsSection() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  const steps = [
    {
      id: 1,
      title: "Browse & Select Camera",
      description: "Choose your preferred camera from our professional collection below",
      icon: "📷",
      details: "Browse through our high-quality cameras and select the one that fits your project needs",
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: 2,
      title: "Pick Your Dates",
      description: "Select your rental start and end dates using our calendar",
      icon: "📅",
      details: "Choose when you need the camera and for how long. Pricing is calculated automatically",
      color: "from-green-500 to-emerald-500"
    },
    {
      id: 3,
      title: "Enter Your Details",
      description: "Fill in your contact information and rental preferences",
      icon: "📝",
      details: "Provide your name, phone number, and any special requirements for your rental",
      color: "from-purple-500 to-violet-500"
    },
    {
      id: 4,
      title: "Send to WhatsApp",
      description: "Your booking details are sent directly to our WhatsApp for processing",
      icon: "📱",
      details: "No payment needed on the website! We'll contact you via WhatsApp to confirm and arrange pickup/delivery",
      color: "from-pink-500 to-rose-500"
    }
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 4000); // Change step every 4 seconds

    return () => clearInterval(interval);
  }, [steps.length]);

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
  };

  return (
    <section id="how-to-book" className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-500 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-pink-500 rounded-full animate-ping"></div>
        <div className="absolute bottom-40 right-1/3 w-14 h-14 bg-green-500 rounded-full animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-6 animate-pulse">
            <span className="text-2xl sm:text-3xl">🎯</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
            How to Book Your Camera
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-4 px-4">
            Simple 4-step process to get your professional camera rental
          </p>
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-3 sm:px-6 rounded-full font-semibold text-base sm:text-lg border-2 border-green-200 mx-4">
            <span className="text-xl sm:text-2xl">💳</span>
            <span className="text-center">No Payment Required on Website!</span>
            <span className="text-xl sm:text-2xl">✨</span>
          </div>
        </div>

        {/* Steps Navigation */}
        <div className="flex justify-center mb-8 sm:mb-12 px-4">
          <div className="flex flex-wrap justify-center gap-1 sm:gap-2 bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-gray-200 max-w-full">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => handleStepClick(index)}
                className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-3 px-2 py-2 sm:px-6 sm:py-4 rounded-xl transition-all duration-500 min-h-[48px] min-w-[48px] ${
                  currentStep === index
                    ? `bg-gradient-to-r ${step.color} text-white shadow-lg transform scale-105`
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl sm:text-2xl">{step.icon}</span>
                <span className="font-semibold text-xs sm:text-base hidden sm:block">Step {step.id}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Current Step Display */}
        <div className="max-w-4xl mx-auto h-[520px] flex items-center">
          <div
            className={`transform transition-all duration-700 w-full ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
            key={currentStep}
          >
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden mx-4">
              <div className={`bg-gradient-to-r ${steps[currentStep].color} p-4 sm:p-8 text-white`}>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm animate-bounce flex-shrink-0">
                    <span className="text-3xl sm:text-4xl">{steps[currentStep].icon}</span>
                  </div>
                  <div className="text-center sm:text-left">
                    <div className="text-sm font-semibold opacity-90 mb-2">
                      STEP {steps[currentStep].id} OF {steps.length}
                    </div>
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
                      {steps[currentStep].title}
                    </h3>
                    <p className="text-lg sm:text-xl opacity-95">
                      {steps[currentStep].description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-8">
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6">
                  {steps[currentStep].details}
                </p>

                {/* Special highlight for no payment step */}
                {currentStep === 3 && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 sm:p-6 mb-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-pulse flex-shrink-0">
                        <span className="text-2xl">💰</span>
                      </div>
                      <div className="text-center sm:text-left">
                        <h4 className="text-lg sm:text-xl font-bold text-green-800 mb-2">
                          100% Free Booking Process!
                        </h4>
                        <p className="text-green-700 text-sm sm:text-base">
                          No credit card required. No upfront payment. Just send your booking details and we'll handle the rest via WhatsApp!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Progress bar */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-600 hidden sm:inline">Progress:</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className={`bg-gradient-to-r ${steps[currentStep].color} h-3 rounded-full transition-all duration-700`}
                      style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-600">
                    {Math.round(((currentStep + 1) / steps.length) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12 sm:mt-16 px-4">
          <button
            onClick={() => {
              // Navigate to homepage with cameras anchor
              router.push('/#cameras');
            }}
            className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-4 sm:px-8 rounded-full font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-pulse max-w-full cursor-pointer"
          >
            <span className="text-xl sm:text-2xl">🚀</span>
            <span
              className="text-center cursor-pointer hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                // Navigate to homepage with cameras anchor
                router.push('/#cameras');
              }}
            >
              Ready to Start? Browse Cameras Below!
            </span>
            <span className="text-xl sm:text-2xl">📷</span>
          </button>
        </div>
      </div>
    </section>
  );
}

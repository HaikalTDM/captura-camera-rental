'use client';

import { useState } from 'react';

export default function FAQSection() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqs = [
    {
      question: "What happens if something gets damaged or stolen during my rental?",
      answer: "The renter is responsible for all costs related to damage, loss, or theft of the equipment. We recommend handling the equipment with care and keeping it secure at all times. Please inspect the equipment upon pickup and report any existing issues immediately."
    },
    {
      question: "Can I extend my rental period if I need the camera longer?",
      answer: "Yes, you can extend your rental period if the equipment is available for the additional days. Please contact us as soon as possible to check availability and arrange the extension. Additional days will be charged at the standard daily rate."
    },
    {
      question: "What if I need to cancel or reschedule my booking?",
      answer: "If you cancel your booking 1 day before the scheduled pickup date, your booking deposit will be forfeited. For cancellations made earlier, please contact us to discuss refund options. We understand plans can change, so please reach out as soon as possible."
    },
    {
      question: "Can I use this camera for commercial or business purposes?",
      answer: "Absolutely! Our cameras are perfect for commercial use, business projects, content creation, and professional photography/videography. There are no restrictions on commercial usage - rent with confidence for your business needs."
    },
    {
      question: "What if I need help with camera settings or something stops working?",
      answer: "You can text me anytime for technical support! I'm here to help with camera settings, troubleshooting, or any questions during your rental period. Don't hesitate to reach out - customer support is part of the service."
    },
    {
      question: "What do I need to bring when picking up the camera?",
      answer: "Please bring a copy of your IC (Identity Card) and the remaining payment balance. We'll verify your identity and complete the payment process before handing over the equipment. Cash or online transfer are both accepted."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <section id="faq" className="py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              ❓ Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Got questions? We've got answers! Here are the most common questions about our camera rental service.
            </p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden transition-all duration-300 hover:shadow-xl"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-gray-50/50 transition-colors duration-200 min-h-[80px]"
                >
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 transition-transform duration-300 ${
                    openFAQ === index ? 'rotate-180 bg-blue-500' : ''
                  }`}>
                    <svg
                      className={`w-5 h-5 transition-colors duration-300 ${
                        openFAQ === index ? 'text-white' : 'text-blue-600'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                
                {openFAQ === index && (
                  <div className="px-6 pb-6">
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <h3 className="text-xl sm:text-2xl font-bold mb-4">
                Still have questions? 🤔
              </h3>
              <p className="text-blue-100 mb-6 text-base sm:text-lg">
                Don't hesitate to reach out! I'm here to help make your camera rental experience smooth and easy.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a
                  href="https://wa.me/60177464121"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center gap-2 min-h-[48px]"
                >
                  💬 WhatsApp Me
                </a>
                <a
                  href="tel:+60177464121"
                  className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center gap-2 min-h-[48px]"
                >
                  📞 Call Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

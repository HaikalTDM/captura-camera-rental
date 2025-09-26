'use client';

import { useState } from 'react';
import PhotographyNavigation from '@/components/PhotographyNavigation';
import WhatsAppButton from '@/components/WhatsAppButton';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    eventDate: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleWhatsAppContact = () => {
    const { name, email, phone, eventType, eventDate, message } = formData;
    let whatsappMessage = "Hi! I'd like to inquire about your photography services.\n\n";
    
    if (name) whatsappMessage += `Name: ${name}\n`;
    if (email) whatsappMessage += `Email: ${email}\n`;
    if (phone) whatsappMessage += `Phone: ${phone}\n`;
    if (eventType) whatsappMessage += `Event Type: ${eventType}\n`;
    if (eventDate) whatsappMessage += `Event Date: ${eventDate}\n`;
    if (message) whatsappMessage += `Additional Details: ${message}\n`;
    
    whatsappMessage += "\nLooking forward to hearing from you!";
    
    const whatsappUrl = `https://wa.me/60177464121?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const contactMethods = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      title: 'Phone',
      content: '+60 17-746 4121',
      description: 'Call us directly for immediate assistance',
      action: () => window.open('tel:+60177464121', '_self')
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.687"/>
        </svg>
      ),
      title: 'WhatsApp',
      content: '+60 17-746 4121',
      description: 'Chat with us instantly for quick responses',
      action: () => {
        const message = "Hi! I'm interested in your photography services and would like to discuss my needs.";
        window.open(`https://wa.me/60177464121?text=${encodeURIComponent(message)}`, '_blank');
      }
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Email',
      content: 'captura.my@gmail.com',
      description: 'Send us detailed inquiries via email',
      action: () => window.open('mailto:captura.my@gmail.com?subject=Photography Inquiry', '_self')
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Location',
      content: 'Seri Kembangan, Selangor',
      description: 'Coverage within 30km included',
      action: () => window.open('https://maps.google.com/?q=Seri+Kembangan+Selangor', '_blank')
    }
  ];

  const businessHours = [
    { day: 'Monday - Friday', hours: '9:00 AM - 7:00 PM' },
    { day: 'Saturday', hours: '9:00 AM - 6:00 PM' },
    { day: 'Sunday', hours: '10:00 AM - 5:00 PM' },
  ];

  const quickLinks = [
    {
      title: 'View Our Packages',
      description: 'Explore our photography packages and pricing',
      action: () => window.location.href = '/photography/packages',
      icon: '📦'
    },
    {
      title: 'Browse Gallery',
      description: 'Check out our latest work and portfolio',
      action: () => window.location.href = '/photography/gallery',
      icon: '🖼️'
    },
    {
      title: 'Read FAQ',
      description: 'Find answers to common questions',
      action: () => window.location.href = '/faq',
      icon: '❓'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Photography Navigation */}
      <PhotographyNavigation />

      {/* Contact Header */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-7xl font-bold text-black mb-6 font-serif">
              Contact Us
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-[#d4af37] to-[#b8941f] mx-auto mb-8 rounded-full"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Get in touch to discuss your photography needs. We're here to capture your special moments 
              with cinematic excellence and professional dedication.
            </p>
          </div>

          {/* Contact Methods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                onClick={method.action}
                className="bg-white rounded-2xl border-2 border-gray-200 hover:border-[#d4af37] p-8 text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer group"
              >
                <div className="w-16 h-16 bg-[#d4af37]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#d4af37] transition-all duration-300">
                  <div className="text-[#d4af37] group-hover:text-white transition-colors duration-300">
                    {method.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-black mb-2 font-serif">{method.title}</h3>
                <p className="text-lg font-medium text-[#d4af37] mb-3">{method.content}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{method.description}</p>
              </div>
            ))}
          </div>

          {/* Contact Form & Info Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            {/* Contact Form */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-black mb-6 font-serif">Send Us a Message</h2>
              <p className="text-gray-600 mb-8">
                Fill out the form below and we'll contact you via WhatsApp with all the details you need.
              </p>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] transition-colors"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] transition-colors"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] transition-colors"
                      placeholder="+60 12-345 6789"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                    <select
                      name="eventType"
                      value={formData.eventType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] transition-colors"
                    >
                      <option value="">Select Event Type</option>
                      <option value="wedding">Wedding</option>
                      <option value="engagement">Engagement</option>
                      <option value="graduation">Graduation</option>
                      <option value="corporate">Corporate Event</option>
                      <option value="portrait">Portrait Session</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Date</label>
                  <input
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] transition-colors resize-none"
                    placeholder="Tell us about your event, preferred style, special requirements, or any questions you have..."
                  />
                </div>

                <button
                  onClick={handleWhatsAppContact}
                  className="w-full py-4 bg-[#d4af37] text-black font-bold text-lg uppercase tracking-widest rounded-xl hover:bg-[#d4af37]/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Send via WhatsApp
                </button>

                <p className="text-sm text-gray-500 text-center">
                  * This form will open WhatsApp with your information pre-filled for quick communication.
                </p>
              </div>
            </div>

            {/* Business Info */}
            <div className="space-y-8">
              {/* Business Hours */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
                <h3 className="text-2xl font-bold text-black mb-6 font-serif">Business Hours</h3>
                <div className="space-y-4">
                  {businessHours.map((schedule, index) => (
                    <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                      <span className="text-gray-700 font-medium">{schedule.day}</span>
                      <span className="text-[#d4af37] font-bold">{schedule.hours}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-[#d4af37]/10 rounded-xl">
                  <p className="text-sm text-gray-700">
                    <strong>Note:</strong> We're also available for emergency bookings and consultations outside business hours via WhatsApp.
                  </p>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
                <h3 className="text-2xl font-bold text-black mb-6 font-serif">Quick Links</h3>
                <div className="space-y-4">
                  {quickLinks.map((link, index) => (
                    <button
                      key={index}
                      onClick={link.action}
                      className="w-full flex items-center space-x-4 p-4 rounded-xl border-2 border-gray-100 hover:border-[#d4af37] hover:bg-[#d4af37]/5 transition-all duration-300 group text-left"
                    >
                      <span className="text-2xl">{link.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-bold text-black group-hover:text-[#d4af37] transition-colors">
                          {link.title}
                        </h4>
                        <p className="text-sm text-gray-600">{link.description}</p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-[#d4af37] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Quick Access */}
          <div className="bg-black rounded-2xl p-8 lg:p-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-4 font-serif">Still Have Questions?</h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Check out our frequently asked questions or get in touch directly for personalized assistance.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button
                onClick={() => window.location.href = '/faq'}
                className="px-8 py-4 bg-white text-black font-bold text-lg uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
              >
                View FAQ
              </button>
              <WhatsAppButton
                message={{
                  type: 'custom',
                  context: "Hi! I have some questions that aren't covered in your FAQ. Can you help me?",
                  pageSource: 'contact-page'
                }}
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-black"
                analytics="contact-page-faq"
              >
                Chat with Us
              </WhatsAppButton>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
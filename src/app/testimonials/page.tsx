'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PhotographyNavigation from '@/components/PhotographyNavigation';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  rating: number;
  review: string;
  image?: string;
  eventType: 'wedding' | 'corporate' | 'graduation' | 'portrait' | 'event';
  date: string;
  featured: boolean;
}

// Mock testimonials data - in real app, this would come from admin panel/database
const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah & Ahmad',
    role: 'Wedding Couple',
    rating: 5,
    review: 'Absolutely stunning work! The photographer captured every precious moment of our wedding day. The photos are cinematic and tell our love story beautifully. Professional, punctual, and incredibly talented.',
    image: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150',
    eventType: 'wedding',
    date: '2024-12-15',
    featured: true
  },
  {
    id: '2',
    name: 'Dr. Melissa Chen',
    role: 'Medical Director',
    company: 'KL Medical Centre',
    rating: 5,
    review: 'Hired for our annual corporate gala. The quality exceeded our expectations. Every shot was perfectly composed and the team was incredibly professional throughout the event.',
    image: 'https://images.unsplash.com/photo-1594824388853-2c5d00f4b7b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150',
    eventType: 'corporate',
    date: '2024-11-20',
    featured: true
  },
  {
    id: '3',
    name: 'Aisha Rahman',
    role: 'Graduate',
    company: 'Universiti Malaya',
    rating: 5,
    review: 'My graduation photos are absolutely perfect! The photographer made me feel comfortable and confident. The editing style is exactly what I wanted - elegant and timeless.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150',
    eventType: 'graduation',
    date: '2024-10-08',
    featured: false
  },
  {
    id: '4',
    name: 'Raj & Priya',
    role: 'Engaged Couple',
    rating: 5,
    review: 'Our engagement shoot was magical! The photographer guided us through poses naturally and captured our personalities perfectly. We can\'t wait to book for our wedding!',
    image: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150',
    eventType: 'wedding',
    date: '2024-09-22',
    featured: false
  },
  {
    id: '5',
    name: 'Marcus Lim',
    role: 'CEO',
    company: 'Tech Innovators Sdn Bhd',
    rating: 5,
    review: 'Professional headshots that elevated our company image. The attention to detail and lighting expertise is exceptional. Highly recommend for any corporate photography needs.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150',
    eventType: 'corporate',
    date: '2024-08-15',
    featured: false
  },
  {
    id: '6',
    name: 'Fatimah & Hakim',
    role: 'Wedding Couple',
    rating: 5,
    review: 'From our nikah to sanding, every moment was captured beautifully. The photos reflect the joy and emotion of our special day. Thank you for preserving our memories so perfectly!',
    image: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150',
    eventType: 'wedding',
    date: '2024-07-30',
    featured: true
  }
];

export default function TestimonialsPage() {
  const [filter, setFilter] = useState<'all' | 'wedding' | 'corporate' | 'graduation' | 'portrait' | 'event'>('all');
  const [isLoading, setIsLoading] = useState(false);

  const filteredTestimonials = filter === 'all' 
    ? testimonials.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    : testimonials.filter(t => t.eventType === filter).sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  const handleFilterChange = (newFilter: typeof filter) => {
    if (newFilter !== filter) {
      setIsLoading(true);
      setTimeout(() => {
        setFilter(newFilter);
        setIsLoading(false);
      }, 300);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <svg
        key={index}
        className={`w-5 h-5 ${index < rating ? 'text-[#d4af37]' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Photography Navigation */}
      <PhotographyNavigation />

      {/* Hero Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-7xl md:text-8xl font-bold mb-8 font-serif text-black leading-tight">
            Client
            <br />
            <span className="italic">Testimonials</span>
          </h1>
          <div className="w-24 h-px bg-[#d4af37] mx-auto mb-8"></div>
          <p className="text-xl text-black/80 mb-4 font-medium">
            Stories from our satisfied clients
          </p>
          <p className="text-lg text-black/60 max-w-3xl mx-auto mb-16 leading-relaxed">
            Real feedback from weddings, corporate events, graduations, and portrait sessions.
            See why clients trust us to capture their most important moments.
          </p>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {(['all', 'wedding', 'corporate', 'graduation', 'portrait', 'event'] as const).map((category) => (
              <button
                key={category}
                onClick={() => handleFilterChange(category)}
                className={`px-6 py-3 text-sm font-bold uppercase tracking-widest rounded-full border-2 transition-all duration-300 ${
                  filter === category
                    ? 'bg-[#d4af37] text-black border-[#d4af37]'
                    : 'bg-white text-black border-[#d4af37]/30 hover:border-[#d4af37] hover:text-[#d4af37]'
                }`}
              >
                {category === 'all' ? 'All Reviews' : category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              // Loading Skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-[#d4af37]/10 animate-pulse"
                >
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mr-4"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))
            ) : (
              filteredTestimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className={`bg-white rounded-2xl p-8 shadow-lg border transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${
                    testimonial.featured 
                      ? 'border-[#d4af37] ring-2 ring-[#d4af37]/10' 
                      : 'border-[#d4af37]/10 hover:border-[#d4af37]'
                  }`}
                >
                  {testimonial.featured && (
                    <div className="absolute -top-3 left-6">
                      <span className="bg-[#d4af37] text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Featured
                      </span>
                    </div>
                  )}
                  
                  {/* Client Info */}
                  <div className="flex items-center mb-6">
                    {testimonial.image && (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-[#d4af37]/20">
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-black text-lg">{testimonial.name}</h3>
                      <p className="text-black/60 text-sm">
                        {testimonial.role}
                        {testimonial.company && ` • ${testimonial.company}`}
                      </p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center mb-4">
                    {renderStars(testimonial.rating)}
                    <span className="ml-2 text-sm text-black/60">
                      {new Date(testimonial.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>

                  {/* Review */}
                  <p className="text-black/80 leading-relaxed mb-4 italic">
                    "{testimonial.review}"
                  </p>

                  {/* Event Type Badge */}
                  <div className="flex justify-between items-center">
                    <span className="inline-block px-3 py-1 bg-[#d4af37]/10 text-[#d4af37] text-xs font-bold rounded-full uppercase tracking-wider">
                      {testimonial.eventType}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* CTA Section */}
          <div className="text-center mt-20">
            <div className="bg-white rounded-2xl p-12 shadow-xl border border-[#d4af37]/20">
              <h3 className="text-3xl font-bold text-black mb-4 font-serif">Ready to Create Your Story?</h3>
              <p className="text-black/60 mb-8 max-w-2xl mx-auto">
                Join our satisfied clients and let us capture your special moments with the same level of excellence and professionalism.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/photography"
                  className="inline-flex items-center px-8 py-4 bg-[#d4af37] text-black font-bold text-sm uppercase tracking-widest rounded-lg hover:bg-[#d4af37]/90 transition-all duration-300 transform hover:scale-105"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                  View Packages
                </Link>
                <button
                  onClick={() => {
                    const message = "Hi! I saw the testimonials and I'm interested in booking photography services. Can you provide more details?";
                    window.open(`https://wa.me/60177464121?text=${encodeURIComponent(message)}`, '_blank');
                  }}
                  className="inline-flex items-center px-8 py-4 bg-black text-white font-bold text-sm uppercase tracking-widest rounded-lg hover:bg-[#d4af37] hover:text-black transition-all duration-300"
                >
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.687"/>
                  </svg>
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

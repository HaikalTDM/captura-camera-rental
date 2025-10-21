'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchEventbriteEvents } from '@/lib/api/externalEvents';

interface Event {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  category: 'holiday' | 'season' | 'concert' | 'sports' | 'festival';
  demand: 'peak' | 'high' | 'medium';
  description: string;
  recommendedCamera: string;
  specialOffer?: string;
  icon: string;
  color: string;
  venue?: string;
  isExternal?: boolean;
}

export default function EventsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingExternal, setIsLoadingExternal] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    // Curated Malaysian events for 2025
    const curatedEvents: Event[] = [
      {
        id: 'cny-2025',
        title: 'Chinese New Year 2025',
        date: 'Jan 29',
        endDate: 'Feb 2',
        category: 'holiday',
        demand: 'peak',
        description: 'Capture family gatherings, lion dances, and festive moments',
        recommendedCamera: 'DJI Osmo Pocket 3',
        specialOffer: '15% off early bookings',
        icon: '🎊',
        color: 'from-red-500 to-orange-600'
      },
      {
        id: 'wedding-season-spring',
        title: 'Wedding Season (Spring)',
        date: 'Feb 1',
        endDate: 'Apr 30',
        category: 'season',
        demand: 'peak',
        description: 'Peak wedding season - book your camera now',
        recommendedCamera: 'Both cameras available',
        specialOffer: '3-day package deals',
        icon: '💒',
        color: 'from-pink-500 to-rose-600'
      },
      {
        id: 'hari-raya-2025',
        title: 'Hari Raya Aidilfitri',
        date: 'Mar 30',
        endDate: 'Apr 2',
        category: 'holiday',
        demand: 'peak',
        description: 'Perfect for Raya celebrations and family portraits',
        recommendedCamera: 'DJI Action 5 Pro',
        specialOffer: '10% off for early birds',
        icon: '🌙',
        color: 'from-emerald-500 to-teal-600'
      },
      {
        id: 'school-holidays-march',
        title: 'School Holidays',
        date: 'Mar 15',
        endDate: 'Mar 23',
        category: 'season',
        demand: 'high',
        description: 'Family trips and vacation content creation',
        recommendedCamera: 'DJI Action 5 Pro',
        icon: '✈️',
        color: 'from-blue-500 to-indigo-600'
      },
      {
        id: 'wesak-2025',
        title: 'Wesak Day',
        date: 'May 12',
        category: 'holiday',
        demand: 'medium',
        description: 'Temple visits and cultural documentation',
        recommendedCamera: 'DJI Osmo Pocket 3',
        icon: '🪔',
        color: 'from-amber-500 to-yellow-600'
      },
      {
        id: 'graduation-may',
        title: 'Graduation Season',
        date: 'May 1',
        endDate: 'May 31',
        category: 'season',
        demand: 'high',
        description: 'Capture graduation moments and celebrations',
        recommendedCamera: 'DJI Osmo Pocket 3',
        specialOffer: 'Student discount available',
        icon: '🎓',
        color: 'from-purple-500 to-indigo-600'
      },
      {
        id: 'merdeka-2025',
        title: 'Merdeka Day',
        date: 'Aug 31',
        category: 'holiday',
        demand: 'medium',
        description: 'National day celebrations and parades',
        recommendedCamera: 'DJI Action 5 Pro',
        icon: '🇲🇾',
        color: 'from-red-500 to-blue-600'
      },
      {
        id: 'malaysia-day',
        title: 'Malaysia Day',
        date: 'Sep 16',
        category: 'holiday',
        demand: 'medium',
        description: 'Patriotic events and celebrations',
        recommendedCamera: 'DJI Action 5 Pro',
        icon: '🎌',
        color: 'from-yellow-500 to-red-600'
      },
      {
        id: 'deepavali-2025',
        title: 'Deepavali',
        date: 'Oct 20',
        category: 'holiday',
        demand: 'high',
        description: 'Festival of lights celebrations',
        recommendedCamera: 'DJI Osmo Pocket 3',
        specialOffer: '10% festival discount',
        icon: '🪔',
        color: 'from-orange-500 to-red-600'
      },
      {
        id: 'wedding-season-fall',
        title: 'Wedding Season (Fall)',
        date: 'Oct 1',
        endDate: 'Dec 31',
        category: 'season',
        demand: 'peak',
        description: 'Year-end wedding peak season',
        recommendedCamera: 'Both cameras available',
        specialOffer: 'Package deals available',
        icon: '💍',
        color: 'from-rose-500 to-pink-600'
      },
      {
        id: 'graduation-nov',
        title: 'Graduation Season',
        date: 'Nov 1',
        endDate: 'Nov 30',
        category: 'season',
        demand: 'high',
        description: 'End of year graduation ceremonies',
        recommendedCamera: 'DJI Osmo Pocket 3',
        icon: '🎓',
        color: 'from-blue-500 to-purple-600'
      },
      {
        id: 'christmas-2025',
        title: 'Christmas',
        date: 'Dec 25',
        category: 'holiday',
        demand: 'high',
        description: 'Holiday festivities and family gatherings',
        recommendedCamera: 'DJI Osmo Pocket 3',
        specialOffer: 'Holiday special rates',
        icon: '🎄',
        color: 'from-green-500 to-red-600'
      },
      {
        id: 'nye-2025',
        title: 'New Year\'s Eve',
        date: 'Dec 31',
        category: 'festival',
        demand: 'peak',
        description: 'Countdown celebrations and fireworks',
        recommendedCamera: 'DJI Action 5 Pro',
        specialOffer: 'NYE package available',
        icon: '🎆',
        color: 'from-indigo-500 to-purple-600'
      },
    ];

    setEvents(curatedEvents);

    // Load live events from Eventbrite
    loadExternalEvents();
  };

  const loadExternalEvents = async () => {
    setIsLoadingExternal(true);
    try {
      const externalEvents = await fetchEventbriteEvents('Kuala Lumpur');
      
      // Convert external events to our format
      const formattedExternalEvents: Event[] = externalEvents.map(ext => {
        // Parse date
        const eventDate = new Date(ext.date);
        const monthDay = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        // Determine category based on event name
        let category: Event['category'] = 'concert';
        const nameLower = ext.name.toLowerCase();
        if (nameLower.includes('concert') || nameLower.includes('music')) category = 'concert';
        else if (nameLower.includes('sport') || nameLower.includes('game')) category = 'sports';
        else if (nameLower.includes('festival') || nameLower.includes('fest')) category = 'festival';
        
        // Determine recommended camera
        const recommendedCamera = category === 'sports' || category === 'festival' 
          ? 'DJI Action 5 Pro' 
          : 'DJI Osmo Pocket 3';
        
        return {
          id: `ext-${ext.id}`,
          title: ext.name,
          date: monthDay,
          category,
          demand: 'medium' as const,
          description: `Live event in ${ext.venue || 'Kuala Lumpur'} - Perfect for capturing the experience`,
          recommendedCamera,
          icon: category === 'concert' ? '🎸' : category === 'sports' ? '⚽' : '🎉',
          color: category === 'concert' ? 'from-purple-500 to-pink-600' : 
                 category === 'sports' ? 'from-orange-500 to-red-600' : 
                 'from-blue-500 to-indigo-600',
          venue: ext.venue,
          isExternal: true
        };
      }).slice(0, 10); // Limit to 10 external events

      // Merge with curated events
      setEvents(prev => {
        const merged = [...prev, ...formattedExternalEvents];
        // Sort by date (upcoming first)
        return merged.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
      });
    } catch (error) {
      console.error('Error loading external events:', error);
      // Silently fail - curated events still show
    } finally {
      setIsLoadingExternal(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Events', icon: '📅' },
    { id: 'holiday', label: 'Holidays', icon: '🎊' },
    { id: 'season', label: 'Seasons', icon: '📆' },
    { id: 'concert', label: 'Concerts', icon: '🎸' },
    { id: 'sports', label: 'Sports', icon: '⚽' },
    { id: 'festival', label: 'Festivals', icon: '🎉' },
  ];

  const filteredEvents = selectedCategory === 'all' 
    ? events 
    : events.filter(e => e.category === selectedCategory);

  const getDemandBadge = (demand: string) => {
    switch (demand) {
      case 'peak':
        return { text: 'Peak Demand', color: 'bg-red-500', textColor: 'text-white' };
      case 'high':
        return { text: 'High Demand', color: 'bg-orange-500', textColor: 'text-white' };
      case 'medium':
        return { text: 'Moderate', color: 'bg-blue-500', textColor: 'text-white' };
      default:
        return { text: 'Available', color: 'bg-green-500', textColor: 'text-white' };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-black text-white pt-16 pb-8 px-6">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-black mb-2">Upcoming Events</h1>
          <p className="text-sm text-slate-300 font-semibold">
            Plan ahead • Book early for peak seasons
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <section className="py-6 px-6 bg-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-lg mx-auto">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-6 px-6">
            {categories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full font-bold text-sm transition-all duration-300 animate-fadeIn ${
                  selectedCategory === category.id
                    ? 'bg-black text-white scale-105 shadow-lg'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="mr-1.5">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Events List */}
      <section className="py-6 px-6">
        <div className="max-w-lg mx-auto space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📅</span>
              </div>
              <h3 className="text-lg font-black text-black mb-2">No Events Found</h3>
              <p className="text-sm text-slate-600 font-semibold">
                Try selecting a different category
              </p>
            </div>
          ) : (
            filteredEvents.map((event, index) => {
              const demandBadge = getDemandBadge(event.demand);
              
              return (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 overflow-hidden hover:scale-[1.02] transition-all duration-300 animate-fadeInUp"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Event Header with Gradient */}
                  <div className={`bg-gradient-to-br ${event.color} p-6 text-white relative overflow-hidden`}>
                    {/* Decorative pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12"></div>
                    
                    <div className="relative">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl">
                            {event.icon}
                          </div>
                          <div>
                            <h3 className="text-xl font-black mb-1">{event.title}</h3>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1.5 text-sm font-bold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {event.date}
                                {event.endDate && ` - ${event.endDate}`}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="p-6">
                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      <span className={`${demandBadge.color} ${demandBadge.textColor} px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wide`}>
                        {demandBadge.text}
                      </span>
                      {event.demand === 'peak' && (
                        <span className="text-xs text-slate-600 font-bold">🔥 Book early!</span>
                      )}
                      {event.isExternal && (
                        <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wide flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                          </svg>
                          Live Event
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-600 font-semibold mb-4 leading-relaxed">
                      {event.description}
                    </p>

                    {/* Venue (for external events) */}
                    {event.venue && (
                      <div className="flex items-center gap-2 mb-4 text-sm text-slate-600 font-semibold">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.venue}
                      </div>
                    )}

                    {/* Recommended Camera */}
                    <div className="bg-slate-50 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-slate-500 font-bold mb-0.5">Recommended</div>
                          <div className="text-sm font-black text-black">{event.recommendedCamera}</div>
                        </div>
                      </div>
                    </div>

                    {/* Special Offer */}
                    {event.specialOffer && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-4 border-2 border-blue-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-blue-600 font-bold mb-0.5">Special Offer</div>
                            <div className="text-sm font-black text-blue-700">{event.specialOffer}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => router.push('/rental/cameras')}
                        className="bg-black text-white font-black py-3 px-4 rounded-xl hover:scale-105 transition-all duration-300 active:scale-95 shadow-lg"
                      >
                        Book Now
                      </button>
                      <a
                        href="https://wa.me/601157119090"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-500 text-white font-black py-3 px-4 rounded-xl hover:scale-105 transition-all duration-300 active:scale-95 shadow-lg flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Ask
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Loading External Events */}
      {isLoadingExternal && (
        <section className="py-4 px-6">
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-200 p-6 flex items-center gap-4">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="text-sm font-black text-black mb-1">Loading Live Events...</div>
                <div className="text-xs text-slate-600 font-semibold">Fetching concerts and events from Eventbrite</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Info Banner */}
      <section className="py-8 px-6">
        <div className="max-w-lg mx-auto">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black mb-2">Pro Tip</h3>
                <p className="text-sm text-white/90 font-semibold leading-relaxed">
                  We show both curated Malaysian events and live concerts/events from Eventbrite. Book 2-3 weeks ahead for peak seasons!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}


'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadEvents = async () => {
    // Comprehensive Malaysian events calendar for 2025-2026
    const curatedEvents: Event[] = [
      // ========== 2025 EVENTS ==========

      // January 2025
      {
        id: 'new-year-2025',
        title: 'New Year 2025',
        date: 'Jan 1',
        category: 'holiday',
        demand: 'peak',
        description: 'New Year celebrations and countdown content',
        recommendedCamera: 'DJI Action 5 Pro',
        icon: '🎉',
        color: 'from-purple-500 to-pink-600'
      },
      {
        id: 'cny-2025',
        title: 'Chinese New Year 2025',
        date: 'Jan 29',
        endDate: 'Jan 30',
        category: 'holiday',
        demand: 'peak',
        description: 'Year of the Snake - Lion dances, family reunions, ang pow moments',
        recommendedCamera: 'DJI Osmo Pocket 3',
        icon: '🐍',
        color: 'from-red-500 to-orange-600'
      },

      // February 2025
      {
        id: 'fed-territory-day-2025',
        title: 'Federal Territory Day',
        date: 'Feb 1',
        category: 'holiday',
        demand: 'medium',
        description: 'Celebrations in KL, Putrajaya & Labuan',
        recommendedCamera: 'DJI Action 5 Pro',
        icon: '🏙️',
        color: 'from-blue-500 to-indigo-600'
      },
      {
        id: 'thaipusam-2025',
        title: 'Thaipusam',
        date: 'Feb 11',
        category: 'holiday',
        demand: 'high',
        description: 'Batu Caves procession and cultural celebrations',
        recommendedCamera: 'DJI Osmo Pocket 3',
        icon: '🕉️',
        color: 'from-yellow-500 to-orange-600'
      },
      {
        id: 'wedding-season-q1',
        title: 'Wedding Season (Q1)',
        date: 'Feb 1',
        endDate: 'Apr 30',
        category: 'season',
        demand: 'peak',
        description: 'Peak wedding season - book early!',
        recommendedCamera: 'Both cameras available',
        icon: '💒',
        color: 'from-pink-500 to-rose-600'
      },

      // March 2025
      {
        id: 'ramadan-2025',
        title: 'Ramadan 2025',
        date: 'Mar 1',
        endDate: 'Mar 29',
        category: 'season',
        demand: 'high',
        description: 'Bazaar Ramadan, iftar gatherings, and family moments',
        recommendedCamera: 'DJI Osmo Pocket 3',
        icon: '🌙',
        color: 'from-purple-500 to-indigo-600'
      },
      {
        id: 'school-holidays-mar-2025',
        title: 'School Holidays (March)',
        date: 'Mar 15',
        endDate: 'Mar 23',
        category: 'season',
        demand: 'high',
        description: 'Family vacations and spring break adventures',
        recommendedCamera: 'DJI Action 5 Pro',
        icon: '✈️',
        color: 'from-blue-500 to-cyan-600'
      },
      {
        id: 'nuzul-quran-2025',
        title: 'Nuzul Al-Quran',
        date: 'Mar 27',
        category: 'holiday',
        demand: 'medium',
        description: 'Religious gatherings and community events',
        recommendedCamera: 'DJI Osmo Pocket 3',
        icon: '📖',
        color: 'from-teal-500 to-green-600'
      },
      {
        id: 'hari-raya-2025',
        title: 'Hari Raya Aidilfitri',
        date: 'Mar 30',
        endDate: 'Mar 31',
        category: 'holiday',
        demand: 'peak',
        description: 'Eid celebrations, open houses, and family traditions',
        recommendedCamera: 'DJI Osmo Pocket 3',
        icon: '🌙',
        color: 'from-emerald-500 to-teal-600'
      },

      // April-May 2025
      {
        id: 'labour-day-2025',
        title: 'Labour Day',
        date: 'May 1',
        category: 'holiday',
        demand: 'medium',
        description: 'Long weekend getaways and family outings',
        recommendedCamera: 'DJI Action 5 Pro',
        icon: '🛠️',
        color: 'from-slate-500 to-gray-600'
      },
      {
        id: 'wesak-2025',
        title: 'Wesak Day',
        date: 'May 12',
        category: 'holiday',
        demand: 'high',
        description: 'Temple visits, processions, and Buddhist celebrations',
        recommendedCamera: 'DJI Osmo Pocket 3',
        icon: '🪔',
        color: 'from-amber-500 to-yellow-600'
      },
      {
        id: 'graduation-may-2025',
        title: 'Graduation Season (May)',
        date: 'May 1',
        endDate: 'May 31',
        category: 'season',
        demand: 'peak',
        description: 'University & college graduation ceremonies',
        recommendedCamera: 'DJI Osmo Pocket 3',
        icon: '🎓',
        color: 'from-purple-500 to-indigo-600'
      },
      {
        id: 'school-holidays-may-2025',
        title: 'School Holidays (Mid-Year)',
        date: 'May 24',
        endDate: 'Jun 8',
        category: 'season',
        demand: 'peak',
        description: 'Mid-year break - family trips and vacations',
        recommendedCamera: 'DJI Action 5 Pro',
        icon: '🏖️',
        color: 'from-cyan-500 to-blue-600'
      },

      // June 2025
      {
        id: 'agong-birthday-2025',
        title: 'Agong\'s Birthday',
        date: 'Jun 7',
        category: 'holiday',
        demand: 'medium',
        description: 'National celebrations and ceremonies',
        recommendedCamera: 'DJI Action 5 Pro',
        icon: '👑',
        color: 'from-yellow-500 to-amber-600'
      },
      {
        id: 'hari-raya-haji-2025',
        title: 'Hari Raya Aidiladha',
        date: 'Jun 7',
        category: 'holiday',
        demand: 'high',
        description: 'Korban celebrations and family gatherings',
        recommendedCamera: 'DJI Osmo Pocket 3',
        icon: '🐑',
        color: 'from-green-500 to-emerald-600'
      },
      {
        id: 'awal-muharram-2025',
        title: 'Awal Muharram',
        date: 'Jun 27',
        category: 'holiday',
        demand: 'medium',
        description: 'Islamic New Year 1447',
        recommendedCamera: 'DJI Osmo Pocket 3',
        icon: '🌙',
        color: 'from-indigo-500 to-purple-600'
      },

      // July-August 2025
      {
        id: 'merdeka-season-2025',
        title: 'Merdeka Season',
        date: 'Aug 1',
        endDate: 'Aug 31',
        category: 'season',
        demand: 'high',
        description: 'National Day celebrations and patriotic events',
        recommendedCamera: 'DJI Action 5 Pro',
        icon: '🇲🇾',
        color: 'from-red-500 to-blue-600'
      },
      {
        id: 'school-holidays-aug-2025',
        title: 'School Holidays (Year-End)',
        date: 'Aug 23',
        endDate: 'Sep 7',
        category: 'season',
        demand: 'high',
        description: 'End of school year - family vacations',
        recommendedCamera: 'DJI Action 5 Pro',
        icon: '🎒',
        color: 'from-orange-500 to-red-600'
      },
      {
        id: 'merdeka-day-2025',
        title: 'Merdeka Day',
        date: 'Aug 31',
        category: 'holiday',
        demand: 'peak',
        description: 'Independence Day - parades, fireworks, celebrations',
        recommendedCamera: 'DJI Action 5 Pro',
        icon: '🎆',
        color: 'from-red-600 to-blue-600'
      },

      // September 2025
      {
        id: 'prophet-birthday-2025',
        title: 'Prophet Muhammad\'s Birthday',
        date: 'Sep 5',
        category: 'holiday',
        demand: 'medium',
        description: 'Maulidur Rasul celebrations',
        recommendedCamera: 'DJI Osmo Pocket 3',
        icon: '🕌',
        color: 'from-teal-500 to-cyan-600'
      },
      {
        id: 'malaysia-day-2025',
        title: 'Malaysia Day',
        date: 'Sep 16',
        category: 'holiday',
        demand: 'high',
        description: 'Formation of Malaysia celebrations',
        recommendedCamera: 'DJI Action 5 Pro',
        icon: '🎌',
        color: 'from-yellow-500 to-red-600'
      },

      // October 2025
      {
        id: 'wedding-season-q4-2025',
        title: 'Wedding Season (Q4)',
        date: 'Oct 1',
        endDate: 'Dec 31',
        category: 'season',
        demand: 'peak',
        description: 'Year-end wedding peak - highest demand',
        recommendedCamera: 'Both cameras available',
        icon: '💍',
        color: 'from-rose-500 to-pink-600'
      },
      {
        id: 'deepavali-2025',
        title: 'Deepavali',
        date: 'Oct 20',
        category: 'holiday',
        demand: 'peak',
        description: 'Festival of Lights - kolam, lights, celebrations',
        recommendedCamera: 'DJI Osmo Pocket 3',
        icon: '🪔',
        color: 'from-orange-500 to-red-600'
      },

      // November-December 2025
      {
        id: 'graduation-nov-2025',
        title: 'Graduation Season (Nov)',
        date: 'Nov 1',
        endDate: 'Nov 30',
        category: 'season',
        demand: 'peak',
        description: 'Final graduation ceremonies of the year',
        recommendedCamera: 'DJI Osmo Pocket 3',
        icon: '🎓',
        color: 'from-blue-500 to-purple-600'
      },
      {
        id: 'school-holidays-nov-2025',
        title: 'School Holidays (Year-End)',
        date: 'Nov 15',
        endDate: 'Dec 31',
        category: 'season',
        demand: 'peak',
        description: 'Long year-end break - peak vacation season',
        recommendedCamera: 'DJI Action 5 Pro',
        icon: '🏝️',
        color: 'from-teal-500 to-blue-600'
      },
      {
        id: 'christmas-2025',
        title: 'Christmas',
        date: 'Dec 25',
        category: 'holiday',
        demand: 'peak',
        description: 'Christmas celebrations, decorations, and gatherings',
        recommendedCamera: 'DJI Osmo Pocket 3',
        icon: '🎄',
        color: 'from-green-500 to-red-600'
      },
      {
        id: 'nye-2025',
        title: 'New Year\'s Eve 2026',
        date: 'Dec 31',
        category: 'festival',
        demand: 'peak',
        description: 'Countdown parties, fireworks, celebrations',
        recommendedCamera: 'DJI Action 5 Pro',
        icon: '🎆',
        color: 'from-indigo-500 to-purple-600'
      },

      // ========== 2026 EVENTS ==========

      // January 2026
      {
        id: 'new-year-2026',
        title: 'New Year 2026',
        date: '2026 Jan 1',
        category: 'holiday',
        demand: 'peak',
        description: 'New Year celebrations',
        recommendedCamera: 'DJI Action 5 Pro',
        icon: '🎉',
        color: 'from-purple-500 to-pink-600'
      },
      {
        id: 'thaipusam-2026',
        title: 'Thaipusam 2026',
        date: '2026 Jan 31',
        category: 'holiday',
        demand: 'high',
        description: 'Batu Caves pilgrimage and celebrations',
        recommendedCamera: 'DJI Osmo Pocket 3',
        icon: '🕉️',
        color: 'from-yellow-500 to-orange-600'
      },

      // February 2026
      {
        id: 'fed-territory-day-2026',
        title: 'Federal Territory Day 2026',
        date: '2026 Feb 1',
        category: 'holiday',
        demand: 'medium',
        description: 'KL, Putrajaya & Labuan celebrations',
        recommendedCamera: 'DJI Action 5 Pro',
        icon: '🏙️',
        color: 'from-blue-500 to-indigo-600'
      },
      {
        id: 'cny-2026',
        title: 'Chinese New Year 2026',
        date: '2026 Feb 17',
        endDate: '2026 Feb 18',
        category: 'holiday',
        demand: 'peak',
        description: 'Year of the Horse - Lion dances and celebrations',
        recommendedCamera: 'DJI Osmo Pocket 3',
        icon: '🐴',
        color: 'from-red-500 to-orange-600'
      },
      {
        id: 'ramadan-2026',
        title: 'Ramadan 2026',
        date: '2026 Feb 18',
        endDate: '2026 Mar 18',
        category: 'season',
        demand: 'high',
        description: 'Ramadan bazaars and iftar gatherings',
        recommendedCamera: 'DJI Osmo Pocket 3',
        icon: '🌙',
        color: 'from-purple-500 to-indigo-600'
      },

      // March 2026
      {
        id: 'nuzul-quran-2026',
        title: 'Nuzul Al-Quran 2026',
        date: '2026 Mar 15',
        category: 'holiday',
        demand: 'medium',
        description: 'Revelation of the Quran',
        recommendedCamera: 'DJI Osmo Pocket 3',
        icon: '📖',
        color: 'from-teal-500 to-green-600'
      },
      {
        id: 'hari-raya-2026',
        title: 'Hari Raya Aidilfitri 2026',
        date: '2026 Mar 19',
        endDate: '2026 Mar 20',
        category: 'holiday',
        demand: 'peak',
        description: 'Eid celebrations and open houses',
        recommendedCamera: 'DJI Osmo Pocket 3',
        icon: '🌙',
        color: 'from-emerald-500 to-teal-600'
      },

      // May 2026
      {
        id: 'labour-day-2026',
        title: 'Labour Day 2026',
        date: '2026 May 1',
        category: 'holiday',
        demand: 'medium',
        description: 'Long weekend trips',
        recommendedCamera: 'DJI Action 5 Pro',
        icon: '🛠️',
        color: 'from-slate-500 to-gray-600'
      },
      {
        id: 'wesak-2026',
        title: 'Wesak Day 2026',
        date: '2026 May 1',
        category: 'holiday',
        demand: 'high',
        description: 'Buddha\'s birthday celebrations',
        recommendedCamera: 'DJI Osmo Pocket 3',
        icon: '🪔',
        color: 'from-amber-500 to-yellow-600'
      },
      {
        id: 'agong-birthday-2026',
        title: 'Agong\'s Birthday 2026',
        date: '2026 May 27',
        category: 'holiday',
        demand: 'medium',
        description: 'Royal birthday celebrations',
        recommendedCamera: 'DJI Action 5 Pro',
        icon: '👑',
        color: 'from-yellow-500 to-amber-600'
      },
      {
        id: 'hari-raya-haji-2026',
        title: 'Hari Raya Aidiladha 2026',
        date: '2026 May 27',
        category: 'holiday',
        demand: 'high',
        description: 'Feast of Sacrifice',
        recommendedCamera: 'DJI Osmo Pocket 3',
        icon: '🐑',
        color: 'from-green-500 to-emerald-600'
      },

      // June 2026
      {
        id: 'awal-muharram-2026',
        title: 'Awal Muharram 2026',
        date: '2026 Jun 16',
        category: 'holiday',
        demand: 'medium',
        description: 'Islamic New Year 1448',
        recommendedCamera: 'DJI Osmo Pocket 3',
        icon: '🌙',
        color: 'from-indigo-500 to-purple-600'
      },

      // August 2026
      {
        id: 'prophet-birthday-2026',
        title: 'Prophet Muhammad\'s Birthday 2026',
        date: '2026 Aug 24',
        category: 'holiday',
        demand: 'medium',
        description: 'Maulidur Rasul 2026',
        recommendedCamera: 'DJI Osmo Pocket 3',
        icon: '🕌',
        color: 'from-teal-500 to-cyan-600'
      },
      {
        id: 'merdeka-day-2026',
        title: 'Merdeka Day 2026',
        date: '2026 Aug 31',
        category: 'holiday',
        demand: 'peak',
        description: 'Independence Day celebrations',
        recommendedCamera: 'DJI Action 5 Pro',
        icon: '🎆',
        color: 'from-red-600 to-blue-600'
      },

      // September 2026
      {
        id: 'malaysia-day-2026',
        title: 'Malaysia Day 2026',
        date: '2026 Sep 16',
        category: 'holiday',
        demand: 'high',
        description: 'Malaysia Formation Day',
        recommendedCamera: 'DJI Action 5 Pro',
        icon: '🎌',
        color: 'from-yellow-500 to-red-600'
      },

      // November 2026
      {
        id: 'deepavali-2026',
        title: 'Deepavali 2026',
        date: '2026 Nov 8',
        category: 'holiday',
        demand: 'peak',
        description: 'Festival of Lights 2026',
        recommendedCamera: 'DJI Osmo Pocket 3',
        icon: '🪔',
        color: 'from-orange-500 to-red-600'
      },

      // December 2026
      {
        id: 'christmas-2026',
        title: 'Christmas 2026',
        date: '2026 Dec 25',
        category: 'holiday',
        demand: 'peak',
        description: 'Christmas festivities',
        recommendedCamera: 'DJI Osmo Pocket 3',
        icon: '🎄',
        color: 'from-green-500 to-red-600'
      },
      {
        id: 'nye-2026',
        title: 'New Year\'s Eve 2027',
        date: '2026 Dec 31',
        category: 'festival',
        demand: 'peak',
        description: 'Year-end countdown',
        recommendedCamera: 'DJI Action 5 Pro',
        icon: '🎆',
        color: 'from-indigo-500 to-purple-600'
      },
    ];

    // Sort curated events by date with year handling
    const parseEventDate = (dateStr: string) => {
      // Check if date has year prefix (e.g., "2026 Jan 1")
      const yearMatch = dateStr.match(/^(\d{4})\s+(.+)$/);
      if (yearMatch) {
        const year = parseInt(yearMatch[1]);
        const monthDay = yearMatch[2];
        return new Date(`${monthDay}, ${year}`);
      }
      // No year prefix, assume 2025
      return new Date(`${dateStr}, 2025`);
    };

    const sortedEvents = curatedEvents.sort((a, b) => {
      const dateA = parseEventDate(a.date);
      const dateB = parseEventDate(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    setEvents(sortedEvents);

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
        // Sort by date (upcoming first) with proper year handling
        return merged.sort((a, b) => {
          // Parse dates with year consideration
          const parseEventDate = (dateStr: string) => {
            // Check if date has year prefix (e.g., "2026 Jan 1")
            const yearMatch = dateStr.match(/^(\d{4})\s+(.+)$/);
            if (yearMatch) {
              const year = parseInt(yearMatch[1]);
              const monthDay = yearMatch[2];
              return new Date(`${monthDay}, ${year}`);
            }
            // No year prefix, assume 2025
            return new Date(`${dateStr}, 2025`);
          };

          const dateA = parseEventDate(a.date);
          const dateB = parseEventDate(b.date);
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

  // Helper to parse event dates with year handling
  const parseEventDate = (dateStr: string) => {
    // Check if date has year prefix (e.g., "2026 Jan 1")
    const yearMatch = dateStr.match(/^(\d{4})\s+(.+)$/);
    if (yearMatch) {
      const year = parseInt(yearMatch[1]);
      const monthDay = yearMatch[2];
      return new Date(`${monthDay}, ${year}`);
    }
    // No year prefix, assume 2025
    return new Date(`${dateStr}, 2025`);
  };

  // Filter out past events and apply category filter
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset to start of day

  const upcomingEvents = events.filter(event => {
    const eventDate = parseEventDate(event.date);
    return eventDate >= today; // Only show today and future events
  });

  const filteredEvents = selectedCategory === 'all'
    ? upcomingEvents
    : upcomingEvents.filter(e => e.category === selectedCategory);

  const getDemandBadge = (demand: string) => {
    switch (demand) {
      case 'peak':
        return { text: 'Peak Demand', color: 'bg-red-500/10 border-red-500/20', textColor: 'text-red-400' };
      case 'high':
        return { text: 'High Demand', color: 'bg-orange-500/10 border-orange-500/20', textColor: 'text-orange-400' };
      case 'medium':
        return { text: 'Moderate', color: 'bg-blue-500/10 border-blue-500/20', textColor: 'text-blue-400' };
      default:
        return { text: 'Available', color: 'bg-emerald-500/10 border-emerald-500/20', textColor: 'text-emerald-400' };
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      {/* Header */}
      <div className="bg-zinc-950 pt-20 pb-8 px-6 border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:32px_32px] pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-lg mx-auto relative z-10">
          <h1 className="text-4xl font-black mb-3 text-white tracking-tight">Upcoming Events</h1>
          <p className="text-base text-zinc-400 font-medium leading-relaxed">
            Plan your content ahead. <span className="text-white">Book early</span> for peak seasons.
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <section className="py-4 px-6 sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-lg mx-auto">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-6 px-6 pb-2 sm:pb-0 sm:mx-0 sm:px-0">
            {categories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-full font-bold text-xs uppercase tracking-wide transition-all duration-300 ${selectedCategory === category.id
                  ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105'
                  : 'bg-zinc-900 text-zinc-500 border border-white/5 hover:border-white/20 hover:text-zinc-300'
                  }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="mr-2 text-sm">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Events List */}
      <section className="py-8 px-6 pb-32">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Event Counter */}
          {filteredEvents.length > 0 && (
            <div className="flex items-center justify-between px-2 mb-4">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                Showing {filteredEvents.length} Events
              </span>
            </div>
          )}

          {filteredEvents.length === 0 ? (
            <div className="text-center py-20 bg-zinc-900/50 rounded-3xl border border-white/5 border-dashed">
              <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📅</span>
              </div>
              <h3 className="text-xl font-black text-white mb-2">No Events Found</h3>
              <p className="text-zinc-500 font-medium">
                Try selecting a different category
              </p>
            </div>
          ) : (
            <>
              {filteredEvents.map((event, index) => {
                // Check if we need to show a year separator
                const currentEventDate = parseEventDate(event.date);
                const currentYear = currentEventDate.getFullYear();
                const prevEvent = index > 0 ? filteredEvents[index - 1] : null;
                const prevYear = prevEvent ? parseEventDate(prevEvent.date).getFullYear() : null;
                const showYearSeparator = index === 0 || (prevYear && currentYear !== prevYear);
                const demandBadge = getDemandBadge(event.demand);

                return (
                  <div key={event.id}>
                    {/* Year Separator */}
                    {showYearSeparator && (
                      <div className="my-10 relative flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative bg-zinc-950 px-6">
                          <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 shadow-xl">
                            {currentYear}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Event Card */}
                    <div
                      className="group bg-zinc-900 rounded-3xl border border-white/5 overflow-hidden hover:border-white/20 transition-all duration-300 animate-fadeInUp relative"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Gradient Ambient Background */}
                      <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${event.color} opacity-10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:opacity-20 transition-opacity duration-500`}></div>
                      {/* Event Header with Gradient */}
                      <div className="relative p-6 pb-0">

                        <div className="relative">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-16 h-16 bg-zinc-800/80 backdrop-blur-sm rounded-2xl border border-white/5 flex items-center justify-center text-3xl shadow-lg ring-1 ring-white/5">
                                {event.icon}
                              </div>
                              <div>
                                <h3 className="text-xl font-black text-white mb-2 leading-tight">{event.title}</h3>
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800/50 border border-white/5 text-xs font-bold text-zinc-300">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {event.date}
                                    {event.endDate && ` - ${event.endDate}`}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Event Details */}
                      <div className="p-6 pt-4 relative z-10">
                        {/* Badges */}
                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                          <span className={`${demandBadge.color} border ${demandBadge.textColor} px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider`}>
                            {demandBadge.text}
                          </span>
                          {event.demand === 'peak' && (
                            <span className="flex items-center gap-1 text-[10px] text-orange-400 font-bold bg-orange-500/10 px-2 py-1 rounded-full border border-orange-500/20">
                              <span>🔥</span> Book 2 weeks ahead
                            </span>
                          )}
                          {event.isExternal && (
                            <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                              </span>
                              Live Event
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-sm text-zinc-400 font-medium mb-6 leading-relaxed border-l-2 border-white/5 pl-4">
                          {event.description}
                        </p>

                        {/* Venue (for external events) */}
                        {event.venue && (
                          <div className="flex items-center gap-2 mb-6 text-sm text-zinc-400 font-medium bg-zinc-950/50 p-3 rounded-lg border border-white/5">
                            <span className="text-zinc-500">📍</span>
                            {event.venue}
                          </div>
                        )}

                        {/* Recommended Camera */}
                        <div className="bg-zinc-950/50 rounded-xl p-4 mb-6 border border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">Recommended Gear</div>
                              <div className="text-sm font-bold text-white">{event.recommendedCamera}</div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            onClick={() => router.push('/rental/cameras')}
                            className="bg-white text-black font-black h-auto py-4 rounded-xl hover:bg-zinc-200 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] active:scale-[0.98] text-sm"
                          >
                            Book Now
                          </Button>
                          <a
                            href="https://wa.me/60177464121"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-zinc-800 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-zinc-700 transition-all duration-300 border border-white/5 hover:border-white/10 text-sm flex items-center justify-center gap-2"
                          >
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Ask
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </section >

      {/* Loading External Events */}
      {
        isLoadingExternal && (
          <section className="py-4 px-6 pb-8">
            <div className="max-w-lg mx-auto">
              <div className="bg-zinc-900 rounded-2xl border border-white/5 p-6 flex items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-700 border-t-white flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-white mb-0.5">Finding nearby events...</div>
                  <div className="text-xs text-zinc-500">Checking Eventbrite for concerts & shows</div>
                </div>
              </div>
            </div>
          </section>
        )
      }

      {/* Info Banner */}
      <section className="py-8 px-6 pb-20">
        <div className="max-w-lg mx-auto">
          <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors duration-500"></div>
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-12 h-12 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-white mb-2">Pro Tip</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  We verify both curated Malaysian holidays and live Eventbrite listings. <span className="text-white">Peak season</span> bookings fill up 2-3 weeks in advance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
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
    </div >
  );
}


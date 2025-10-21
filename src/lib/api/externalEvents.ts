/**
 * External Event API Integrations
 * 
 * Connect to third-party event APIs like:
 * - Eventbrite
 * - Ticketmaster
 * - SeatGeek
 */

export interface ExternalEvent {
  id: string;
  name: string;
  date: string;
  venue?: string;
  category: string;
  url?: string;
  image?: string;
  source: 'eventbrite' | 'ticketmaster' | 'seatgeek' | 'manual';
}

/**
 * Eventbrite API Integration
 * Get your API key from: https://www.eventbrite.com/platform/
 */
export async function fetchEventbriteEvents(location: string = 'Kuala Lumpur'): Promise<ExternalEvent[]> {
  const API_TOKEN = process.env.NEXT_PUBLIC_EVENTBRITE_TOKEN;
  
  if (!API_TOKEN) {
    console.warn('Eventbrite API token not configured');
    return [];
  }

  try {
    const response = await fetch(
      `https://www.eventbriteapi.com/v3/events/search/?location.address=${encodeURIComponent(location)}&expand=venue&token=${API_TOKEN}`
    );

    if (!response.ok) throw new Error('Eventbrite API error');

    const data = await response.json();
    
    return data.events?.map((event: any) => ({
      id: event.id,
      name: event.name.text,
      date: event.start.local,
      venue: event.venue?.name,
      category: event.category?.name || 'general',
      url: event.url,
      image: event.logo?.url,
      source: 'eventbrite' as const
    })) || [];
  } catch (error) {
    console.error('Error fetching Eventbrite events:', error);
    return [];
  }
}

/**
 * Ticketmaster API Integration
 * Get your API key from: https://developer.ticketmaster.com/
 */
export async function fetchTicketmasterEvents(countryCode: string = 'MY'): Promise<ExternalEvent[]> {
  const API_KEY = process.env.NEXT_PUBLIC_TICKETMASTER_KEY;
  
  if (!API_KEY) {
    console.warn('Ticketmaster API key not configured');
    return [];
  }

  try {
    const response = await fetch(
      `https://app.ticketmaster.com/discovery/v2/events.json?countryCode=${countryCode}&apikey=${API_KEY}`
    );

    if (!response.ok) throw new Error('Ticketmaster API error');

    const data = await response.json();
    
    return data._embedded?.events?.map((event: any) => ({
      id: event.id,
      name: event.name,
      date: event.dates.start.localDate,
      venue: event._embedded?.venues?.[0]?.name,
      category: event.classifications?.[0]?.segment?.name || 'general',
      url: event.url,
      image: event.images?.[0]?.url,
      source: 'ticketmaster' as const
    })) || [];
  } catch (error) {
    console.error('Error fetching Ticketmaster events:', error);
    return [];
  }
}

/**
 * SeatGeek API Integration
 * Get your API key from: https://seatgeek.com/
 */
export async function fetchSeatGeekEvents(): Promise<ExternalEvent[]> {
  const CLIENT_ID = process.env.NEXT_PUBLIC_SEATGEEK_CLIENT_ID;
  
  if (!CLIENT_ID) {
    console.warn('SeatGeek client ID not configured');
    return [];
  }

  try {
    const response = await fetch(
      `https://api.seatgeek.com/2/events?geoip=true&client_id=${CLIENT_ID}`
    );

    if (!response.ok) throw new Error('SeatGeek API error');

    const data = await response.json();
    
    return data.events?.map((event: any) => ({
      id: event.id.toString(),
      name: event.title,
      date: event.datetime_local,
      venue: event.venue?.name,
      category: event.type || 'general',
      url: event.url,
      image: event.performers?.[0]?.image,
      source: 'seatgeek' as const
    })) || [];
  } catch (error) {
    console.error('Error fetching SeatGeek events:', error);
    return [];
  }
}

/**
 * Combine events from multiple sources
 */
export async function fetchAllExternalEvents(): Promise<ExternalEvent[]> {
  try {
    const [eventbrite, ticketmaster, seatgeek] = await Promise.all([
      fetchEventbriteEvents(),
      fetchTicketmasterEvents(),
      fetchSeatGeekEvents()
    ]);

    return [...eventbrite, ...ticketmaster, ...seatgeek]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error('Error fetching external events:', error);
    return [];
  }
}


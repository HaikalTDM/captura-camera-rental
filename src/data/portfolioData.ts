// ============================================================
// PORTFOLIO DATA — Production Services (Captura Studio)
// ------------------------------------------------------------
// Centralized content for the /portfolio page.
//
// NOTE ON MEDIA — PLACEHOLDER CONTENT:
// - Thumbnails use Unsplash images (free for commercial use).
// - videoUrl values are public sample MP4s so the lightbox works
//   out of the box.
// - EVERY videoUrl / thumbnail below marked with `TODO: replace
//   with real film` must be swapped for real client work before
//   production launch. The wedding showcase is designed around
//   real films being dropped into these fields.
// ============================================================

export type ServiceId = 'weddings' | 'corporate' | 'events' | 'content' | 'graduation';

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  testimonial: string;
  testimonialShort?: string;
  clientName: string;
  clientRole: string;
  rating: number;
  tags: string[];
  year?: string;
  location?: string;
  duration?: string;
  style?: string;
  featured?: boolean;
}

export interface PortfolioService {
  id: ServiceId;
  label: string;
  shortLabel: string;
  icon: 'film' | 'briefcase' | 'sparkles' | 'smartphone' | 'graduation-cap';
  accent: string;
  accentSoft: string;
  headline: string;
  description: string;
  items: PortfolioItem[];
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'select' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: string[];
  fullWidth?: boolean;
}

export interface ServiceFormConfig {
  serviceId: ServiceId;
  title: string;
  description: string;
  serviceType: string;
  fields: FormFieldConfig[];
}

const SAMPLE_VIDEO_BASE = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample';

const sv = (file: string) => `${SAMPLE_VIDEO_BASE}/${file}.mp4`;

const img = (id: string) =>
  `https://images.unsplash.com/${id}?w=900&q=80&auto=format&fit=crop`;

export const portfolioServices: PortfolioService[] = [
  {
    id: 'weddings',
    label: 'Wedding Films',
    shortLabel: 'Weddings',
    icon: 'film',
    accent: '#d4af37',
    accentSoft: 'rgba(212, 175, 55, 0.12)',
    headline: 'Wedding Films',
    description:
      'Cinematic highlights and full-day wedding films crafted around your story. From the first look to the last dance.',
    items: [
      {
        id: 'wedding-1',
        title: "Jasmine & Irfan's Wedding Film",
        description: 'Their fun-style wedding highlight film',
        thumbnail: '/images/jasminirfancover.png',
        // Real film: public/videos/jasmine-irfan-wedding.mp4
        videoUrl: '/videos/jasmine-irfan-wedding.mp4',
        testimonial:
          'Haikal and Aqil were incredibly easy to approach, and I felt comfortable with them from the very first day we met. They arrived at my reception early to prepare, and it was clear from the start how seriously they take their work and how much passion they put into what they do.\n\nThe entire filming process was relaxed and enjoyable. When they mentioned they wanted to go for a more candid, chill style, I trusted their creative direction completely, and I\u2019m so glad I did. The final video left me in tears. It captured the emotions of the evening so beautifully and authentically.\n\nOne thing I really appreciated was how warm and friendly they were throughout the whole experience. That\u2019s something I value greatly in a photographer or videographer. On such an important day, you want to feel comfortable around the people capturing your memories, and they made that effortless.\n\nThe video they delivered was absolutely chef\u2019s kiss. It was funny, heartfelt, emotional, and perfectly reflected us as a couple. It\u2019s the kind of video I know my husband and I will watch over and over again, even when we\u2019re old and grey.\n\nTheir service was excellent, communication was smooth, and the turnaround time was impressively fast. We received our video in less than two weeks. I am truly grateful to have had them document our reception night.\n\nI would wholeheartedly recommend Haikal and Aqil to anyone in the Klang Valley and beyond. Whatever style or vision you have, they\u2019ll bring it to life while making the entire experience enjoyable. Thank you both for giving us a memory we\u2019ll cherish forever \u2764\ufe0f\u2728',
        testimonialShort:
          'The final video left me in tears. It captured the emotions of the evening so beautifully and authentically. The video they delivered was absolutely chef\u2019s kiss.',
        clientName: 'Jasmine & Irfan',
        clientRole: 'Bride & Groom',
        rating: 5,
        tags: ['Highlight Film', 'Fun Style'],
        year: '2026',
        location: 'Malaysia',
        duration: '3:00',
        style: 'Highlight Film',
        featured: true,
      },
      {
        id: 'wedding-2',
        title: 'Nurul & Hafiz · Nikah Ceremony',
        description: 'Intimate morning nikah at a private villa',
        thumbnail: img('photo-1583939003579-730e3918a45a'),
        videoUrl: sv('ElephantsDream'),
        testimonial:
          'They captured moments we did not even know happened. Every family member cried watching the film.',
        clientName: 'Nurul & Hafiz',
        clientRole: 'Bride & Groom',
        rating: 5,
        tags: ['Nikah Film', 'Same-Day Edit'],
        year: '2024',
        location: 'Kuala Lumpur',
        duration: '5:21',
        style: 'Same-Day Edit',
      },
      {
        id: 'wedding-3',
        title: 'Emily & Daniel · Garden Reception',
        description: 'Golden-hour reception under string lights',
        thumbnail: img('photo-1519225421980-715cb0215aed'),
        videoUrl: sv('ForBiggerBlazes'),
        testimonial:
          'Professional from start to finish. The film feels like a movie. Our friends keep asking who the videographer was.',
        clientName: 'Emily & Daniel',
        clientRole: 'Bride & Groom',
        rating: 5,
        tags: ['Reception Film', 'Golden Hour'],
        year: '2023',
        location: 'Penang',
        duration: '4:45',
        style: 'Highlight Film',
      },
      {
        id: 'wedding-4',
        title: 'Aina & Farid · Traditional Malay Wedding',
        description: 'Three-day celebration with full cultural coverage',
        thumbnail: img('photo-1465495976277-4387d4b0b4c6'),
        // TODO: replace with real film
        videoUrl: sv('ForBiggerEscapes'),
        testimonial:
          'Three days of coverage handled beautifully. They blended into the celebration and delivered a film we will treasure forever.',
        clientName: 'Aina & Farid',
        clientRole: 'Bride & Groom',
        rating: 5,
        tags: ['Multi-Day Film', 'Cultural Wedding'],
        year: '2024',
        location: 'Johor',
        duration: '6:08',
        style: 'Full Film',
        featured: true,
      },
      {
        id: 'wedding-5',
        title: 'Melissa & Ken · City Hall Elopement',
        description: 'Whirlwind elopement through Kuala Lumpur',
        thumbnail: img('photo-1511285560929-80b456fea0bc'),
        videoUrl: sv('ForBiggerFun'),
        testimonial:
          'We almost skipped the video to save budget. Best money we spent on the wedding, hands down.',
        clientName: 'Melissa & Ken',
        clientRole: 'Bride & Groom',
        rating: 5,
        tags: ['Elopement Film', 'City Shoot'],
        year: '2023',
        location: 'Kuala Lumpur',
        duration: '3:30',
        style: 'Highlight Film',
      },
      {
        id: 'wedding-6',
        title: 'Zara & Imran · Destination Wedding',
        description: 'Candid film from a Penang heritage hotel',
        thumbnail: img('photo-1522673607200-164d1b6ce486'),
        // TODO: replace with real film
        videoUrl: sv('ForBiggerJoyrides'),
        testimonial:
          'Kael understood exactly the tone we wanted: calm, candid, timeless. The drone shots of the heritage hotel are stunning.',
        clientName: 'Zara & Imran',
        clientRole: 'Bride & Groom',
        rating: 5,
        tags: ['Destination Film', 'Drone Footage'],
        year: '2025',
        location: 'Penang',
        duration: '3:47',
        style: 'Highlight Film',
        featured: true,
      },
    ],
  },
  {
    id: 'corporate',
    label: 'Corporate & Brand',
    shortLabel: 'Corporate',
    icon: 'briefcase',
    accent: '#2563eb',
    accentSoft: 'rgba(37, 99, 235, 0.10)',
    headline: 'Corporate & Brand',
    description:
      'Brand films, product launches and company profiles built to move your business forward. On time and on message.',
    items: [
      {
        id: 'corporate-1',
        title: 'TechCorp Product Launch 2024',
        description: 'Fast-paced brand video for enterprise tech launch',
        thumbnail: img('photo-1556761175-5973dc0f32e7'),
        videoUrl: sv('ForBiggerMeltdowns'),
        testimonial:
          'Professional, timely, and exceeded our expectations. The launch film drove 3x our usual demo requests.',
        clientName: 'Zainab Ali',
        clientRole: 'Marketing Manager, TechCorp',
        rating: 5,
        tags: ['Product Launch', 'Brand Video'],
      },
      {
        id: 'corporate-2',
        title: 'MediCore Company Profile',
        description: 'Warm documentary-style profile for healthcare brand',
        thumbnail: img('photo-1497366216548-37526070297c'),
        videoUrl: sv('Sintel'),
        testimonial:
          'They interviewed our staff with such care. The final film makes everyone at MediCore proud.',
        clientName: 'Dr. Siti Rahmah',
        clientRole: 'Founder, MediCore',
        rating: 5,
        tags: ['Company Profile', 'Documentary'],
      },
      {
        id: 'corporate-3',
        title: 'KopiKita Brand Film',
        description: 'Origin-story commercial for local coffee roaster',
        thumbnail: img('photo-1414235077428-338989a2e8c0'),
        videoUrl: sv('SubaruOutbackOnStreetAndDirt'),
        testimonial:
          'Our sales team now opens every pitch with this film. It paid for itself in the first month.',
        clientName: 'Hanif Kamal',
        clientRole: 'Co-founder, KopiKita',
        rating: 5,
        tags: ['Brand Film', 'Commercial'],
      },
      {
        id: 'corporate-4',
        title: 'Ascend Capital · Annual Recap',
        description: 'High-energy year-in-review for investor communications',
        thumbnail: img('photo-1552664730-d307ca884978'),
        videoUrl: sv('TearsOfSteel'),
        testimonial:
          'Delivered in a week, no drama, beautiful output. Exactly what a fast-moving firm needs.',
        clientName: 'Rachel Wong',
        clientRole: 'Head of Comms, Ascend Capital',
        rating: 5,
        tags: ['Recap Film', 'Corporate Event'],
      },
    ],
  },
  {
    id: 'events',
    label: 'Events',
    shortLabel: 'Events',
    icon: 'sparkles',
    accent: '#7c3aed',
    accentSoft: 'rgba(124, 58, 237, 0.10)',
    headline: 'Events',
    description:
      'Multi-camera coverage for conferences, galas, product launches and gatherings. Delivered fast enough to post the same night.',
    items: [
      {
        id: 'event-1',
        title: 'KL Fintech Summit 2024',
        description: 'Two-day conference with aftermovie',
        thumbnail: img('photo-1540575467063-178a50c2df87'),
        videoUrl: sv('VolkswagenGTIReview'),
        testimonial:
          'The aftermovie captured the energy of the summit perfectly. We received 40% more sponsor interest after posting it.',
        clientName: 'Kevin Tan',
        clientRole: 'Event Director, Fintech Assoc.',
        rating: 5,
        tags: ['Conference', 'Aftermovie'],
      },
      {
        id: 'event-2',
        title: 'Lumen Gala Night',
        description: 'Charity gala highlight with red-carpet arrivals',
        thumbnail: img('photo-1511578314322-379afb476865'),
        videoUrl: sv('WeAreGoingOnBullrun'),
        testimonial:
          'Beautifully edited and delivered the next morning. Donations spiked 22% after the gala reel went out.',
        clientName: 'Priya Nair',
        clientRole: 'Gala Organiser, Lumen Foundation',
        rating: 5,
        tags: ['Gala', 'Same-Week Edit'],
      },
      {
        id: 'event-3',
        title: 'FusionBeats Music Festival',
        description: 'Night concert coverage with drone light show',
        thumbnail: img('photo-1533174072545-7a4b6ad7a6c3'),
        videoUrl: sv('WhatCarCanYouGetForAGrand'),
        testimonial:
          'They worked through the night to get us teasers for the next day. Insane dedication.',
        clientName: 'Danial Rahman',
        clientRole: 'Festival Producer',
        rating: 5,
        tags: ['Concert', 'Drone Footage'],
      },
      {
        id: 'event-4',
        title: 'Horizon Auto Launch Night',
        description: 'Indoor product reveal with stage production',
        thumbnail: img('photo-1492684223066-81342ee5ff30'),
        videoUrl: sv('ForBiggerMeltdowns'),
        testimonial:
          'Handled the lighting changes and stage show like pros. The recap video is the best asset we have from launch night.',
        clientName: 'Marcus Lim',
        clientRole: 'Brand Manager, Horizon Auto',
        rating: 5,
        tags: ['Product Launch', 'Stage Show'],
      },
    ],
  },
  {
    id: 'content',
    label: 'Content Creation',
    shortLabel: 'Content',
    icon: 'smartphone',
    accent: '#db2777',
    accentSoft: 'rgba(219, 39, 119, 0.10)',
    headline: 'Content Creation',
    description:
      'Scroll-stopping social content, product showcases and ongoing content partnerships that keep your feeds fresh every week.',
    items: [
      {
        id: 'content-1',
        title: 'XTE Ink X4 - Review',
        description: 'Hands-on review of the XTE Ink X4',
        thumbnail: img('photo-1611162617213-7d7a39e9b1d7'),
        // Real sample: public/videos/content.mp4
        videoUrl: '/videos/content.mp4',
        testimonial:
          'Our engagement tripled in the first month. They plan, shoot and edit. We just approve.',
        clientName: 'Alya Sofea',
        clientRole: 'Founder, GlowUp Skincare',
        rating: 5,
        tags: ['Reels', 'Ongoing Retainer'],
        duration: '1:38',
        style: 'Sample Reel',
      },
      {
        id: 'content-2',
        title: 'Crate & Craft · Product Showcase',
        description: 'Stylised product films for e-commerce store',
        thumbnail: img('photo-1607082348824-0a96f2a4b9da'),
        videoUrl: sv('ForBiggerJoyrides'),
        testimonial:
          'The product films converted so well we now run them as paid ads. Best ROI of any creative we have tested.',
        clientName: 'Lily Chong',
        clientRole: 'E-commerce Owner',
        rating: 5,
        tags: ['Product Film', 'E-commerce'],
      },
      {
        id: 'content-3',
        title: 'FitFlow Studio · Class Teasers',
        description: 'Weekly energy-packed gym content',
        thumbnail: img('photo-1536240478700-b869070f9279'),
        videoUrl: sv('ForBiggerEscapes'),
        testimonial:
          'New member signups doubled within six weeks of starting the content partnership.',
        clientName: 'Mike Arif',
        clientRole: 'Studio Owner, FitFlow',
        rating: 5,
        tags: ['Social Media', 'Weekly Content'],
      },
      {
        id: 'content-4',
        title: 'Nomad Eats · Food Blog Series',
        description: 'Vertical food storytelling for YouTube Shorts',
        thumbnail: img('photo-1611162616308-c13c868e5e54'),
        videoUrl: sv('ElephantsDream'),
        testimonial:
          'They understand food content. Each video feels cinematic but still authentic to our brand.',
        clientName: 'Farah Ismail',
        clientRole: 'Food Blogger',
        rating: 5,
        tags: ['YouTube Shorts', 'Food Content'],
      },
      {
        id: 'content-5',
        title: 'TechSparks · Creator Kit',
        description: 'Monthly creator package for tech reviewers',
        thumbnail: img('photo-1526170375885-4d8ecf77b99f'),
        videoUrl: sv('BigBuckBunny'),
        testimonial:
          'A content team without the headcount. They handle everything from scripting to thumbnails.',
        clientName: 'Ryan Goh',
        clientRole: 'Tech Reviewer',
        rating: 5,
        tags: ['Creator Package', 'Monthly Retainer'],
      },
    ],
  },
  {
    id: 'graduation',
    label: 'Graduation',
    shortLabel: 'Graduation',
    icon: 'graduation-cap',
    accent: '#059669',
    accentSoft: 'rgba(5, 150, 105, 0.12)',
    headline: 'Graduation Photography',
    description:
      'Convocation day photos with zero stiff poses and all the hype. Cap toss, family chaos, and portraits that make your mom cry.',
    items: [
      {
        id: 'grad-1',
        title: 'Pre Convo Session',
        description: 'Solo portraits before the big day',
        thumbnail: '/images/preconvo-graduation-photo.jpg',
        // TODO: replace with a real graduation shoot
        videoUrl: sv('ForBiggerFun'),
        testimonial: '',
        clientName: 'Usamah & Friends',
        clientRole: 'Pre Convo Shoot',
        rating: 5,
        tags: ['Pre Convo'],
        year: '2026',
        location: 'Malaysia',
      },
      {
        id: 'grad-2',
        title: 'Full Convocation Day',
        description: 'Ceremony, hall, campus and the whole family',
        thumbnail: img('photo-1523580494863-6f3031224c94'),
        // TODO: replace with a real graduation shoot
        videoUrl: sv('ForBiggerJoyrides'),
        testimonial: '',
        clientName: 'Founder Grad #2',
        clientRole: 'Could be you',
        rating: 5,
        tags: ['Full Day'],
        year: '2026',
        location: 'Malaysia',
      },
    ],
  },
];

export const serviceForms: Record<ServiceId, ServiceFormConfig> = {
  weddings: {
    serviceId: 'weddings',
    title: 'Enquire About a Wedding Film',
    description:
      'Tell us about your big day and we will send a tailored proposal within 24 hours.',
    serviceType: 'weddings',
    fields: [
      { name: 'clientName', label: 'Full Names', type: 'text', required: true, placeholder: 'e.g. Sarah & Ahmad' },
      { name: 'eventDate', label: 'Wedding Date', type: 'date', required: true },
      { name: 'venue', label: 'Venue', type: 'text', required: true, placeholder: 'e.g. The Datai Langkawi' },
      { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'you@email.com' },
      { name: 'phone', label: 'Phone / WhatsApp', type: 'tel', required: true, placeholder: '+60 17-xxx xxxx' },
      {
        name: 'stylePreference',
        label: 'Preferred Film Style',
        type: 'select',
        required: true,
        options: ['Cinematic (slow, emotional)', 'Reality / Documentary (candid)', 'Both / Mixed'],
      },
      {
        name: 'message',
        label: 'Message',
        type: 'textarea',
        required: false,
        placeholder: 'Ceremony details, must-have moments, cultural traditions...',
        fullWidth: true,
      },
    ],
  },
  corporate: {
    serviceId: 'corporate',
    title: 'Enquire About a Corporate Film',
    description:
      'Share your project brief and we will reply with a production plan and quote.',
    serviceType: 'corporate',
    fields: [
      { name: 'clientName', label: 'Company Name', type: 'text', required: true, placeholder: 'e.g. TechCorp Sdn Bhd' },
      {
        name: 'projectType',
        label: 'Project Type',
        type: 'select',
        required: true,
        options: [
          'Product Launch',
          'Brand Video',
          'Company Profile',
          'Event Coverage',
          'Social Media Campaign',
          'Training / Internal Video',
          'Other',
        ],
      },
      {
        name: 'projectTimeline',
        label: 'Timeline',
        type: 'select',
        required: true,
        options: ['Urgent (1–2 weeks)', 'Standard (3–4 weeks)', 'Flexible (1–2 months)', 'Not sure yet'],
      },
      {
        name: 'budgetRange',
        label: 'Budget Range',
        type: 'select',
        required: true,
        options: ['Under RM 3,000', 'RM 3,000 – RM 7,000', 'RM 7,000 – RM 15,000', 'RM 15,000+'],
      },
      { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'you@company.com' },
      { name: 'phone', label: 'Phone / WhatsApp', type: 'tel', required: true, placeholder: '+60 17-xxx xxxx' },
      {
        name: 'message',
        label: 'Message',
        type: 'textarea',
        required: false,
        placeholder: 'Tell us about the project, audience, key messages...',
        fullWidth: true,
      },
    ],
  },
  events: {
    serviceId: 'events',
    title: 'Enquire About Event Coverage',
    description:
      'Tell us about your event and we will put together a coverage plan.',
    serviceType: 'events',
    fields: [
      {
        name: 'eventType',
        label: 'Event Type',
        type: 'select',
        required: true,
        options: [
          'Conference / Summit',
          'Product Launch',
          'Gala / Dinner',
          'Corporate Gathering',
          'Concert / Festival',
          'Private Party',
          'Other',
        ],
      },
      { name: 'eventDate', label: 'Event Date', type: 'date', required: true },
      {
        name: 'coverageDuration',
        label: 'Duration / Hours Needed',
        type: 'select',
        required: true,
        options: ['Up to 2 hours', 'Half day (3–5 hours)', 'Full day (6–10 hours)', 'Multi-day'],
      },
      { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'you@email.com' },
      { name: 'phone', label: 'Phone / WhatsApp', type: 'tel', required: true, placeholder: '+60 17-xxx xxxx' },
      {
        name: 'message',
        label: 'Message',
        type: 'textarea',
        required: false,
        placeholder: 'Event programme, number of attendees, deliverables needed...',
        fullWidth: true,
      },
    ],
  },
  content: {
    serviceId: 'content',
    title: 'Enquire About Content Creation',
    description:
      'Let us know what content you need and how often. We will handle the rest.',
    serviceType: 'content',
    fields: [
      {
        name: 'contentType',
        label: 'Content Type',
        type: 'select',
        required: true,
        options: [
          'Social Media (Reels / Shorts)',
          'Product Showcase',
          'Blog / Editorial',
          'Event Recap',
          'YouTube Videos',
          'Mixed',
          'Other',
        ],
      },
      {
        name: 'uploadFrequency',
        label: 'Upload Frequency',
        type: 'select',
        required: true,
        options: ['Weekly', 'Bi-weekly', 'Monthly', 'One-time project', 'Ongoing retainer'],
      },
      { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'you@email.com' },
      { name: 'phone', label: 'Phone / WhatsApp', type: 'tel', required: true, placeholder: '+60 17-xxx xxxx' },
      {
        name: 'message',
        label: 'Message',
        type: 'textarea',
        required: false,
        placeholder: 'Platforms, examples you like, brand voice notes...',
        fullWidth: true,
      },
    ],
  },
  graduation: {
    serviceId: 'graduation',
    title: 'Enquire About Graduation Photos',
    description:
      'Tell us about your convocation day and we will reply within 24 hours, usually with too much enthusiasm.',
    serviceType: 'graduation',
    fields: [
      { name: 'clientName', label: 'Full Name', type: 'text', required: true, placeholder: 'e.g. Aina Binti Ahmad' },
      { name: 'institution', label: 'Institution / University', type: 'text', required: true, placeholder: 'e.g. UiTM Shah Alam' },
      { name: 'eventDate', label: 'Graduation Date', type: 'date', required: true },
      { name: 'venue', label: 'Venue / Hall', type: 'text', required: true, placeholder: 'e.g. Dewan Agung Tuanku Canselor' },
      { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'you@email.com' },
      { name: 'phone', label: 'Phone / WhatsApp', type: 'tel', required: true, placeholder: '+60 17-xxx xxxx' },
      {
        name: 'message',
        label: 'Message',
        type: 'textarea',
        required: false,
        placeholder: 'Solo portraits, family shots, full day coverage...',
        fullWidth: true,
      },
    ],
  },
};

export const getServiceById = (id: ServiceId): PortfolioService => {
  const service = portfolioServices.find((s) => s.id === id);
  if (!service) throw new Error(`Unknown service: ${id}`);
  return service;
};

// ============================================================
// GRADUATION PHOTOGRAPHY
// ============================================================

export interface GraduationPackage {
  id: string;
  name: string;
  tagline: string;
  price: number;
  originalPrice: number;
  popular?: boolean;
  features: string[];
}

export const graduationPackages: GraduationPackage[] = [
  {
    id: 'solo',
    name: 'Solo',
    tagline: 'Just you and the spotlight',
    price: 150,
    originalPrice: 199,
    features: [
      '1 person',
      '45 minutes of shooting',
      '1 location',
      'All edited photos delivered',
    ],
  },
  {
    id: 'duo-family',
    name: 'Duo / Solo + Family',
    tagline: 'Bring the family, we handle the rest',
    price: 250,
    originalPrice: 320,
    popular: true,
    features: [
      'Up to 4 people',
      '1 hour of shooting',
      '1 location',
      'Solo + family + group shots',
      'All edited photos delivered',
    ],
  },
  {
    id: 'group',
    name: 'Group',
    tagline: 'Three or more, group rate kicks in',
    price: 55,
    originalPrice: 75,
    features: [
      'RM 55 per person',
      'For groups larger than 3',
      '1 hour of shooting',
      '1 location',
      'All edited photos delivered',
    ],
  },
];

// ============================================================
// WEDDING SHOWREEL
// ------------------------------------------------------------
// TODO: replace with the real 2025 studio showreel before launch.
// ============================================================

export const weddingShowreel: PortfolioItem = {
  id: 'showreel',
  title: 'Captura Wedding Showreel',
  description: 'A taste of the fun-style wedding films we craft',
  thumbnail: img('photo-1511285560929-80b456fea0bc'),
  // Real film: public/videos/jasmine-irfan-wedding.mp4
  videoUrl: '/videos/jasmine-irfan-wedding.mp4',
  testimonial: '',
  clientName: 'Captura Studio',
  clientRole: 'Wedding Films',
  rating: 5,
  tags: ['Showreel', '2026'],
  year: '2026',
  duration: '3:00',
  style: 'Showreel',
};

// ============================================================
// TIKTOK PROFILES — content portfolio lives on TikTok
// ============================================================

export const TIKTOK_HANDLE = '@itsaintreal';
export const TIKTOK_URL = 'https://www.tiktok.com/@itsaintreal';
export const TIKTOK_HANDLE_SECONDARY = '@captura.my';
export const TIKTOK_URL_SECONDARY = 'https://www.tiktok.com/@captura.my';

// ============================================================
// GOOGLE REVIEWS — kind words section
// ============================================================
export const GOOGLE_RATING = '5.0';
export const GOOGLE_REVIEWS_URL = 'https://g.page/r/CUDjhcWmBBfNEBM/review';

// ============================================================
// WEDDING PACKAGES — Launch promo pricing
// ------------------------------------------------------------
// Anchor strategy: originalPrice is the struck-through market
// value; price is the launch-promo price (first 10 bookings).
// ============================================================

export interface WeddingPackage {
  id: string;
  name: string;
  tagline: string;
  price: number;
  originalPrice: number;
  popular?: boolean;
  features: string[];
}

export const weddingPackages: WeddingPackage[] = [
  {
    id: 'fun-highlight',
    name: 'Fun Highlight',
    tagline: 'The essentials, done well',
    price: 1200,
    originalPrice: 1500,
    features: [
      '3–4 min fun-style highlight film',
      '5 hours of coverage',
      '1 videographer',
      'Delivery within 4 weeks',
      'Online gallery & full-quality download',
    ],
  },
  {
    id: 'fun-highlight-plus',
    name: 'Fun Highlight+',
    tagline: 'Our signature fun-style experience',
    price: 1800,
    originalPrice: 2400,
    popular: true,
    features: [
      '3–4 min fun-style highlight film',
      '6 hours of coverage',
      '1 videographer',
      'Drone add-on available (RM 300)',
      'Priority delivery within 3 weeks',
      'Online gallery & full-quality download',
    ],
  },
  {
    id: 'fun-signature',
    name: 'Fun Signature',
    tagline: 'The full cinematic treatment',
    price: 2800,
    originalPrice: 3400,
    features: [
      '3–4 min highlight film',
      'Same-day teaser reel for your socials',
      '8 hours of coverage',
      '2 videographers',
      'Drone footage included',
      'Delivery within 2 weeks',
    ],
  },
];

// ============================================================
// WEDDING FAQ
// ============================================================

export interface WeddingFaq {
  q: string;
  a: string;
}

export const weddingFaqs: WeddingFaq[] = [
  {
    q: 'How long until we receive our film?',
    a: 'Highlight films are delivered within 2–4 weeks depending on your package. Fun Signature includes a same-day teaser reel so you can post the very next morning.',
  },
  {
    q: 'What if it rains on our wedding day?',
    a: 'We shoot rain or shine. Overcast and rain can actually give footage a moodier, more cinematic feel. We carry gear that handles light rain, and we adapt the shot list on the day.',
  },
  {
    q: 'Do you offer same-day edits?',
    a: 'Yes, the Fun Signature package includes a 1-minute teaser cut delivered the same evening, ready for your socials while your guests are still dancing.',
  },
  {
    q: 'Do you travel outside KL?',
    a: 'We cover all of KL and Selangor at no extra cost. Weddings elsewhere in Malaysia are welcome with a modest travel fee based on distance.',
  },
  {
    q: 'How many weddings do you take each month?',
    a: 'We cap at around six bookings a month so every couple gets our full attention on their day and during editing. Lock in your date early.',
  },
  {
    q: 'Can we add extra coverage hours?',
    a: 'Yes, extra hours are RM 100/hour on any package, subject to availability. We recommend booking them in advance so we can plan the day properly.',
  },
];

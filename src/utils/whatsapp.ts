// WhatsApp integration utilities for Captura Photography
// Centralized WhatsApp message handling with context-aware messages

export interface WhatsAppMessage {
  type: 'general' | 'package' | 'gallery' | 'availability' | 'custom';
  context?: string;
  packageName?: string;
  packagePrice?: string;
  addOns?: string[];
  totalPrice?: number;
  selectedDate?: string;
  pageSource?: string;
}

const WHATSAPP_NUMBER = '60177464121';

// Pre-defined message templates
const messageTemplates = {
  general: {
    greeting: "Hi! I'm interested in your photography services.",
    inquiry: "Can you provide more information about your packages and availability?",
    portfolio: "I saw your portfolio and would love to discuss my photography needs.",
    pricing: "Can you help me understand your pricing and what's included?"
  },
  
  package: {
    interest: (pkg: string, price: string) => 
      `Hi! I'm interested in the ${pkg} package (${price}). Can you check availability and provide more details?`,
    booking: (pkg: string, price: string) => 
      `Hi! I'd like to book the ${pkg} package (${price}). When can we schedule this?`,
    comparison: (pkg: string) => 
      `Hi! I'm considering the ${pkg} package. Can you help me compare it with other options?`,
    custom: (pkg: string) => 
      `Hi! I'm interested in the ${pkg} package but need some customization. Can we discuss?`
  },
  
  gallery: {
    inquiry: "Hi! I saw your gallery and I'm impressed with your work. Can we discuss my event?",
    specific: (category: string) => 
      `Hi! I loved your ${category} photography in the gallery. Can you photograph my ${category}?`,
    style: "Hi! Your photography style is exactly what I'm looking for. Can we schedule a consultation?"
  },
  
  availability: {
    dateCheck: (date: string) => 
      `Hi! I'd like to check if you're available on ${date} for photography services.`,
    booking: (date: string, pkg: string) => 
      `Hi! I want to book the ${pkg} package for ${date}. Is this date available?`,
    flexible: "Hi! I'm flexible with dates. What availability do you have in the coming months?"
  },
  
  addOns: {
    withAddOns: (pkg: string, addOns: string[], total: number) => 
      `Hi! I'd like to book the ${pkg} package with add-ons: ${addOns.join(', ')}. Total: RM${total}. Can you confirm availability?`,
    customization: "Hi! I'm interested in your packages but would like to add some custom services. Can we discuss?"
  }
};

// Generate WhatsApp URL with pre-filled message
export function generateWhatsAppUrl(message: WhatsAppMessage): string {
  let finalMessage = '';
  
  switch (message.type) {
    case 'general':
      finalMessage = message.context === 'portfolio' 
        ? messageTemplates.general.portfolio
        : message.context === 'pricing'
        ? messageTemplates.general.pricing
        : messageTemplates.general.greeting + ' ' + messageTemplates.general.inquiry;
      break;
      
    case 'package':
      if (message.packageName && message.packagePrice) {
        finalMessage = message.context === 'booking'
          ? messageTemplates.package.booking(message.packageName, message.packagePrice)
          : message.context === 'comparison'
          ? messageTemplates.package.comparison(message.packageName)
          : message.context === 'custom'
          ? messageTemplates.package.custom(message.packageName)
          : messageTemplates.package.interest(message.packageName, message.packagePrice);
      }
      break;
      
    case 'gallery':
      finalMessage = message.context
        ? messageTemplates.gallery.specific(message.context)
        : messageTemplates.gallery.inquiry;
      break;
      
    case 'availability':
      if (message.selectedDate) {
        finalMessage = message.packageName
          ? messageTemplates.availability.booking(message.selectedDate, message.packageName)
          : messageTemplates.availability.dateCheck(message.selectedDate);
      } else {
        finalMessage = messageTemplates.availability.flexible;
      }
      break;
      
    case 'custom':
      finalMessage = message.context || messageTemplates.general.greeting;
      break;
      
    default:
      finalMessage = messageTemplates.general.greeting + ' ' + messageTemplates.general.inquiry;
  }
  
  // Add package details and add-ons if provided
  if (message.addOns && message.addOns.length > 0 && message.totalPrice) {
    finalMessage = messageTemplates.addOns.withAddOns(
      message.packageName || 'selected package',
      message.addOns,
      message.totalPrice
    );
  }
  
  // Add page source context for analytics
  if (message.pageSource) {
    finalMessage += ` (Inquiry from: ${message.pageSource})`;
  }
  
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(finalMessage)}`;
}

// Quick function generators for common use cases
export const whatsappLinks = {
  // General inquiries
  general: (context?: string, pageSource?: string) => 
    generateWhatsAppUrl({ type: 'general', context, pageSource }),
  
  // Package inquiries
  packageInquiry: (packageName: string, packagePrice: string, pageSource?: string) =>
    generateWhatsAppUrl({ type: 'package', packageName, packagePrice, pageSource }),
  
  packageBooking: (packageName: string, packagePrice: string, pageSource?: string) =>
    generateWhatsAppUrl({ type: 'package', context: 'booking', packageName, packagePrice, pageSource }),
  
  packageComparison: (packageName: string, pageSource?: string) =>
    generateWhatsAppUrl({ type: 'package', context: 'comparison', packageName, pageSource }),
  
  // Gallery inquiries
  galleryInquiry: (category?: string, pageSource?: string) =>
    generateWhatsAppUrl({ type: 'gallery', context: category, pageSource }),
  
  // Availability checks
  availabilityCheck: (selectedDate?: string, packageName?: string, pageSource?: string) =>
    generateWhatsAppUrl({ type: 'availability', selectedDate, packageName, pageSource }),
  
  // Package with add-ons
  packageWithAddOns: (packageName: string, packagePrice: string, addOns: string[], totalPrice: number, pageSource?: string) =>
    generateWhatsAppUrl({ 
      type: 'package', 
      packageName, 
      packagePrice, 
      addOns, 
      totalPrice, 
      pageSource 
    }),
  
  // Custom message
  custom: (message: string, pageSource?: string) =>
    generateWhatsAppUrl({ type: 'custom', context: message, pageSource })
};

// WhatsApp button component props helper
export interface WhatsAppButtonProps {
  message: WhatsAppMessage;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

// Analytics tracking for WhatsApp clicks
export function trackWhatsAppClick(context: string, packageName?: string) {
  // This will be useful for analytics later
  if (typeof window !== 'undefined') {
    console.log('WhatsApp click:', { context, packageName, timestamp: new Date().toISOString() });
    
    // Could integrate with Google Analytics here
    // gtag('event', 'whatsapp_click', {
    //   context: context,
    //   package: packageName,
    //   page: window.location.pathname
    // });
  }
}

// Quick contact scenarios
export const quickContact = {
  // Homepage hero
  heroInquiry: () => whatsappLinks.general('portfolio', 'homepage-hero'),
  
  // Gallery page
  galleryContact: (category?: string) => whatsappLinks.galleryInquiry(category, 'gallery-page'),
  
  // Package page
  packageInquiry: (pkg: string, price: string) => whatsappLinks.packageInquiry(pkg, price, 'packages-page'),
  packageBooking: (pkg: string, price: string) => whatsappLinks.packageBooking(pkg, price, 'packages-page'),
  
  // Calendar/availability
  dateInquiry: (date?: string, pkg?: string) => whatsappLinks.availabilityCheck(date, pkg, 'calendar-selection'),
  
  // Navigation
  navInquiry: () => whatsappLinks.general('inquiry', 'navigation'),
  
  // Footer
  footerContact: () => whatsappLinks.general('contact', 'footer')
};

const whatsappUtils = {
  generateWhatsAppUrl,
  whatsappLinks,
  quickContact,
  trackWhatsAppClick
};

export default whatsappUtils;

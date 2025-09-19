'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function FloatingNav() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const pathname = usePathname();

  // Show floating nav after scrolling down a bit
  useEffect(() => {
    // Don't set up scroll listeners on admin pages
    if (pathname.startsWith('/admin')) {
      return;
    }
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Track which section is currently in view
    const handleScroll = () => {
      const sections = ['cameras', 'how-to-book', 'pickup-delivery'];
      const scrollPosition = window.pageYOffset + 200;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname]);

  // Don't render FloatingNav on admin pages
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const navItems = [
    {
      id: 'cameras',
      icon: '📷',
      label: 'Cameras',
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700'
    },
    {
      id: 'how-to-book',
      icon: '📋',
      label: 'How to Book',
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700'
    },
    {
      id: 'pickup-delivery',
      icon: '📍',
      label: 'Location',
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700'
    }
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 hidden lg:block">
      <div className="flex flex-col space-y-3">
        {navItems.map((item) => (
          <div key={item.id} className="relative group">
            {/* Tooltip */}
            <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              {item.label}
              <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
            </div>

            {/* Button */}
            <button
              onClick={() => scrollToSection(item.id)}
              className={`
                relative w-14 h-14 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 hover:shadow-xl
                bg-gradient-to-r ${item.color} ${item.hoverColor}
                ${activeSection === item.id ? 'scale-110 shadow-xl ring-4 ring-white ring-opacity-50' : 'hover:scale-105'}
                flex items-center justify-center text-white text-xl
                backdrop-blur-sm border-2 border-white/20
              `}
              title={item.label}
            >
              <span className="relative z-10">{item.icon}</span>
              
              {/* Pulse animation for active section */}
              {activeSection === item.id && (
                <div className="absolute inset-0 rounded-full bg-white opacity-20 animate-ping"></div>
              )}
              
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        ))}
        
        {/* WhatsApp Quick Contact */}
        <div className="mt-6 pt-3 border-t border-white/20">
          <div className="relative group">
            {/* Tooltip */}
            <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              Quick Contact
              <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
            </div>

            {/* WhatsApp Button */}
            <a
              href="https://wa.me/60177464121"
              target="_blank"
              rel="noopener noreferrer"
              className="
                relative w-14 h-14 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 hover:shadow-xl
                bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700
                flex items-center justify-center text-white text-xl
                backdrop-blur-sm border-2 border-white/20
                animate-pulse hover:animate-none
              "
              title="WhatsApp Us"
            >
              <span className="relative z-10">💬</span>
              
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

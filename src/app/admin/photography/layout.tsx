'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

const photographyNavItems = [
  { name: 'Dashboard', href: '/admin/photography', icon: '📊' },
  { name: 'Bookings', href: '/admin/photography/bookings', icon: '📅' },
  { name: 'Gallery', href: '/admin/photography/gallery', icon: '📸' },
  { name: 'Add-ons', href: '/admin/photography/addons', icon: '🎁' },
  { name: 'Clients', href: '/admin/photography/clients', icon: '👥' },
  { name: 'Analytics', href: '/admin/photography/analytics', icon: '📈' },
  { name: 'Calendar', href: '/admin/photography/calendar', icon: '🗓️' },
];

export default function PhotographyAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === '/admin/photography/login') {
      setIsLoading(false);
      return;
    }

    // Check if user is authenticated for photography admin
    const photographyAuth = localStorage.getItem('photographyAuth');
    if (photographyAuth === 'true') {
      setIsAuthenticated(true);
    } else {
      router.push('/admin/photography/login');
    }
    setIsLoading(false);
  }, [pathname, router]);

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37] mx-auto mb-4"></div>
          <p className="text-black/60">Loading Photography Admin...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated && pathname !== '/admin/photography/login') {
    return null; // Will redirect to login
  }

  // Skip layout for login page
  if (pathname === '/admin/photography/login') {
    return children;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <nav className="bg-black shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/admin/photography" className="flex items-center space-x-3 group">
              <div className="relative w-10 h-10 group-hover:scale-110 transition-transform duration-300">
                <Image
                  src="/images/captura_logo_big.png"
                  alt="Captura Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <span className="text-2xl font-bold text-white font-serif group-hover:text-[#d4af37] transition-colors duration-300">
                  CAPTURA
                </span>
                <div className="text-xs text-white/60 uppercase tracking-wider font-medium">
                  Photography Admin
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {photographyNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative group ${
                      isActive
                        ? 'text-[#d4af37] bg-[#d4af37]/10'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {item.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#d4af37] transform scale-x-100"></span>
                    )}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#d4af37] group-hover:w-full transition-all duration-300"></span>
                  </Link>
                );
              })}
            </div>

            {/* Quick Actions & User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/"
                className="px-3 py-1 text-white/80 hover:text-white border border-white/20 hover:border-white/40 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Website</span>
              </Link>

              {/* User Avatar & Logout */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#d4af37] rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-sm">📷</span>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem('photographyAuth');
                    router.push('/admin/photography/login');
                  }}
                  className="px-3 py-1 text-white/80 hover:text-white border border-white/20 hover:border-white/40 rounded-lg text-sm font-medium transition-all duration-300"
                  title="Logout"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white hover:text-[#d4af37] focus:outline-none focus:text-[#d4af37] transition-colors p-2"
                aria-label="Toggle menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-black border-t border-white/10">
                {photographyNavItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`text-white/80 hover:text-white block px-4 py-3 rounded-md text-base font-medium transition-colors w-full text-left flex items-center space-x-3 ${
                        isActive ? 'bg-[#d4af37]/10 text-[#d4af37]' : ''
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                
                {/* Mobile Quick Links */}
                <div className="pt-4 border-t border-white/10 space-y-1">
                  <Link
                    href="/"
                    className="w-full px-4 py-3 text-white/80 hover:text-white rounded-lg text-base font-medium transition-all duration-300 flex items-center space-x-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="text-lg">🌐</span>
                    <span>Visit Website</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Page content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

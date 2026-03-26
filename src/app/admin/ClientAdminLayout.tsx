'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import AdminPWAWrapper from '../../components/admin/AdminPWAWrapper';
import { AdminDataProvider } from '@/contexts/AdminDataContext';
import { ErrorBoundary } from '@/components/admin/ErrorBoundary';
import { RefreshButton } from '@/components/admin/RefreshButton';
import './globals-admin.css';
import {
  LayoutDashboard,
  Clock,
  Calendar,
  Sparkles,
  BookOpen,
  FileText,
  Camera,
  Wrench,
  Users,
  MessageSquareQuote,
  Image as ImageIcon,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  // Check if current route is photography admin or mobile admin
  const isPhotographyRoute = pathname?.startsWith('/admin/photography');
  const isMobileRoute = pathname?.startsWith('/admin/mobile');

  // ALL HOOKS MUST BE AT THE TOP - BEFORE ANY CONDITIONAL RETURNS
  useEffect(() => {
    // Check authentication
    const authStatus = localStorage.getItem('adminAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    } else if (pathname !== '/admin/login' && !isMobileRoute) {
      router.push('/admin/login');
    }
    setIsLoading(false);
  }, [pathname, router, isMobileRoute]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    router.push('/admin/login');
  };

  // Don't show layout for login page or mobile routes
  if (pathname === '/admin/login' || isMobileRoute) {
    return children;
  }

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0e0d] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // For photography routes, return children without admin layout
  if (isPhotographyRoute) {
    return children;
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Approvals', href: '/admin/booking-approvals', icon: Clock },
    { name: 'Calendar', href: '/admin/calendar', icon: Calendar },
    { name: 'Creator', href: '/admin/creator', icon: Sparkles },
    { name: 'Bookings', href: '/admin/bookings', icon: BookOpen },
    { name: 'Agreements', href: '/admin/rental-agreements', icon: FileText },
    { name: 'Cameras', href: '/admin/cameras', icon: Camera },
    { name: 'Accessories', href: '/admin/accessories', icon: Wrench },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Reviews', href: '/admin/reviews', icon: MessageSquareQuote },
    { name: 'Gallery', href: '/admin/gallery', icon: ImageIcon },
    { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <AdminPWAWrapper>
      <ErrorBoundary>
        <AdminDataProvider>
          <div className="h-screen bg-[#0d0c0b] flex overflow-hidden text-stone-100">
            {/* Mobile sidebar overlay */}
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                  onClick={() => setIsSidebarOpen(false)}
                />
              )}
            </AnimatePresence>

            {/* Sidebar */}
            <div className="hidden lg:flex lg:flex-shrink-0 lg:relative">
              <div className="flex flex-col h-[calc(100vh-2rem)] w-[280px] bg-[#161412] m-4 rounded-3xl border border-[#2c2723] shadow-[0_24px_60px_rgba(0,0,0,0.32)] overflow-hidden">
                {/* Logo */}
                <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-[#26211d]">
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="w-10 h-10 bg-[#0f0e0d] border border-[#322b25] rounded-xl flex items-center justify-center"
                    >
                      <Image
                        src="/images/captura_icon.png"
                        alt="CAPTURA"
                        width={22}
                        height={22}
                        className="w-5.5 h-5.5 object-contain brightness-0 invert"
                      />
                    </motion.div>
                    <div>
                      <h1 className="text-lg font-bold text-stone-100 tracking-tight">CAPTURA</h1>
                      <p className="text-xs text-stone-500">Admin Panel</p>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="admin-scrollbar flex-1 space-y-1 overflow-y-auto px-4 py-6">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                          ? 'bg-[#f3efe8] text-[#11100f] shadow-[0_10px_25px_rgba(0,0,0,0.22)]'
                          : 'text-stone-400 hover:bg-[#211d19] hover:text-stone-100'
                          }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium text-sm">{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-[#26211d]">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-stone-400 hover:bg-[#211614] hover:text-red-300 rounded-xl transition-all duration-200"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium text-sm">Logout</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Sidebar */}
            <motion.div
              initial={false}
              animate={{ x: isSidebarOpen ? 0 : -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] lg:hidden"
            >
              <div className="flex flex-col h-full w-full bg-[#161412] border-r border-[#2c2723] shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
                {/* Logo */}
                <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-[#26211d]">
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="w-10 h-10 bg-[#0f0e0d] border border-[#322b25] rounded-xl flex items-center justify-center"
                    >
                      <Image
                        src="/images/captura_icon.png"
                        alt="CAPTURA"
                        width={22}
                        height={22}
                        className="w-5.5 h-5.5 object-contain brightness-0 invert"
                      />
                    </motion.div>
                    <div>
                      <h1 className="text-lg font-bold text-stone-100 tracking-tight">CAPTURA</h1>
                      <p className="text-xs text-stone-500">Admin Panel</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="text-stone-500 hover:text-stone-100 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#211d19] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Navigation */}
                <nav className="admin-scrollbar flex-1 space-y-1 overflow-y-auto px-4 py-6">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                          ? 'bg-[#f3efe8] text-[#11100f] shadow-[0_10px_25px_rgba(0,0,0,0.22)]'
                          : 'text-stone-400 hover:bg-[#211d19] hover:text-stone-100'
                          }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium text-sm">{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-[#26211d]">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-stone-400 hover:bg-[#211614] hover:text-red-300 rounded-xl transition-all duration-200"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium text-sm">Logout</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 lg:pl-0 w-full max-w-full overflow-hidden">
              {/* Top bar */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-[#161412] border border-[#2c2723] m-4 mb-0 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.24)] z-30 w-auto flex-shrink-0"
              >
                <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 md:px-6 max-w-full">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsSidebarOpen(true)}
                      className="lg:hidden text-stone-400 hover:text-stone-100 p-1.5 sm:p-2 rounded-lg hover:bg-[#211d19] transition-colors"
                    >
                      <Menu className="w-5 h-5" />
                    </motion.button>

                    <div className="hidden lg:block">
                      <input
                        type="text"
                        placeholder="Search"
                        className="w-80 px-4 py-2 text-sm bg-[#1e1a17] border border-[#2f2a25] text-stone-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-[#c96b2c] transition-all placeholder:text-stone-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-4">
                    <span className="text-[10px] sm:text-xs text-stone-500 hidden md:block font-medium">
                      {new Date().toLocaleDateString('en-MY', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <RefreshButton />
                  </div>
                </div>
              </motion.div>

              {/* Page content */}
              <main className="admin-scrollbar flex-1 w-full max-w-full overflow-y-auto overflow-x-hidden bg-[#0d0c0b] p-3 sm:p-4 md:p-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-full"
                >
                  {children}
                </motion.div>
              </main>
            </div>
          </div>
        </AdminDataProvider>
      </ErrorBoundary>
    </AdminPWAWrapper>
  );
}

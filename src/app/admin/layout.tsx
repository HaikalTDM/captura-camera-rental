'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import AdminPWAWrapper from '../../components/admin/AdminPWAWrapper';
import AIAssistant from '../../components/admin/AIAssistant';
import { AdminDataProvider } from '@/contexts/AdminDataContext';
import { ErrorBoundary } from '@/components/admin/ErrorBoundary';
import { RefreshButton } from '@/components/admin/RefreshButton';
import './globals-admin.css';
import {
  LayoutDashboard,
  Clock,
  Calendar,
  BookOpen,
  FileText,
  Camera,
  Wrench,
  Users,
  Image as ImageIcon,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Heart,
  ChevronDown,
  ChevronRight,
  List,
  AlertCircle
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMotherExpanded, setIsMotherExpanded] = useState(false);
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

  // Auto-expand Mother section if on a Mother route
  useEffect(() => {
    if (pathname?.startsWith('/admin/mother')) {
      setIsMotherExpanded(true);
    }
  }, [pathname]);

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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
    { name: 'Bookings', href: '/admin/bookings', icon: BookOpen },
    { name: 'Agreements', href: '/admin/rental-agreements', icon: FileText },
    { name: 'Cameras', href: '/admin/cameras', icon: Camera },
    { name: 'Accessories', href: '/admin/accessories', icon: Wrench },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Gallery', href: '/admin/gallery', icon: ImageIcon },
    { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const motherNavigation = {
    name: 'Mother',
    href: '/admin/mother',
    icon: Heart,
    subItems: [
      { name: 'Dashboard', href: '/admin/mother', icon: LayoutDashboard },
      { name: 'Bookings', href: '/admin/mother/bookings', icon: List },
      { name: 'Approvals', href: '/admin/mother/approvals', icon: AlertCircle },
    ]
  };

  return (
    <AdminPWAWrapper>
      <ErrorBoundary>
        <AdminDataProvider>
          <div className="h-screen bg-slate-100 flex overflow-hidden">
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
              <div className="flex flex-col h-[calc(100vh-2rem)] w-[280px] bg-slate-50 m-4 rounded-3xl shadow-lg overflow-hidden">
                {/* Logo */}
                <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center"
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
                      <h1 className="text-lg font-bold text-slate-900 tracking-tight">CAPTURA</h1>
                      <p className="text-xs text-slate-500">Admin Panel</p>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                          ? 'bg-slate-900 text-white shadow-md'
                          : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                          }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium text-sm">{item.name}</span>
                      </Link>
                    );
                  })}

                  {/* Mother Section with Sub-items */}
                  <div className="space-y-1">
                    <button
                      onClick={() => setIsMotherExpanded(!isMotherExpanded)}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${pathname?.startsWith('/admin/mother')
                        ? 'bg-pink-500 text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Heart className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium text-sm">Mother</span>
                      </div>
                      {isMotherExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    <AnimatePresence>
                      {isMotherExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden pl-4 space-y-1"
                        >
                          {motherNavigation.subItems.map((subItem) => {
                            const isActive = pathname === subItem.href;
                            const SubIcon = subItem.icon;
                            return (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${isActive
                                  ? 'bg-pink-100 text-pink-700 font-medium'
                                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                  }`}
                              >
                                <SubIcon className="w-4 h-4 flex-shrink-0" />
                                <span className="text-sm">{subItem.name}</span>
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-slate-200">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
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
              <div className="flex flex-col h-full w-full bg-slate-50 shadow-lg">
                {/* Logo */}
                <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center"
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
                      <h1 className="text-lg font-bold text-slate-900 tracking-tight">CAPTURA</h1>
                      <p className="text-xs text-slate-500">Admin Panel</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="text-slate-400 hover:text-slate-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                          ? 'bg-slate-900 text-white shadow-md'
                          : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                          }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium text-sm">{item.name}</span>
                      </Link>
                    );
                  })}

                  {/* Mother Section with Sub-items */}
                  <div className="space-y-1">
                    <button
                      onClick={() => setIsMotherExpanded(!isMotherExpanded)}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${pathname?.startsWith('/admin/mother')
                        ? 'bg-pink-500 text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Heart className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium text-sm">Mother</span>
                      </div>
                      {isMotherExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    <AnimatePresence>
                      {isMotherExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden pl-4 space-y-1"
                        >
                          {motherNavigation.subItems.map((subItem) => {
                            const isActive = pathname === subItem.href;
                            const SubIcon = subItem.icon;
                            return (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${isActive
                                  ? 'bg-pink-100 text-pink-700 font-medium'
                                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                  }`}
                              >
                                <SubIcon className="w-4 h-4 flex-shrink-0" />
                                <span className="text-sm">{subItem.name}</span>
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-slate-200">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
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
                className="bg-white m-4 mb-0 rounded-2xl shadow-sm z-30 w-auto flex-shrink-0"
              >
                <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 md:px-6 max-w-full">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsSidebarOpen(true)}
                      className="lg:hidden text-slate-600 hover:text-slate-900 p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <Menu className="w-5 h-5" />
                    </motion.button>

                    <div className="hidden lg:block">
                      <input
                        type="text"
                        placeholder="Search"
                        className="w-80 px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-4">
                    <span className="text-[10px] sm:text-xs text-slate-500 hidden md:block font-medium">
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
              <main className="flex-1 p-3 sm:p-4 md:p-6 bg-slate-100 overflow-y-auto overflow-x-hidden w-full max-w-full">
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

            {/* AI Assistant */}
            <AIAssistant />
          </div>
        </AdminDataProvider>
      </ErrorBoundary>
    </AdminPWAWrapper>
  );
}

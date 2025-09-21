'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

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

  useEffect(() => {
    // Check authentication
    const authStatus = localStorage.getItem('adminAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    } else if (pathname !== '/admin/login') {
      router.push('/admin/login');
    }
    setIsLoading(false);
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    router.push('/admin/login');
  };

  // Don't show layout for login page
  if (pathname === '/admin/login') {
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

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Calendar', href: '/admin/calendar', icon: '📅' },
    { name: 'Bookings', href: '/admin/bookings', icon: '📋' },
    { name: 'Cameras', href: '/admin/cameras', icon: '📷' },
    { name: 'Accessories', href: '/admin/accessories', icon: '🔧' },
    { name: 'Customers', href: '/admin/customers', icon: '👥' },
    { name: 'Gallery', href: '/admin/gallery', icon: '📸' },
    { name: 'Reports', href: '/admin/reports', icon: '📈' },
    { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out border-r border-gray-200
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:relative lg:flex lg:flex-shrink-0
      `}>
        <div className="flex flex-col h-full w-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-blue-600 to-purple-600 border-b border-blue-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-lg">📷</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">CAPTURA</h1>
                <p className="text-xs text-blue-100">Admin Panel</p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-white hover:text-gray-200 w-6 h-6 flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                    ${isActive
                      ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info & logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">A</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-800">Admin</p>
                  <p className="text-xs text-gray-600">CAPTURA Owner</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                title="Logout"
              >
                🚪
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-0">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              ☰
            </button>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-MY', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function PhotographyAdminLogin() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Photography admin authentication
    if (credentials.username === 'photographer' && credentials.password === 'captura2024') {
      // Store photography auth in localStorage
      localStorage.setItem('photographyAuth', 'true');
      router.push('/admin/photography');
    } else {
      setError('Invalid username or password');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-16 h-16">
              <Image
                src="/images/captura_logo_big.png"
                alt="Captura Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-black mb-2 font-serif">CAPTURA</h1>
          <p className="text-black/60">Photography Admin</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl border border-[#d4af37]/20 p-8">
          <h2 className="text-2xl font-bold text-black mb-6 text-center font-serif">
            📸 Photography Login
          </h2>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Username
              </label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
                placeholder="Enter username"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Password
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
                placeholder="Enter password"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#d4af37] hover:bg-[#d4af37]/90 text-black font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                  Logging in...
                </div>
              ) : (
                'Access Photography Admin'
              )}
            </button>
          </form>

          {/* Quick Access Note */}
          <div className="mt-6 p-4 bg-[#d4af37]/10 rounded-lg">
            <p className="text-sm text-black/70 text-center">
              <strong>Photography Admin Access</strong><br />
              Manage your photography business, bookings, and gallery
            </p>
          </div>
        </div>

        {/* Back to Main Site */}
        <div className="text-center mt-8">
          <a 
            href="/"
            className="text-black/60 hover:text-[#d4af37] text-sm transition-colors"
          >
            ← Back to Captura Website
          </a>
        </div>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-black/40 text-sm">
            © 2024 CAPTURA Photography - Admin Panel
          </p>
        </div>
      </div>
    </div>
  );
}

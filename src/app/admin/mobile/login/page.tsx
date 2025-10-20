'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function MobileLogin() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simple password check (use your actual auth logic)
    if (password === 'admin123' || password === 'password') {
      localStorage.setItem('adminAuth', 'true');
      router.push('/admin/mobile');
    } else {
      setError('Invalid password');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-6 text-center border border-white/20">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <Image
              src="/images/captura_icon.png"
              alt="CAPTURA"
              width={60}
              height={60}
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">CAPTURA</h1>
          <p className="text-white/80 text-sm">Mobile Admin Panel</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <h2 className="text-2xl font-bold">Welcome Back</h2>
            <p className="text-blue-100 text-sm mt-1">Sign in to continue</p>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="p-6 pt-0">
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Default password: <span className="font-mono font-semibold text-gray-700">admin123</span>
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-3 text-center border border-white/20">
            <span className="text-2xl mb-1 block">📊</span>
            <p className="text-xs text-white font-medium">Analytics</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-3 text-center border border-white/20">
            <span className="text-2xl mb-1 block">📱</span>
            <p className="text-xs text-white font-medium">Mobile First</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-3 text-center border border-white/20">
            <span className="text-2xl mb-1 block">🌙</span>
            <p className="text-xs text-white font-medium">Dark Mode</p>
          </div>
        </div>
      </div>
    </div>
  );
}


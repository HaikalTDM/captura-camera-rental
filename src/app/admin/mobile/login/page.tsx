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
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Card */}
        <div className="bg-zinc-900 rounded-3xl p-8 mb-6 text-center border border-zinc-800">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Image
              src="/images/captura_icon.png"
              alt="CAPTURA"
              width={60}
              height={60}
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">CAPTURA</h1>
          <p className="text-gray-400 text-sm">Admin Panel</p>
        </div>

        {/* Login Form */}
        <div className="bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800">
          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
            <p className="text-gray-400 text-sm mt-1">Sign in to continue</p>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-gray-500"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black py-3 px-4 rounded-xl font-bold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Features */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="bg-zinc-900 rounded-2xl p-4 text-center border border-zinc-800">
            <span className="text-2xl mb-2 block">📊</span>
            <p className="text-xs text-gray-400 font-medium">Analytics</p>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-4 text-center border border-zinc-800">
            <span className="text-2xl mb-2 block">📱</span>
            <p className="text-xs text-gray-400 font-medium">Mobile First</p>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-4 text-center border border-zinc-800">
            <span className="text-2xl mb-2 block">⚡</span>
            <p className="text-xs text-gray-400 font-medium">Fast</p>
          </div>
        </div>
      </div>
    </div>
  );
}


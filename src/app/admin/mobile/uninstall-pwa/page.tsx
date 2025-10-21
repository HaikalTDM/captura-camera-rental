'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UninstallPWAPage() {
  const router = useRouter();
  const [uninstalling, setUninstalling] = useState(false);
  const [status, setStatus] = useState<string[]>([]);

  const addStatus = (message: string) => {
    setStatus(prev => [...prev, message]);
  };

  useEffect(() => {
    const cleanup = async () => {
      setUninstalling(true);
      addStatus('🧹 Starting cleanup...');

      try {
        // 1. Unregister all service workers
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          addStatus(`📦 Found ${registrations.length} service worker(s)`);
          
          for (const registration of registrations) {
            await registration.unregister();
            addStatus(`✅ Unregistered: ${registration.scope}`);
          }
        }

        // 2. Clear all caches
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          addStatus(`🗄️ Found ${cacheNames.length} cache(s)`);
          
          for (const cacheName of cacheNames) {
            await caches.delete(cacheName);
            addStatus(`✅ Deleted cache: ${cacheName}`);
          }
        }

        // 3. Clear localStorage
        localStorage.clear();
        addStatus('✅ Cleared localStorage');

        // 4. Clear sessionStorage
        sessionStorage.clear();
        addStatus('✅ Cleared sessionStorage');

        addStatus('');
        addStatus('🎉 Cleanup complete!');
        addStatus('');
        addStatus('📱 Now uninstall the PWA from your device:');
        addStatus('• Chrome: Settings > Apps > CAPTURA > Uninstall');
        addStatus('• Safari: Long press app icon > Remove');
        addStatus('');
        addStatus('⏱️ Redirecting in 5 seconds...');

        setTimeout(() => {
          window.location.href = '/admin/mobile';
        }, 5000);

      } catch (error) {
        addStatus(`❌ Error: ${error}`);
      }
    };

    cleanup();
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 rounded-2xl shadow-2xl p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            {uninstalling ? (
              <svg className="w-8 h-8 text-red-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Cleaning Up Old PWA
          </h1>
          <p className="text-slate-400 text-sm">
            Removing old service workers and caches...
          </p>
        </div>

        <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs space-y-1 max-h-[400px] overflow-y-auto">
          {status.map((line, i) => (
            <div key={i} className={`${
              line.startsWith('✅') ? 'text-green-400' :
              line.startsWith('❌') ? 'text-red-400' :
              line.startsWith('🎉') ? 'text-blue-400' :
              line.startsWith('📱') ? 'text-yellow-400' :
              line.startsWith('⏱️') ? 'text-orange-400' :
              'text-slate-400'
            }`}>
              {line || '\u00A0'}
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => window.location.href = '/admin/mobile'}
            className="text-sm text-blue-400 hover:text-blue-300 font-medium"
          >
            Go to Mobile Admin →
          </button>
        </div>
      </div>
    </div>
  );
}


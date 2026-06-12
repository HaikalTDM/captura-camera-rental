'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchStudioClients, type StudioClient } from '@/lib/api/studio-clients';
import StudioClientDrawer from '@/components/admin/studio/StudioClientDrawer';

export default function StudioClientsPage() {
  const [search, setSearch] = useState('');
  const [clients, setClients] = useState<StudioClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    setLoading(true);
    const data = await fetchStudioClients({ search: search || undefined });
    setClients(data);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const fmtMoney = (n: number) => `RM${Number(n ?? 0).toLocaleString()}`;
  const fmtDate = (s: string | null) =>
    s ? new Date(s).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="p-6 sm:p-8 lg:p-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 mb-1">Clients</h1>
          <p className="text-stone-400 text-sm">
            {loading ? 'Loading...' : `${clients.length} ${clients.length === 1 ? 'client' : 'clients'}`}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, phone, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-sm px-4 py-2.5 bg-white border border-stone-200 rounded-lg text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:border-stone-300"
        />
      </div>

      {/* Clients Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-stone-200/80 rounded-xl p-5 h-32 animate-pulse" />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-16 bg-white border border-stone-200/80 rounded-xl">
          <p className="text-stone-500 text-sm">
            {search ? 'No clients match your search.' : 'No studio clients yet. They\u2019ll show up here once you create a booking.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map((client) => (
            <button
              key={client.id}
              onClick={() => setSelectedId(client.id)}
              className="text-left bg-white border border-stone-200/80 shadow-sm rounded-xl p-5 hover:border-stone-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                  <span className="text-stone-600 text-sm font-bold">
                    {client.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 justify-end">
                  {client.services.includes('video') && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200 rounded">Video</span>
                  )}
                  {client.services.includes('photo') && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-[#d4af37]/10 text-[#a08520] border border-[#d4af37]/30 rounded">Photo</span>
                  )}
                  {client.services.includes('combo') && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200 rounded">Combo</span>
                  )}
                </div>
              </div>
              <h3 className="text-stone-900 font-semibold text-sm mb-1">{client.name}</h3>
              <p className="text-stone-400 text-xs">{client.phone || '\u2014'}</p>
              {client.email && (
                <p className="text-stone-400 text-xs truncate">{client.email}</p>
              )}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-stone-100">
                <span className="text-stone-500 text-xs">
                  {client.totalJobs} job{client.totalJobs > 1 ? 's' : ''} \u00b7 {fmtDate(client.lastJob)}
                </span>
                <span className="text-[#a08520] text-xs font-semibold">
                  {fmtMoney(client.totalSpent)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Detail Drawer */}
      <StudioClientDrawer
        clientId={selectedId}
        onClose={() => setSelectedId(null)}
        onChanged={loadList}
      />
    </div>
  );
}

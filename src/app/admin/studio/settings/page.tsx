'use client';

import { useState } from 'react';

export default function StudioSettingsPage() {
  const [settings, setSettings] = useState({
    businessName: 'Captura Studio',
    phone: '+60 17-746 4121',
    email: 'captura.my@gmail.com',
    location: 'Selayang, Kuala Lumpur',
    coverageRadius: '30',
    additionalHourRate: '100',
    depositRequired: true,
    autoReply: true,
  });

  return (
    <div className="p-6 sm:p-8 lg:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 mb-1">Settings</h1>
        <p className="text-stone-400 text-sm">Manage your studio preferences and business info.</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Business Info */}
        <div className="bg-white border border-stone-200/80 rounded-xl p-6 shadow-sm">
          <h2 className="text-stone-900 font-semibold text-sm mb-4">Business Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-stone-400 text-xs mb-1.5">Business Name</label>
              <input
                type="text"
                value={settings.businessName}
                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 text-sm focus:outline-none focus:border-stone-300"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-stone-400 text-xs mb-1.5">Phone</label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 text-sm focus:outline-none focus:border-stone-300"
                />
              </div>
              <div>
                <label className="block text-stone-400 text-xs mb-1.5">Email</label>
                <input
                  type="text"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 text-sm focus:outline-none focus:border-stone-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-stone-400 text-xs mb-1.5">Location</label>
              <input
                type="text"
                value={settings.location}
                onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 text-sm focus:outline-none focus:border-stone-300"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white border border-stone-200/80 rounded-xl p-6 shadow-sm">
          <h2 className="text-stone-900 font-semibold text-sm mb-4">Pricing Defaults</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-400 text-xs mb-1.5">Coverage Radius (km)</label>
              <input
                type="number"
                value={settings.coverageRadius}
                onChange={(e) => setSettings({ ...settings, coverageRadius: e.target.value })}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 text-sm focus:outline-none focus:border-stone-300"
              />
            </div>
            <div>
              <label className="block text-stone-400 text-xs mb-1.5">Additional Hour Rate (RM)</label>
              <input
                type="number"
                value={settings.additionalHourRate}
                onChange={(e) => setSettings({ ...settings, additionalHourRate: e.target.value })}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 text-sm focus:outline-none focus:border-stone-300"
              />
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="bg-white border border-stone-200/80 rounded-xl p-6 shadow-sm">
          <h2 className="text-stone-900 font-semibold text-sm mb-4">Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-stone-900 text-sm">Require deposit</p>
                <p className="text-stone-400 text-xs mt-0.5">Require non-refundable deposit to confirm booking</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, depositRequired: !settings.depositRequired })}
                className={`w-10 h-6 rounded-full transition-all ${settings.depositRequired ? 'bg-[#d4af37]' : 'bg-stone-200'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform mx-1 ${settings.depositRequired ? 'translate-x-4' : ''}`}></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-stone-900 text-sm">WhatsApp auto-reply</p>
                <p className="text-stone-400 text-xs mt-0.5">Send automatic acknowledgment to new inquiries</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, autoReply: !settings.autoReply })}
                className={`w-10 h-6 rounded-full transition-all ${settings.autoReply ? 'bg-[#d4af37]' : 'bg-stone-200'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform mx-1 ${settings.autoReply ? 'translate-x-4' : ''}`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Save */}
        <button className="px-6 py-3 bg-[#d4af37] text-black font-semibold text-sm rounded-lg hover:bg-[#d4af37]/90 transition-all">
          Save Settings
        </button>
      </div>
    </div>
  );
}

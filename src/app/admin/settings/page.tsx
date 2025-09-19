'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    businessName: 'CAPTURA',
    businessPhone: '0177464121',
    businessEmail: 'info@captura.my',
    businessAddress: 'Caltex Selayang Pandang, Selangor',
    whatsappNumber: '0177464121',
    defaultDepositPercentage: 30,
    lateFeePerDay: 10,
    maxRentalDays: 30,
    autoConfirmBookings: false,
    emailNotifications: true,
    smsNotifications: false,
    reminderDaysBefore: 1,
    currency: 'RM',
    timezone: 'Asia/Kuala_Lumpur',
    workingHours: {
      start: '09:00',
      end: '18:00'
    },
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  });

  const [activeTab, setActiveTab] = useState('business');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('Settings saved successfully!');
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateWorkingHours = (key: 'start' | 'end', value: string) => {
    setSettings(prev => ({
      ...prev,
      workingHours: { ...prev.workingHours, [key]: value }
    }));
  };

  const toggleWorkingDay = (day: string) => {
    setSettings(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day]
    }));
  };

  const tabs = [
    { id: 'business', name: 'Business Info', icon: '🏢' },
    { id: 'booking', name: 'Booking Settings', icon: '📅' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'schedule', name: 'Schedule', icon: '⏰' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-blue-100 text-lg">Configure your business preferences and system settings</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-colors backdrop-blur-sm disabled:opacity-50"
          >
            {isSaving ? '💾 Saving...' : '💾 Save Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Business Info Tab */}
          {activeTab === 'business' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900">Business Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                  <input
                    type="text"
                    value={settings.businessName}
                    onChange={(e) => updateSetting('businessName', e.target.value)}
                    placeholder="Enter business name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder:text-gray-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Phone</label>
                  <input
                    type="tel"
                    value={settings.businessPhone}
                    onChange={(e) => updateSetting('businessPhone', e.target.value)}
                    placeholder="e.g., +60123456789"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder:text-gray-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Email</label>
                  <input
                    type="email"
                    value={settings.businessEmail}
                    onChange={(e) => updateSetting('businessEmail', e.target.value)}
                    placeholder="business@example.com"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder:text-gray-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                  <input
                    type="tel"
                    value={settings.whatsappNumber}
                    onChange={(e) => updateSetting('whatsappNumber', e.target.value)}
                    placeholder="e.g., 60177464121"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder:text-gray-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
                  <textarea
                    value={settings.businessAddress}
                    onChange={(e) => updateSetting('businessAddress', e.target.value)}
                    rows={3}
                    placeholder="Enter your business address"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder:text-gray-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Booking Settings Tab */}
          {activeTab === 'booking' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900">Booking Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Deposit (%)</label>
                  <input
                    type="number"
                    value={settings.defaultDepositPercentage}
                    onChange={(e) => updateSetting('defaultDepositPercentage', Number(e.target.value))}
                    placeholder="e.g., 30"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder:text-gray-500"
                    min="0"
                    max="100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Late Fee per Day (RM)</label>
                  <input
                    type="number"
                    value={settings.lateFeePerDay}
                    onChange={(e) => updateSetting('lateFeePerDay', Number(e.target.value))}
                    placeholder="e.g., 10"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder:text-gray-500"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Rental Days</label>
                  <input
                    type="number"
                    value={settings.maxRentalDays}
                    onChange={(e) => updateSetting('maxRentalDays', Number(e.target.value))}
                    placeholder="e.g., 30"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder:text-gray-500"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => updateSetting('currency', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="RM">RM (Malaysian Ringgit)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="SGD">SGD (Singapore Dollar)</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoConfirm"
                  checked={settings.autoConfirmBookings}
                  onChange={(e) => updateSetting('autoConfirmBookings', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="autoConfirm" className="ml-2 block text-sm text-gray-900">
                  Auto-confirm bookings when deposit is paid
                </label>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900">Notification Preferences</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                    <p className="text-sm text-gray-500">Receive booking updates via email</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
                    <p className="text-sm text-gray-500">Receive booking updates via SMS</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.smsNotifications}
                    onChange={(e) => updateSetting('smsNotifications', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Send reminders (days before pickup)
                  </label>
                  <input
                    type="number"
                    value={settings.reminderDaysBefore}
                    onChange={(e) => updateSetting('reminderDaysBefore', Number(e.target.value))}
                    placeholder="1"
                    className="w-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder:text-gray-500"
                    min="0"
                    max="7"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900">Business Schedule</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Opening Time</label>
                  <input
                    type="time"
                    value={settings.workingHours.start}
                    onChange={(e) => updateWorkingHours('start', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder:text-gray-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Closing Time</label>
                  <input
                    type="time"
                    value={settings.workingHours.end}
                    onChange={(e) => updateWorkingHours('end', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder:text-gray-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Working Days</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                    <label key={day} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.workingDays.includes(day)}
                        onChange={() => toggleWorkingDay(day)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-900 capitalize">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => updateSetting('timezone', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="Asia/Kuala_Lumpur">Asia/Kuala_Lumpur (GMT+8)</option>
                  <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
                  <option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SystemSettings() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [settings, setSettings] = useState({
    // Booking Configuration
    defaultDepositPercentage: 30,
    lateFeePerDay: 10,
    maxRentalDays: 30,
    minRentalDays: 1,
    autoConfirmBookings: false,
    requireApproval: true,
    allowSameDayPickup: true,
    advanceBookingDays: 90,
    
    // Working Schedule
    workingHours: {
      start: '09:00',
      end: '18:00'
    },
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    
    // Payment Settings
    acceptCash: true,
    acceptCard: true,
    acceptOnlineTransfer: true,
    requireDepositToConfirm: true,
  });

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
    
    // Load saved settings
    const savedSettings = localStorage.getItem('systemSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('systemSettings', JSON.stringify(settings));
      await new Promise(resolve => setTimeout(resolve, 800));
      
      showSuccessToast('System settings saved!');
    } catch (error) {
      showSuccessToast('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
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

  const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`relative w-12 h-7 rounded-full transition-all duration-300 flex-shrink-0 ${
        enabled 
          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md shadow-blue-500/30' 
          : isDarkMode ? 'bg-slate-700' : 'bg-slate-300'
      }`}
    >
      <div 
        className={`absolute w-5 h-5 bg-white rounded-full top-1 transition-all duration-300 shadow-sm ${
          enabled ? 'left-6' : 'left-1'
        }`}
        style={{
          transform: enabled ? 'scale(1.05)' : 'scale(1)'
        }}
      ></div>
    </button>
  );

  return (
    <>
      {/* Animated Toast Notification */}
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slideDown">
          <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-3 min-w-[300px]`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {toastMessage}
            </p>
          </div>
        </div>
      )}

      <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'} pb-24`}>
        {/* Header */}
        <div className={`sticky top-0 z-40 ${isDarkMode ? 'bg-slate-950' : 'bg-white'} border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className={`w-10 h-10 rounded-xl ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'} flex items-center justify-center transition-all duration-200 active:scale-95`}
              >
                <svg className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                System Settings
              </h1>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 shadow-md disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pt-6 space-y-4">
          {/* Booking Configuration */}
          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl border shadow-sm overflow-hidden animate-fadeIn`}>
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Booking Configuration
              </h3>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                Configure how bookings work in your system
              </p>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} mb-2 block`}>
                    Default Deposit (%)
                  </label>
                  <input
                    type="number"
                    value={settings.defaultDepositPercentage}
                    onChange={(e) => updateSetting('defaultDepositPercentage', Number(e.target.value))}
                    min="0"
                    max="100"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-slate-200 text-slate-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                  />
                </div>

                <div>
                  <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} mb-2 block`}>
                    Late Fee (RM/Day)
                  </label>
                  <input
                    type="number"
                    value={settings.lateFeePerDay}
                    onChange={(e) => updateSetting('lateFeePerDay', Number(e.target.value))}
                    min="0"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-slate-200 text-slate-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                  />
                </div>

                <div>
                  <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} mb-2 block`}>
                    Min Rental Days
                  </label>
                  <input
                    type="number"
                    value={settings.minRentalDays}
                    onChange={(e) => updateSetting('minRentalDays', Number(e.target.value))}
                    min="1"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-slate-200 text-slate-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                  />
                </div>

                <div>
                  <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} mb-2 block`}>
                    Max Rental Days
                  </label>
                  <input
                    type="number"
                    value={settings.maxRentalDays}
                    onChange={(e) => updateSetting('maxRentalDays', Number(e.target.value))}
                    min="1"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-slate-200 text-slate-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                  />
                </div>
              </div>

              <div>
                <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} mb-2 block`}>
                  Advance Booking Period (Days)
                </label>
                <input
                  type="number"
                  value={settings.advanceBookingDays}
                  onChange={(e) => updateSetting('advanceBookingDays', Number(e.target.value))}
                  min="1"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDarkMode 
                      ? 'bg-slate-800 border-slate-700 text-white' 
                      : 'bg-white border-slate-200 text-slate-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                />
                <p className={`text-xs mt-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                  How far in advance customers can book equipment
                </p>
              </div>
            </div>
          </div>

          {/* Booking Rules */}
          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl border shadow-sm overflow-hidden animate-fadeIn`} style={{ animationDelay: '100ms' }}>
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Booking Rules
              </h3>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                Automated booking behavior
              </p>
            </div>
            <div className="px-6 py-3 divide-y divide-slate-200 dark:divide-slate-800">
              <div className="flex items-center justify-between py-3">
                <div className="flex-1 pr-4">
                  <p className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Auto-Confirm Bookings
                  </p>
                  <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                    Automatically approve when deposit is paid
                  </p>
                </div>
                <ToggleSwitch 
                  enabled={settings.autoConfirmBookings}
                  onToggle={() => updateSetting('autoConfirmBookings', !settings.autoConfirmBookings)}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex-1 pr-4">
                  <p className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Require Manual Approval
                  </p>
                  <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                    Admin must approve each booking
                  </p>
                </div>
                <ToggleSwitch 
                  enabled={settings.requireApproval}
                  onToggle={() => updateSetting('requireApproval', !settings.requireApproval)}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex-1 pr-4">
                  <p className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Allow Same-Day Pickup
                  </p>
                  <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                    Customer can pick up equipment today
                  </p>
                </div>
                <ToggleSwitch 
                  enabled={settings.allowSameDayPickup}
                  onToggle={() => updateSetting('allowSameDayPickup', !settings.allowSameDayPickup)}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex-1 pr-4">
                  <p className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Require Deposit to Confirm
                  </p>
                  <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                    Booking not confirmed until deposit paid
                  </p>
                </div>
                <ToggleSwitch 
                  enabled={settings.requireDepositToConfirm}
                  onToggle={() => updateSetting('requireDepositToConfirm', !settings.requireDepositToConfirm)}
                />
              </div>
            </div>
          </div>

          {/* Working Schedule */}
          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl border shadow-sm overflow-hidden animate-fadeIn`} style={{ animationDelay: '200ms' }}>
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Working Schedule
              </h3>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                Set your business operating hours
              </p>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} mb-2 block`}>
                    Opening Time
                  </label>
                  <input
                    type="time"
                    value={settings.workingHours.start}
                    onChange={(e) => updateWorkingHours('start', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-slate-200 text-slate-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                  />
                </div>

                <div>
                  <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} mb-2 block`}>
                    Closing Time
                  </label>
                  <input
                    type="time"
                    value={settings.workingHours.end}
                    onChange={(e) => updateWorkingHours('end', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-slate-200 text-slate-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                  />
                </div>
              </div>

              <div>
                <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} mb-3 block`}>
                  Working Days
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                    <label 
                      key={day}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                        settings.workingDays.includes(day)
                          ? isDarkMode
                            ? 'bg-blue-900/30 border-blue-500'
                            : 'bg-blue-50 border-blue-500'
                          : isDarkMode
                            ? 'bg-slate-800 border-slate-700 hover:border-slate-600'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={settings.workingDays.includes(day)}
                        onChange={() => toggleWorkingDay(day)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className={`text-sm font-semibold capitalize ${
                        settings.workingDays.includes(day)
                          ? 'text-blue-500'
                          : isDarkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        {day.slice(0, 3)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl border shadow-sm overflow-hidden animate-fadeIn`} style={{ animationDelay: '300ms' }}>
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Payment Methods
              </h3>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                Accepted payment options
              </p>
            </div>
            <div className="px-6 py-3 divide-y divide-slate-200 dark:divide-slate-800">
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} flex items-center justify-center`}>
                    💵
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Cash Payment
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                      Accept cash on pickup/return
                    </p>
                  </div>
                </div>
                <ToggleSwitch 
                  enabled={settings.acceptCash}
                  onToggle={() => updateSetting('acceptCash', !settings.acceptCash)}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} flex items-center justify-center`}>
                    💳
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Card Payment
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                      Accept credit/debit cards
                    </p>
                  </div>
                </div>
                <ToggleSwitch 
                  enabled={settings.acceptCard}
                  onToggle={() => updateSetting('acceptCard', !settings.acceptCard)}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} flex items-center justify-center`}>
                    🏦
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Online Transfer
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                      Accept bank transfers
                    </p>
                  </div>
                </div>
                <ToggleSwitch 
                  enabled={settings.acceptOnlineTransfer}
                  onToggle={() => updateSetting('acceptOnlineTransfer', !settings.acceptOnlineTransfer)}
                />
              </div>
            </div>
          </div>

          {/* Save Button (Bottom) */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-lg disabled:opacity-50 animate-fadeIn"
            style={{ animationDelay: '400ms' }}
          >
            {isSaving ? 'Saving Settings...' : 'Save All Settings'}
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotificationSettings() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    whatsappNotifications: true,
    
    // Booking Notifications
    newBooking: true,
    bookingConfirmed: true,
    bookingCancelled: true,
    depositPaid: true,
    finalPaymentPaid: true,
    
    // Pickup & Return Notifications
    pickupReminder: true,
    pickupToday: true,
    returnReminder: true,
    returnToday: true,
    overdueReturn: true,
    
    // Equipment Notifications
    equipmentPickedUp: true,
    equipmentReturned: true,
    
    // Reminder Settings
    reminderDaysBefore: 1,
    overdueReminderFrequency: 'daily', // daily, twice-daily, every-6-hours
  });

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
    
    // Load saved settings
    const savedSettings = localStorage.getItem('notificationSettings');
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
      localStorage.setItem('notificationSettings', JSON.stringify(settings));
      await new Promise(resolve => setTimeout(resolve, 800));
      
      showSuccessToast('Notification settings saved!');
    } catch (error) {
      showSuccessToast('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSetting = (key: string) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const ToggleSwitch = ({ enabled, label, sublabel, onToggle }: { enabled: boolean; label: string; sublabel?: string; onToggle: () => void }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 min-w-0 pr-4">
        <p className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          {label}
        </p>
        {sublabel && (
          <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
            {sublabel}
          </p>
        )}
      </div>
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
    </div>
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
                Notifications
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
          {/* Notification Channels */}
          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl border shadow-sm overflow-hidden animate-fadeIn`}>
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Notification Channels
              </h3>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                Choose how you want to receive notifications
              </p>
            </div>
            <div className="px-6 py-2 divide-y divide-slate-200 dark:divide-slate-800">
              <ToggleSwitch 
                enabled={settings.pushNotifications}
                label="Push Notifications"
                sublabel="In-app notifications"
                onToggle={() => toggleSetting('pushNotifications')}
              />
              <ToggleSwitch 
                enabled={settings.emailNotifications}
                label="Email Notifications"
                sublabel="Receive updates via email"
                onToggle={() => toggleSetting('emailNotifications')}
              />
              <ToggleSwitch 
                enabled={settings.smsNotifications}
                label="SMS Notifications"
                sublabel="Text message alerts"
                onToggle={() => toggleSetting('smsNotifications')}
              />
              <ToggleSwitch 
                enabled={settings.whatsappNotifications}
                label="WhatsApp Notifications"
                sublabel="Messages via WhatsApp"
                onToggle={() => toggleSetting('whatsappNotifications')}
              />
            </div>
          </div>

          {/* Booking Notifications */}
          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl border shadow-sm overflow-hidden animate-fadeIn`} style={{ animationDelay: '100ms' }}>
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Booking Alerts
              </h3>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                Get notified about booking activities
              </p>
            </div>
            <div className="px-6 py-2 divide-y divide-slate-200 dark:divide-slate-800">
              <ToggleSwitch 
                enabled={settings.newBooking}
                label="New Booking"
                sublabel="When a new booking is created"
                onToggle={() => toggleSetting('newBooking')}
              />
              <ToggleSwitch 
                enabled={settings.bookingConfirmed}
                label="Booking Confirmed"
                sublabel="When a booking is approved"
                onToggle={() => toggleSetting('bookingConfirmed')}
              />
              <ToggleSwitch 
                enabled={settings.bookingCancelled}
                label="Booking Cancelled"
                sublabel="When a booking is cancelled"
                onToggle={() => toggleSetting('bookingCancelled')}
              />
              <ToggleSwitch 
                enabled={settings.depositPaid}
                label="Deposit Paid"
                sublabel="When deposit is received"
                onToggle={() => toggleSetting('depositPaid')}
              />
              <ToggleSwitch 
                enabled={settings.finalPaymentPaid}
                label="Final Payment Paid"
                sublabel="When final payment is received"
                onToggle={() => toggleSetting('finalPaymentPaid')}
              />
            </div>
          </div>

          {/* Pickup & Return Alerts */}
          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl border shadow-sm overflow-hidden animate-fadeIn`} style={{ animationDelay: '200ms' }}>
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Pickup & Return Alerts
              </h3>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                Reminders for pickups and returns
              </p>
            </div>
            <div className="px-6 py-2 divide-y divide-slate-200 dark:divide-slate-800">
              <ToggleSwitch 
                enabled={settings.pickupReminder}
                label="Pickup Reminder"
                sublabel="Reminder before pickup date"
                onToggle={() => toggleSetting('pickupReminder')}
              />
              <ToggleSwitch 
                enabled={settings.pickupToday}
                label="Pickup Today"
                sublabel="Alert for today's pickups"
                onToggle={() => toggleSetting('pickupToday')}
              />
              <ToggleSwitch 
                enabled={settings.returnReminder}
                label="Return Reminder"
                sublabel="Reminder before return date"
                onToggle={() => toggleSetting('returnReminder')}
              />
              <ToggleSwitch 
                enabled={settings.returnToday}
                label="Return Today"
                sublabel="Alert for today's returns"
                onToggle={() => toggleSetting('returnToday')}
              />
              <ToggleSwitch 
                enabled={settings.overdueReturn}
                label="Overdue Return"
                sublabel="Alert for overdue equipment"
                onToggle={() => toggleSetting('overdueReturn')}
              />
            </div>
          </div>

          {/* Equipment Alerts */}
          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl border shadow-sm overflow-hidden animate-fadeIn`} style={{ animationDelay: '300ms' }}>
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Equipment Alerts
              </h3>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                Track equipment status changes
              </p>
            </div>
            <div className="px-6 py-2 divide-y divide-slate-200 dark:divide-slate-800">
              <ToggleSwitch 
                enabled={settings.equipmentPickedUp}
                label="Equipment Picked Up"
                sublabel="When customer collects equipment"
                onToggle={() => toggleSetting('equipmentPickedUp')}
              />
              <ToggleSwitch 
                enabled={settings.equipmentReturned}
                label="Equipment Returned"
                sublabel="When equipment is returned"
                onToggle={() => toggleSetting('equipmentReturned')}
              />
            </div>
          </div>

          {/* Reminder Settings */}
          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl border shadow-sm overflow-hidden animate-fadeIn`} style={{ animationDelay: '400ms' }}>
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Reminder Timing
              </h3>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                Configure when to send reminders
              </p>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} mb-2 block`}>
                  Send Reminders (Days Before)
                </label>
                <input
                  type="number"
                  value={settings.reminderDaysBefore}
                  onChange={(e) => updateSetting('reminderDaysBefore', Number(e.target.value))}
                  min="0"
                  max="7"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDarkMode 
                      ? 'bg-slate-800 border-slate-700 text-white' 
                      : 'bg-white border-slate-200 text-slate-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                />
                <p className={`text-xs mt-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                  Send pickup/return reminders {settings.reminderDaysBefore} {settings.reminderDaysBefore === 1 ? 'day' : 'days'} before
                </p>
              </div>

              <div>
                <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} mb-2 block`}>
                  Overdue Reminder Frequency
                </label>
                <select
                  value={settings.overdueReminderFrequency}
                  onChange={(e) => updateSetting('overdueReminderFrequency', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDarkMode 
                      ? 'bg-slate-800 border-slate-700 text-white' 
                      : 'bg-white border-slate-200 text-slate-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                >
                  <option value="daily">Once Daily</option>
                  <option value="twice-daily">Twice Daily (Morning & Evening)</option>
                  <option value="every-6-hours">Every 6 Hours</option>
                </select>
              </div>
            </div>
          </div>

          {/* Save Button (Bottom) */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-lg disabled:opacity-50 animate-fadeIn"
            style={{ animationDelay: '500ms' }}
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


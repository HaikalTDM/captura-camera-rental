'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileSettings() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [profile, setProfile] = useState({
    businessName: 'CAPTURA',
    businessPhone: '0177464121',
    businessEmail: 'captura.my@gmail.com',
    businessAddress: 'Caltex Selayang Pandang, Selangor',
    whatsappNumber: '0177464121',
    timezone: 'Asia/Kuala_Lumpur',
    currency: 'RM',
  });

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
    
    // Load saved profile from localStorage
    const savedProfile = localStorage.getItem('businessProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
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
      // Save to localStorage (in production, this would be an API call)
      localStorage.setItem('businessProfile', JSON.stringify(profile));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showSuccessToast('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      showSuccessToast('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

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
                Profile Settings
              </h1>
            </div>
            {isEditing ? (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 shadow-md disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 ${isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
              >
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pt-6 space-y-4">
          {/* Avatar Section */}
          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl border shadow-sm p-6 animate-fadeIn`}>
            <div className="flex flex-col items-center">
              <div className={`w-24 h-24 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} flex items-center justify-center mb-4`}>
                <span className={`text-4xl font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {profile.businessName.charAt(0)}
                </span>
              </div>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {profile.businessName}
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                Camera Rental Business
              </p>
            </div>
          </div>

          {/* Business Information */}
          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl border shadow-sm overflow-hidden animate-fadeIn`} style={{ animationDelay: '100ms' }}>
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Business Information
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {/* Business Name */}
              <div>
                <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} mb-2 block`}>
                  Business Name
                </label>
                <input
                  type="text"
                  value={profile.businessName}
                  onChange={(e) => updateField('businessName', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDarkMode 
                      ? 'bg-slate-800 border-slate-700 text-white disabled:bg-slate-800/50' 
                      : 'bg-white border-slate-200 text-slate-900 disabled:bg-slate-50'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                />
              </div>

              {/* Business Phone */}
              <div>
                <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} mb-2 block`}>
                  Business Phone
                </label>
                <input
                  type="tel"
                  value={profile.businessPhone}
                  onChange={(e) => updateField('businessPhone', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDarkMode 
                      ? 'bg-slate-800 border-slate-700 text-white disabled:bg-slate-800/50' 
                      : 'bg-white border-slate-200 text-slate-900 disabled:bg-slate-50'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                />
              </div>

              {/* Business Email */}
              <div>
                <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} mb-2 block`}>
                  Business Email
                </label>
                <input
                  type="email"
                  value={profile.businessEmail}
                  onChange={(e) => updateField('businessEmail', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDarkMode 
                      ? 'bg-slate-800 border-slate-700 text-white disabled:bg-slate-800/50' 
                      : 'bg-white border-slate-200 text-slate-900 disabled:bg-slate-50'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                />
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} mb-2 block`}>
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={profile.whatsappNumber}
                  onChange={(e) => updateField('whatsappNumber', e.target.value)}
                  disabled={!isEditing}
                  placeholder="e.g., 60177464121"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDarkMode 
                      ? 'bg-slate-800 border-slate-700 text-white disabled:bg-slate-800/50' 
                      : 'bg-white border-slate-200 text-slate-900 disabled:bg-slate-50'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                />
              </div>

              {/* Business Address */}
              <div>
                <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} mb-2 block`}>
                  Business Address
                </label>
                <textarea
                  value={profile.businessAddress}
                  onChange={(e) => updateField('businessAddress', e.target.value)}
                  disabled={!isEditing}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDarkMode 
                      ? 'bg-slate-800 border-slate-700 text-white disabled:bg-slate-800/50' 
                      : 'bg-white border-slate-200 text-slate-900 disabled:bg-slate-50'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none`}
                />
              </div>
            </div>
          </div>

          {/* Regional Settings */}
          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl border shadow-sm overflow-hidden animate-fadeIn`} style={{ animationDelay: '200ms' }}>
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Regional Settings
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {/* Currency */}
              <div>
                <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} mb-2 block`}>
                  Currency
                </label>
                <select
                  value={profile.currency}
                  onChange={(e) => updateField('currency', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDarkMode 
                      ? 'bg-slate-800 border-slate-700 text-white disabled:bg-slate-800/50' 
                      : 'bg-white border-slate-200 text-slate-900 disabled:bg-slate-50'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                >
                  <option value="RM">RM (Malaysian Ringgit)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="SGD">SGD (Singapore Dollar)</option>
                </select>
              </div>

              {/* Timezone */}
              <div>
                <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} mb-2 block`}>
                  Timezone
                </label>
                <select
                  value={profile.timezone}
                  onChange={(e) => updateField('timezone', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDarkMode 
                      ? 'bg-slate-800 border-slate-700 text-white disabled:bg-slate-800/50' 
                      : 'bg-white border-slate-200 text-slate-900 disabled:bg-slate-50'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                >
                  <option value="Asia/Kuala_Lumpur">Asia/Kuala_Lumpur (GMT+8)</option>
                  <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
                  <option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</option>
                </select>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-3 animate-fadeIn">
              <button
                onClick={() => {
                  setIsEditing(false);
                  // Reload profile from localStorage
                  const savedProfile = localStorage.getItem('businessProfile');
                  if (savedProfile) {
                    setProfile(JSON.parse(savedProfile));
                  }
                }}
                className={`flex-1 py-4 rounded-xl font-bold transition-all duration-200 active:scale-95 ${isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-lg disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
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


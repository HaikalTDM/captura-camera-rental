'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Calendar,
  Bell,
  Clock,
  Save,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  DollarSign,
  Settings as SettingsIcon,
  CheckCircle2
} from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    businessName: 'CAPTURA',
    businessPhone: '0177464121',
    businessEmail: 'captura.my@gmail.com',
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
    { id: 'business', name: 'Business Info', icon: Building2 },
    { id: 'booking', name: 'Booking Settings', icon: Calendar },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'schedule', name: 'Schedule', icon: Clock },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-xl border border-slate-700">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
              <SettingsIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-1">Settings</h1>
              <p className="text-slate-300 text-lg">Configure your business preferences and system settings</p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm disabled:opacity-50 px-6 py-6 text-base font-semibold shadow-lg"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card className="border-slate-200 shadow-sm">
        <div className="border-b border-slate-200">
          <nav className="flex flex-wrap gap-2 px-6 py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-4 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <CardContent className="p-6">
          {/* Business Info Tab */}
          {activeTab === 'business' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                <Building2 className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Business Information</h3>
                  <p className="text-sm text-slate-600">Manage your business contact details</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Building2 className="w-4 h-4 text-slate-500" />
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={settings.businessName}
                    onChange={(e) => updateSetting('businessName', e.target.value)}
                    placeholder="Enter business name"
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 bg-white placeholder:text-slate-400 font-medium"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Phone className="w-4 h-4 text-slate-500" />
                    Business Phone
                  </label>
                  <input
                    type="tel"
                    value={settings.businessPhone}
                    onChange={(e) => updateSetting('businessPhone', e.target.value)}
                    placeholder="e.g., +60177464121"
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 bg-white placeholder:text-slate-400 font-medium"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Mail className="w-4 h-4 text-slate-500" />
                    Business Email
                  </label>
                  <input
                    type="email"
                    value={settings.businessEmail}
                    onChange={(e) => updateSetting('businessEmail', e.target.value)}
                    placeholder="business@example.com"
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 bg-white placeholder:text-slate-400 font-medium"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <MessageSquare className="w-4 h-4 text-green-600" />
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={settings.whatsappNumber}
                    onChange={(e) => updateSetting('whatsappNumber', e.target.value)}
                    placeholder="e.g., 60177464121"
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 bg-white placeholder:text-slate-400 font-medium"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    Business Address
                  </label>
                  <textarea
                    value={settings.businessAddress}
                    onChange={(e) => updateSetting('businessAddress', e.target.value)}
                    rows={3}
                    placeholder="Enter your business address"
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 bg-white placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Booking Settings Tab */}
          {activeTab === 'booking' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                <Calendar className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Booking Configuration</h3>
                  <p className="text-sm text-slate-600">Set up your rental policies and pricing</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    Default Deposit (%)
                  </label>
                  <input
                    type="number"
                    value={settings.defaultDepositPercentage}
                    onChange={(e) => updateSetting('defaultDepositPercentage', Number(e.target.value))}
                    placeholder="e.g., 30"
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 bg-white placeholder:text-slate-400 font-bold text-lg"
                    min="0"
                    max="100"
                  />
                  <p className="text-xs text-slate-500 mt-2">Percentage of total amount required as deposit</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Late Fee per Day (RM)
                  </label>
                  <input
                    type="number"
                    value={settings.lateFeePerDay}
                    onChange={(e) => updateSetting('lateFeePerDay', Number(e.target.value))}
                    placeholder="e.g., 10"
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 bg-white placeholder:text-slate-400 font-bold text-lg"
                    min="0"
                  />
                  <p className="text-xs text-slate-500 mt-2">Charge for each day equipment is returned late</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Maximum Rental Days
                  </label>
                  <input
                    type="number"
                    value={settings.maxRentalDays}
                    onChange={(e) => updateSetting('maxRentalDays', Number(e.target.value))}
                    placeholder="e.g., 30"
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 bg-white placeholder:text-slate-400 font-bold text-lg"
                    min="1"
                  />
                  <p className="text-xs text-slate-500 mt-2">Maximum number of days for a single rental</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    Currency
                  </label>
                  <select
                    value={settings.currency}
                    onChange={(e) => updateSetting('currency', e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 bg-white font-bold text-lg"
                  >
                    <option value="RM">RM (Malaysian Ringgit)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="SGD">SGD (Singapore Dollar)</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-2">Default currency for all transactions</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    id="autoConfirm"
                    checked={settings.autoConfirmBookings}
                    onChange={(e) => updateSetting('autoConfirmBookings', e.target.checked)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-slate-900">Auto-confirm bookings when deposit is paid</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">Automatically approve bookings once the deposit payment is received</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                <Bell className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Notification Preferences</h3>
                  <p className="text-sm text-slate-600">Manage how you receive booking updates</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${settings.emailNotifications ? 'bg-green-100' : 'bg-slate-200'}`}>
                      <Mail className={`w-6 h-6 ${settings.emailNotifications ? 'text-green-600' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Email Notifications</h4>
                      <p className="text-sm text-slate-600">Receive booking updates via email</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                    className="h-6 w-6 text-blue-600 focus:ring-blue-500 border-slate-300 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${settings.smsNotifications ? 'bg-green-100' : 'bg-slate-200'}`}>
                      <MessageSquare className={`w-6 h-6 ${settings.smsNotifications ? 'text-green-600' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">SMS Notifications</h4>
                      <p className="text-sm text-slate-600">Receive booking updates via SMS</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.smsNotifications}
                    onChange={(e) => updateSetting('smsNotifications', e.target.checked)}
                    className="h-6 w-6 text-blue-600 focus:ring-blue-500 border-slate-300 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                    <Bell className="w-5 h-5 text-blue-600" />
                    Send reminders (days before pickup)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={settings.reminderDaysBefore}
                      onChange={(e) => updateSetting('reminderDaysBefore', Number(e.target.value))}
                      placeholder="1"
                      className="w-24 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 bg-white placeholder:text-slate-400 font-bold text-lg text-center"
                      min="0"
                      max="7"
                    />
                    <span className="text-slate-600 font-medium">days before pickup date</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-3">Customers will receive a reminder notification before their rental starts</p>
                </div>
              </div>
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                <Clock className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Business Schedule</h3>
                  <p className="text-sm text-slate-600">Set your operating hours and working days</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                    <Clock className="w-4 h-4 text-green-600" />
                    Opening Time
                  </label>
                  <input
                    type="time"
                    value={settings.workingHours.start}
                    onChange={(e) => updateWorkingHours('start', e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 bg-white font-bold text-lg"
                  />
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                    <Clock className="w-4 h-4 text-red-600" />
                    Closing Time
                  </label>
                  <input
                    type="time"
                    value={settings.workingHours.end}
                    onChange={(e) => updateWorkingHours('end', e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 bg-white font-bold text-lg"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Working Days
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                    <label key={day} className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all ${
                      settings.workingDays.includes(day)
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                    }`}>
                      <input
                        type="checkbox"
                        checked={settings.workingDays.includes(day)}
                        onChange={() => toggleWorkingDay(day)}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
                      />
                      <span className="font-semibold capitalize">{day}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-slate-600 mt-4">Select the days your business is open for rentals</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <MapPin className="w-4 h-4 text-purple-600" />
                  Timezone
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) => updateSetting('timezone', e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 bg-white font-bold text-lg"
                >
                  <option value="Asia/Kuala_Lumpur">Asia/Kuala_Lumpur (GMT+8)</option>
                  <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
                  <option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</option>
                </select>
                <p className="text-xs text-slate-500 mt-2">Your local timezone for bookings and notifications</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Bell,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Save,
  Settings as SettingsIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/useIsMobile';
import MobileSettings from '@/components/admin/MobileSettings';
import { AnimatedToastContainer, useAnimatedToast } from '@/components/ui/animated-toast';

type SettingsTab = 'business' | 'booking' | 'notifications' | 'schedule';

export default function SettingsPage() {
  const isMobile = useIsMobile(768);
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
      end: '18:00',
    },
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
  });

  const [activeTab, setActiveTab] = useState<SettingsTab>('business');
  const [isSaving, setIsSaving] = useState(false);
  const { toasts, success, error, removeToast } = useAnimatedToast();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      success('Settings saved', 'Your admin preferences were updated in this session.');
    } catch {
      error('Save failed', 'Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateWorkingHours = (key: 'start' | 'end', value: string) => {
    setSettings((prev) => ({
      ...prev,
      workingHours: { ...prev.workingHours, [key]: value },
    }));
  };

  const toggleWorkingDay = (day: string) => {
    setSettings((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((item) => item !== day)
        : [...prev.workingDays, day],
    }));
  };

  const tabs: Array<{ id: SettingsTab; name: string; icon: typeof Building2 }> = [
    { id: 'business', name: 'Business Info', icon: Building2 },
    { id: 'booking', name: 'Booking Settings', icon: Calendar },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'schedule', name: 'Schedule', icon: Clock },
  ];

  if (isMobile) {
    return (
      <MobileSettings
        settings={settings}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSaving={isSaving}
        handleSave={handleSave}
        updateSetting={updateSetting}
        updateWorkingHours={updateWorkingHours}
        toggleWorkingDay={toggleWorkingDay}
      />
    );
  }

  return (
    <>
      <AnimatedToastContainer toasts={toasts} onClose={removeToast} />
      <div className="space-y-6 px-2 pb-8 xl:px-0">
        <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_340px]"
      >
        <Card className="rounded-[30px] border border-[#2d2722] bg-[radial-gradient(circle_at_top,_rgba(201,107,44,0.12),_transparent_42%),linear-gradient(180deg,#1c1713_0%,#141210_100%)] shadow-[0_30px_80px_rgba(0,0,0,0.34)]">
          <CardContent className="p-6 md:p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#43372d] bg-[#1d1814] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-300">
                  <SettingsIcon className="h-3.5 w-3.5 text-orange-300" />
                  Control center
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-tight text-stone-50">Settings</h1>
                  <p className="max-w-2xl text-sm leading-6 text-stone-400">
                    Configure business identity, rental rules, notifications, and operating hours from one cleaner admin panel.
                  </p>
                </div>
              </div>

              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="h-11 rounded-2xl bg-[#c96b2c] px-5 text-black hover:bg-[#d97a39] disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-[#2f2924] bg-[#171411] p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Business</p>
                <p className="mt-3 text-2xl font-semibold text-stone-50">{settings.businessName}</p>
                <p className="mt-2 text-sm text-stone-400">Primary identity used across invoices, agreements, and admin communication.</p>
              </div>
              <div className="rounded-2xl border border-[#2f2924] bg-[#171411] p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Default Deposit</p>
                <p className="mt-3 text-3xl font-semibold text-stone-50">{settings.defaultDepositPercentage}%</p>
                <p className="mt-2 text-sm text-stone-400">Base deposit policy currently applied to rental flow decisions.</p>
              </div>
              <div className="rounded-2xl border border-[#3f3125] bg-[#241b14] p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Timezone</p>
                <p className="mt-3 text-2xl font-semibold text-stone-50">{settings.timezone}</p>
                <p className="mt-2 text-sm text-stone-400">System clock used for scheduling, reminders, and booking operations.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[30px] border border-[#2d2722] bg-[#171411] shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
          <CardHeader className="border-b border-[#26211d] pb-4">
            <CardTitle className="text-lg text-stone-50">Settings Notes</CardTitle>
            <CardDescription className="text-stone-400">
              A quick read before changing global behavior.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            <div className="rounded-2xl border border-[#2c2621] bg-[#1d1a17] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Current mode</p>
              <p className="mt-2 text-sm leading-6 text-stone-300">
                These settings currently behave like a local admin control surface, so changes affect the active app state here first.
              </p>
            </div>
            <div className="rounded-2xl border border-[#2c2621] bg-[#1d1a17] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Reminder</p>
              <p className="mt-2 text-sm leading-6 text-stone-300">
                Save after editing grouped fields so booking rules, notifications, and branding stay in sync across the admin.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Card className="rounded-[28px] border border-[#2c2722] bg-[#171411] shadow-[0_24px_55px_rgba(0,0,0,0.28)]">
        <div className="border-b border-[#26211d] px-5 py-3">
          <nav className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                    activeTab === tab.id
                      ? 'border border-[#c96b2c] bg-[#2a1f16] text-orange-200'
                      : 'border border-transparent bg-transparent text-stone-400 hover:border-[#3a3129] hover:bg-[#1d1814] hover:text-stone-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <CardContent className="p-6">
          {activeTab === 'business' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-[#26211d] pb-4">
                <Building2 className="h-6 w-6 text-orange-300" />
                <div>
                  <h3 className="text-xl font-semibold text-stone-50">Business Information</h3>
                  <p className="text-sm text-stone-400">Manage your business contact details and public identity.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-stone-300">
                    <Building2 className="h-4 w-4 text-stone-500" />
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={settings.businessName}
                    onChange={(e) => updateSetting('businessName', e.target.value)}
                    className="admin-dark-input"
                    placeholder="Enter business name"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-stone-300">
                    <Phone className="h-4 w-4 text-stone-500" />
                    Business Phone
                  </label>
                  <input
                    type="tel"
                    value={settings.businessPhone}
                    onChange={(e) => updateSetting('businessPhone', e.target.value)}
                    className="admin-dark-input"
                    placeholder="e.g., +60177464121"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-stone-300">
                    <Mail className="h-4 w-4 text-stone-500" />
                    Business Email
                  </label>
                  <input
                    type="email"
                    value={settings.businessEmail}
                    onChange={(e) => updateSetting('businessEmail', e.target.value)}
                    className="admin-dark-input"
                    placeholder="business@example.com"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-stone-300">
                    <MessageSquare className="h-4 w-4 text-orange-300" />
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={settings.whatsappNumber}
                    onChange={(e) => updateSetting('whatsappNumber', e.target.value)}
                    className="admin-dark-input"
                    placeholder="e.g., 60177464121"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-stone-300">
                    <MapPin className="h-4 w-4 text-stone-500" />
                    Business Address
                  </label>
                  <textarea
                    value={settings.businessAddress}
                    onChange={(e) => updateSetting('businessAddress', e.target.value)}
                    rows={3}
                    className="admin-dark-textarea"
                    placeholder="Enter your business address"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'booking' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-[#26211d] pb-4">
                <Calendar className="h-6 w-6 text-orange-300" />
                <div>
                  <h3 className="text-xl font-semibold text-stone-50">Booking Configuration</h3>
                  <p className="text-sm text-stone-400">Set your rental rules, fees, and transaction defaults.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-[#2b2520] bg-[#13110f] p-4">
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-stone-300">
                    <DollarSign className="h-4 w-4 text-emerald-300" />
                    Default Deposit (%)
                  </label>
                  <input
                    type="number"
                    value={settings.defaultDepositPercentage}
                    onChange={(e) => updateSetting('defaultDepositPercentage', Number(e.target.value))}
                    min="0"
                    max="100"
                    className="admin-dark-input text-lg font-semibold"
                  />
                  <p className="mt-2 text-xs text-stone-500">Percentage of the total amount required as deposit.</p>
                </div>

                <div className="rounded-2xl border border-[#2b2520] bg-[#13110f] p-4">
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-stone-300">
                    <AlertTriangle className="h-4 w-4 text-rose-300" />
                    Late Fee per Day (RM)
                  </label>
                  <input
                    type="number"
                    value={settings.lateFeePerDay}
                    onChange={(e) => updateSetting('lateFeePerDay', Number(e.target.value))}
                    min="0"
                    className="admin-dark-input text-lg font-semibold"
                  />
                  <p className="mt-2 text-xs text-stone-500">Charge for each day equipment is returned late.</p>
                </div>

                <div className="rounded-2xl border border-[#2b2520] bg-[#13110f] p-4">
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-stone-300">
                    <Calendar className="h-4 w-4 text-orange-300" />
                    Maximum Rental Days
                  </label>
                  <input
                    type="number"
                    value={settings.maxRentalDays}
                    onChange={(e) => updateSetting('maxRentalDays', Number(e.target.value))}
                    min="1"
                    className="admin-dark-input text-lg font-semibold"
                  />
                  <p className="mt-2 text-xs text-stone-500">Maximum number of days for a single rental.</p>
                </div>

                <div className="rounded-2xl border border-[#2b2520] bg-[#13110f] p-4">
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-stone-300">
                    <DollarSign className="h-4 w-4 text-emerald-300" />
                    Currency
                  </label>
                  <select
                    value={settings.currency}
                    onChange={(e) => updateSetting('currency', e.target.value)}
                    className="admin-dark-select text-lg font-semibold"
                  >
                    <option value="RM">RM (Malaysian Ringgit)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="SGD">SGD (Singapore Dollar)</option>
                  </select>
                  <p className="mt-2 text-xs text-stone-500">Default currency for all transactions.</p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#31414f] bg-[#1b232b] p-5">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={settings.autoConfirmBookings}
                    onChange={(e) => updateSetting('autoConfirmBookings', e.target.checked)}
                    className="mt-1 h-5 w-5 rounded border-[#4b4137] bg-[#11100f] text-[#c96b2c] focus:ring-[#c96b2c]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-sky-300" />
                      <span className="font-semibold text-stone-100">Auto-confirm bookings when deposit is paid</span>
                    </div>
                    <p className="mt-1 text-sm text-stone-400">
                      Automatically approve bookings once the deposit payment is received.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-[#26211d] pb-4">
                <Bell className="h-6 w-6 text-orange-300" />
                <div>
                  <h3 className="text-xl font-semibold text-stone-50">Notification Preferences</h3>
                  <p className="text-sm text-stone-400">Manage how you receive booking updates and reminders.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-2xl border border-[#2b2520] bg-[#13110f] p-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${settings.emailNotifications ? 'bg-[#1f2b20]' : 'bg-[#221f1b]'}`}>
                      <Mail className={`h-6 w-6 ${settings.emailNotifications ? 'text-emerald-300' : 'text-stone-500'}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-stone-100">Email Notifications</h4>
                      <p className="text-sm text-stone-400">Receive booking updates via email.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                    className="h-6 w-6 rounded border-[#4b4137] bg-[#11100f] text-[#c96b2c] focus:ring-[#c96b2c]"
                  />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[#2b2520] bg-[#13110f] p-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${settings.smsNotifications ? 'bg-[#1f2b20]' : 'bg-[#221f1b]'}`}>
                      <MessageSquare className={`h-6 w-6 ${settings.smsNotifications ? 'text-emerald-300' : 'text-stone-500'}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-stone-100">SMS Notifications</h4>
                      <p className="text-sm text-stone-400">Receive booking updates via SMS.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.smsNotifications}
                    onChange={(e) => updateSetting('smsNotifications', e.target.checked)}
                    className="h-6 w-6 rounded border-[#4b4137] bg-[#11100f] text-[#c96b2c] focus:ring-[#c96b2c]"
                  />
                </div>

                <div className="rounded-2xl border border-[#31414f] bg-[#1b232b] p-5">
                  <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-300">
                    <Bell className="h-5 w-5 text-sky-300" />
                    Send reminders (days before pickup)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={settings.reminderDaysBefore}
                      onChange={(e) => updateSetting('reminderDaysBefore', Number(e.target.value))}
                      min="0"
                      max="7"
                      className="admin-dark-input w-24 text-center text-lg font-semibold"
                    />
                    <span className="text-stone-400">days before pickup date</span>
                  </div>
                  <p className="mt-3 text-xs text-stone-500">
                    Customers will receive a reminder notification before their rental starts.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-[#26211d] pb-4">
                <Clock className="h-6 w-6 text-orange-300" />
                <div>
                  <h3 className="text-xl font-semibold text-stone-50">Business Schedule</h3>
                  <p className="text-sm text-stone-400">Set your operating hours and working days.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-[#2b2520] bg-[#13110f] p-4">
                  <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-300">
                    <Clock className="h-4 w-4 text-emerald-300" />
                    Opening Time
                  </label>
                  <input
                    type="time"
                    value={settings.workingHours.start}
                    onChange={(e) => updateWorkingHours('start', e.target.value)}
                    className="admin-dark-input text-lg font-semibold"
                  />
                </div>

                <div className="rounded-2xl border border-[#2b2520] bg-[#13110f] p-4">
                  <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-300">
                    <Clock className="h-4 w-4 text-rose-300" />
                    Closing Time
                  </label>
                  <input
                    type="time"
                    value={settings.workingHours.end}
                    onChange={(e) => updateWorkingHours('end', e.target.value)}
                    className="admin-dark-input text-lg font-semibold"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-[#31414f] bg-[#1b232b] p-5">
                <label className="mb-4 flex items-center gap-2 text-sm font-semibold text-stone-300">
                  <Calendar className="h-5 w-5 text-sky-300" />
                  Working Days
                </label>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                    <label
                      key={day}
                      className={`flex cursor-pointer items-center gap-2 rounded-2xl border p-3 transition-colors ${
                        settings.workingDays.includes(day)
                          ? 'border-[#c96b2c] bg-[#2a1f16] text-orange-200'
                          : 'border-[#3a3129] bg-[#11100f] text-stone-300 hover:border-[#56473c] hover:text-stone-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={settings.workingDays.includes(day)}
                        onChange={() => toggleWorkingDay(day)}
                        className="h-5 w-5 rounded border-[#4b4137] bg-[#11100f] text-[#c96b2c] focus:ring-[#c96b2c]"
                      />
                      <span className="font-semibold capitalize">{day}</span>
                    </label>
                  ))}
                </div>
                <p className="mt-4 text-xs text-stone-500">Select the days your business is open for rentals.</p>
              </div>

              <div className="rounded-2xl border border-[#2b2520] bg-[#13110f] p-4">
                <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-300">
                  <MapPin className="h-4 w-4 text-orange-300" />
                  Timezone
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) => updateSetting('timezone', e.target.value)}
                  className="admin-dark-select text-lg font-semibold"
                >
                  <option value="Asia/Kuala_Lumpur">Asia/Kuala_Lumpur (GMT+8)</option>
                  <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
                  <option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</option>
                </select>
                <p className="mt-2 text-xs text-stone-500">Your local timezone for bookings and notifications.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </>
  );
}

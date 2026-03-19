'use client';

import { motion } from 'framer-motion';
import {
  Bell,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Mail,
  MessageSquare,
  Settings as SettingsIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { AdminSettingsState } from '@/lib/business-settings';

type SettingsTab = 'business' | 'booking' | 'notifications' | 'schedule';

interface MobileSettingsProps {
  settings: AdminSettingsState;
  activeTab: SettingsTab;
  setActiveTab: React.Dispatch<React.SetStateAction<SettingsTab>>;
  isSaving: boolean;
  isLoading?: boolean;
  isSendingTestReminder?: boolean;
  handleSave: () => void | Promise<void>;
  handleSendTestReminder: () => void | Promise<void>;
  updateSetting: <K extends keyof AdminSettingsState>(key: K, value: AdminSettingsState[K]) => void;
  updateWorkingHours: (key: 'start' | 'end', value: string) => void;
  toggleWorkingDay: (day: string) => void;
}

export default function MobileSettings({
  settings,
  activeTab,
  setActiveTab,
  isSaving,
  isLoading = false,
  isSendingTestReminder = false,
  handleSave,
  handleSendTestReminder,
  updateSetting,
  updateWorkingHours,
  toggleWorkingDay,
}: MobileSettingsProps) {
  const tabs: Array<{ id: SettingsTab; name: string; icon: typeof Building2 }> = [
    { id: 'business', name: 'Business', icon: Building2 },
    { id: 'booking', name: 'Booking', icon: Calendar },
    { id: 'notifications', name: 'Alerts', icon: Bell },
    { id: 'schedule', name: 'Hours', icon: Clock },
  ];

  return (
    <div className="space-y-4 px-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-[#332b25] bg-[radial-gradient(circle_at_top_left,_rgba(201,107,44,0.18),_transparent_45%),linear-gradient(135deg,#1b1714_0%,#171411_60%,#141210_100%)] p-4 shadow-[0_20px_45px_rgba(0,0,0,0.35)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#5a4328] bg-[#332316]">
              <SettingsIcon className="h-5 w-5 text-orange-300" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-stone-100">Settings</h1>
              <p className="text-xs text-stone-400">Business identity, rules, alerts, and hours</p>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="rounded-xl bg-[#c96b2c] px-3 py-2 text-sm font-semibold text-stone-950 hover:bg-[#d97a39] disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-[#332b25] bg-[#1f1a16] px-3 py-3 text-center">
            <p className="text-sm font-bold text-stone-100">{settings.businessName}</p>
            <p className="text-[10px] text-stone-500">Business</p>
          </div>
          <div className="rounded-xl border border-[#332b25] bg-[#1f1a16] px-3 py-3 text-center">
            <p className="text-lg font-bold text-orange-300">{settings.defaultDepositPercentage}%</p>
            <p className="text-[10px] text-stone-500">Deposit</p>
          </div>
          <div className="rounded-xl border border-[#332b25] bg-[#1f1a16] px-3 py-3 text-center">
            <p className="text-sm font-bold text-stone-100">GMT+8</p>
            <p className="text-[10px] text-stone-500">Timezone</p>
          </div>
        </div>
      </motion.div>

      <Card className="border border-[#2c2722] bg-[#171411] shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
        <CardContent className="space-y-3 p-4">
          <div className="grid grid-cols-2 gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  data-active={activeTab === tab.id}
                  className="admin-dark-tab flex items-center justify-center gap-2 px-3 py-3 text-sm font-semibold"
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {activeTab === 'business' && (
        <Card className="border border-[#2c2722] bg-[#171411] shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
          <CardContent className="space-y-3 p-4">
            <input
              type="text"
              value={settings.businessName}
              onChange={(e) => updateSetting('businessName', e.target.value)}
              placeholder="Business name"
              className="admin-dark-input"
            />
            <input
              type="tel"
              value={settings.businessPhone}
              onChange={(e) => updateSetting('businessPhone', e.target.value)}
              placeholder="Business phone"
              className="admin-dark-input"
            />
            <input
              type="email"
              value={settings.businessEmail}
              onChange={(e) => updateSetting('businessEmail', e.target.value)}
              placeholder="Business email"
              className="admin-dark-input"
            />
            <input
              type="tel"
              value={settings.whatsappNumber}
              onChange={(e) => updateSetting('whatsappNumber', e.target.value)}
              placeholder="WhatsApp number"
              className="admin-dark-input"
            />
            <textarea
              rows={3}
              value={settings.businessAddress}
              onChange={(e) => updateSetting('businessAddress', e.target.value)}
              placeholder="Business address"
              className="admin-dark-textarea"
            />
          </CardContent>
        </Card>
      )}

      {activeTab === 'booking' && (
        <Card className="border border-[#2c2722] bg-[#171411] shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
          <CardContent className="space-y-3 p-4">
            <input
              type="number"
              value={settings.defaultDepositPercentage}
              onChange={(e) => updateSetting('defaultDepositPercentage', Number(e.target.value))}
              min="0"
              max="100"
              placeholder="Default deposit %"
              className="admin-dark-input text-lg font-semibold"
            />
            <input
              type="number"
              value={settings.lateFeePerDay}
              onChange={(e) => updateSetting('lateFeePerDay', Number(e.target.value))}
              min="0"
              placeholder="Late fee per day"
              className="admin-dark-input text-lg font-semibold"
            />
            <input
              type="number"
              value={settings.maxRentalDays}
              onChange={(e) => updateSetting('maxRentalDays', Number(e.target.value))}
              min="1"
              placeholder="Maximum rental days"
              className="admin-dark-input text-lg font-semibold"
            />
            <select
              value={settings.currency}
              onChange={(e) => updateSetting('currency', e.target.value)}
              className="admin-dark-select text-lg font-semibold"
            >
              <option value="RM">RM (Malaysian Ringgit)</option>
              <option value="USD">USD (US Dollar)</option>
              <option value="SGD">SGD (Singapore Dollar)</option>
            </select>
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#31414f] bg-[#1b232b] p-4">
              <input
                type="checkbox"
                checked={settings.autoConfirmBookings}
                onChange={(e) => updateSetting('autoConfirmBookings', e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-[#4b4137] bg-[#11100f] text-[#c96b2c] focus:ring-[#c96b2c]"
              />
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-sky-300" />
                  <span className="font-semibold text-stone-100">Auto-confirm bookings</span>
                </div>
                <p className="mt-1 text-sm text-stone-400">Approve bookings once deposit is paid.</p>
              </div>
            </label>
          </CardContent>
        </Card>
      )}

      {activeTab === 'notifications' && (
        <Card className="border border-[#2c2722] bg-[#171411] shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between rounded-2xl border border-[#2b2520] bg-[#13110f] p-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-emerald-300" />
                <div>
                  <h4 className="font-semibold text-stone-100">Email Notifications</h4>
                  <p className="text-sm text-stone-400">Booking updates by email.</p>
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
                <MessageSquare className="h-5 w-5 text-stone-400" />
                <div>
                  <h4 className="font-semibold text-stone-100">SMS Notifications</h4>
                  <p className="text-sm text-stone-400">Booking updates by SMS.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={(e) => updateSetting('smsNotifications', e.target.checked)}
                className="h-6 w-6 rounded border-[#4b4137] bg-[#11100f] text-[#c96b2c] focus:ring-[#c96b2c]"
              />
            </div>
            <div className="rounded-2xl border border-[#31414f] bg-[#1b232b] p-4">
              <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-300">
                <Bell className="h-5 w-5 text-sky-300" />
                Reminder days before pickup
              </label>
              <input
                type="number"
                value={settings.reminderDaysBefore}
                onChange={(e) => updateSetting('reminderDaysBefore', Number(e.target.value))}
                min="0"
                max="7"
                className="admin-dark-input w-24 text-center text-lg font-semibold"
              />
            </div>
            <div className="rounded-2xl border border-[#2b2520] bg-[#13110f] p-4">
              <h4 className="text-sm font-semibold text-stone-100">Send Test Reminder</h4>
              <p className="mt-1 text-sm text-stone-400">
                Send a sample reminder email to your admin inbox now.
              </p>
              <Button
                onClick={handleSendTestReminder}
                disabled={isLoading || isSendingTestReminder}
                className="mt-4 w-full rounded-xl border border-[#4c2d14] bg-[#25170d] px-4 py-3 text-sm font-semibold text-[#fdba74] hover:bg-[#2d1b0e] disabled:opacity-50"
              >
                {isSendingTestReminder ? 'Sending...' : 'Send Test Reminder'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'schedule' && (
        <Card className="border border-[#2c2722] bg-[#171411] shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
          <CardContent className="space-y-3 p-4">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="time"
                value={settings.workingHours.start}
                onChange={(e) => updateWorkingHours('start', e.target.value)}
                className="admin-dark-input text-lg font-semibold"
              />
              <input
                type="time"
                value={settings.workingHours.end}
                onChange={(e) => updateWorkingHours('end', e.target.value)}
                className="admin-dark-input text-lg font-semibold"
              />
            </div>
            <div className="rounded-2xl border border-[#31414f] bg-[#1b232b] p-4">
              <div className="grid grid-cols-2 gap-2">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                  <label
                    key={day}
                    className={`flex cursor-pointer items-center gap-2 rounded-2xl border p-3 transition-colors ${
                      settings.workingDays.includes(day)
                        ? 'border-[#c96b2c] bg-[#2a1f16] text-orange-200'
                        : 'border-[#3a3129] bg-[#11100f] text-stone-300'
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
            </div>
            <select
              value={settings.timezone}
              onChange={(e) => updateSetting('timezone', e.target.value)}
              className="admin-dark-select text-lg font-semibold"
            >
              <option value="Asia/Kuala_Lumpur">Asia/Kuala_Lumpur (GMT+8)</option>
              <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
              <option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</option>
            </select>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

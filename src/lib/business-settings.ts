export type AdminSettingsState = {
  businessName: string;
  businessPhone: string;
  businessEmail: string;
  businessAddress: string;
  whatsappNumber: string;
  defaultDepositPercentage: number;
  lateFeePerDay: number;
  maxRentalDays: number;
  autoConfirmBookings: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  reminderDaysBefore: number;
  currency: string;
  timezone: string;
  workingHours: {
    start: string;
    end: string;
  };
  workingDays: string[];
};

export const defaultAdminSettings: AdminSettingsState = {
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
};

const settingsKeyMap = {
  businessName: 'business_name',
  businessPhone: 'contact_phone',
  businessEmail: 'business_email',
  businessAddress: 'business_address',
  whatsappNumber: 'whatsapp_number',
  defaultDepositPercentage: 'default_deposit_percentage',
  lateFeePerDay: 'late_fee_per_day',
  maxRentalDays: 'max_rental_days',
  autoConfirmBookings: 'auto_confirm_bookings',
  emailNotifications: 'email_notifications',
  smsNotifications: 'sms_notifications',
  reminderDaysBefore: 'reminder_days_before',
  currency: 'currency',
  timezone: 'timezone',
  workingHoursStart: 'working_hours_start',
  workingHoursEnd: 'working_hours_end',
  workingDays: 'working_days',
} as const;

const descriptionMap: Record<string, string> = {
  business_name: 'Business name',
  contact_phone: 'Primary contact phone number',
  business_email: 'Primary business email address',
  business_address: 'Business address',
  whatsapp_number: 'WhatsApp business number',
  default_deposit_percentage: 'Default deposit percentage for rentals',
  late_fee_per_day: 'Late fee charged per day',
  max_rental_days: 'Maximum allowed rental days',
  auto_confirm_bookings: 'Automatically confirm eligible bookings',
  email_notifications: 'Enable email notifications and reminders',
  sms_notifications: 'Enable SMS notifications',
  reminder_days_before: 'How many days before pickup/return to send reminders',
  currency: 'Business currency',
  timezone: 'Business timezone',
  working_hours_start: 'Business opening time',
  working_hours_end: 'Business closing time',
  working_days: 'Business working days',
};

const readBoolean = (value: string | undefined, fallback: boolean) =>
  value === undefined ? fallback : value === 'true';

const readNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const readString = (value: string | undefined, fallback: string) => value || fallback;

const readStringArray = (value: string | undefined, fallback: string[]) => {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

export type BusinessSettingsRow = {
  setting_key?: string | null;
  setting_value?: string | null;
  key?: string | null;
  value?: string | null;
  name?: string | null;
  description?: string | null;
};

export type SerializedBusinessSetting = {
  key: string;
  value: string;
  description: string;
};

const getRowKey = (row: BusinessSettingsRow) => row.setting_key ?? row.key ?? row.name ?? undefined;

const getRowValue = (row: BusinessSettingsRow) => row.setting_value ?? row.value ?? undefined;

export function createBusinessSettingsMap(rows: BusinessSettingsRow[]): Map<string, string> {
  const map = new Map<string, string>();

  rows.forEach((row) => {
    const key = getRowKey(row);
    const value = getRowValue(row);

    if (key && value !== undefined && value !== null) {
      map.set(key, value);
    }
  });

  return map;
}

export function mapBusinessSettingsRowsToState(
  rows: BusinessSettingsRow[]
): AdminSettingsState {
  const map = createBusinessSettingsMap(rows);

  return {
    businessName: readString(map.get(settingsKeyMap.businessName), defaultAdminSettings.businessName),
    businessPhone: readString(map.get(settingsKeyMap.businessPhone), defaultAdminSettings.businessPhone),
    businessEmail: readString(map.get(settingsKeyMap.businessEmail), defaultAdminSettings.businessEmail),
    businessAddress: readString(
      map.get(settingsKeyMap.businessAddress) || map.get('pickup_location'),
      defaultAdminSettings.businessAddress
    ),
    whatsappNumber: readString(map.get(settingsKeyMap.whatsappNumber), defaultAdminSettings.whatsappNumber),
    defaultDepositPercentage: readNumber(
      map.get(settingsKeyMap.defaultDepositPercentage),
      defaultAdminSettings.defaultDepositPercentage
    ),
    lateFeePerDay: readNumber(
      map.get(settingsKeyMap.lateFeePerDay) || map.get('late_return_penalty'),
      defaultAdminSettings.lateFeePerDay
    ),
    maxRentalDays: readNumber(map.get(settingsKeyMap.maxRentalDays), defaultAdminSettings.maxRentalDays),
    autoConfirmBookings: readBoolean(
      map.get(settingsKeyMap.autoConfirmBookings),
      defaultAdminSettings.autoConfirmBookings
    ),
    emailNotifications: readBoolean(
      map.get(settingsKeyMap.emailNotifications),
      defaultAdminSettings.emailNotifications
    ),
    smsNotifications: readBoolean(
      map.get(settingsKeyMap.smsNotifications),
      defaultAdminSettings.smsNotifications
    ),
    reminderDaysBefore: readNumber(
      map.get(settingsKeyMap.reminderDaysBefore),
      defaultAdminSettings.reminderDaysBefore
    ),
    currency: readString(map.get(settingsKeyMap.currency), defaultAdminSettings.currency),
    timezone: readString(map.get(settingsKeyMap.timezone), defaultAdminSettings.timezone),
    workingHours: {
      start: readString(map.get(settingsKeyMap.workingHoursStart), defaultAdminSettings.workingHours.start),
      end: readString(map.get(settingsKeyMap.workingHoursEnd), defaultAdminSettings.workingHours.end),
    },
    workingDays: readStringArray(map.get(settingsKeyMap.workingDays), defaultAdminSettings.workingDays),
  };
}

export function serializeAdminSettings(
  settings: AdminSettingsState
): SerializedBusinessSetting[] {
  return [
    { key: settingsKeyMap.businessName, value: settings.businessName, description: descriptionMap[settingsKeyMap.businessName] },
    { key: settingsKeyMap.businessPhone, value: settings.businessPhone, description: descriptionMap[settingsKeyMap.businessPhone] },
    { key: settingsKeyMap.businessEmail, value: settings.businessEmail, description: descriptionMap[settingsKeyMap.businessEmail] },
    { key: settingsKeyMap.businessAddress, value: settings.businessAddress, description: descriptionMap[settingsKeyMap.businessAddress] },
    { key: settingsKeyMap.whatsappNumber, value: settings.whatsappNumber, description: descriptionMap[settingsKeyMap.whatsappNumber] },
    { key: settingsKeyMap.defaultDepositPercentage, value: String(settings.defaultDepositPercentage), description: descriptionMap[settingsKeyMap.defaultDepositPercentage] },
    { key: settingsKeyMap.lateFeePerDay, value: String(settings.lateFeePerDay), description: descriptionMap[settingsKeyMap.lateFeePerDay] },
    { key: settingsKeyMap.maxRentalDays, value: String(settings.maxRentalDays), description: descriptionMap[settingsKeyMap.maxRentalDays] },
    { key: settingsKeyMap.autoConfirmBookings, value: String(settings.autoConfirmBookings), description: descriptionMap[settingsKeyMap.autoConfirmBookings] },
    { key: settingsKeyMap.emailNotifications, value: String(settings.emailNotifications), description: descriptionMap[settingsKeyMap.emailNotifications] },
    { key: settingsKeyMap.smsNotifications, value: String(settings.smsNotifications), description: descriptionMap[settingsKeyMap.smsNotifications] },
    { key: settingsKeyMap.reminderDaysBefore, value: String(settings.reminderDaysBefore), description: descriptionMap[settingsKeyMap.reminderDaysBefore] },
    { key: settingsKeyMap.currency, value: settings.currency, description: descriptionMap[settingsKeyMap.currency] },
    { key: settingsKeyMap.timezone, value: settings.timezone, description: descriptionMap[settingsKeyMap.timezone] },
    { key: settingsKeyMap.workingHoursStart, value: settings.workingHours.start, description: descriptionMap[settingsKeyMap.workingHoursStart] },
    { key: settingsKeyMap.workingHoursEnd, value: settings.workingHours.end, description: descriptionMap[settingsKeyMap.workingHoursEnd] },
    { key: settingsKeyMap.workingDays, value: JSON.stringify(settings.workingDays), description: descriptionMap[settingsKeyMap.workingDays] },
  ];
}

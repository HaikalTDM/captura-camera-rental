import type { BusinessSettings } from '../supabase/types.js';
export declare function getSettings(settingKey?: string): Promise<BusinessSettings[]>;
export declare function updateSetting(settingKey: string, settingValue: string, _description?: string): Promise<BusinessSettings>;
export declare function getDashboardSummary(period: string): Promise<Record<string, unknown>>;
export declare function getRevenueReport(startDate: string, endDate: string, groupBy: string): Promise<Record<string, unknown>>;
//# sourceMappingURL=admin.tools.d.ts.map
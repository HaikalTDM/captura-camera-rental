import { z } from 'zod';
export declare const paginationSchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    offset: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
}, {
    limit?: number | undefined;
    offset?: number | undefined;
}>;
export declare const dateRangeSchema: z.ZodEffects<z.ZodObject<{
    start_date: z.ZodString;
    end_date: z.ZodString;
}, "strip", z.ZodTypeAny, {
    start_date: string;
    end_date: string;
}, {
    start_date: string;
    end_date: string;
}>, {
    start_date: string;
    end_date: string;
}, {
    start_date: string;
    end_date: string;
}>;
export declare const cameraIdSchema: z.ZodObject<{
    camera_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    camera_id: string;
}, {
    camera_id: string;
}>;
export declare const bookingIdSchema: z.ZodObject<{
    booking_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    booking_id: string;
}, {
    booking_id: string;
}>;
export declare const customerIdSchema: z.ZodObject<{
    customer_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    customer_id: string;
}, {
    customer_id: string;
}>;
export declare const cameraCreateSchema: z.ZodObject<{
    name: z.ZodString;
    brand: z.ZodString;
    model: z.ZodString;
    type: z.ZodEnum<["action", "mirrorless", "dslr", "compact"]>;
    daily_rate: z.ZodNumber;
    weekly_rate: z.ZodOptional<z.ZodNumber>;
    monthly_rate: z.ZodOptional<z.ZodNumber>;
    discount_threshold: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    deposit_amount: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    description: z.ZodOptional<z.ZodString>;
    image_url: z.ZodOptional<z.ZodString>;
    is_available: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    display_order: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    condition: z.ZodDefault<z.ZodOptional<z.ZodEnum<["excellent", "good", "fair", "needs_repair"]>>>;
    location: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    specifications: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    brand: string;
    model: string;
    type: "action" | "mirrorless" | "dslr" | "compact";
    daily_rate: number;
    deposit_amount: number;
    discount_threshold: number;
    is_available: boolean;
    display_order: number;
    condition: "excellent" | "good" | "fair" | "needs_repair";
    weekly_rate?: number | undefined;
    monthly_rate?: number | undefined;
    description?: string | undefined;
    location?: string | undefined;
    notes?: string | undefined;
    image_url?: string | undefined;
    specifications?: Record<string, unknown> | undefined;
}, {
    name: string;
    brand: string;
    model: string;
    type: "action" | "mirrorless" | "dslr" | "compact";
    daily_rate: number;
    weekly_rate?: number | undefined;
    monthly_rate?: number | undefined;
    deposit_amount?: number | undefined;
    discount_threshold?: number | undefined;
    description?: string | undefined;
    is_available?: boolean | undefined;
    display_order?: number | undefined;
    condition?: "excellent" | "good" | "fair" | "needs_repair" | undefined;
    location?: string | undefined;
    notes?: string | undefined;
    image_url?: string | undefined;
    specifications?: Record<string, unknown> | undefined;
}>;
export declare const cameraUpdateSchema: z.ZodObject<{
    camera_id: z.ZodString;
} & {
    name: z.ZodOptional<z.ZodString>;
    brand: z.ZodOptional<z.ZodString>;
    daily_rate: z.ZodOptional<z.ZodNumber>;
    weekly_rate: z.ZodOptional<z.ZodNumber>;
    discount_threshold: z.ZodOptional<z.ZodNumber>;
    description: z.ZodOptional<z.ZodString>;
    image_url: z.ZodOptional<z.ZodString>;
    is_available: z.ZodOptional<z.ZodBoolean>;
    display_order: z.ZodOptional<z.ZodNumber>;
    condition: z.ZodOptional<z.ZodEnum<["excellent", "good", "fair", "needs_repair"]>>;
    location: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    specifications: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    camera_id: string;
    name?: string | undefined;
    brand?: string | undefined;
    daily_rate?: number | undefined;
    weekly_rate?: number | undefined;
    discount_threshold?: number | undefined;
    description?: string | undefined;
    is_available?: boolean | undefined;
    display_order?: number | undefined;
    condition?: "excellent" | "good" | "fair" | "needs_repair" | undefined;
    location?: string | undefined;
    notes?: string | undefined;
    image_url?: string | undefined;
    specifications?: Record<string, unknown> | undefined;
}, {
    camera_id: string;
    name?: string | undefined;
    brand?: string | undefined;
    daily_rate?: number | undefined;
    weekly_rate?: number | undefined;
    discount_threshold?: number | undefined;
    description?: string | undefined;
    is_available?: boolean | undefined;
    display_order?: number | undefined;
    condition?: "excellent" | "good" | "fair" | "needs_repair" | undefined;
    location?: string | undefined;
    notes?: string | undefined;
    image_url?: string | undefined;
    specifications?: Record<string, unknown> | undefined;
}>;
export declare const cameraAvailabilitySchema: z.ZodObject<{
    camera_id: z.ZodString;
} & {
    is_available: z.ZodBoolean;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    is_available: boolean;
    camera_id: string;
    notes?: string | undefined;
}, {
    is_available: boolean;
    camera_id: string;
    notes?: string | undefined;
}>;
export declare const bookingCreateSchema: z.ZodEffects<z.ZodObject<{
    camera_id: z.ZodString;
    customer_name: z.ZodString;
    customer_email: z.ZodString;
    customer_phone: z.ZodString;
    customer_whatsapp: z.ZodOptional<z.ZodString>;
    customer_address: z.ZodOptional<z.ZodString>;
    customer_id_number: z.ZodOptional<z.ZodString>;
    emergency_contact_name: z.ZodOptional<z.ZodString>;
    emergency_contact_phone: z.ZodOptional<z.ZodString>;
    start_date: z.ZodString;
    end_date: z.ZodString;
    total_days: z.ZodNumber;
    daily_rate: z.ZodNumber;
    total_amount: z.ZodNumber;
    deposit_amount: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    pickup_method: z.ZodEnum<["pickup", "delivery"]>;
    pickup_address: z.ZodOptional<z.ZodString>;
    delivery_fee: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    special_requests: z.ZodOptional<z.ZodString>;
    booking_source: z.ZodDefault<z.ZodOptional<z.ZodEnum<["website", "phone", "whatsapp", "walk-in", "manual"]>>>;
}, "strip", z.ZodTypeAny, {
    daily_rate: number;
    deposit_amount: number;
    start_date: string;
    end_date: string;
    camera_id: string;
    customer_email: string;
    customer_phone: string;
    customer_name: string;
    total_days: number;
    total_amount: number;
    pickup_method: "pickup" | "delivery";
    delivery_fee: number;
    booking_source: "website" | "phone" | "whatsapp" | "walk-in" | "manual";
    customer_whatsapp?: string | undefined;
    customer_address?: string | undefined;
    customer_id_number?: string | undefined;
    emergency_contact_name?: string | undefined;
    emergency_contact_phone?: string | undefined;
    pickup_address?: string | undefined;
    special_requests?: string | undefined;
}, {
    daily_rate: number;
    start_date: string;
    end_date: string;
    camera_id: string;
    customer_email: string;
    customer_phone: string;
    customer_name: string;
    total_days: number;
    total_amount: number;
    pickup_method: "pickup" | "delivery";
    deposit_amount?: number | undefined;
    customer_whatsapp?: string | undefined;
    customer_address?: string | undefined;
    customer_id_number?: string | undefined;
    emergency_contact_name?: string | undefined;
    emergency_contact_phone?: string | undefined;
    pickup_address?: string | undefined;
    delivery_fee?: number | undefined;
    booking_source?: "website" | "phone" | "whatsapp" | "walk-in" | "manual" | undefined;
    special_requests?: string | undefined;
}>, {
    daily_rate: number;
    deposit_amount: number;
    start_date: string;
    end_date: string;
    camera_id: string;
    customer_email: string;
    customer_phone: string;
    customer_name: string;
    total_days: number;
    total_amount: number;
    pickup_method: "pickup" | "delivery";
    delivery_fee: number;
    booking_source: "website" | "phone" | "whatsapp" | "walk-in" | "manual";
    customer_whatsapp?: string | undefined;
    customer_address?: string | undefined;
    customer_id_number?: string | undefined;
    emergency_contact_name?: string | undefined;
    emergency_contact_phone?: string | undefined;
    pickup_address?: string | undefined;
    special_requests?: string | undefined;
}, {
    daily_rate: number;
    start_date: string;
    end_date: string;
    camera_id: string;
    customer_email: string;
    customer_phone: string;
    customer_name: string;
    total_days: number;
    total_amount: number;
    pickup_method: "pickup" | "delivery";
    deposit_amount?: number | undefined;
    customer_whatsapp?: string | undefined;
    customer_address?: string | undefined;
    customer_id_number?: string | undefined;
    emergency_contact_name?: string | undefined;
    emergency_contact_phone?: string | undefined;
    pickup_address?: string | undefined;
    delivery_fee?: number | undefined;
    booking_source?: "website" | "phone" | "whatsapp" | "walk-in" | "manual" | undefined;
    special_requests?: string | undefined;
}>;
export declare const bookingApproveSchema: z.ZodObject<{
    booking_id: z.ZodString;
} & {
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    booking_id: string;
    notes?: string | undefined;
}, {
    booking_id: string;
    notes?: string | undefined;
}>;
export declare const bookingRejectSchema: z.ZodObject<{
    booking_id: z.ZodString;
} & {
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    booking_id: string;
    reason: string;
}, {
    booking_id: string;
    reason: string;
}>;
export declare const bookingCancelSchema: z.ZodObject<{
    booking_id: z.ZodString;
} & {
    reason: z.ZodOptional<z.ZodString>;
    confirm: z.ZodLiteral<true>;
}, "strip", z.ZodTypeAny, {
    booking_id: string;
    confirm: true;
    reason?: string | undefined;
}, {
    booking_id: string;
    confirm: true;
    reason?: string | undefined;
}>;
export declare const bookingPickupSchema: z.ZodObject<{
    booking_id: z.ZodString;
} & {
    pickup_notes: z.ZodOptional<z.ZodString>;
    equipment_condition: z.ZodDefault<z.ZodOptional<z.ZodEnum<["excellent", "good", "fair", "damaged"]>>>;
}, "strip", z.ZodTypeAny, {
    booking_id: string;
    equipment_condition: "excellent" | "good" | "fair" | "damaged";
    pickup_notes?: string | undefined;
}, {
    booking_id: string;
    pickup_notes?: string | undefined;
    equipment_condition?: "excellent" | "good" | "fair" | "damaged" | undefined;
}>;
export declare const bookingReturnSchema: z.ZodObject<{
    booking_id: z.ZodString;
} & {
    return_notes: z.ZodOptional<z.ZodString>;
    equipment_condition: z.ZodDefault<z.ZodOptional<z.ZodEnum<["excellent", "good", "fair", "damaged"]>>>;
}, "strip", z.ZodTypeAny, {
    booking_id: string;
    equipment_condition: "excellent" | "good" | "fair" | "damaged";
    return_notes?: string | undefined;
}, {
    booking_id: string;
    equipment_condition?: "excellent" | "good" | "fair" | "damaged" | undefined;
    return_notes?: string | undefined;
}>;
export declare const customerUpdateSchema: z.ZodObject<{
    customer_id: z.ZodString;
} & {
    full_name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    whatsapp: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    id_number: z.ZodOptional<z.ZodString>;
    emergency_contact_name: z.ZodOptional<z.ZodString>;
    emergency_contact_phone: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    customer_id: string;
    phone?: string | undefined;
    whatsapp?: string | undefined;
    notes?: string | undefined;
    full_name?: string | undefined;
    email?: string | undefined;
    emergency_contact_name?: string | undefined;
    emergency_contact_phone?: string | undefined;
    address?: string | undefined;
    id_number?: string | undefined;
}, {
    customer_id: string;
    phone?: string | undefined;
    whatsapp?: string | undefined;
    notes?: string | undefined;
    full_name?: string | undefined;
    email?: string | undefined;
    emergency_contact_name?: string | undefined;
    emergency_contact_phone?: string | undefined;
    address?: string | undefined;
    id_number?: string | undefined;
}>;
export declare const paymentRecordSchema: z.ZodObject<{
    booking_id: z.ZodString;
    payment_type: z.ZodEnum<["deposit", "final", "refund"]>;
    amount: z.ZodNumber;
    payment_method: z.ZodEnum<["cash", "bank_transfer", "online"]>;
    payment_reference: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    amount: number;
    booking_id: string;
    payment_type: "deposit" | "final" | "refund";
    payment_method: "cash" | "bank_transfer" | "online";
    notes?: string | undefined;
    payment_reference?: string | undefined;
}, {
    amount: number;
    booking_id: string;
    payment_type: "deposit" | "final" | "refund";
    payment_method: "cash" | "bank_transfer" | "online";
    notes?: string | undefined;
    payment_reference?: string | undefined;
}>;
export declare const depositRefundSchema: z.ZodObject<{
    booking_id: z.ZodString;
} & {
    refund_amount: z.ZodOptional<z.ZodNumber>;
    refund_notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    booking_id: string;
    refund_amount?: number | undefined;
    refund_notes?: string | undefined;
}, {
    booking_id: string;
    refund_amount?: number | undefined;
    refund_notes?: string | undefined;
}>;
export declare const invoiceGenerateSchema: z.ZodObject<{
    booking_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    booking_id: string;
}, {
    booking_id: string;
}>;
export declare const settingsUpdateSchema: z.ZodObject<{
    setting_key: z.ZodString;
    setting_value: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    setting_key: string;
    setting_value: string;
    description?: string | undefined;
}, {
    setting_key: string;
    setting_value: string;
    description?: string | undefined;
}>;
export declare const searchQuerySchema: z.ZodObject<{
    query: z.ZodString;
}, "strip", z.ZodTypeAny, {
    query: string;
}, {
    query: string;
}>;
export declare const revenueReportSchema: z.ZodEffects<z.ZodObject<{
    start_date: z.ZodString;
    end_date: z.ZodString;
    group_by: z.ZodDefault<z.ZodOptional<z.ZodEnum<["camera", "month", "week"]>>>;
}, "strip", z.ZodTypeAny, {
    start_date: string;
    end_date: string;
    group_by: "week" | "month" | "camera";
}, {
    start_date: string;
    end_date: string;
    group_by?: "week" | "month" | "camera" | undefined;
}>, {
    start_date: string;
    end_date: string;
    group_by: "week" | "month" | "camera";
}, {
    start_date: string;
    end_date: string;
    group_by?: "week" | "month" | "camera" | undefined;
}>;
export declare const dashboardSummarySchema: z.ZodObject<{
    period: z.ZodDefault<z.ZodOptional<z.ZodEnum<["today", "week", "month", "year"]>>>;
}, "strip", z.ZodTypeAny, {
    period: "today" | "week" | "month" | "year";
}, {
    period?: "today" | "week" | "month" | "year" | undefined;
}>;
export declare const smartCreateSchema: z.ZodEffects<z.ZodObject<{
    camera_query: z.ZodString;
    customer_name: z.ZodString;
    customer_email: z.ZodString;
    customer_phone: z.ZodString;
    start_date: z.ZodString;
    end_date: z.ZodString;
    pickup_method: z.ZodDefault<z.ZodOptional<z.ZodEnum<["pickup", "delivery"]>>>;
    customer_whatsapp: z.ZodOptional<z.ZodString>;
    customer_address: z.ZodOptional<z.ZodString>;
    customer_id_number: z.ZodOptional<z.ZodString>;
    emergency_contact_name: z.ZodOptional<z.ZodString>;
    emergency_contact_phone: z.ZodOptional<z.ZodString>;
    special_requests: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    start_date: string;
    end_date: string;
    customer_email: string;
    customer_phone: string;
    customer_name: string;
    pickup_method: "pickup" | "delivery";
    camera_query: string;
    customer_whatsapp?: string | undefined;
    customer_address?: string | undefined;
    customer_id_number?: string | undefined;
    emergency_contact_name?: string | undefined;
    emergency_contact_phone?: string | undefined;
    special_requests?: string | undefined;
}, {
    start_date: string;
    end_date: string;
    customer_email: string;
    customer_phone: string;
    customer_name: string;
    camera_query: string;
    customer_whatsapp?: string | undefined;
    customer_address?: string | undefined;
    customer_id_number?: string | undefined;
    emergency_contact_name?: string | undefined;
    emergency_contact_phone?: string | undefined;
    pickup_method?: "pickup" | "delivery" | undefined;
    special_requests?: string | undefined;
}>, {
    start_date: string;
    end_date: string;
    customer_email: string;
    customer_phone: string;
    customer_name: string;
    pickup_method: "pickup" | "delivery";
    camera_query: string;
    customer_whatsapp?: string | undefined;
    customer_address?: string | undefined;
    customer_id_number?: string | undefined;
    emergency_contact_name?: string | undefined;
    emergency_contact_phone?: string | undefined;
    special_requests?: string | undefined;
}, {
    start_date: string;
    end_date: string;
    customer_email: string;
    customer_phone: string;
    customer_name: string;
    camera_query: string;
    customer_whatsapp?: string | undefined;
    customer_address?: string | undefined;
    customer_id_number?: string | undefined;
    emergency_contact_name?: string | undefined;
    emergency_contact_phone?: string | undefined;
    pickup_method?: "pickup" | "delivery" | undefined;
    special_requests?: string | undefined;
}>;
export declare const bulkApproveSchema: z.ZodObject<{
    booking_ids: z.ZodArray<z.ZodString, "many">;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    booking_ids: string[];
    notes?: string | undefined;
}, {
    booking_ids: string[];
    notes?: string | undefined;
}>;
//# sourceMappingURL=schemas.d.ts.map
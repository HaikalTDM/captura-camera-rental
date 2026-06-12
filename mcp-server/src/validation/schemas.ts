import { z } from 'zod';

export const paginationSchema = z.object({
  limit: z.number().int().min(1).max(200).optional().default(50),
  offset: z.number().int().min(0).optional().default(0),
});

export const dateRangeSchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
}).refine((data) => data.end_date >= data.start_date, {
  message: 'end_date must be on or after start_date',
});

export const cameraIdSchema = z.object({
  camera_id: z.string().uuid('Invalid camera ID format'),
});

export const bookingIdSchema = z.object({
  booking_id: z.string().uuid('Invalid booking ID format'),
});

export const customerIdSchema = z.object({
  customer_id: z.string().uuid('Invalid customer ID format'),
});

export const cameraCreateSchema = z.object({
  name: z.string().min(2).max(255),
  brand: z.string().min(1).max(100),
  model: z.string().min(1).max(100),
  type: z.enum(['action', 'mirrorless', 'dslr', 'compact']),
  daily_rate: z.number().positive('Daily rate must be positive'),
  weekly_rate: z.number().positive('Weekly rate must be positive').optional(),
  monthly_rate: z.number().positive('Monthly rate must be positive').optional(),
  discount_threshold: z.number().int().min(2).max(30).optional().default(3),
  deposit_amount: z.number().positive().optional().default(100),
  description: z.string().max(2000).optional(),
  image_url: z.string().max(500).optional(),
  is_available: z.boolean().optional().default(true),
  display_order: z.number().int().min(0).optional().default(99),
  condition: z.enum(['excellent', 'good', 'fair', 'needs_repair']).optional().default('excellent'),
  location: z.string().max(255).optional(),
  notes: z.string().max(2000).optional(),
  specifications: z.record(z.unknown()).optional(),
});

export const cameraUpdateSchema = cameraIdSchema.extend({
  name: z.string().min(2).max(255).optional(),
  brand: z.string().min(1).max(100).optional(),
  daily_rate: z.number().positive().optional(),
  weekly_rate: z.number().positive().optional(),
  discount_threshold: z.number().int().min(2).max(30).optional(),
  description: z.string().max(2000).optional(),
  image_url: z.string().max(500).optional(),
  is_available: z.boolean().optional(),
  display_order: z.number().int().min(0).optional(),
  condition: z.enum(['excellent', 'good', 'fair', 'needs_repair']).optional(),
  location: z.string().max(255).optional(),
  notes: z.string().max(2000).optional(),
  specifications: z.record(z.unknown()).optional(),
});

export const cameraAvailabilitySchema = cameraIdSchema.extend({
  is_available: z.boolean(),
  notes: z.string().max(500).optional(),
});

export const bookingCreateSchema = z.object({
  camera_id: z.string().uuid(),
  customer_name: z.string().min(2).max(255),
  customer_email: z.string().email(),
  customer_phone: z.string().regex(/^\+?[0-9\s\-\(\)]{8,}$/, 'Invalid phone format'),
  customer_whatsapp: z.string().optional(),
  customer_address: z.string().max(500).optional(),
  customer_id_number: z.string().max(50).optional(),
  emergency_contact_name: z.string().max(255).optional(),
  emergency_contact_phone: z.string().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  total_days: z.number().int().positive(),
  daily_rate: z.number().positive(),
  total_amount: z.number().positive(),
  deposit_amount: z.number().positive().optional().default(100),
  pickup_method: z.enum(['pickup', 'delivery']),
  pickup_address: z.string().max(500).optional(),
  delivery_fee: z.number().min(0).optional().default(0),
  special_requests: z.string().max(1000).optional(),
  booking_source: z.enum(['website', 'phone', 'whatsapp', 'walk-in', 'manual']).optional().default('manual'),
}).refine((data) => data.end_date >= data.start_date, {
  message: 'end_date must be on or after start_date',
});

export const bookingApproveSchema = bookingIdSchema.extend({
  notes: z.string().max(500).optional(),
});

export const bookingRejectSchema = bookingIdSchema.extend({
  reason: z.string().min(1).max(500),
});

export const bookingCancelSchema = bookingIdSchema.extend({
  reason: z.string().max(500).optional(),
  confirm: z.literal(true),
});

export const bookingPickupSchema = bookingIdSchema.extend({
  pickup_notes: z.string().max(500).optional(),
  equipment_condition: z.enum(['excellent', 'good', 'fair', 'damaged']).optional().default('excellent'),
});

export const bookingReturnSchema = bookingIdSchema.extend({
  return_notes: z.string().max(500).optional(),
  equipment_condition: z.enum(['excellent', 'good', 'fair', 'damaged']).optional().default('excellent'),
});

export const customerUpdateSchema = customerIdSchema.extend({
  full_name: z.string().min(2).max(255).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  address: z.string().max(500).optional(),
  id_number: z.string().max(50).optional(),
  emergency_contact_name: z.string().max(255).optional(),
  emergency_contact_phone: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

export const paymentRecordSchema = z.object({
  booking_id: z.string().uuid(),
  payment_type: z.enum(['deposit', 'final', 'refund']),
  amount: z.number().positive(),
  payment_method: z.enum(['cash', 'bank_transfer', 'online']),
  payment_reference: z.string().max(255).optional(),
  notes: z.string().max(500).optional(),
});

export const depositRefundSchema = bookingIdSchema.extend({
  refund_amount: z.number().positive().optional(),
  refund_notes: z.string().max(500).optional(),
});

export const invoiceGenerateSchema = bookingIdSchema;

export const settingsUpdateSchema = z.object({
  setting_key: z.string().min(1).max(100),
  setting_value: z.string(),
  description: z.string().max(500).optional(),
});

export const searchQuerySchema = z.object({
  query: z.string().min(1).max(255),
});

export const revenueReportSchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
  group_by: z.enum(['camera', 'month', 'week']).optional().default('camera'),
}).refine((data) => data.end_date >= data.start_date, {
  message: 'end_date must be on or after start_date',
});

export const dashboardSummarySchema = z.object({
  period: z.enum(['today', 'week', 'month', 'year']).optional().default('month'),
});

export const smartCreateSchema = z.object({
  camera_query: z.string().min(1).max(100, 'Camera query must be under 100 characters'),
  customer_name: z.string().min(2).max(255),
  customer_email: z.string().email(),
  customer_phone: z.string().regex(/^\+?[0-9\s\-\(\)]{8,}$/, 'Invalid phone format'),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  pickup_method: z.enum(['pickup', 'delivery']).optional().default('pickup'),
  customer_whatsapp: z.string().optional(),
  customer_address: z.string().max(500).optional(),
  customer_id_number: z.string().max(50).optional(),
  emergency_contact_name: z.string().max(255).optional(),
  emergency_contact_phone: z.string().optional(),
  special_requests: z.string().max(1000).optional(),
}).refine((data) => data.end_date >= data.start_date, {
  message: 'end_date must be on or after start_date',
});

export const bulkApproveSchema = z.object({
  booking_ids: z.array(z.string().uuid()).min(1).max(50, 'Max 50 bookings per batch'),
  notes: z.string().max(500).optional(),
});

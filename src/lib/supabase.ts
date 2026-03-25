import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client for browser/client-side use (respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side API routes (bypasses RLS)
// Use this ONLY in API routes, never expose to client-side
// This will be lazily initialized on the server-side only
let _supabaseAdmin: SupabaseClient | null = null

export const getSupabaseAdmin = (): SupabaseClient => {
  if (_supabaseAdmin) {
    return _supabaseAdmin
  }

  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseServiceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables')
  }

  _supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  return _supabaseAdmin
}

// For backwards compatibility - but should only be used in server-side contexts
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get: (target, prop) => {
    const admin = getSupabaseAdmin()
    return admin[prop as keyof SupabaseClient]
  }
})

// Database Types
export interface Camera {
  id: string
  name: string
  brand: string
  model: string
  type: 'action' | 'mirrorless' | 'dslr' | 'compact'
  daily_rate: number
  weekly_rate: number
  monthly_rate: number
  deposit_amount: number
  discount_threshold?: number
  description: string
  specifications: Record<string, any>
  image_url: string
  is_available: boolean
  total_quantity: number
  available_quantity: number
  display_order: number
  condition?: 'excellent' | 'good' | 'fair' | 'needs_repair'
  last_maintenance?: string
  next_maintenance?: string
  purchase_date?: string | null
  purchase_price?: number
  serial_number?: string
  warranty_expiry?: string | null
  location?: string
  notes?: string
  status?: 'available' | 'rented' | 'maintenance' | 'inactive'
  image?: string
  images?: string[]
  dailyRate?: number
  discountRate?: number
  discountThreshold?: number
  features?: string[]
  created_at: string
  updated_at: string
  camera_accessories?: CameraAccessory[]
}

export interface Accessory {
  id: string
  name: string
  type: 'lens' | 'battery' | 'memory_card' | 'tripod' | 'case' | 'charger' | 'filter' | 'other'
  brand?: string
  model?: string
  description?: string
  daily_rate: number
  weekly_rate: number
  monthly_rate: number
  deposit_amount: number
  total_quantity: number
  available_quantity: number
  is_available: boolean
  specifications: Record<string, any>
  image_url?: string
  created_at: string
  updated_at: string
}

export interface CameraAccessory {
  id: string
  camera_id: string
  accessory_id: string
  is_included: boolean
  quantity: number
  created_at: string
  accessory?: Accessory
}

export interface BookingAccessory {
  id: string
  booking_id: string
  accessory_id: string
  quantity: number
  daily_rate: number
  total_days: number
  total_amount: number
  created_at: string
  accessory?: Accessory
}

export interface Customer {
  id: string
  full_name: string
  name?: string
  email: string
  phone: string
  phone_number?: string
  whatsapp: string
  address: string
  id_number: string
  emergency_contact_name: string
  emergency_contact_phone: string
  notes?: string
  reliability?: 'excellent' | 'good' | 'fair' | 'poor'
  totalSpent?: number
  totalRentals?: number
  lastRental?: string | null
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  customer_id: string
  camera_id: string
  booking_group_id?: string | null
  start_date: string
  end_date: string
  total_days: number
  daily_rate: number
  total_amount: number
  deposit_amount: number
  deposit_paid: boolean
  deposit_paid_date: string | null
  final_payment_amount: number
  final_payment_paid: boolean
  final_payment_paid_date: string | null
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'picked_up'
  booking_status: 'pending_approval' | 'confirmed' | 'approved' | 'rejected' | 'cancelled' | 'completed'
  pickup_method: 'pickup' | 'delivery'
  pickup_address: string | null
  delivery_fee: number
  booking_source: 'website' | 'phone' | 'whatsapp' | 'walk-in' | 'historical' | 'manual'
  notes: string | null
  // Approval workflow fields
  approved_by: string | null
  approved_at: string | null
  rejection_reason: string | null
  admin_notes: string | null
  whatsapp_message_sent: boolean
  whatsapp_sent_at: string | null
  // Equipment pickup/return tracking
  pickup_date: string | null // Date when customer should pick up (start_date - 1 day)
  equipment_picked_up: boolean
  equipment_pickup_date: string | null
  equipment_pickup_notes: string | null
  // Deposit refund tracking
  deposit_refunded: boolean
  deposit_refund_date: string | null
  deposit_refund_notes: string | null
  deposit_refund_amount: number
  equipment_returned: boolean
  equipment_return_date: string | null
  equipment_return_notes: string | null
  equipment_condition_pickup: 'excellent' | 'good' | 'fair' | 'damaged' | null
  equipment_condition_return: 'excellent' | 'good' | 'fair' | 'damaged' | null
  created_at: string
  updated_at: string
  paymentStatus?: 'paid' | 'partial' | 'pending' | 'overdue'
  camera_name?: string
  cameraName?: string
  startDate?: string
  endDate?: string
  totalDays?: number
  totalAmount?: number
  balanceDue?: number
  depositPaid?: boolean
  createdAt?: string
  addons?: string[]
  // Relations
  customer?: Customer
  camera?: Camera
  group?: BookingGroup
}

export interface BookingGroup {
  id: string
  group_reference: string
  customer_id: string
  start_date: string
  end_date: string
  total_days: number
  pickup_method: 'pickup' | 'delivery'
  pickup_address: string | null
  delivery_fee: number
  subtotal_amount: number
  deposit_amount: number
  final_payment_amount: number
  total_amount: number
  booking_source: 'website' | 'phone' | 'whatsapp' | 'walk-in' | 'historical' | 'manual'
  notes: string | null
  status: 'pending_approval' | 'confirmed' | 'partially_confirmed' | 'completed' | 'cancelled' | 'rejected'
  created_at: string
  updated_at: string
  customer?: Customer
  items?: BookingGroupItem[]
  bookings?: Booking[]
}

export interface BookingGroupItem {
  id: string
  booking_group_id: string
  camera_id: string
  daily_rate: number
  total_days: number
  subtotal_amount: number
  deposit_amount: number
  final_payment_amount: number
  total_amount: number
  sort_order: number
  created_at: string
  camera?: Camera
}


export interface GalleryImage {
  id: string
  customer_name: string
  camera_used: string
  location: string
  image_url: string
  alt_text: string
  is_active: boolean
  upload_date: string
  created_at: string
  updated_at: string
}

export interface BusinessSettings {
  id: string
  setting_key: string
  setting_value: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface InvoiceBusinessSnapshot {
  business_name: string
  business_email: string
  business_phone: string
  business_address: string
  logo_url: string
}

export interface InvoiceCustomerSnapshot {
  full_name: string
  email: string
  phone: string
  address: string
  id_number: string
}

export interface InvoiceBookingSnapshot {
  booking_id: string
  camera_name: string
  rental_start_date: string
  rental_end_date: string
  total_days: number
  pickup_method: 'pickup' | 'delivery'
  pickup_address: string
  rental_subtotal: number
  delivery_fee: number
  deposit_amount: number
  deposit_paid_amount: number
  total_amount: number
  balance_due: number
  notes: string
}

export interface Invoice {
  id: string
  booking_id: string
  invoice_number: string
  status: 'draft' | 'exported'
  issue_date: string
  notes: string | null
  customer_snapshot: InvoiceCustomerSnapshot
  business_snapshot: InvoiceBusinessSnapshot
  booking_snapshot: InvoiceBookingSnapshot
  exported_at: string | null
  created_at: string
  updated_at: string
}

export interface PaymentRecord {
  id: string
  booking_id: string
  payment_type: 'deposit' | 'final' | 'refund'
  amount: number
  payment_method: 'cash' | 'bank_transfer' | 'online'
  payment_reference: string | null
  payment_date: string
  notes: string | null
  created_at: string
  updated_at: string
  // Relations
  booking?: Booking
}

export interface MaintenanceRecord {
  id: string
  camera_id: string
  maintenance_type: 'cleaning' | 'repair' | 'inspection' | 'upgrade'
  description: string
  cost: number
  maintenance_date: string
  performed_by: string
  notes: string | null
  created_at: string
  updated_at: string
  // Relations
  camera?: Camera
}

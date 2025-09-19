import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
  description: string
  specifications: Record<string, any>
  image_url: string
  is_available: boolean
  total_quantity: number
  available_quantity: number
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  full_name: string
  email: string
  phone: string
  whatsapp: string
  address: string
  id_number: string
  emergency_contact_name: string
  emergency_contact_phone: string
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  customer_id: string
  camera_id: string
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
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'
  pickup_method: 'pickup' | 'delivery'
  pickup_address: string | null
  delivery_fee: number
  notes: string | null
  created_at: string
  updated_at: string
  // Relations
  customer?: Customer
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

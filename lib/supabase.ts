import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Database {
  public: {
    Tables: {
      cameras: {
        Row: {
          id: string
          name: string
          model: string
          daily_rate: number
          deposit_amount: number
          status: 'available' | 'rented' | 'maintenance'
          condition: 'excellent' | 'good' | 'fair'
          purchase_date: string
          last_maintenance: string | null
          total_rentals: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          model: string
          daily_rate: number
          deposit_amount: number
          status?: 'available' | 'rented' | 'maintenance'
          condition?: 'excellent' | 'good' | 'fair'
          purchase_date: string
          last_maintenance?: string | null
          total_rentals?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          model?: string
          daily_rate?: number
          deposit_amount?: number
          status?: 'available' | 'rented' | 'maintenance'
          condition?: 'excellent' | 'good' | 'fair'
          purchase_date?: string
          last_maintenance?: string | null
          total_rentals?: number
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          address: string | null
          id_number: string | null
          reliability_score: number
          total_bookings: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          address?: string | null
          id_number?: string | null
          reliability_score?: number
          total_bookings?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          address?: string | null
          id_number?: string | null
          reliability_score?: number
          total_bookings?: number
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          customer_id: string
          camera_id: string
          start_date: string
          end_date: string
          total_amount: number
          deposit_amount: number
          status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'
          payment_status: 'pending' | 'partial' | 'completed'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          camera_id: string
          start_date: string
          end_date: string
          total_amount: number
          deposit_amount: number
          status?: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'
          payment_status?: 'pending' | 'partial' | 'completed'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          camera_id?: string
          start_date?: string
          end_date?: string
          total_amount?: number
          deposit_amount?: number
          status?: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'
          payment_status?: 'pending' | 'partial' | 'completed'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      gallery_images: {
        Row: {
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
        Insert: {
          id?: string
          customer_name: string
          camera_used: string
          location: string
          image_url: string
          alt_text: string
          is_active?: boolean
          upload_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_name?: string
          camera_used?: string
          location?: string
          image_url?: string
          alt_text?: string
          is_active?: boolean
          upload_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      business_settings: {
        Row: {
          id: string
          business_name: string
          business_phone: string
          business_email: string | null
          whatsapp_number: string
          business_address: string
          default_deposit_percentage: number
          late_fee_per_day: number
          max_rental_days: number
          currency: string
          reminder_days_before: number
          opening_time: string
          closing_time: string
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_name: string
          business_phone: string
          business_email?: string | null
          whatsapp_number: string
          business_address: string
          default_deposit_percentage?: number
          late_fee_per_day?: number
          max_rental_days?: number
          currency?: string
          reminder_days_before?: number
          opening_time?: string
          closing_time?: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_name?: string
          business_phone?: string
          business_email?: string | null
          whatsapp_number?: string
          business_address?: string
          default_deposit_percentage?: number
          late_fee_per_day?: number
          max_rental_days?: number
          currency?: string
          reminder_days_before?: number
          opening_time?: string
          closing_time?: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

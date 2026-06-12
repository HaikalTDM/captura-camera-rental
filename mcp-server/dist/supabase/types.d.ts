export type CameraType = 'action' | 'mirrorless' | 'dslr' | 'compact';
export type CameraCondition = 'excellent' | 'good' | 'fair' | 'needs_repair';
export type CameraStatus = 'available' | 'rented' | 'maintenance' | 'inactive';
export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'picked_up';
export type BookingApprovalStatus = 'pending_approval' | 'confirmed' | 'approved' | 'rejected' | 'cancelled' | 'completed';
export type PickupMethod = 'pickup' | 'delivery';
export type BookingSource = 'website' | 'phone' | 'whatsapp' | 'walk-in' | 'historical' | 'manual';
export type PaymentType = 'deposit' | 'final' | 'refund';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'online';
export type MaintenanceType = 'cleaning' | 'repair' | 'inspection' | 'upgrade';
export interface Camera {
    id: string;
    name: string;
    brand: string;
    model: string;
    type: CameraType;
    daily_rate: number;
    weekly_rate: number;
    monthly_rate: number;
    deposit_amount: number;
    discount_threshold?: number;
    description: string;
    specifications: Record<string, unknown>;
    image_url: string;
    is_available: boolean;
    total_quantity: number;
    available_quantity: number;
    display_order: number;
    condition?: CameraCondition;
    purchase_date?: string | null;
    purchase_price?: number;
    serial_number?: string;
    warranty_expiry?: string | null;
    location?: string;
    notes?: string;
    status?: CameraStatus;
    created_at: string;
    updated_at: string;
}
export interface Customer {
    id: string;
    name?: string;
    full_name: string;
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
    id_number: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    notes?: string;
    reliability?: 'excellent' | 'good' | 'fair' | 'poor';
    created_at: string;
    updated_at: string;
}
export interface Booking {
    id: string;
    customer_id: string;
    camera_id: string;
    booking_group_id?: string | null;
    start_date: string;
    end_date: string;
    total_days: number;
    daily_rate: number;
    total_amount: number;
    deposit_amount: number;
    deposit_paid: boolean;
    deposit_paid_date: string | null;
    final_payment_amount: number;
    final_payment_paid: boolean;
    final_payment_paid_date: string | null;
    status: BookingStatus;
    booking_status: BookingApprovalStatus;
    pickup_method: PickupMethod;
    pickup_address: string | null;
    delivery_fee: number;
    booking_source: BookingSource;
    notes: string | null;
    approved_by: string | null;
    approved_at: string | null;
    rejection_reason: string | null;
    admin_notes: string | null;
    whatsapp_message_sent: boolean;
    whatsapp_sent_at: string | null;
    pickup_date: string | null;
    equipment_picked_up: boolean;
    equipment_pickup_date: string | null;
    equipment_pickup_notes: string | null;
    deposit_refunded: boolean;
    deposit_refund_date: string | null;
    deposit_refund_notes: string | null;
    deposit_refund_amount: number;
    equipment_returned: boolean;
    equipment_return_date: string | null;
    equipment_return_notes: string | null;
    equipment_condition_pickup: CameraCondition | null;
    equipment_condition_return: CameraCondition | null;
    created_at: string;
    updated_at: string;
    customer?: Customer;
    camera?: Camera;
}
export interface PaymentRecord {
    id: string;
    booking_id: string;
    payment_type: PaymentType;
    amount: number;
    payment_method: PaymentMethod;
    payment_reference: string | null;
    payment_date: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
}
export interface Invoice {
    id: string;
    booking_id: string;
    invoice_number: string;
    status: 'draft' | 'exported';
    issue_date: string;
    notes: string | null;
    customer_snapshot: Record<string, unknown>;
    business_snapshot: Record<string, unknown>;
    booking_snapshot: Record<string, unknown>;
    exported_at: string | null;
    created_at: string;
    updated_at: string;
}
export interface MaintenanceRecord {
    id: string;
    camera_id: string;
    maintenance_type: MaintenanceType;
    description: string;
    cost: number;
    maintenance_date: string;
    performed_by: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
}
export interface BusinessSettings {
    id: string;
    setting_key: string;
    setting_value: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}
export interface BookingGroup {
    id: string;
    group_reference: string;
    customer_id: string;
    start_date: string;
    end_date: string;
    total_days: number;
    pickup_method: PickupMethod;
    pickup_address: string | null;
    delivery_fee: number;
    subtotal_amount: number;
    deposit_amount: number;
    final_payment_amount: number;
    total_amount: number;
    booking_source: BookingSource;
    notes: string | null;
    status: 'pending_approval' | 'confirmed' | 'partially_confirmed' | 'completed' | 'cancelled' | 'rejected';
    created_at: string;
    updated_at: string;
}
//# sourceMappingURL=types.d.ts.map
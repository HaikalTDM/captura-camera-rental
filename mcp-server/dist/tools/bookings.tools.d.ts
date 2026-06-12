import type { Booking, Customer, Camera } from '../supabase/types.js';
export declare function listBookings(filters: {
    status?: string;
    date_from?: string;
    date_to?: string;
    camera_id?: string;
    limit: number;
    offset: number;
}): Promise<Booking[]>;
export declare function getBooking(bookingId: string): Promise<Booking>;
export declare function searchBookings(query: string): Promise<Booking[]>;
export declare function getTodayReturns(): Promise<Booking[]>;
export declare function createBooking(fields: Record<string, unknown>): Promise<{
    booking: Booking;
    customer: Customer;
}>;
export declare function approveBooking(bookingId: string, notes?: string): Promise<Booking>;
export declare function rejectBooking(bookingId: string, reason: string): Promise<Booking>;
export declare function cancelBooking(bookingId: string, reason?: string): Promise<Booking>;
export declare function markPickup(bookingId: string, pickupNotes?: string, condition?: string): Promise<Booking>;
export declare function getOverduePayments(limit: number): Promise<Booking[]>;
export declare function getNextActions(limit: number): Promise<{
    pending_approvals: Booking[];
    todays_pickups: Booking[];
    todays_returns: Booking[];
    overdue_payments: Booking[];
}>;
export declare function completeBookingWorkflow(bookingId: string, options?: {
    pickupCondition?: string;
    returnCondition?: string;
    pickupNotes?: string;
    returnNotes?: string;
    refundNotes?: string;
}): Promise<Booking>;
export declare function deleteBooking(bookingId: string): Promise<void>;
export declare function markReturn(bookingId: string, returnNotes?: string, condition?: string): Promise<Booking>;
export declare function smartCreateBooking(fields: {
    camera_query: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    start_date: string;
    end_date: string;
    pickup_method?: string;
    customer_whatsapp?: string;
    customer_address?: string;
    customer_id_number?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    special_requests?: string;
}): Promise<{
    booking: Booking;
    customer: Customer;
    matched_camera: Camera;
    total_days: number;
    daily_rate: number;
    total_cost: number;
    deposit: number;
    discount_applied: boolean;
}>;
export declare function bulkApproveBookings(bookingIds: string[], notes?: string): Promise<{
    approved: string[];
    failed: {
        id: string;
        error: string;
    }[];
}>;
//# sourceMappingURL=bookings.tools.d.ts.map
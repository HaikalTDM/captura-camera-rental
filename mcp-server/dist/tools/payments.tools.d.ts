import type { PaymentRecord } from '../supabase/types.js';
export declare function recordPayment(fields: {
    booking_id: string;
    payment_type: 'deposit' | 'final' | 'refund';
    amount: number;
    payment_method: 'cash' | 'bank_transfer' | 'online';
    payment_reference?: string;
    notes?: string;
}): Promise<{
    payment: PaymentRecord;
    bookingUpdated: boolean;
}>;
export declare function markDepositRefunded(bookingId: string, refundAmount?: number, refundNotes?: string): Promise<PaymentRecord>;
//# sourceMappingURL=payments.tools.d.ts.map
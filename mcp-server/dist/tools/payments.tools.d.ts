export declare function recordPayment(fields: {
    booking_id: string;
    payment_type: 'deposit' | 'final' | 'refund';
    amount: number;
    payment_method: 'cash' | 'bank_transfer' | 'online';
    payment_reference?: string;
    notes?: string;
}): Promise<{
    success: boolean;
    booking_id: string;
    payment_type: string;
    amount: number;
}>;
export declare function markDepositRefunded(bookingId: string, refundAmount?: number, refundNotes?: string): Promise<{
    success: boolean;
    booking_id: string;
    refund_amount: number;
}>;
//# sourceMappingURL=payments.tools.d.ts.map
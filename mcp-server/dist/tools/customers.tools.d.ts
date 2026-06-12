import type { Customer } from '../supabase/types.js';
export declare function listCustomers(query: string, limit: number, offset: number): Promise<Customer[]>;
export declare function getCustomer(customerId: string): Promise<{
    customer: Customer;
    bookingsCount: number;
}>;
export declare function updateCustomer(customerId: string, fields: Record<string, unknown>): Promise<Customer>;
//# sourceMappingURL=customers.tools.d.ts.map
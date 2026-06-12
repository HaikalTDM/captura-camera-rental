import { getSupabaseAdmin, logQueryError } from '../supabase/client.js';
import { NotFoundError } from '../errors/handler.js';
import type { Customer } from '../supabase/types.js';

const CUSTOMER_SELECT = 'id, name, full_name, email, phone, whatsapp, address, id_number, emergency_contact_name, emergency_contact_phone, notes, created_at, updated_at';

export async function listCustomers(query: string, limit: number, offset: number): Promise<Customer[]> {
  const supabase = getSupabaseAdmin();

  let dbQuery = supabase.from('customers').select(CUSTOMER_SELECT);

  if (query) {
    dbQuery = dbQuery.or(
      `full_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`
    );
  }

  dbQuery = dbQuery.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

  const { data, error } = await dbQuery;

  if (error) {
    logQueryError('customers.list', error);
    throw new Error('Failed to fetch customers');
  }

  return data as Customer[];
}

export async function getCustomer(customerId: string): Promise<{ customer: Customer; bookingsCount: number }> {
  const supabase = getSupabaseAdmin();

  const { data: customer, error } = await supabase
    .from('customers')
    .select(CUSTOMER_SELECT)
    .eq('id', customerId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Customer', customerId);
    }
    logQueryError('customers.get', error);
    throw new Error('Failed to fetch customer');
  }

  const { count, error: countError } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('customer_id', customerId);

  if (countError) {
    logQueryError('customers.get.count', countError);
  }

  return { customer: customer as Customer, bookingsCount: count || 0 };
}

export async function updateCustomer(customerId: string, fields: Record<string, unknown>): Promise<Customer> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('customers')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', customerId)
    .select(CUSTOMER_SELECT)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Customer', customerId);
    }
    logQueryError('customers.update', error);
    throw new Error('Failed to update customer');
  }

  return data as Customer;
}

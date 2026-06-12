import { getSupabaseAdmin, logQueryError } from '../supabase/client.js';
import { NotFoundError, ConflictError, BusinessRuleError } from '../errors/handler.js';
import type { Booking, Customer, Camera } from '../supabase/types.js';

const BOOKING_SELECT = `
  *,
  customer:customers(id, name, full_name, email, phone, whatsapp)
`;

const CUSTOMER_SELECT = 'id, name, full_name, email, phone, whatsapp, address, id_number';

export async function listBookings(filters: {
  status?: string;
  date_from?: string;
  date_to?: string;
  camera_id?: string;
  limit: number;
  offset: number;
}): Promise<Booking[]> {
  const supabase = getSupabaseAdmin();

  let query = supabase.from('bookings').select(BOOKING_SELECT);

  if (filters.status) {
    query = query.eq('booking_status', filters.status);
  }
  if (filters.date_from) {
    query = query.gte('start_date', filters.date_from);
  }
  if (filters.date_to) {
    query = query.lte('end_date', filters.date_to);
  }
  if (filters.camera_id) {
    query = query.eq('camera_id', filters.camera_id);
  }

  query = query.order('created_at', { ascending: false }).range(filters.offset, filters.offset + filters.limit - 1);

  const { data, error } = await query;

  if (error) {
    logQueryError('bookings.list', error);
    throw new Error('Failed to fetch bookings');
  }

  return data as Booking[];
}

export async function getBooking(bookingId: string): Promise<Booking> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('bookings')
    .select(BOOKING_SELECT)
    .eq('id', bookingId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Booking', bookingId);
    }
    logQueryError('bookings.get', error);
    throw new Error('Failed to fetch booking');
  }

  return data as Booking;
}

export async function searchBookings(query: string): Promise<Booking[]> {
  const supabase = getSupabaseAdmin();

  // Search by customer name, email, or phone via join
  const { data, error } = await supabase
    .from('bookings')
    .select(BOOKING_SELECT)
    .or(
      `customer.full_name.ilike.%${query}%,customer.email.ilike.%${query}%,customer.phone.ilike.%${query}%`,
      { referencedTable: 'customer' }
    )
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    // Fallback: search by notes/booking ID
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('bookings')
      .select(BOOKING_SELECT)
      .or(`notes.ilike.%${query}%,id.eq.${query}`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (fallbackError) {
      logQueryError('bookings.search', fallbackError);
      throw new Error('Failed to search bookings');
    }

    return fallbackData as Booking[];
  }

  return data as Booking[];
}

export async function getTodayReturns(): Promise<Booking[]> {
  const supabase = getSupabaseAdmin();

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('bookings')
    .select(BOOKING_SELECT)
    .eq('end_date', today)
    .eq('booking_status', 'confirmed')
    .eq('equipment_returned', false)
    .order('created_at', { ascending: false });

  if (error) {
    logQueryError('bookings.todayReturns', error);
    throw new Error('Failed to fetch today\'s returns');
  }

  return data as Booking[];
}

export async function createBooking(fields: Record<string, unknown>): Promise<{ booking: Booking; customer: Customer }> {
  const supabase = getSupabaseAdmin();

  // Upsert customer first
  const customerEmail = fields.customer_email as string;
  const customerPhone = fields.customer_phone as string;

  if (!customerEmail) {
    throw new Error('Customer email is required');
  }

  const { data: existingCustomer } = await supabase
    .from('customers')
    .select('id, email')
    .eq('email', customerEmail)
    .maybeSingle();

  let customerId: string;

  if (existingCustomer) {
    customerId = existingCustomer.id;
    // Update existing customer
    await supabase
      .from('customers')
      .update({
        name: fields.customer_name as string,
        phone: customerPhone,
        full_name: fields.customer_name as string,
        updated_at: new Date().toISOString(),
      })
      .eq('id', customerId);
  } else {
    const { data: newCustomer, error: customerError } = await supabase
      .from('customers')
      .insert([{
        name: fields.customer_name,
        full_name: fields.customer_name,
        email: customerEmail,
        phone: customerPhone,
        whatsapp: fields.customer_whatsapp || customerPhone,
        address: fields.customer_address || null,
        id_number: fields.customer_id_number || null,
        emergency_contact_name: fields.emergency_contact_name || null,
        emergency_contact_phone: fields.emergency_contact_phone || null,
      }])
      .select('id')
      .single();

    if (customerError) {
      logQueryError('bookings.create.customer', customerError);
      throw new Error('Failed to create customer record');
    }

    customerId = newCustomer.id;
  }

  // Create booking
  const bookingPayload = {
    customer_id: customerId,
    camera_id: fields.camera_id,
    start_date: fields.start_date,
    end_date: fields.end_date,
    total_days: fields.total_days,
    daily_rate: fields.daily_rate,
    total_amount: fields.total_amount,
    deposit_amount: fields.deposit_amount || 100,
    final_payment_amount: fields.total_amount as number,
    status: 'pending',
    booking_status: 'confirmed',
    pickup_method: fields.pickup_method || 'pickup',
    pickup_address: fields.pickup_address || null,
    delivery_fee: fields.delivery_fee || 0,
    booking_source: fields.booking_source || 'manual',
    notes: fields.special_requests || null,
  };

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert([bookingPayload])
    .select(BOOKING_SELECT)
    .single();

  if (bookingError) {
    logQueryError('bookings.create.booking', bookingError);
    throw new Error('Failed to create booking');
  }

  // Fetch full customer record
  const { data: customer } = await supabase
    .from('customers')
    .select(CUSTOMER_SELECT)
    .eq('id', customerId)
    .single();

  return { booking: booking as Booking, customer: (customer || { id: customerId }) as Customer };
}

export async function approveBooking(bookingId: string, notes?: string): Promise<Booking> {
  const supabase = getSupabaseAdmin();

  const updates: Record<string, unknown> = {
    booking_status: 'confirmed',
    status: 'confirmed',
    approved_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (notes) {
    updates.admin_notes = notes;
  }

  const { data, error } = await supabase
    .from('bookings')
    .update(updates)
    .eq('id', bookingId)
    .select(BOOKING_SELECT)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Booking', bookingId);
    }
    logQueryError('bookings.approve', error);
    throw new Error('Failed to approve booking');
  }

  return data as Booking;
}

export async function rejectBooking(bookingId: string, reason: string): Promise<Booking> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('bookings')
    .update({
      booking_status: 'rejected',
      status: 'cancelled',
      rejection_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId)
    .select(BOOKING_SELECT)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Booking', bookingId);
    }
    logQueryError('bookings.reject', error);
    throw new Error('Failed to reject booking');
  }

  return data as Booking;
}

export async function cancelBooking(bookingId: string, reason?: string): Promise<Booking> {
  const supabase = getSupabaseAdmin();

  const updates: Record<string, unknown> = {
    booking_status: 'cancelled',
    status: 'cancelled',
    updated_at: new Date().toISOString(),
  };

  if (reason) {
    updates.notes = reason;
  }

  const { data, error } = await supabase
    .from('bookings')
    .update(updates)
    .eq('id', bookingId)
    .select(BOOKING_SELECT)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Booking', bookingId);
    }
    logQueryError('bookings.cancel', error);
    throw new Error('Failed to cancel booking');
  }

  return data as Booking;
}

export async function markPickup(
  bookingId: string,
  pickupNotes?: string,
  condition?: string
): Promise<Booking> {
  const supabase = getSupabaseAdmin();

  const updates: Record<string, unknown> = {
    equipment_picked_up: true,
    equipment_pickup_date: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'active',
    booking_status: 'confirmed',
  };

  if (pickupNotes) {
    updates.equipment_pickup_notes = pickupNotes;
  }
  if (condition) {
    updates.equipment_condition_pickup = condition;
  }

  const { data, error } = await supabase
    .from('bookings')
    .update(updates)
    .eq('id', bookingId)
    .select(BOOKING_SELECT)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Booking', bookingId);
    }
    logQueryError('bookings.markPickup', error);
    throw new Error('Failed to mark pickup');
  }

  return data as Booking;
}

export async function getOverduePayments(limit: number): Promise<Booking[]> {
  const supabase = getSupabaseAdmin();
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('bookings')
    .select(BOOKING_SELECT)
    .eq('final_payment_paid', false)
    .eq('booking_status', 'completed')
    .lt('end_date', today)
    .order('end_date', { ascending: false })
    .limit(limit);

  if (error) {
    logQueryError('bookings.overdue', error);
    throw new Error('Failed to fetch overdue payments');
  }

  return (data || []) as Booking[];
}

export async function getNextActions(limit: number): Promise<{
  pending_approvals: Booking[];
  todays_pickups: Booking[];
  todays_returns: Booking[];
  overdue_payments: Booking[];
}> {
  const supabase = getSupabaseAdmin();
  const today = new Date().toISOString().split('T')[0];

  const [pending, pickups, returns, overdue] = await Promise.all([
    supabase.from('bookings')
      .select(BOOKING_SELECT)
      .eq('booking_status', 'pending_approval')
      .order('created_at', { ascending: false })
      .limit(limit),
    supabase.from('bookings')
      .select(BOOKING_SELECT)
      .eq('booking_status', 'confirmed')
      .eq('equipment_picked_up', false)
      .eq('pickup_date', today)
      .order('created_at', { ascending: false })
      .limit(limit),
    supabase.from('bookings')
      .select(BOOKING_SELECT)
      .eq('booking_status', 'confirmed')
      .eq('equipment_returned', false)
      .eq('end_date', today)
      .order('created_at', { ascending: false })
      .limit(limit),
    supabase.from('bookings')
      .select(BOOKING_SELECT)
      .eq('final_payment_paid', false)
      .eq('booking_status', 'completed')
      .lt('end_date', today)
      .order('end_date', { ascending: false })
      .limit(limit),
  ]);

  return {
    pending_approvals: (pending.data || []) as Booking[],
    todays_pickups: (pickups.data || []) as Booking[],
    todays_returns: (returns.data || []) as Booking[],
    overdue_payments: (overdue.data || []) as Booking[],
  };
}

export async function completeBookingWorkflow(
  bookingId: string,
  options?: {
    pickupCondition?: string;
    returnCondition?: string;
    pickupNotes?: string;
    returnNotes?: string;
    refundNotes?: string;
  }
): Promise<Booking> {
  // Step 1: mark picked up
  await markPickup(
    bookingId,
    options?.pickupNotes || 'Completed via MCP',
    options?.pickupCondition || 'good'
  );

  // Step 2: mark returned
  await markReturn(
    bookingId,
    options?.returnNotes || 'Returned via MCP',
    options?.returnCondition || 'good'
  );

  // Step 3: mark deposit refunded
  const supabase = getSupabaseAdmin();
  const { data: booking } = await supabase
    .from('bookings')
    .select('deposit_amount')
    .eq('id', bookingId)
    .single();

  if (booking) {
    await supabase
      .from('payment_records')
      .insert([{
        booking_id: bookingId,
        payment_type: 'refund',
        amount: booking.deposit_amount || 100,
        payment_method: 'cash',
        payment_date: new Date().toISOString().split('T')[0],
        notes: options?.refundNotes || 'Deposit refunded via MCP complete',
      }]);

    await supabase
      .from('bookings')
      .update({
        deposit_refunded: true,
        deposit_refund_date: new Date().toISOString(),
        deposit_refund_amount: booking.deposit_amount || 100,
        deposit_refund_notes: options?.refundNotes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);
  }

  // Fetch final state
  return getBooking(bookingId);
}

export async function deleteBooking(bookingId: string): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', bookingId);

  if (error) {
    logQueryError('bookings.delete', error);
    throw new Error('Failed to delete booking');
  }
}

export async function markReturn(
  bookingId: string,
  returnNotes?: string,
  condition?: string
): Promise<Booking> {
  const supabase = getSupabaseAdmin();

  const updates: Record<string, unknown> = {
    equipment_returned: true,
    equipment_return_date: new Date().toISOString(),
    status: 'completed',
    booking_status: 'completed',
    updated_at: new Date().toISOString(),
  };

  if (returnNotes) {
    updates.equipment_return_notes = returnNotes;
  }
  if (condition) {
    updates.equipment_condition_return = condition;
  }

  const { data, error } = await supabase
    .from('bookings')
    .update(updates)
    .eq('id', bookingId)
    .select(BOOKING_SELECT)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Booking', bookingId);
    }
    logQueryError('bookings.markReturn', error);
    throw new Error('Failed to mark return');
  }

  return data as Booking;
}

export async function smartCreateBooking(fields: {
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
}> {
  const query = fields.camera_query.toLowerCase().trim();
  const supabase = getSupabaseAdmin();

  const { data: cameras, error: cameraSearchError } = await supabase
    .from('cameras')
    .select('*')
    .eq('is_available', true)
    .order('display_order', { ascending: true });

  if (cameraSearchError) {
    logQueryError('smartCreate.cameraSearch', cameraSearchError);
    throw new Error('Failed to search cameras');
  }

  const matches = (cameras || []).filter((c) =>
    c.name.toLowerCase().includes(query) ||
    c.brand?.toLowerCase().includes(query) ||
    c.model?.toLowerCase().includes(query)
  );

  if (matches.length === 0) {
    const availableNames = (cameras || []).map(c => c.name).join(', ');
    throw new NotFoundError('Camera', `"${fields.camera_query}". Available: ${availableNames}`);
  }

  if (matches.length > 1) {
    const options = matches.map(c => `${c.name} (${c.id} | RM${c.daily_rate}/day)`);
    throw new BusinessRuleError(
      `Multiple cameras match "${fields.camera_query}": ${options.join('; ')}. Please specify which one.`
    );
  }

  const matchedCamera = matches[0] as Camera;

  const { data: conflicts, error: availError } = await supabase
    .from('bookings')
    .select('id, start_date, end_date')
    .eq('camera_id', matchedCamera.id)
    .not('booking_status', 'in', '("cancelled","rejected")')
    .or(`start_date.lte.${fields.end_date},end_date.gte.${fields.start_date}`)
    .not('end_date', 'lt', fields.start_date)
    .not('start_date', 'gt', fields.end_date);

  if (availError) {
    logQueryError('smartCreate.availability', availError);
    throw new Error('Failed to check availability');
  }

  if (conflicts && conflicts.length >= (matchedCamera.available_quantity || 1)) {
    throw new ConflictError(
      `${matchedCamera.name} is not available for ${fields.start_date} to ${fields.end_date}. ${conflicts.length} conflicting booking(s).`
    );
  }

  const start = new Date(fields.start_date);
  const end = new Date(fields.end_date);
  const timeDiff = end.getTime() - start.getTime();
  let totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
  if (totalDays <= 0) totalDays = 1;
  else totalDays = totalDays + 1;

  const threshold = matchedCamera.discount_threshold || 3;
  const discountApplied = totalDays >= threshold;
  const weeklyRate = Number(matchedCamera.weekly_rate || 0);

  let discountedRate: number;
  if (weeklyRate <= 0) {
    discountedRate = Math.round(matchedCamera.daily_rate * 0.9 * 100) / 100;
  } else if (weeklyRate > matchedCamera.daily_rate * 1.5) {
    discountedRate = Math.round((weeklyRate / 7) * 100) / 100;
  } else {
    discountedRate = Math.round(weeklyRate * 100) / 100;
  }

  const dailyRate = discountApplied ? discountedRate : matchedCamera.daily_rate;
  const totalCost = dailyRate * totalDays;
  const deposit = 100;

  const result = await createBooking({
    camera_id: matchedCamera.id,
    customer_name: fields.customer_name,
    customer_email: fields.customer_email,
    customer_phone: fields.customer_phone,
    customer_whatsapp: fields.customer_whatsapp || fields.customer_phone,
    customer_address: fields.customer_address,
    customer_id_number: fields.customer_id_number,
    emergency_contact_name: fields.emergency_contact_name,
    emergency_contact_phone: fields.emergency_contact_phone,
    start_date: fields.start_date,
    end_date: fields.end_date,
    total_days: totalDays,
    daily_rate: dailyRate,
    total_amount: totalCost,
    deposit_amount: 100,
    pickup_method: (fields.pickup_method as 'pickup' | 'delivery') || 'pickup',
    pickup_address: fields.customer_address,
    delivery_fee: 0,
    special_requests: fields.special_requests,
    booking_source: 'manual',
  });

  return {
    booking: result.booking,
    customer: result.customer,
    matched_camera: matchedCamera,
    total_days: totalDays,
    daily_rate: dailyRate,
    total_cost: totalCost,
    deposit,
    discount_applied: discountApplied,
  };
}

export async function bulkApproveBookings(
  bookingIds: string[],
  notes?: string
): Promise<{ approved: string[]; failed: { id: string; error: string }[] }> {
  const approved: string[] = [];
  const failed: { id: string; error: string }[] = [];

  for (const id of bookingIds) {
    try {
      await approveBooking(id, notes);
      approved.push(id);
    } catch (err) {
      failed.push({
        id,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  return { approved, failed };
}

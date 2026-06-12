import { getSupabaseAdmin, logQueryError } from '../supabase/client.js';
import { NotFoundError } from '../errors/handler.js';
export async function generateInvoice(bookingId) {
    const supabase = getSupabaseAdmin();
    // Fetch booking with customer and camera
    const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select(`
      *,
      customer:customers(*)
    `)
        .eq('id', bookingId)
        .single();
    if (bookingError) {
        if (bookingError.code === 'PGRST116') {
            throw new NotFoundError('Booking', bookingId);
        }
        logQueryError('invoices.generate.booking', bookingError);
        throw new Error('Failed to fetch booking');
    }
    // Fetch camera separately (no FK in schema cache)
    let cameraName = 'Unknown Camera';
    if (booking?.camera_id) {
        const { data: cam } = await supabase
            .from('cameras')
            .select('name')
            .eq('id', booking.camera_id)
            .single();
        if (cam)
            cameraName = cam.name;
    }
    const { data: settings } = await supabase
        .from('business_settings')
        .select('*');
    const settingsMap = {};
    if (settings) {
        for (const s of settings) {
            const k = (s.setting_key ?? s.key ?? '');
            const v = (s.setting_value ?? s.value ?? '');
            if (k)
                settingsMap[k] = v;
        }
    }
    // Check if invoice already exists
    const { data: existingInvoice } = await supabase
        .from('invoices')
        .select('id')
        .eq('booking_id', bookingId)
        .maybeSingle();
    if (existingInvoice) {
        // Return existing invoice
        const { data: invoice } = await supabase
            .from('invoices')
            .select('*')
            .eq('id', existingInvoice.id)
            .single();
        return invoice;
    }
    // Generate invoice number: INV-YYYYMMDD-XXXX
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const invoiceNumber = `INV-${today}-${randomSuffix}`;
    const customer = booking.customer || {};
    const camera = booking.camera || {};
    const customerSnapshot = {
        full_name: customer.full_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        id_number: customer.id_number || '',
    };
    const businessSnapshot = {
        business_name: settingsMap.business_name || 'CAPTURA',
        business_email: settingsMap.business_email || 'captura.my@gmail.com',
        business_phone: settingsMap.whatsapp_number || '0177464121',
        business_address: settingsMap.pickup_location || 'No 78, Jalan Masjid, Selayang Pandang',
        logo_url: '',
    };
    const bookingSnapshot = {
        booking_id: bookingId,
        camera_name: cameraName,
        rental_start_date: booking.start_date,
        rental_end_date: booking.end_date,
        total_days: booking.total_days,
        pickup_method: booking.pickup_method || 'pickup',
        pickup_address: booking.pickup_address || '',
        rental_subtotal: booking.total_amount,
        delivery_fee: booking.delivery_fee || 0,
        deposit_amount: booking.deposit_amount || 100,
        deposit_paid_amount: booking.deposit_paid ? booking.deposit_amount : 0,
        total_amount: booking.total_amount,
        balance_due: booking.final_payment_paid ? 0 : booking.total_amount,
        notes: booking.notes || '',
    };
    const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{
            booking_id: bookingId,
            invoice_number: invoiceNumber,
            status: 'draft',
            issue_date: new Date().toISOString().split('T')[0],
            customer_snapshot: customerSnapshot,
            business_snapshot: businessSnapshot,
            booking_snapshot: bookingSnapshot,
        }])
        .select()
        .single();
    if (invoiceError) {
        logQueryError('invoices.generate', invoiceError);
        throw new Error('Failed to generate invoice');
    }
    return invoice;
}
//# sourceMappingURL=invoices.tools.js.map
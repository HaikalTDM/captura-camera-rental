import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { validate } from './validation/validator.js';
import { cameraCreateSchema, cameraUpdateSchema, cameraAvailabilitySchema, bookingCreateSchema, bookingApproveSchema, bookingRejectSchema, bookingCancelSchema, bookingPickupSchema, bookingReturnSchema, customerUpdateSchema, paymentRecordSchema, depositRefundSchema, invoiceGenerateSchema, settingsUpdateSchema, } from './validation/schemas.js';
import { requireAccess, AccessLevel, AUTH_TOOLS } from './auth/guard.js';
import { getAuthTokenFromArgs } from './auth/api-key.js';
import { formatError, BusinessRuleError } from './errors/handler.js';
import { auditLog } from './audit/logger.js';
import { listCameras, getCamera, checkAvailability, createCamera, updateCamera, setCameraAvailability, } from './tools/cameras.tools.js';
import { listBookings, getBooking, searchBookings, getTodayReturns, createBooking, approveBooking, rejectBooking, cancelBooking, markPickup, markReturn, completeBookingWorkflow, deleteBooking, getOverduePayments, getNextActions, smartCreateBooking, bulkApproveBookings, } from './tools/bookings.tools.js';
import { listCustomers, getCustomer, updateCustomer, } from './tools/customers.tools.js';
import { recordPayment, markDepositRefunded, } from './tools/payments.tools.js';
import { generateInvoice } from './tools/invoices.tools.js';
import { getSettings, updateSetting, getDashboardSummary, getRevenueReport, } from './tools/admin.tools.js';
function authGate(toolName, args) {
    const accessLevel = AUTH_TOOLS[toolName] || AccessLevel.PUBLIC_READ;
    const apiKey = getAuthTokenFromArgs(args);
    requireAccess(toolName, accessLevel, apiKey);
}
function stripAuthArg(args) {
    const { _apiKey, ...rest } = args;
    return rest;
}
export function createServer() {
    const server = new McpServer({
        name: 'captura',
        version: '1.0.0',
    });
    // ── Camera Tools ──
    server.tool('captura.cameras.list', 'List all cameras in inventory. Shows pricing, availability, and discount thresholds.', {
        filter: z.enum(['available_only', 'all']).optional().default('available_only'),
        sort_by: z.enum(['display_order', 'daily_rate', 'name']).optional().default('display_order'),
        _apiKey: z.string().optional(),
    }, async (args) => {
        try {
            authGate('captura.cameras.list', args);
            const cameras = await listCameras(args.filter, args.sort_by);
            auditLog({ tool_name: 'captura.cameras.list', action: 'list', details: { filter: args.filter, count: cameras.length } });
            return { content: [{ type: 'text', text: JSON.stringify({ cameras, count: cameras.length }, null, 2) }] };
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('captura.cameras.get', 'Get detailed information about a specific camera by ID.', {
        camera_id: z.string().uuid('Invalid camera ID format'),
        _apiKey: z.string().optional(),
    }, async (args) => {
        try {
            authGate('captura.cameras.get', args);
            const camera = await getCamera(args.camera_id);
            return { content: [{ type: 'text', text: JSON.stringify(camera, null, 2) }] };
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('captura.cameras.check_availability', 'Check if a specific camera is available for a given date range. Returns availability status and any conflicting bookings.', {
        camera_id: z.string().uuid(),
        start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        _apiKey: z.string().optional(),
    }, async (args) => {
        try {
            authGate('captura.cameras.check_availability', args);
            const result = await checkAvailability(args.camera_id, args.start_date, args.end_date);
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('captura.cameras.admin.create', 'Add a new camera to the inventory. Requires admin authentication.', {
        name: z.string().min(2).max(255),
        brand: z.string().min(1).max(100),
        model: z.string().min(1).max(100),
        type: z.enum(['action', 'mirrorless', 'dslr', 'compact']),
        daily_rate: z.number().positive(),
        weekly_rate: z.number().positive().optional(),
        discount_threshold: z.number().int().min(2).max(30).optional().default(3),
        deposit_amount: z.number().positive().optional().default(100),
        description: z.string().max(2000).optional(),
        image_url: z.string().max(500).optional(),
        is_available: z.boolean().optional().default(true),
        display_order: z.number().int().min(0).optional().default(99),
        condition: z.enum(['excellent', 'good', 'fair', 'needs_repair']).optional().default('excellent'),
        location: z.string().max(255).optional(),
        notes: z.string().max(2000).optional(),
        specifications: z.record(z.unknown()).optional(),
        _apiKey: z.string().optional(),
    }, async (args) => {
        try {
            authGate('captura.cameras.admin.create', args);
            const fields = validate(cameraCreateSchema, stripAuthArg(args));
            const camera = await createCamera(fields);
            auditLog({ tool_name: 'captura.cameras.admin.create', action: 'create', target_id: camera.id, details: { name: camera.name } });
            return { content: [{ type: 'text', text: JSON.stringify({ success: true, camera }, null, 2) }] };
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('captura.cameras.admin.update', 'Update camera details including pricing, availability, and specifications. Requires admin authentication.', {
        camera_id: z.string().uuid(),
        name: z.string().min(2).max(255).optional(),
        brand: z.string().min(1).max(100).optional(),
        daily_rate: z.number().positive().optional(),
        weekly_rate: z.number().positive().optional(),
        discount_threshold: z.number().int().min(2).max(30).optional(),
        description: z.string().max(2000).optional(),
        image_url: z.string().max(500).optional(),
        is_available: z.boolean().optional(),
        display_order: z.number().int().min(0).optional(),
        condition: z.enum(['excellent', 'good', 'fair', 'needs_repair']).optional(),
        location: z.string().max(255).optional(),
        notes: z.string().max(2000).optional(),
        specifications: z.record(z.unknown()).optional(),
        _apiKey: z.string().optional(),
    }, async (args) => {
        try {
            authGate('captura.cameras.admin.update', args);
            const fields = validate(cameraUpdateSchema, stripAuthArg(args));
            const { camera_id, ...updateFields } = fields;
            const camera = await updateCamera(camera_id, updateFields);
            auditLog({ tool_name: 'captura.cameras.admin.update', action: 'update', target_id: camera.id, details: { fields: Object.keys(updateFields) } });
            return { content: [{ type: 'text', text: JSON.stringify({ success: true, camera }, null, 2) }] };
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('captura.cameras.admin.set_availability', 'Toggle camera availability on/off. Use to mark cameras as in maintenance or available for rent.', {
        camera_id: z.string().uuid(),
        is_available: z.boolean(),
        notes: z.string().max(500).optional(),
        _apiKey: z.string().optional(),
    }, async (args) => {
        try {
            authGate('captura.cameras.admin.set_availability', args);
            const fields = validate(cameraAvailabilitySchema, stripAuthArg(args));
            const camera = await setCameraAvailability(fields.camera_id, fields.is_available, fields.notes);
            auditLog({ tool_name: 'captura.cameras.admin.set_availability', action: 'set_availability', target_id: fields.camera_id, details: { is_available: fields.is_available } });
            return { content: [{ type: 'text', text: JSON.stringify({ success: true, camera }, null, 2) }] };
        }
        catch (e) {
            return formatError(e);
        }
    });
    // ── Booking Tools ──
    server.tool('captura.bookings.list', 'List bookings with optional filtering by status, date range, or camera. Requires authentication to view customer details.', {
        status: z.string().optional(),
        date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        camera_id: z.string().uuid().optional(),
        limit: z.number().int().min(1).max(200).optional().default(50),
        offset: z.number().int().min(0).optional().default(0),
        _apiKey: z.string().optional(),
    }, async (args) => {
        try {
            authGate('captura.bookings.list', args);
            const bookings = await listBookings(stripAuthArg(args));
            return { content: [{ type: 'text', text: JSON.stringify({ bookings, count: bookings.length }, null, 2) }] };
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('captura.bookings.get', 'Get full details of a single booking including customer and camera information.', {
        booking_id: z.string().uuid(),
        _apiKey: z.string().optional(),
    }, async (args) => {
        try {
            authGate('captura.bookings.get', args);
            const booking = await getBooking(args.booking_id);
            return { content: [{ type: 'text', text: JSON.stringify(booking, null, 2) }] };
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('captura.bookings.search', 'Search bookings by customer name, email, or phone number.', {
        query: z.string().min(1).max(255),
        _apiKey: z.string().optional(),
    }, async (args) => {
        try {
            authGate('captura.bookings.search', args);
            const bookings = await searchBookings(args.query);
            return { content: [{ type: 'text', text: JSON.stringify({ bookings, count: bookings.length }, null, 2) }] };
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('captura.bookings.today_returns', 'Get all bookings due for return today that have not been returned yet.', {
        _apiKey: z.string().optional(),
    }, async (args) => {
        try {
            authGate('captura.bookings.today_returns', args);
            const bookings = await getTodayReturns();
            return { content: [{ type: 'text', text: JSON.stringify({ bookings, count: bookings.length }, null, 2) }] };
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('captura.bookings.admin.create', 'Create a new booking manually. Automatically creates or updates the customer record. Requires admin authentication.', {
        camera_id: z.string().uuid(),
        customer_name: z.string().min(2).max(255),
        customer_email: z.string().email(),
        customer_phone: z.string().regex(/^\+?[0-9\s\-\(\)]{8,}$/),
        customer_whatsapp: z.string().optional(),
        customer_address: z.string().max(500).optional(),
        customer_id_number: z.string().max(50).optional(),
        emergency_contact_name: z.string().max(255).optional(),
        emergency_contact_phone: z.string().optional(),
        start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        total_days: z.number().int().positive(),
        daily_rate: z.number().positive(),
        total_amount: z.number().positive(),
        deposit_amount: z.number().positive().optional().default(100),
        pickup_method: z.enum(['pickup', 'delivery']),
        pickup_address: z.string().max(500).optional(),
        delivery_fee: z.number().min(0).optional().default(0),
        special_requests: z.string().max(1000).optional(),
        booking_source: z.enum(['website', 'phone', 'whatsapp', 'walk-in', 'manual']).optional().default('manual'),
        _apiKey: z.string().optional(),
    }, async (args) => {
        try {
            authGate('captura.bookings.admin.create', args);
            const fields = validate(bookingCreateSchema, stripAuthArg(args));
            if (fields.end_date < fields.start_date) {
                throw new BusinessRuleError('End date must be on or after start date');
            }
            const result = await createBooking(fields);
            auditLog({ tool_name: 'captura.bookings.admin.create', action: 'create', target_id: result.booking.id, details: { camera_id: fields.camera_id, customer_email: fields.customer_email } });
            return { content: [{ type: 'text', text: JSON.stringify({ success: true, booking: result.booking, customer: result.customer }, null, 2) }] };
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('captura.bookings.admin.approve', 'Approve a pending booking. Sets status to confirmed.', {
        booking_id: z.string().uuid(),
        notes: z.string().max(500).optional(),
        _apiKey: z.string().optional(),
    }, async (args) => {
        try {
            authGate('captura.bookings.admin.approve', args);
            const fields = validate(bookingApproveSchema, stripAuthArg(args));
            const booking = await approveBooking(fields.booking_id, fields.notes);
            auditLog({ tool_name: 'captura.bookings.admin.approve', action: 'approve', target_id: fields.booking_id, details: {} });
            return { content: [{ type: 'text', text: JSON.stringify({ success: true, booking }, null, 2) }] };
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('captura.bookings.admin.reject', 'Reject a booking with a required reason.', {
        booking_id: z.string().uuid(),
        reason: z.string().min(1).max(500),
        _apiKey: z.string().optional(),
    }, async (args) => {
        try {
            authGate('captura.bookings.admin.reject', args);
            const fields = validate(bookingRejectSchema, stripAuthArg(args));
            const booking = await rejectBooking(fields.booking_id, fields.reason);
            auditLog({ tool_name: 'captura.bookings.admin.reject', action: 'reject', target_id: fields.booking_id, details: { reason: fields.reason } });
            return { content: [{ type: 'text', text: JSON.stringify({ success: true, booking }, null, 2) }] };
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('captura.bookings.admin.cancel', 'Cancel a booking. Requires explicit confirmation via confirm=true parameter.', {
        booking_id: z.string().uuid(),
        reason: z.string().max(500).optional(),
        confirm: z.literal(true),
        _apiKey: z.string().optional(),
    }, async (args) => {
        try {
            authGate('captura.bookings.admin.cancel', args);
            const fields = validate(bookingCancelSchema, stripAuthArg(args));
            const booking = await cancelBooking(fields.booking_id, fields.reason);
            auditLog({ tool_name: 'captura.bookings.admin.cancel', action: 'cancel', target_id: fields.booking_id, details: { reason: fields.reason } });
            return { content: [{ type: 'text', text: JSON.stringify({ success: true, booking }, null, 2) }] };
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('captura.bookings.admin.mark_pickup', 'Mark equipment as picked up by the customer. Updates booking status to active.', {
        booking_id: z.string().uuid(),
        pickup_notes: z.string().max(500).optional(),
        equipment_condition: z.enum(['excellent', 'good', 'fair', 'damaged']).optional().default('excellent'),
        _apiKey: z.string().optional(),
    }, async (args) => {
        try {
            authGate('captura.bookings.admin.mark_pickup', args);
            const fields = validate(bookingPickupSchema, stripAuthArg(args));
            const booking = await markPickup(fields.booking_id, fields.pickup_notes, fields.equipment_condition);
            auditLog({ tool_name: 'captura.bookings.admin.mark_pickup', action: 'mark_pickup', target_id: fields.booking_id, details: { condition: fields.equipment_condition } });
            return { content: [{ type: 'text', text: JSON.stringify({ success: true, booking }, null, 2) }] };
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('captura.bookings.admin.mark_return', 'Mark equipment as returned by the customer. Updates booking status to completed.', {
        booking_id: z.string().uuid(),
        return_notes: z.string().max(500).optional(),
        equipment_condition: z.enum(['excellent', 'good', 'fair', 'damaged']).optional().default('excellent'),
        _apiKey: z.string().optional(),
    }, async (args) => {
        try {
            authGate('captura.bookings.admin.mark_return', args);
            const fields = validate(bookingReturnSchema, stripAuthArg(args));
            const booking = await markReturn(fields.booking_id, fields.return_notes, fields.equipment_condition);
            auditLog({ tool_name: 'captura.bookings.admin.mark_return', action: 'mark_return', target_id: fields.booking_id, details: { condition: fields.equipment_condition } });
            return { content: [{ type: 'text', text: JSON.stringify({ success: true, booking }, null, 2) }] };
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('captura.bookings.admin.complete', 'Complete the full booking workflow in one operation: mark pickup, mark return, and refund deposit.', {
        booking_id: z.string().uuid(),
        pickup_condition: z.enum(['excellent', 'good', 'fair', 'damaged']).optional().default('good'),
        return_condition: z.enum(['excellent', 'good', 'fair', 'damaged']).optional().default('good'),
        pickup_notes: z.string().max(500).optional(),
        return_notes: z.string().max(500).optional(),
        refund_notes: z.string().max(500).optional(),
        _apiKey: z.string().optional(),
    }, async (args) => {
        try {
            authGate('captura.bookings.admin.complete', args);
            const booking = await completeBookingWorkflow(args.booking_id, {
                pickupCondition: args.pickup_condition,
                returnCondition: args.return_condition,
                pickupNotes: args.pickup_notes,
                returnNotes: args.return_notes,
                refundNotes: args.refund_notes,
            });
            auditLog({ tool_name: 'captura.bookings.admin.complete', action: 'complete', target_id: args.booking_id, details: {} });
            return { content: [{ type: 'text', text: JSON.stringify({ success: true, booking }, null, 2) }] };
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('captura.bookings.admin.delete', 'Delete a booking permanently. Requires admin authentication. IRREVERSIBLE.', {
        booking_id: z.string().uuid(),
        confirm: z.literal(true),
        _apiKey: z.string().optional(),
    }, async (args) => {
        try {
            authGate('captura.bookings.admin.delete', args);
            await deleteBooking(args.booking_id);
            auditLog({ tool_name: 'captura.bookings.admin.delete', action: 'delete', target_id: args.booking_id, details: {} });
            return { content: [{ type: 'text', text: JSON.stringify({ success: true, message: `Booking ${args.booking_id} deleted` }, null, 2) }] };
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('captura.bookings.overdue', 'List bookings with overdue final payments (returned but final payment not yet settled).', {
        limit: z.number().int().min(1).max(100).optional().default(20),
        _apiKey: z.string().optional(),
    }, async (args) => {
        try {
            authGate('captura.bookings.overdue', args);
            const bookings = await getOverduePayments(args.limit);
            return { content: [{ type: 'text', text: JSON.stringify({ bookings, count: bookings.length }, null, 2) }] };
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('captura.bookings.next_actions', 'Get the operational action queue: pending approvals, today\'s pickups, today\'s returns, and overdue payments.', {
        limit: z.number().int().min(1).max(50).optional().default(10),
        _apiKey: z.string().optional(),
    }, async (args) => {
        try {
            authGate('captura.bookings.next_actions', args);
            const actions = await getNextActions(args.limit);
            return { content: [{ type: 'text', text: JSON.stringify(actions, null, 2) }] };
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('captura.bookings.admin.smart_create', 'Create a booking with fuzzy camera name matching. Accepts "osmo", "r50", "action", "fuji" etc. Automatically checks availability and applies bulk discounts. Single call replaces 4 separate steps.', {
        camera_query: z.string().min(1).max(100),
        customer_name: z.string().min(2).max(255),
        customer_email: z.string().email(),
        customer_phone: z.string().regex(/^\+?[0-9\s\-\(\)]{8,}$/),
        start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        pickup_method: z.enum(['pickup', 'delivery']).optional().default('pickup'),
        customer_whatsapp: z.string().optional(),
        customer_address: z.string().max(500).optional(),
        customer_id_number: z.string().max(50).optional(),
        emergency_contact_name: z.string().max(255).optional(),
        emergency_contact_phone: z.string().optional(),
        special_requests: z.string().max(1000).optional(),
        _apiKey: z.string().optional(),
    }, async (args) => {
        try {
            authGate('captura.bookings.admin.smart_create', args);
            const { _apiKey, ...fields } = args;
            if (fields.end_date < fields.start_date) {
                throw new BusinessRuleError('End date must be on or after start date');
            }
            const result = await smartCreateBooking(fields);
            auditLog({ tool_name: 'captura.bookings.admin.smart_create', action: 'smart_create', target_id: result.booking.id, details: { camera: result.matched_camera.name, customer: fields.customer_email } });
            return { content: [{ type: 'text', text: JSON.stringify({
                            success: true,
                            booking_id: result.booking.id,
                            camera: result.matched_camera.name,
                            total_days: result.total_days,
                            daily_rate: result.daily_rate,
                            total_cost: result.total_cost,
                            deposit: result.deposit,
                            discount_applied: result.discount_applied,
                            discount_threshold: result.matched_camera.discount_threshold || 3,
                        }, null, 2) }] };
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('captura.bookings.admin.bulk_approve', 'Approve multiple pending bookings at once. Accepts up to 50 booking IDs. Returns lists of approved and failed IDs.', {
        booking_ids: z.array(z.string().uuid()).min(1).max(50),
        notes: z.string().max(500).optional(),
        _apiKey: z.string().optional(),
    }, async (args) => {
        try {
            authGate('captura.bookings.admin.bulk_approve', args);
            const result = await bulkApproveBookings(args.booking_ids, args.notes);
            auditLog({ tool_name: 'captura.bookings.admin.bulk_approve', action: 'bulk_approve', details: { approved: result.approved.length, failed: result.failed.length } });
            return { content: [{ type: 'text', text: JSON.stringify({ success: true, ...result }, null, 2) }] };
        }
        catch (e) {
            return formatError(e);
        }
    });
    // ── Customer Tools ──
    server.tool('captura.customers.list', 'List customers with optional search by name, email, or phone.', {
        query: z.string().optional(),
        limit: z.number().int().min(1).max(200).optional().default(50),
        offset: z.number().int().min(0).optional().default(0),
        _apiKey: z.string().optional(),
    }, async (args) => {
        try {
            authGate('captura.customers.list', args);
            const customers = await listCustomers(args.query || '', args.limit, args.offset);
            return { content: [{ type: 'text', text: JSON.stringify({ customers, count: customers.length }, null, 2) }] };
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('captura.customers.get', 'Get customer details with count of their booking history.', {
        customer_id: z.string().uuid(),
        _apiKey: z.string().optional(),
    }, async (args) => {
        try {
            authGate('captura.customers.get', args);
            const result = await getCustomer(args.customer_id);
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('captura.customers.admin.update', 'Update customer details. Requires admin authentication.', {
        customer_id: z.string().uuid(),
        full_name: z.string().min(2).max(255).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        whatsapp: z.string().optional(),
        address: z.string().max(500).optional(),
        id_number: z.string().max(50).optional(),
        emergency_contact_name: z.string().max(255).optional(),
        emergency_contact_phone: z.string().optional(),
        notes: z.string().max(1000).optional(),
        _apiKey: z.string().optional(),
    }, async (args) => {
        try {
            authGate('captura.customers.admin.update', args);
            const fields = validate(customerUpdateSchema, stripAuthArg(args));
            const { customer_id, ...updateFields } = fields;
            const customer = await updateCustomer(customer_id, updateFields);
            auditLog({ tool_name: 'captura.customers.admin.update', action: 'update', target_id: customer_id, details: { fields: Object.keys(updateFields) } });
            return { content: [{ type: 'text', text: JSON.stringify({ success: true, customer }, null, 2) }] };
        }
        catch (e) {
            return formatError(e);
        }
    });
    // ── Payment Tools ──
    server.tool('captura.payments.admin.record', 'Record a payment (deposit, final payment, or refund) for a booking. Requires admin authentication.', {
        booking_id: z.string().uuid(),
        payment_type: z.enum(['deposit', 'final', 'refund']),
        amount: z.number().positive(),
        payment_method: z.enum(['cash', 'bank_transfer', 'online']),
        payment_reference: z.string().max(255).optional(),
        notes: z.string().max(500).optional(),
        _apiKey: z.string().optional(),
    }, async (args) => {
        try {
            authGate('captura.payments.admin.record', args);
            const fields = validate(paymentRecordSchema, stripAuthArg(args));
            const result = await recordPayment(fields);
            auditLog({ tool_name: 'captura.payments.admin.record', action: 'record_payment', target_id: fields.booking_id, details: { type: fields.payment_type, amount: fields.amount } });
            return { content: [{ type: 'text', text: JSON.stringify({ success: true, payment: result.payment, booking_updated: result.bookingUpdated }, null, 2) }] };
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('captura.payments.admin.mark_deposit_refunded', 'Mark the security deposit as refunded for a booking. Creates a refund payment record and updates the booking.', {
        booking_id: z.string().uuid(),
        refund_amount: z.number().positive().optional(),
        refund_notes: z.string().max(500).optional(),
        _apiKey: z.string().optional(),
    }, async (args) => {
        try {
            authGate('captura.payments.admin.mark_deposit_refunded', args);
            const fields = validate(depositRefundSchema, stripAuthArg(args));
            const refund = await markDepositRefunded(fields.booking_id, fields.refund_amount, fields.refund_notes);
            auditLog({ tool_name: 'captura.payments.admin.mark_deposit_refunded', action: 'refund_deposit', target_id: fields.booking_id, details: { amount: refund.amount } });
            return { content: [{ type: 'text', text: JSON.stringify({ success: true, refund }, null, 2) }] };
        }
        catch (e) {
            return formatError(e);
        }
    });
    // ── Invoice Tools ──
    server.tool('captura.invoices.admin.generate', 'Generate a PDF-ready invoice for a booking. Creates a snapshot-based invoice record. Requires admin authentication.', {
        booking_id: z.string().uuid(),
        _apiKey: z.string().optional(),
    }, async (args) => {
        try {
            authGate('captura.invoices.admin.generate', args);
            const fields = validate(invoiceGenerateSchema, stripAuthArg(args));
            const invoice = await generateInvoice(fields.booking_id);
            auditLog({ tool_name: 'captura.invoices.admin.generate', action: 'generate', target_id: fields.booking_id, details: { invoice_number: invoice.invoice_number } });
            return { content: [{ type: 'text', text: JSON.stringify({ success: true, invoice }, null, 2) }] };
        }
        catch (e) {
            return formatError(e);
        }
    });
    // ── Admin Tools ──
    server.tool('captura.admin.get_settings', 'Get business settings. Returns all settings or a specific one by key.', {
        setting_key: z.string().optional(),
        _apiKey: z.string().optional(),
    }, async (args) => {
        try {
            authGate('captura.admin.get_settings', args);
            const settings = await getSettings(args.setting_key);
            return { content: [{ type: 'text', text: JSON.stringify({ settings, count: settings.length }, null, 2) }] };
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('captura.admin.update_settings', 'Update a business setting value. Requires admin authentication.', {
        setting_key: z.string().min(1).max(100),
        setting_value: z.string(),
        description: z.string().max(500).optional(),
        _apiKey: z.string().optional(),
    }, async (args) => {
        try {
            authGate('captura.admin.update_settings', args);
            const fields = validate(settingsUpdateSchema, stripAuthArg(args));
            const setting = await updateSetting(fields.setting_key, fields.setting_value, fields.description);
            auditLog({ tool_name: 'captura.admin.update_settings', action: 'update', details: { key: fields.setting_key } });
            return { content: [{ type: 'text', text: JSON.stringify({ success: true, setting }, null, 2) }] };
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('captura.admin.dashboard_summary', 'Get dashboard KPIs: active bookings, pending approvals, revenue, available cameras, new customers.', {
        period: z.enum(['today', 'week', 'month', 'year']).optional().default('month'),
        _apiKey: z.string().optional(),
    }, async (args) => {
        try {
            authGate('captura.admin.dashboard_summary', args);
            const summary = await getDashboardSummary(args.period);
            return { content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }] };
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('captura.admin.revenue_report', 'Generate a revenue report grouped by camera or month for a date range.', {
        start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        group_by: z.enum(['camera', 'month', 'week']).optional().default('camera'),
        _apiKey: z.string().optional(),
    }, async (args) => {
        try {
            authGate('captura.admin.revenue_report', args);
            const report = await getRevenueReport(args.start_date, args.end_date, args.group_by);
            return { content: [{ type: 'text', text: JSON.stringify(report, null, 2) }] };
        }
        catch (e) {
            return formatError(e);
        }
    });
    return server;
}
//# sourceMappingURL=server.js.map
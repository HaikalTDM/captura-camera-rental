#!/usr/bin/env node
/**
 * CLI bridge for Hermes — provides the same interface as captura-db.py
 * but backed by the MCP server's tool functions.
 *
 * Usage:
 *   node dist/cli.js cameras list
 *   node dist/cli.js bookings get BOOKING_ID
 *   node dist/cli.js bookings create --camera-id ... --customer-name ...
 *   node dist/cli.js summary
 *
 * All reads go through the same Supabase service-role client.
 * All writes call the existing Next.js API routes (matches captura-db.py behavior).
 */

import { config } from './config.js';
import {
  listCameras, getCamera, checkAvailability,
  createCamera,
} from './tools/cameras.tools.js';
import {
  listBookings, getBooking, searchBookings, getTodayReturns,
  approveBooking, rejectBooking, cancelBooking,
  markPickup, markReturn,
  smartCreateBooking, bulkApproveBookings,
} from './tools/bookings.tools.js';
import {
  listCustomers, getCustomer,
} from './tools/customers.tools.js';
import {
  getDashboardSummary,
} from './tools/admin.tools.js';

const BASE_URL = process.env.CAPTURA_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const MIRROR_SECRET = process.env.HERMES_MIRROR_WEBHOOK_SECRET || '';

function print(data: unknown) {
  process.stdout.write(JSON.stringify(data, null, 2) + '\n');
}

function printCompact(label: string, value: unknown) {
  process.stdout.write(`${label}: ${value}\n`);
}

function usage() {
  const lines = [
    'captura-mcp <command> [options]',
    '',
    'READ COMMANDS (direct Supabase):',
    '  cameras list                    List available cameras',
    '  cameras get CAMERA_ID           Get camera details',
    '  cameras availability CAMERA_ID START END   Check availability',
    '  bookings [--status STATUS] [--date-from YYYY-MM-DD] [--date-to YYYY-MM-DD] [--camera-id ID] [--limit N]',
    '  bookings get BOOKING_ID         Get booking details',
    '  bookings search QUERY           Search by customer name/email/phone',
    '  bookings today-returns          Today\'s expected returns',
    '  bookings pending                Pending approvals',
    '  customers [--search QUERY] [--limit N]',
    '  customers get CUSTOMER_ID',
    '  summary                         Dashboard KPIs',
    '',
    'WRITE COMMANDS (via app API routes):',
    '  bookings create --camera-name NAME --customer-name NAME --customer-phone PHONE --customer-email EMAIL --start-date YYYY-MM-DD --end-date YYYY-MM-DD [--pickup-method pickup|delivery]',
    '  bookings smart-create --camera-query "osmo" --customer-name NAME --customer-email EMAIL --customer-phone PHONE --start-date YYYY-MM-DD --end-date YYYY-MM-DD',
    '  bookings approve BOOKING_ID [--notes NOTES]',
    '  bookings bulk-approve --booking-ids ID1,ID2,ID3 [--notes NOTES]',
    '  bookings reject BOOKING_ID --reason REASON',
    '  bookings cancel BOOKING_ID [--reason REASON]',
    '  bookings pickup BOOKING_ID [--condition excellent|good|fair|damaged] [--notes NOTES]',
    '  bookings return BOOKING_ID [--condition excellent|good|fair|damaged] [--notes NOTES]',
    '  bookings complete BOOKING_ID',
    '  health                           Check Supabase connectivity',
    '',
    'All commands support --json for machine-readable output.',
  ];
  process.stdout.write(lines.join('\n') + '\n');
}

// ──── API route helpers for writes (mirrors captura-db.py approach) ────

async function fetchApi(path: string, method: string, body?: Record<string, unknown>) {
  const url = `${BASE_URL}/api${path}`;
  const init: RequestInit = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) {
    init.body = JSON.stringify(body);
  }
  if (MIRROR_SECRET) {
    (init.headers as Record<string, string>)['X-Captura-Mirror-Secret'] = MIRROR_SECRET;
  }

  const res = await fetch(url, init);
  const data = await res.json() as Record<string, unknown>;

  if (!res.ok) {
    throw new Error(String(data.error) || `API request failed: ${res.status}`);
  }
  return data;
}

async function fetchJson(path: string) {
  const url = `${BASE_URL}/api${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API request failed: ${res.status}`);
  }
  return res.json();
}

// ──── Parse args ────

function parseArgs(): Record<string, unknown> {
  const args = process.argv.slice(2);
  const parsed: Record<string, unknown> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        i++;
        parsed[key] = args[i];
      } else {
        parsed[key] = true;
      }
    } else if (!parsed._cmd) {
      parsed._cmd = arg;
    } else {
      const positional = (parsed._args as string[]) || [];
      positional.push(arg);
      parsed._args = positional;
    }
  }
  return parsed;
}

// ──── Main ────

async function main() {
  const parsed = parseArgs();
  const cmd = (parsed._cmd as string || '').toLowerCase();
  const subcmd = ((parsed._args as string[])?.[0] || '').toLowerCase();
  const posArgs = parsed._args as string[] || [];
  const jsonMode = parsed.json !== undefined;

  try {
    switch (cmd) {
      case 'health': {
        const { data, error } = await (await import('./supabase/client.js')).getSupabaseAdmin()
          .from('cameras').select('id').limit(1);
        if (error) throw error;
        print({ status: 'ok', supabase: 'connected' });
        break;
      }

      case 'bookings': {
        switch (subcmd) {
          case 'list': {
            const bookings = await listBookings({
              status: parsed.status as string | undefined,
              date_from: parsed.dateFrom as string | undefined,
              date_to: parsed.dateTo as string | undefined,
              camera_id: parsed.cameraId as string | undefined,
              limit: Number(parsed.limit) || 50,
              offset: Number(parsed.offset) || 0,
            });
            if (jsonMode) {
              print(bookings);
            } else {
              for (const b of bookings) {
                const cust = (b.customer as { full_name?: string } | null)?.full_name || 'N/A';
                const cam = (b.camera as { name?: string } | null)?.name || 'N/A';
                process.stdout.write(`${b.id} | ${b.booking_status} | ${cust} | ${cam} | ${b.start_date} → ${b.end_date} | RM${b.total_amount}\n`);
              }
            }
            break;
          }
          case 'pending': {
            const bookings = await listBookings({ status: 'pending_approval', limit: 50, offset: 0 });
            if (jsonMode) print(bookings);
            else for (const b of bookings) {
              const cust = (b.customer as { full_name?: string } | null)?.full_name || 'N/A';
              process.stdout.write(`${b.id} | ${cust} | ${b.start_date} → ${b.end_date} | RM${b.total_amount}\n`);
            }
            break;
          }
          case 'get': {
            const bookingId = posArgs[1];
            if (!bookingId) { process.stderr.write('Usage: bookings get BOOKING_ID\n'); process.exit(1); }
            const booking = await getBooking(bookingId);
            print(booking);
            break;
          }
          case 'search': {
            const query = posArgs[1] || parsed.search as string;
            if (!query) { process.stderr.write('Usage: bookings search QUERY\n'); process.exit(1); }
            const bookings = await searchBookings(query);
            print(bookings);
            break;
          }
          case 'today-returns': {
            const bookings = await getTodayReturns();
            if (jsonMode) print(bookings);
            else for (const b of bookings) {
              const cust = (b.customer as { full_name?: string } | null)?.full_name || 'N/A';
              process.stdout.write(`${b.id} | ${cust} | ${b.start_date} → ${b.end_date}\n`);
            }
            break;
          }
          case 'create': {
            const result = await fetchApi('/bookings/submit', 'POST', {
              camera_name: parsed.cameraName,
              customer_name: parsed.customerName,
              customer_email: parsed.customerEmail,
              customer_phone: parsed.customerPhone,
              start_date: parsed.startDate,
              end_date: parsed.endDate,
              pickup_method: parsed.pickupMethod || 'pickup',
              pickup_address: parsed.pickupAddress,
            });
            print(result);
            break;
          }
          case 'approve': {
            const bookingId = posArgs[1];
            if (!bookingId) { process.stderr.write('Usage: bookings approve BOOKING_ID [--notes NOTES]\n'); process.exit(1); }
            const result = await fetchApi(`/bookings/${bookingId}/approve`, 'POST', { notes: parsed.notes });
            print(result);
            break;
          }
          case 'reject': {
            const bookingId = posArgs[1];
            const reason = parsed.reason as string;
            if (!bookingId || !reason) { process.stderr.write('Usage: bookings reject BOOKING_ID --reason REASON\n'); process.exit(1); }
            const result = await fetchApi(`/bookings/${bookingId}/reject`, 'POST', { reason });
            print(result);
            break;
          }
          case 'cancel': {
            const bookingId = posArgs[1];
            if (!bookingId) { process.stderr.write('Usage: bookings cancel BOOKING_ID [--reason REASON]\n'); process.exit(1); }
            const result = await fetchApi(`/bookings/${bookingId}/cancel`, 'POST', { reason: parsed.reason });
            print(result);
            break;
          }
          case 'pickup': {
            const bookingId = posArgs[1];
            if (!bookingId) { process.stderr.write('Usage: bookings pickup BOOKING_ID [--condition CONDITION]\n'); process.exit(1); }
            const result = await fetchApi(`/bookings/${bookingId}/pickup-status`, 'POST', {
              equipment_picked_up: true,
              equipment_pickup_notes: parsed.notes,
              equipment_condition_pickup: parsed.condition || 'excellent',
            });
            print(result);
            break;
          }
          case 'return': {
            const bookingId = posArgs[1];
            if (!bookingId) { process.stderr.write('Usage: bookings return BOOKING_ID [--condition CONDITION]\n'); process.exit(1); }
            const result = await fetchApi(`/bookings/${bookingId}/return-status`, 'POST', {
              equipment_returned: true,
              equipment_return_notes: parsed.notes,
              equipment_condition_return: parsed.condition || 'excellent',
            });
            print(result);
            break;
          }
          case 'smart-create': {
            const fields = {
              camera_query: parsed.cameraQuery as string,
              customer_name: parsed.customerName as string,
              customer_email: parsed.customerEmail as string,
              customer_phone: parsed.customerPhone as string,
              start_date: parsed.startDate as string,
              end_date: parsed.endDate as string,
              pickup_method: (parsed.pickupMethod as string) || 'pickup',
              special_requests: parsed.specialRequests as string,
            };
            if (!fields.camera_query || !fields.customer_name || !fields.customer_phone || !fields.customer_email || !fields.start_date || !fields.end_date) {
              process.stderr.write('Usage: bookings smart-create --camera-query "osmo" --customer-name "Name" --customer-email "a@b.com" --customer-phone "+60123456789" --start-date YYYY-MM-DD --end-date YYYY-MM-DD [--pickup-method pickup|delivery]\n');
              process.exit(1);
            }
            const result = await smartCreateBooking(fields);
            print(result);
            break;
          }
          case 'bulk-approve': {
            const idsStr = parsed.bookingIds as string;
            if (!idsStr) { process.stderr.write('Usage: bookings bulk-approve --booking-ids ID1,ID2,ID3\n'); process.exit(1); }
            const bookingIds = idsStr.split(',').map(s => s.trim()).filter(Boolean);
            const result = await bulkApproveBookings(bookingIds, parsed.notes as string);
            print(result);
            break;
          }
          default:
            process.stderr.write(`Unknown subcommand: ${subcmd}\n`);
            usage();
            break;
        }
        break;
      }

      case 'customers': {
        switch (subcmd) {
          case 'list': {
            const search = parsed.search as string || '';
            const customers = await listCustomers(search, Number(parsed.limit) || 50, 0);
            if (jsonMode) print(customers);
            else for (const c of customers) {
              process.stdout.write(`${c.id} | ${c.full_name} | ${c.email} | ${c.phone}\n`);
            }
            break;
          }
          case 'get': {
            const customerId = posArgs[1];
            if (!customerId) { process.stderr.write('Usage: customers get CUSTOMER_ID\n'); process.exit(1); }
            const result = await getCustomer(customerId);
            print(result);
            break;
          }
          default:
            process.stderr.write(`Unknown subcommand: ${subcmd}\n`);
            usage();
            break;
        }
        break;
      }

      case 'summary': {
        const data = await getDashboardSummary('month');
        if (jsonMode) print(data);
        else {
          const m = (data as Record<string, unknown>).metrics as Record<string, unknown>;
          printCompact('Active bookings', m.active_bookings);
          printCompact('Pending approvals', m.pending_approvals);
          printCompact('New bookings (this month)', m.new_bookings);
          printCompact('Revenue (this month)', `RM${m.total_revenue_rm}`);
          printCompact('Available cameras', m.available_cameras);
          printCompact('New customers', m.new_customers);
        }
        break;
      }

      default:
        usage();
        break;
    }
  } catch (err) {
    process.stderr.write(`Error: ${err instanceof Error ? err.message : String(err)}\n`);
    process.exit(1);
  }
}

main();

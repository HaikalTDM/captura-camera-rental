/**
 * Notify the Hermes mirror server of booking changes.
 * This keeps the local SQLite cache on the Hermes host in sync with Supabase.
 *
 * The webhook is fire-and-forget — failures are logged but never block the response.
 */

const MIRROR_URL = process.env.HERMES_MIRROR_WEBHOOK_URL || '';
const MIRROR_SECRET = process.env.HERMES_MIRROR_WEBHOOK_SECRET || '';

export type MirrorEventType =
  | 'booking.created'
  | 'booking.updated'
  | 'booking.deleted'
  | 'customer.created'
  | 'customer.updated'
  | 'camera.updated';

interface MirrorPayload {
  event: MirrorEventType;
  data: Record<string, unknown>;
  timestamp: string;
}

/**
 * Send a webhook notification to the Hermes mirror server.
 * Fire-and-forget: errors are caught and logged, never thrown.
 */
export async function notifyMirror(
  event: MirrorEventType,
  data: Record<string, unknown>
): Promise<void> {
  if (!MIRROR_URL || !MIRROR_SECRET) {
    // Silently skip if not configured — mirror is optional
    return;
  }

  const payload: MirrorPayload = {
    event,
    data,
    timestamp: new Date().toISOString(),
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch(MIRROR_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Mirror-Secret': MIRROR_SECRET,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`[mirror] Webhook returned ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    // Never throw — mirror failures must not break booking operations
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('[mirror] Webhook timed out after 5s');
    } else {
      console.warn('[mirror] Webhook failed:', error);
    }
  }
}

/**
 * Convenience: notify mirror after a booking mutation.
 * Fetches the full booking from Supabase and sends it.
 */
export async function notifyBookingChange(
  event: 'booking.created' | 'booking.updated' | 'booking.deleted',
  bookingId: string,
  supabaseClient: { from: (table: string) => { select: (cols: string) => { eq: (col: string, val: string) => Promise<{ data: unknown; error: unknown }> } } }
): Promise<void> {
  try {
    // Fetch the full booking record
    const { data } = await supabaseClient
      .from('bookings')
      .select('*')
      .eq('id', bookingId);

    const booking = Array.isArray(data) ? data[0] : data;
    if (booking) {
      await notifyMirror(event, { booking });
    }
  } catch (error) {
    console.warn('[mirror] Failed to fetch booking for notification:', error);
  }
}

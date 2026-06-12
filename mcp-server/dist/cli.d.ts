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
export {};
//# sourceMappingURL=cli.d.ts.map
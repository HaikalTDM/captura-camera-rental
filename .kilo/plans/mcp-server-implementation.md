# CAPTURA MCP Server — Technical Implementation Guide

> **Objective:** Build a Model Context Protocol (MCP) server that enables AI agents to perform authenticated read/write operations against the CAPTURA website's internal data (Supabase PostgreSQL), with super-admin privilege control.

---

## 1. ARCHITECTURE OVERVIEW

```
┌──────────────┐     MCP Protocol (stdio/SSE)     ┌──────────────────┐     Service Role Key     ┌──────────────┐
│  AI Agent     │ ──────────────────────────────── │  MCP Server       │ ─────────────────────── │  Supabase     │
│  (Claude etc) │                                  │  (TypeScript/Node) │                          │  (PostgreSQL) │
└──────────────┘                                  │                    │                          └──────────────┘
                                                   │  ┌──────────────┐ │
                                                   │  │ Tool Registry │ │
                                                   │  ├──────────────┤ │
                                                   │  │ Auth Gate     │ │
                                                   │  ├──────────────┤ │
                                                   │  │ Validation    │ │
                                                   │  ├──────────────┤ │
                                                   │  │ Supabase Ops  │ │
                                                   │  ├──────────────┤ │
                                                   │  │ Audit Logger  │ │
                                                   │  └──────────────┘ │
                                                   └──────────────────┘
```

**Deployment Model:** The MCP server runs as a standalone Node.js process, either:
- **Local:** Started by the AI agent's MCP client on the same machine
- **Remote:** Deployed as a stateless HTTP service (SSE transport) with a process manager (PM2, Docker)

**Environment Context:** The existing CAPTURA codebase runs on Next.js 16 + Supabase. The MCP server is an *additional* service that sits alongside the Next.js app, not inside it. It connects directly to the same Supabase instance using the `SUPABASE_SERVICE_ROLE_KEY` (which already exists in `.env.local`).

---

## 2. SERVER ARCHITECTURE

### 2.1 Project Structure

```
captura-camera-rental/
├── mcp-server/                       # New: MCP server root
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts                  # Entry point (MCP server bootstrap)
│   │   ├── server.ts                 # McpServer instantiation + tool registration
│   │   ├── config.ts                 # Env vars, constants, auth config
│   │   ├── supabase/
│   │   │   ├── client.ts             # Supabase service-role client
│   │   │   └── types.ts              # Re-exported DB types from main app
│   │   ├── tools/
│   │   │   ├── index.ts              # Tool registry aggregator
│   │   │   ├── cameras.tools.ts      # Camera CRUD tools
│   │   │   ├── bookings.tools.ts     # Booking CRUD tools
│   │   │   ├── customers.tools.ts    # Customer tools
│   │   │   ├── payments.tools.ts     # Payment/deposit tools
│   │   │   ├── invoices.tools.ts     # Invoice tools
│   │   │   ├── analytics.tools.ts    # Dashboard/report tools
│   │   │   └── admin.tools.ts        # Business settings, maintenance
│   │   ├── auth/
│   │   │   ├── guard.ts              # Tool-level auth gate
│   │   │   └── api-key.ts            # API key validation + hashing
│   │   ├── validation/
│   │   │   ├── schemas.ts            # Zod schemas for all tool inputs
│   │   │   └── validator.ts          # Reusable validation wrapper
│   │   ├── audit/
│   │   │   └── logger.ts             # Structured audit log writer
│   │   └── errors/
│   │       └── handler.ts            # Error formatting + MCP error codes
│   ├── .env.example                  # MCP server env vars template
│   └── README.md
```

### 2.2 Dependency Stack

| Package | Purpose |
|---|---|
| `@modelcontextprotocol/sdk` | Core MCP server framework (McpServer, stdio/SSE transport) |
| `@supabase/supabase-js` | Supabase client (already in project) |
| `zod` | Runtime input validation for tool parameters |
| `dotenv` | Load `.env.local` from project root |
| `uuid` | Generate deterministic IDs for audit entries |
| `typescript` | TypeScript compilation |
| `tsx` | Dev runner (compatible with existing project) |

### 2.3 Transport Layer

Two transports supported, determined by environment config:

```typescript
// stdio transport (default, for local AI agent use)
const transport = new StdioServerTransport();

// SSE transport (for remote/deployed use)
// const transport = new SSEServerTransport({ port: 3456 });
```

AI agents (Claude Desktop, Kilo, etc.) typically connect via stdio. SSE is for future remote deployment scenarios.

---

## 3. TOOL DESIGN — MAPPING WEBSITE DATA TO MCP TOOLS

### 3.1 Tool Naming Convention

```
captura.<resource>.<action>
captura.<resource>.admin.<action>   (for admin-only write operations)
```

### 3.2 Complete Tool Catalog

#### Camera Tools

| Tool Name | Access | Description | Inputs |
|---|---|---|---|
| `captura.cameras.list` | Read | List all available cameras with pricing | `?filter=available_only`, `?sort_by=display_order` |
| `captura.cameras.get` | Read | Get single camera by ID | `camera_id: string` |
| `captura.cameras.check_availability` | Read | Check camera availability for date range | `camera_id`, `start_date`, `end_date` |
| `captura.cameras.admin.create` | Write | Add new camera to inventory | Full camera fields (validated) |
| `captura.cameras.admin.update` | Write | Update camera details/pricing | `camera_id`, partial fields |
| `captura.cameras.admin.set_availability` | Write | Toggle camera availability or move to maintenance | `camera_id`, `is_available`, `?maintenance_notes` |

#### Booking Tools

| Tool Name | Access | Description | Inputs |
|---|---|---|---|
| `captura.bookings.list` | Read | List bookings with optional filters | `?status`, `?date_from`, `?date_to`, `?camera_id` |
| `captura.bookings.get` | Read | Get single booking with customer + camera relations | `booking_id: string` |
| `captura.bookings.search` | Read | Search bookings by customer name/phone/email | `query: string` |
| `captura.bookings.today_returns` | Read | Get today's expected returns | (none) |
| `captura.bookings.admin.create` | Write | Create manual booking (admin) | Full booking + customer details |
| `captura.bookings.admin.approve` | Write | Approve pending booking | `booking_id` |
| `captura.bookings.admin.reject` | Write | Reject booking with reason | `booking_id`, `reason` |
| `captura.bookings.admin.cancel` | Write | Cancel booking | `booking_id`, `?reason` |
| `captura.bookings.admin.mark_pickup` | Write | Record equipment pickup | `booking_id`, `?pickup_notes`, `?equipment_condition` |
| `captura.bookings.admin.mark_return` | Write | Record equipment return | `booking_id`, `?return_notes`, `?equipment_condition` |
| `captura.bookings.admin.update_status` | Write | Update booking status | `booking_id`, `new_status`, `?notes` |

#### Customer Tools

| Tool Name | Access | Description | Inputs |
|---|---|---|---|
| `captura.customers.list` | Read | List customers | `?search_query`, `?limit` |
| `captura.customers.get` | Read | Get customer with rental history | `customer_id: string` |
| `captura.customers.admin.update` | Write | Update customer details | `customer_id`, partial fields |

#### Payment Tools

| Tool Name | Access | Description | Inputs |
|---|---|---|---|
| `captura.payments.admin.record` | Write | Record a payment (deposit/final/refund) | `booking_id`, `type`, `amount`, `method`, `?reference` |
| `captura.payments.admin.mark_deposit_refunded` | Write | Mark deposit as refunded | `booking_id`, `?refund_notes` |

#### Invoice & Admin Tools

| Tool Name | Access | Description | Inputs |
|---|---|---|---|
| `captura.invoices.admin.generate` | Write | Generate invoice for booking | `booking_id` |
| `captura.admin.get_settings` | Read | Get business settings | `?setting_key` |
| `captura.admin.update_settings` | Write | Update business setting | `setting_key`, `setting_value` |
| `captura.admin.dashboard_summary` | Read | Get dashboard KPIs | `?period` |
| `captura.admin.revenue_report` | Read | Revenue by period/camera | `start_date`, `end_date`, `?group_by` |

### 3.3 Tool Implementation Pattern

Each tool follows this pattern:

```typescript
// src/tools/cameras.tools.ts
import { z } from 'zod';
import { supabaseAdmin } from '../supabase/client';

export const cameraListTool = {
  name: 'captura.cameras.list',
  description: 'List all available cameras with pricing and discount details.',
  inputSchema: {
    filter: z.enum(['available_only', 'all']).optional().default('available_only'),
    sort_by: z.enum(['display_order', 'daily_rate', 'name']).optional().default('display_order'),
  },
  handler: async ({ filter, sort_by }) => {
    let query = supabaseAdmin.from('cameras').select('*');
    if (filter === 'available_only') {
      query = query.eq('is_available', true);
    }
    query = query.order(sort_by);
    const { data, error } = await query;
    if (error) throw error;
    return { cameras: data, count: data.length };
  },
};
```

Each tool is then registered in `server.ts`:

```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [cameraListTool, cameraGetTool, ...].map(t => ({
    name: t.name,
    description: t.description,
    inputSchema: zodToJsonSchema(t.inputSchema),
  })),
}));
```

---

## 4. AUTHENTICATION & AUTHORIZATION

### 4.1 API Key-Based Auth Model

The MCP server uses a pre-shared API key for authentication. This is the simplest and most effective pattern for MCP, where the AI agent + MCP server are part of a trusted local or internal network.

```
┌───────────────┐         MCP Request                ┌────────────────┐
│  AI Agent      │ ── with MCP_API_KEY in header ── │  MCP Server     │
│  (MCP Client)  │                                    │  auth/guard.ts  │
└───────────────┘                                    └────────────────┘
                                                              │
                                                    ┌─────────▼──────────┐
                                                    │ 1. Validate API key │
                                                    │ 2. Check permissions │
                                                    │ 3. If OK → handler  │
                                                    └────────────────────┘
```

### 4.2 Implementation

```typescript
// src/auth/api-key.ts
import { createHash } from 'crypto';

const API_KEY = process.env.MCP_API_KEY;
const API_KEY_HASH = API_KEY ? createHash('sha256').update(API_KEY).digest('hex') : null;

export function validateApiKey(key: string): boolean {
  if (!API_KEY_HASH || !key) return false;
  return createHash('sha256').update(key).digest('hex') === API_KEY_HASH;
}

// src/auth/guard.ts
export function requireAdmin(toolName: string, apiKey?: string): void {
  if (!apiKey || !validateApiKey(apiKey)) {
    throw new Error(`Authentication required for tool: ${toolName}`);
  }
}
```

### 4.3 Permission Tiers

| Tier | Scope | Tools Included |
|---|---|---|
| **Read (Public)** | Read-only access to non-sensitive data | `cameras.*`, `bookings.search` (anonymized), availability checks |
| **Read (Auth)** | Read all data including customer details | `bookings.list`, `bookings.get`, `customers.*`, `analytics.*` |
| **Write (Admin)** | Full CRUD with audit logging | All `*.admin.*` tools |

The MCP_API_KEY must be set on the MCP client side:

```json
// MCP client configuration (e.g., claude_desktop_config.json)
{
  "mcpServers": {
    "captura": {
      "command": "node",
      "args": ["mcp-server/dist/index.js"],
      "env": {
        "MCP_API_KEY": "your-secure-api-key-here",
        "SUPABASE_URL": "...",
        "SUPABASE_SERVICE_ROLE_KEY": "..."
      }
    }
  }
}
```

### 4.4 Existing Supabase Auth Integration

The MCP server inherits the existing `SUPABASE_SERVICE_ROLE_KEY` approach already used in the codebase (`src/lib/supabase.ts:19`). This key bypasses Supabase Row-Level Security (RLS) and grants full database access. The MCP server's `MCP_API_KEY` is an additional layer — you authenticate to the MCP server first, which then uses the service role key internally.

```
Request: MCP_API_KEY → MCP Server Auth → SUPABASE_SERVICE_ROLE_KEY → Supabase
```

---

## 5. DATA VALIDATION

### 5.1 Zod Schema Layer

All tool inputs are validated with Zod before reaching the database:

```typescript
// src/validation/schemas.ts
import { z } from 'zod';

export const createBookingSchema = z.object({
  camera_id: z.string().uuid(),
  customer_name: z.string().min(2).max(255),
  customer_email: z.string().email(),
  customer_phone: z.string().regex(/^\+?[0-9\s\-\(\)]{8,}$/),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  pickup_method: z.enum(['pickup', 'delivery']),
  pickup_address: z.string().optional(),
  daily_rate: z.number().positive(),
  total_days: z.number().int().positive(),
  total_amount: z.number().positive(),
  deposit_amount: z.number().positive(),
  special_requests: z.string().max(1000).optional(),
}).refine(data => data.end_date >= data.start_date, {
  message: 'End date must be on or after start date',
});

export const updateCameraSchema = z.object({
  camera_id: z.string().uuid(),
  daily_rate: z.number().positive().optional(),
  weekly_rate: z.number().positive().optional(),
  discount_threshold: z.number().int().min(2).max(30).optional(),
  is_available: z.boolean().optional(),
  description: z.string().max(2000).optional(),
  specifications: z.record(z.unknown()).optional(),
  display_order: z.number().int().min(0).optional(),
  condition: z.enum(['excellent', 'good', 'fair', 'needs_repair']).optional(),
  location: z.string().max(255).optional(),
  notes: z.string().max(2000).optional(),
});
```

### 5.2 Validation Wrapper

```typescript
// src/validation/validator.ts
export function validate<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const messages = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Validation failed: ${messages}`);
  }
  return result.data;
}
```

### 5.3 Business Logic Validation

Beyond schema validation, tools enforce business rules:

- Date cannot be in the past (for new bookings)
- Camera must exist and be available
- Discount threshold logic matches `src/lib/pricing.ts`
- Deposit must be RM100 (matches current policy)
- Booking status transitions follow the valid state machine (`pending → confirmed → active → completed`)

```typescript
const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending_approval: ['confirmed', 'rejected'],
  confirmed: ['cancelled', 'completed'],  // becomes active on pickup
  rejected: [],
  cancelled: [],
  completed: [],
};
```

---

## 6. ERROR HANDLING

### 6.1 Error Taxonomy

```typescript
// src/errors/handler.ts
export enum ErrorCode {
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',              // e.g., camera not available
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export function formatMCPError(error: unknown): { content: { type: 'text', text: string }[], isError: true } {
  if (error instanceof ValidationError) {
    return { content: [{ type: 'text', text: `[${ErrorCode.VALIDATION_ERROR}] ${error.message}` }], isError: true };
  }
  if (error instanceof SupabaseError) {
    console.error('Database error:', error);
    return { content: [{ type: 'text', text: `[${ErrorCode.DATABASE_ERROR}] An internal database error occurred.` }], isError: true };
  }
  // Generic fallback
  return { content: [{ type: 'text', text: `[${ErrorCode.INTERNAL_ERROR}] ${error instanceof Error ? error.message : 'Unknown error'}` }], isError: true };
}
```

### 6.2 Supabase Error Handling

All Supabase queries follow this pattern:

```typescript
const { data, error } = await supabaseAdmin.from('cameras').select('*');
if (error) {
  logQueryError('cameras.list', error);
  throw new SupabaseError('Failed to fetch cameras');
}
```

The `logQueryError` function (mirroring `src/lib/api/bookings.ts:31-50`) extracts PostgREST error details for debugging while returning safe messages to the client.

---

## 7. SECURITY BEST PRACTICES

### 7.1 Principle of Least Privilege

```
MCP_API_KEY → Access Gate → Tool-Level Permissions → Database Access
```

- **Read tools** do not require auth (public data: camera list, availability)
- **Read-with-PII tools** require auth (bookings, customers list — despite being read, these contain customer personal data)
- **Write tools** always require auth (super-admin)

### 7.2 Destruction Prevention

For irreversible or high-impact operations, implement a **confirmation gate**:

```typescript
// Destructive operations require explicit confirmation
export const cancelBookingTool = {
  name: 'captura.bookings.admin.cancel',
  inputSchema: {
    booking_id: z.string().uuid(),
    reason: z.string().optional(),
    confirm: z.literal(true), // Must be explicitly true
  },
  handler: async ({ booking_id, reason, confirm }) => {
    // confirm is validated as true by Zod; serves as a human/machine guard
  },
};
```

### 7.3 Input Sanitization

- All string inputs are trimmed and length-limited via Zod schemas
- Phone numbers validated against Malaysian format pattern
- Email validated against RFC-compliant regex
- Dates parsed strictly (YYYY-MM-DD), validated for sanity (not past, end >= start)
- SQL injection not applicable (Supabase uses parameterized queries)

### 7.4 Audit Logging

Every write operation is logged:

```typescript
// src/audit/logger.ts
export async function auditLog(entry: {
  tool_name: string;
  action: string;
  target_id?: string;
  details: Record<string, unknown>;
  timestamp: string;
}) {
  // Write to Supabase audit_logs table OR local structured JSON log
  console.log(JSON.stringify({ ...entry, severity: 'info' }));
}
```

### 7.5 Rate Limiting

Add a simple in-memory rate limiter to prevent abuse:

```typescript
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(toolName: string, maxPerMinute = 60): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(toolName);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(toolName, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (entry.count >= maxPerMinute) return false;
  entry.count++;
  return true;
}
```

### 7.6 Environment Variable Protection

```bash
# mcp-server/.env.example
MCP_API_KEY=your-secure-random-key-here
SUPABASE_URL=from-root-dotenv
SUPABASE_SERVICE_ROLE_KEY=from-root-dotenv
```

- `MCP_API_KEY` is generated as a cryptographically random string (e.g., `openssl rand -hex 32`)
- `SUPABASE_SERVICE_ROLE_KEY` is loaded from the parent `.env.local` via `dotenv`
- The `.env` file is in `.gitignore` (already enforced in the project)

---

## 8. IMPLEMENTATION PHASES

### Phase 1: Foundation (Day 1–2)
1. Scaffold `mcp-server/` with `package.json`, `tsconfig.json`
2. Implement `src/index.ts` with McpServer bootstrap + stdio transport
3. Implement `src/supabase/client.ts` connecting to existing Supabase
4. Implement `src/auth/` — API key validation
5. Implement `src/errors/handler.ts`
6. Implement `src/validation/schemas.ts` + `validator.ts`
7. Write `README.md` with setup instructions

### Phase 2: Core Read Tools (Day 2–3)
1. `captura.cameras.list`, `captura.cameras.get`, `captura.cameras.check_availability`
2. `captura.bookings.list`, `captura.bookings.get`, `captura.bookings.search`
3. `captura.customers.list`, `captura.customers.get`
4. `captura.admin.dashboard_summary`, `captura.admin.get_settings`

### Phase 3: Write Tools (Day 3–5)
1. `captura.cameras.admin.*` — create, update, set_availability
2. `captura.bookings.admin.*` — create, approve, reject, cancel, mark_pickup, mark_return
3. `captura.customers.admin.update`
4. `captura.payments.admin.*`
5. `captura.invoices.admin.generate`
6. `captura.admin.update_settings`

### Phase 4: Hardening (Day 5–6)
1. Rate limiting
2. Audit logging
3. Confirmation gates on destructive operations
4. Integration testing with a real AI agent (Claude Desktop / Kilo)
5. Error message polish for AI consumption

---

## 9. KEY DESIGN DECISIONS & TRADE-OFFS

| Decision | Choice | Rationale |
|---|---|---|
| Transport | **stdio** (default), SSE (optional) | stdio is the MCP standard for local agents; SSE enables cloud deployment |
| Auth method | **Pre-shared API key** | Simplest for MCP; no OAuth complexity needed for trusted local/network setup |
| Validation | **Zod** | Compile-time type inference + runtime validation in one dependency |
| Database access | **Direct Supabase (service role)** | Bypasses RLS for full admin access; same pattern as existing `getSupabaseAdmin()` |
| State | **Stateless** | Each MCP request is independent; simplifies scaling and error recovery |
| Logging | **Structured JSON to stdout** | Compatible with docker, PM2, and cloud log aggregators |
| Where to put it | **New `mcp-server/` directory in monorepo** | Shares types with main app, avoids Next.js coupling, runs independently |

---

## 10. TESTING STRATEGY

### 10.1 Unit Tests
- Zod schema validation (valid + invalid inputs)
- Auth guard (valid key, invalid key, missing key)
- Error formatting for all error types

### 10.2 Integration Tests
- Each tool tested against a Supabase development/staging instance
- Verify correct data returned, correct writes performed
- Test state transitions (booking status flow)

### 10.3 AI Agent Smoke Tests
- Connect Claude Desktop or Kilo to the MCP server
- Run natural language commands: "Show me all available cameras", "Create a booking for Osmo Pocket 3 for next Monday-Wednesday for a customer named Test User"
- Verify the agent correctly interprets tool responses

---

## 11. MCP CLIENT CONFIGURATION EXAMPLE

```json
{
  "mcpServers": {
    "captura": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/captura-camera-rental/mcp-server",
      "env": {
        "MCP_API_KEY": "sk-a1b2c3d4e5f6g7h8i9j0",
        "SUPABASE_URL": "https://xxxxx.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "eyJhbGciOiJIUzI1NiIs..."
      }
    }
  }
}
```

---

## END OF IMPLEMENTATION GUIDE

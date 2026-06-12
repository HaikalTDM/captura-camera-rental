# Bug: Missing `middleware.ts` or www→non-www redirect logic

## Summary
The app is deployed at `www.captura.my`, but the base URL in `.env` (or customer-facing forms) may reference `captura.my` without the `www` prefix. The HTTP layer returns a 307 redirect, but the CLI wrapper (`captura-db`) and n8n workflows that store URLs may end up with inconsistent references.

While this works at the HTTP level (Vercel auto-redirects), it causes issues for:
- CLI tools that cache or compare URLs
- Email links and WhatsApp messages referencing the domain
- Any API responses that include absolute URLs

## Where to fix
**File:** Create `src/middleware.ts` at the root of the Next.js app

This should enforce consistent domain usage. Two approaches:

### Option A: Force www (recommended)
```ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host');
  
  if (hostname && !hostname.startsWith('www.')) {
    url.host = 'www.' + hostname;
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### Option B: Force non-www
Swap `www.` to empty string instead, and update `.env` base URLs.

## Why it matters
- URL consistency across all responses and references
- Avoids 307 redirects that slow down API calls
- Prevents cookie/session issues with domain mismatch
- Makes debugging easier (no redirect chain to trace)

## Acceptance criteria
- Requesting `http://captura.my` or `https://captura.my` redirects to `https://www.captura.my`
- Direct `https://www.captura.my` requests work without redirect
- API routes are excluded from middleware (they get called with full URL anyway)
- No infinite redirect loops

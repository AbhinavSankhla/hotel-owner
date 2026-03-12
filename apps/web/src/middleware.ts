import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * BlueStay Multi-Tenant Middleware
 * 
 * This middleware handles domain-based tenant resolution:
 * - bluestay.in → Aggregator view (all hotels)
 * - radhikaresort.in → Hotel tenant view (single hotel)
 * 
 * Domain→hotel mappings are fetched from the API and cached in-memory
 * with a 5-minute TTL to minimize latency.
 */

// Aggregator domains that show all hotels
const AGGREGATOR_DOMAINS = [
  "bluestay.in",
  "www.bluestay.in",
  "localhost",
  "127.0.0.1",
];

// In-memory cache for domain→hotelId mappings
const domainCache = new Map<string, { hotelId: string | null; expiresAt: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Check if the hostname is an aggregator domain
 */
function isAggregatorDomain(hostname: string): boolean {
  const host = hostname.split(":")[0];
  return AGGREGATOR_DOMAINS.includes(host);
}

/**
 * Get hotel ID from domain, using in-memory cache → API fallback
 */
async function getHotelIdFromDomain(hostname: string): Promise<string | null> {
  const host = hostname.split(":")[0];
  
  // Check for subdomain pattern (e.g., radhika.bluestay.in)
  const parts = host.split(".");
  if (parts.length >= 3) {
    const subdomain = parts[0];
    const baseDomain = parts.slice(-2).join(".");
    if (baseDomain === "bluestay.in" && subdomain !== "www") {
      return subdomain;
    }
  }

  // Check in-memory cache
  const cached = domainCache.get(host);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.hotelId;
  }

  // Fetch from API
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const res = await fetch(`${apiUrl}/api/domain-resolve?domain=${encodeURIComponent(host)}`, {
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      const data = await res.json();
      const hotelId = data.hotelId || null;
      domainCache.set(host, { hotelId, expiresAt: Date.now() + CACHE_TTL });
      return hotelId;
    }
  } catch {
    // API unavailable — fall through
  }

  domainCache.set(host, { hotelId: null, expiresAt: Date.now() + CACHE_TTL });
  return null;
}

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "localhost:3000";
  const url = request.nextUrl.clone();
  
  // Skip middleware for static files and API routes
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/api") ||
    url.pathname.includes(".") // Static files have extensions
  ) {
    return NextResponse.next();
  }
  
  // Create response headers to pass tenant context
  const requestHeaders = new Headers(request.headers);
  
  // Determine if this is aggregator or hotel tenant
  if (isAggregatorDomain(hostname)) {
    requestHeaders.set("x-tenant-type", "aggregator");
    requestHeaders.set("x-tenant-id", "bluestay");
  } else {
    const hotelId = await getHotelIdFromDomain(hostname);
    
    if (hotelId) {
      requestHeaders.set("x-tenant-type", "hotel");
      requestHeaders.set("x-tenant-id", hotelId);
      requestHeaders.set("x-hotel-domain", hostname);
    } else {
      requestHeaders.set("x-tenant-type", "aggregator");
      requestHeaders.set("x-tenant-id", "bluestay");
    }
  }
  
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // ── Security Headers ──────────────────────────────────────
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), payment=(self)'
  );
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  // Strict-Transport-Security set by Nginx in production

  return response;
}

/**
 * Configure which paths the middleware runs on
 * We run on all paths except static files and API
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)",
  ],
};

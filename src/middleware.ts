import { NextRequest, NextResponse } from "next/server";

const WINDOW_MS = 10_000; // 10 seconds
const MAX_REQUESTS = 10;

// In-memory store: ip → array of request timestamps within the current window.
// NOTE: this is per-Edge-instance. In a multi-region deployment, pair with an
// external store (e.g. Upstash Redis) for a globally consistent limit.
const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  const timestamps = (requestLog.get(ip) ?? []).filter((t) => t > windowStart);
  timestamps.push(now);
  requestLog.set(ip, timestamps);

  return timestamps.length > MAX_REQUESTS;
}

export function middleware(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (isRateLimited(ip)) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": String(WINDOW_MS / 1000),
        "X-RateLimit-Limit": String(MAX_REQUESTS),
        "X-RateLimit-Window": `${WINDOW_MS / 1000}s`,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  // Apply to all API routes only
  matcher: ["/api/:path*"],
};

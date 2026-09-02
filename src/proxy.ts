import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// 1. Initialize Redis and the Rate Limiter
const redis = Redis.fromEnv();
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"), // Max 10 requests per 10 seconds
  analytics: true,
});

export async function proxy(request: NextRequest) {
  // 2. Target specific paths (e.g., only API routes)
  if (request.nextUrl.pathname.startsWith("/api")) {
    
    // 3. Get the user's IP address
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      request.headers.get("x-real-ip") ??
      "127.0.0.1";
    
    // 4. Check the rate limit — fail open if the Redis backend is unreachable
    // so an Upstash outage/misconfig doesn't 500 every API route.
    try {
      const { success, limit, reset, remaining } = await ratelimit.limit(ip);

      // 5. Block the request if limit is exceeded
      if (!success) {
        return new NextResponse(
          JSON.stringify({ error: "Too many requests. Please try again later." }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString(),
            },
          }
        );
      }
    } catch (err) {
      console.error("Rate limiter unavailable, allowing request through:", err);
    }
  }

  return NextResponse.next();
}

// 6. Optional: Optimize middleware execution using a matcher
export const config = {
  matcher: "/api/:path*",
};

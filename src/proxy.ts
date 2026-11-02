import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { ratelimit } from "@/lib/rateLimit";
import { AUTH_ROUTES, DEFAULT_REDIRECT } from "@/_components/Auth/authRoutes";

async function limitApiRequest(request: NextRequest) {
  // SessionProvider polls this read-only endpoint; don't spend the shared API
  // rate-limit budget on routine session checks.
  if (request.nextUrl.pathname === "/api/auth/session") {
    return NextResponse.next();
  }

  // Extract client IP address securely
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "127.0.0.1";

  // Evaluate rate limit. If Upstash is unavailable, return a deliberate JSON
  // response instead of allowing an HTML 500 to break auth/client JSON parsing.
  let result;
  try {
    result = await ratelimit.limit(ip);
  } catch (error) {
    console.error("API rate limiter unavailable:", error);
    // Fail open in dev so a missing Redis doesn't take down every API route.
    if (process.env.NODE_ENV !== "production") return NextResponse.next();
    return NextResponse.json(
      { error: "Request protection is temporarily unavailable. Please try again shortly." },
      { status: 503 }
    );
  }

  const { success, limit, reset, remaining } = result;

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

  return NextResponse.next();
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/api")) {
    return limitApiRequest(request);
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (!token && !isAuthRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL(DEFAULT_REDIRECT, request.url));
  }

  return NextResponse.next();
}

// Run on API routes and on pages, skipping Next internals and static assets.
export const config = {
  matcher: ["/api/:path*", "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};

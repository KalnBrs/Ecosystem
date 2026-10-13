// lib/ratelimit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Automatically reads UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from your environment
export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  // Use a sliding window to block spam seamlessly
  limiter: Ratelimit.slidingWindow(10, "10 s"), // Max 10 requests per 10 seconds
  analytics: true, // Enables analytics metrics in the Upstash console
});

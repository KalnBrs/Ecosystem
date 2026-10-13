export const AUTH_ROUTES = ["/login", "/signup", "/recover-password"]
export const DEFAULT_REDIRECT = "/tasks"

/** Returns `value` only if it is a same-origin relative path, otherwise the default redirect. */
export function getSafeCallbackUrl(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return DEFAULT_REDIRECT
  }
  if (AUTH_ROUTES.some(route => value === route || value.startsWith(`${route}?`))) {
    return DEFAULT_REDIRECT
  }
  return value
}

/**
 * Password recovery without email verification lets anyone reset any account,
 * so it must stay off in production.
 */
export function isRecoveryEnabled(): boolean {
  return process.env.NODE_ENV !== "production"
}

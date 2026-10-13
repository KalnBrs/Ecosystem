export const PASSWORD_MIN_LENGTH = 10
// bcrypt silently ignores anything past 72 bytes.
export const PASSWORD_MAX_LENGTH = 72

export type PasswordRule = {
  id: string
  label: string
  test: (password: string) => boolean
}

export const PASSWORD_RULES: PasswordRule[] = [
  { id: "length", label: `At least ${PASSWORD_MIN_LENGTH} characters`, test: p => p.length >= PASSWORD_MIN_LENGTH },
  { id: "lower", label: "One lowercase letter", test: p => /[a-z]/.test(p) },
  { id: "upper", label: "One uppercase letter", test: p => /[A-Z]/.test(p) },
  { id: "number", label: "One number", test: p => /[0-9]/.test(p) },
  { id: "symbol", label: "One symbol (e.g. ! @ # $)", test: p => /[^A-Za-z0-9\s]/.test(p) },
  { id: "spaces", label: "No spaces", test: p => !/\s/.test(p) },
]

export function isStrongPassword(password: string): boolean {
  return password.length <= PASSWORD_MAX_LENGTH && PASSWORD_RULES.every(rule => rule.test(password))
}

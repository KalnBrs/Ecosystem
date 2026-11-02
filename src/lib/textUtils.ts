/**
 * Capitalizes the first character of a string.
 *
 * The remainder of the string is left unchanged.
 *
 * @param {string} value - The string to capitalize.
 * @returns {string} The string with its first character capitalized.
 */
export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
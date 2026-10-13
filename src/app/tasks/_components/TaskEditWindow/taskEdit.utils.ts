import type { EnergyLevel } from "@/@types"

/**
 * Converts the string inputed into a string that can be used in the frontend
 * @param iso the total string that is being sliced into the right string length
 * @returns the sliced string to 10 characters
 */
export const toDateInputValue = (iso?: string) => (iso ? iso.slice(0, 10) : "")

/**
 * Takes a string value for time and converts it to the correct format for the backend
 * @param value the time value being converted 
 * @returns a valid string for the backend/db storage
 */
export const fromDateInputValue = (value: string) => (value ? `${value}T00:00:00.000Z` : null)

export const energyOptions: { value: EnergyLevel; label: string }[] = [
  { value: "deep", label: "Deep" },
  { value: "light", label: "Light" },
  { value: "quick", label: "Quick" },
]


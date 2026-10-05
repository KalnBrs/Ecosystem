import type { EnergyLevel } from "@/@types"

export const toDateInputValue = (iso?: string) => (iso ? iso.slice(0, 10) : "")
export const fromDateInputValue = (value: string) => (value ? `${value}T00:00:00.000Z` : null)

export const energyOptions: { value: EnergyLevel; label: string }[] = [
  { value: "deep", label: "Deep" },
  { value: "light", label: "Light" },
  { value: "quick", label: "Quick" },
]


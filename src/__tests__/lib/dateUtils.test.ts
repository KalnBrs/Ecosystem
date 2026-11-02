import { getCalendarDayDiff, getDueStatus } from "@/lib/dateUtils"

describe("dateUtils calendar-day comparisons", () => {
  const today = new Date(2026, 9, 23, 15, 30)

  it("compares today and tomorrow using the day of the month", () => {
    expect(getCalendarDayDiff("2026-10-23", today)).toBe(0)
    expect(getCalendarDayDiff("2026-10-24", today)).toBe(1)
  })

  it("assigns due-date status against the correct local calendar day", () => {
    expect(getDueStatus("2026-10-23", today)).toBe("soon")
    expect(getDueStatus("2026-10-24", today)).toBe("soon")
    expect(getDueStatus("2026-10-22", today)).toBe("overdue")
  })
})
const MS_PER_DAY = 86_400_000

const relativeDateFormatter = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
})

/** Status of a task's due date. */
export type DueStatus = "overdue" | "soon" | null

/**
 * Converts a date to a UTC timestamp representing its local calendar day.
 *
 * The date's local year, month, and day are used to create a UTC
 * timestamp at midnight. The time of day is discarded.
 *
 * @param date - The date whose local calendar day should be converted.
 * @returns The UTC timestamp in milliseconds for that calendar day.
 */
export function toUtcDay(date: Date): number {
  return Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  )
}

/**
 * Calculates the difference in calendar days between a target date
 * and a reference date.
 *
 * The target date is interpreted as a date-only value when provided
 * as a string. The reference date uses its local calendar day.
 *
 * @param targetDate - The target date to compare. Strings are interpreted as date-only values.
 * @param fromDate - The reference date; defaults to the current date.
 * @returns The number of calendar days between the dates.
 * A negative value indicates a past date, zero indicates the same
 * calendar day, and a positive value indicates a future date.
 */
export function getCalendarDayDiff(targetDate: string | Date, fromDate: Date = new Date()): number {
  const target = typeof targetDate === "string" ? Date.parse(targetDate.slice(0, 10)) : toUtcDay(targetDate)
  const from = toUtcDay(fromDate)
  return (target - from) / MS_PER_DAY
}

/**
 * Formats a day difference as a localized relative-time label.
 *
 * Uses the English locale and automatically selects terms such as
 * "yesterday", "today", and "tomorrow" where applicable.
 *
 * @param days - The number of days relative to the present.
 * @returns The formatted relative-time label.
 */
export function formatRelativeDays(days: number): string {
  return relativeDateFormatter.format(days, "day")
}

/**
 * Formats a date using a short month name and numeric day.
 *
 * Date-only strings in YYYY-MM-DD format are interpreted as UTC
 * midnight to avoid timezone-related date shifts.
 *
 * @param date - The date to format. Date-only strings are interpreted as UTC.
 * @param locale - The locale used for formatting; defaults to English.
 * @returns The formatted date, such as "Oct 14".
 */
export function formatDateShort(date: string | Date, locale = "en"): string {
  const parsed = date instanceof Date ? date : new Date(date.length === 10 ? `${date}T00:00:00Z` : date)

  return parsed.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
}

/**
 * Formats a date as an ISO-style date-only value (YYYY-MM-DD).
 * Date-only strings are interpreted at UTC midnight, matching `formatDateShort`.
 *
 * @param date - The date to format. Date-only strings are interpreted as UTC.
 * @returns The date in YYYY-MM-DD format.
 */
export function formatDateLong(date: string | Date): string {
  const parsed = date instanceof Date ? date : new Date(date.length === 10 ? `${date}T00:00:00Z` : date)

  const year = parsed.getUTCFullYear()
  const month = String(parsed.getUTCMonth() + 1).padStart(2, "0")
  const day = String(parsed.getUTCDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

/**
 * Determines the status of a task based on its due date.
 *
 * Completed tasks and tasks without a due date have no status.
 * A date before today is "overdue". A date within the next three
 * calendar days, including today, is "soon".
 *
 * @param dueDate - The task's due date, if any.
 * @param now - The reference date used for comparison; defaults to now.
 * @param isChecked - Whether the task is completed; defaults to false.
 * @returns The due-date status, or null if no status applies.
 */
export function getDueStatus(dueDate: string | null | undefined, now: Date = new Date(),isChecked = false): DueStatus {
  if (!dueDate || isChecked) return null

  const daysLeft = getCalendarDayDiff(dueDate, now)

  if (daysLeft < 0) return "overdue"
  if (daysLeft < 3) return "soon"

  return null
}

/**
 * Formats a timestamp as a relative number of days.
 *
 * The difference is rounded to the nearest 24-hour period before
 * being formatted. Future timestamps produce future-relative labels.
 *
 * @param updatedAt - The timestamp to format, if any.
 * @param now - The reference timestamp; defaults to the current time.
 * @returns The relative-time label, or null when no timestamp is provided.
 */
export function getTimeAgo(updatedAt: string | Date | null | undefined, now: number | Date = Date.now()): string | null {
  if (!updatedAt) return null

  const timestamp = updatedAt instanceof Date ? updatedAt.getTime() : new Date(updatedAt).getTime()

  const nowTimestamp =
    now instanceof Date ? now.getTime() : now

  const days = Math.round(
    (timestamp - nowTimestamp) / MS_PER_DAY
  )

  return formatRelativeDays(days)
}
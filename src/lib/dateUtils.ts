const MS_PER_DAY = 86_400_000

const relativeDateFormatter = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
})

/**
 * Represents the status of a task's due date.
 *
 * @typedef {"overdue" | "soon" | null} DueStatus
 */
export type DueStatus = "overdue" | "soon" | null

/**
 * Converts a date to a UTC timestamp representing its local calendar day.
 *
 * The date's local year, month, and day are used to create a UTC
 * timestamp at midnight. The time of day is discarded.
 *
 * @param {Date} date - The date whose local calendar day should be converted.
 * @returns {number} The UTC timestamp in milliseconds for that calendar day.
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
 * @param {string | Date} targetDate - The target date to compare.
 * @param {Date} [fromDate=new Date()] - The reference date.
 * @returns {number} The number of calendar days between the dates.
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
 * @param {number} days - The number of days relative to the present.
 * @returns {string} The formatted relative-time label.
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
 * @param {string | Date} date - The date to format.
 * @param {string} [locale="en"] - The locale used for formatting.
 * @returns {string} The formatted date, such as "Oct 14".
 */
export function formatDate(date: string | Date, locale = "en"): string {
  const parsed = date instanceof Date ? date : new Date(date.length === 10 ? `${date}T00:00:00Z` : date)

  return parsed.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
}

/**
 * Determines the status of a task based on its due date.
 *
 * Completed tasks and tasks without a due date have no status.
 * A date before today is "overdue". A date within the next three
 * calendar days, including today, is "soon".
 *
 * @param {string | null | undefined} dueDate - The task's due date.
 * @param {Date} [now=new Date()] - The reference date used for comparison.
 * @param {boolean} [isChecked=false] - Whether the task is completed.
 * @returns {DueStatus} The due-date status, or null if no status applies.
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
 * @param {string | Date | null | undefined} updatedAt - The timestamp
 * to format.
 * @param {number | Date} [now=Date.now()] - The reference timestamp.
 * @returns {string | null} The relative-time label, or null when
 * no timestamp is provided.
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
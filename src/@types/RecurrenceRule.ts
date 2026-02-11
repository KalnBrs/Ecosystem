export type Frequency = "daily" | "weekly" | "monthly" | "yearly";

export interface RecurrenceRule {
  frequency: Frequency;
  interval: number; // every X units (1 = every week, 2 = every 2 weeks)

  // Weekly
  daysOfWeek?: number[]; // 0 = Sunday, 6 = Saturday

  // Monthly
  dayOfMonth?: number; // 1–31

  // End conditions
  endDate?: Date;
  count?: number; // total number of occurrences
}
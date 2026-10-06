// Date helpers. Everything works in UTC and returns plain
// "YYYY-MM-DD" strings, so dates never drift due to time zones.

// Turn a Date into a "YYYY-MM-DD" string.
export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// Build a UTC date from a "YYYY-MM-DD" string.
export function fromISODate(iso: string): Date {
  return new Date(iso + "T00:00:00Z");
}

// Add a number of days to a date and return the new date.
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

// First day of the month for a given date.
export function startOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

// True if the date is Monday to Friday.
export function isWeekday(date: Date): boolean {
  const day = date.getUTCDay();
  return day >= 1 && day <= 5;
}
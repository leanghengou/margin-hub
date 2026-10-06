import { faker, reseed } from "./lib/random.js";
import { toISODate, fromISODate, addDays } from "./lib/dates.js";

// One place that decides when each client starts and ends.
// clients, client_budgets, invoices, projects and time_entries
// all read from here, so their dates always agree.

export const CLIENT_COUNT = 42;

// ids 1–26 are founding clients (start 2025-01-01).
// ids 27–42 join later (16 late joiners).
export const FIRST_LATE_JOINER = 27;

// The new client with heavy setup hours.
export const NEW_CLIENT_ID = 28;

// E-commerce clients that drive the Q4 Paid Ads spike.
// They never churn, so the spike shows in both years.
export const ECOMMERCE_IDS = [2, 6, 9, 13, 17, 21, 25];

// Two churn dates we pin by hand. The rest are picked below.
const FIXED_CHURN: Record<number, string> = {
  12: "2025-08-31",
  22: "2026-05-31",
};

// Total clients that churn over the two years.
const CHURN_TARGET = 22;

export type ClientWindow = {
  clientId: number;
  start: string;       // "YYYY-MM-DD"
  end: string | null;  // null = still active
};

// Last day of the month for a date (day 0 of next month).
function lastDayOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
}

function buildWindows(): ClientWindow[] {
  reseed("stories");
  const windows: ClientWindow[] = [];

  // Step 1: start dates.
  for (let id = 1; id <= CLIENT_COUNT; id++) {
    let start = "2025-01-01";
    if (id === NEW_CLIENT_ID) {
      start = "2026-03-01";
    } else if (id >= FIRST_LATE_JOINER) {
      start = toISODate(faker.date.between({ from: "2025-02-01", to: "2026-07-01" }));
    }
    windows.push({ clientId: id, start, end: FIXED_CHURN[id] ?? null });
  }

  // Step 2: pick the other churners.
  // Skip e-commerce, the new client, and anyone who joined after
  // May 2026 (they need at least ~4 months before they can leave).
  const candidates = windows.filter(
    (w) =>
      w.end === null &&
      w.clientId !== NEW_CLIENT_ID &&
      !ECOMMERCE_IDS.includes(w.clientId) &&
      w.start <= "2026-05-31",
  );
  const extraCount = CHURN_TARGET - Object.keys(FIXED_CHURN).length;
  const churners = faker.helpers.arrayElements(candidates, extraCount);

  // Step 3: give each churner an end date, spread across the range,
  // at least 120 days after they started, and no later than Sep 2026.
  for (const w of churners) {
    const earliest = addDays(fromISODate(w.start), 120);
    const d = faker.date.between({ from: earliest, to: fromISODate("2026-09-30") });
    w.end = toISODate(lastDayOfMonth(d));
  }

  return windows;
}

// Built once, when this file is first imported.
export const CLIENT_WINDOWS = buildWindows();

// Look up one client's window by id.
export function clientWindow(clientId: number): ClientWindow {
  return CLIENT_WINDOWS[clientId - 1];
}
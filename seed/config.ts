// Shared settings for the whole seed process.
// Everything reads from here so the data stays consistent and reproducible.

// Fixed seed: same number in, same data out, every time.
export const SEED = 20250101;

// Full date range the data covers: Jan 2025 to Dec 2026 (24 months).
export const START_DATE = "2025-01-01";
export const END_DATE = "2026-12-31";

// "Today" is pinned so future dates (Oct–Dec 2026) stay consistent.
export const TODAY = "2026-10-06";

// Roughly how many rows to aim for.
export const TARGETS = {
  employees: 25,
  clients: 30,
  timeEntries: 70000,
};
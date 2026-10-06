import { faker, reseed } from "../lib/random.js";
import { writeCsv } from "../lib/csv.js";
import { toISODate } from "../lib/dates.js";

// How many employees sit on each team (team_id -> count).
// Weighted toward delivery teams; Account Mgmt is small.
const TEAM_HEADCOUNT: Record<number, number> = {
  1: 5, // SEO
  2: 4, // Website
  3: 4, // Paid Ads
  4: 2, // Account Management
};

// The burnt-out employee story lands on this id (an SEO specialist).
const BURNOUT_ID = 1;

export function generateEmployees(): void {
  reseed("employees");
  const rows = [];
  let id = 1;

  for (const [teamId, count] of Object.entries(TEAM_HEADCOUNT)) {
    for (let i = 0; i < Number(count); i++) {
      // Most started before our data window; a few joined during it.
      const created = faker.date.between({ from: "2024-06-01", to: "2026-03-01" });

      rows.push({
        id,
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        team_id: Number(teamId),
        created_at: toISODate(created),
        weekly_capacity: 40,
      });
      id++;
    }
  }

  writeCsv(
    "data/employees.csv",
    ["id", "first_name", "last_name", "team_id", "created_at", "weekly_capacity"],
    rows,
  );
  console.log(`employees: wrote ${rows.length} rows`);
}
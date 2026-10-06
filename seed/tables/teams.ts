import { writeCsv } from "../lib/csv.js";

// Teams are fixed, so we just list them by hand.
// These ids must stay the same: other tables point to them.
const teams = [
  { id: 1, name: "SEO" },
  { id: 2, name: "Website" },
  { id: 3, name: "Paid Ads" },
  { id: 4, name: "Account Management" },
];

// Write them out to data/teams.csv.
export function generateTeams(): void {
  writeCsv("data/teams.csv", ["id", "name"], teams);
  console.log(`teams: wrote ${teams.length} rows`);
}
import { writeCsv } from "../lib/csv.js";

// Services are fixed. Each belongs to a team (team_id -> teams.id).
// bill_rate is the default hourly rate charged to clients.
// Note: CRO sits under the Website team (team 2), per the plan.
const services = [
  { id: 1, name: "SEO",             team_id: 1, bill_rate: 120 },
  { id: 2, name: "AEO/GEO",         team_id: 1, bill_rate: 130 },
  { id: 3, name: "Web Development", team_id: 2, bill_rate: 150 },
  { id: 4, name: "CRO",             team_id: 2, bill_rate: 180 },
  { id: 5, name: "Paid Ads",        team_id: 3, bill_rate: 140 },
];

export function generateServices(): void {
  writeCsv("data/services.csv", ["id", "name", "team_id", "bill_rate"], services);
  console.log(`services: wrote ${services.length} rows`);
}
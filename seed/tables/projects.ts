import { faker, reseed } from "../lib/random.js";
import { writeCsv } from "../lib/csv.js";
import { toISODate, addDays, fromISODate } from "../lib/dates.js";
import { CLIENT_COUNT, clientWindow } from "../stories.js";

// Services: 1 SEO, 2 AEO/GEO, 3 Web Development, 4 CRO, 5 Paid Ads
const SERVICE_IDS = [1, 2, 3, 4, 5];

// The money-losing project ids get filled in as we build, then
// exported so time_entries can pile extra hours onto them.
export const MONEY_LOSING_PROJECT_IDS: number[] = [];

// The standout client-level story: an SEO retainer whose hours
// creep up while the fee stays flat.
export const CREEP_PROJECT = { projectId: 0 };

export function generateProjects(): void {
  reseed("projects");
  const rows = [];
  let id = 1;

  // Collect candidate losers by type as we go.
  const webProjects: number[] = [];
  const otherProjects: number[] = [];

  for (let clientId = 1; clientId <= CLIENT_COUNT; clientId++) {
    const { start, end } = clientWindow(clientId);
    const windowEnd = end ?? "2026-12-31";

    const count = faker.number.int({ min: 1, max: 3 });
    const services = faker.helpers.arrayElements(SERVICE_IDS, count);

    for (const serviceId of services) {
      // CRO (service 4) is fixed-fee with a high budget (star margin).
      let pricingModel: string;
      let budget: number;

      if (serviceId === 4) {
        pricingModel = "fixed";
        budget = faker.number.int({ min: 25000, max: 60000 });
      } else if (serviceId === 3) {
        // Web Development is a one-time fixed build fee.
        pricingModel = "fixed";
        budget = faker.helpers.arrayElement([8000, 10000, 12000, 15000]);
      } else {
        pricingModel = faker.helpers.arrayElement(["retainer", "fixed", "hourly"]);
        budget = faker.number.int({ min: 5000, max: 30000 });
      }

      const startDate = faker.date.between({ from: fromISODate(start), to: fromISODate(windowEnd) });
      const deadline = addDays(startDate, faker.number.int({ min: 60, max: 365 }));

      rows.push({
        id,
        budget,
        service_id: serviceId,
        client_id: clientId,
        start_date: toISODate(startDate),
        deadline: toISODate(deadline),
        pricing_model: pricingModel,
      });

      // Track candidates for money-losing.
      if (serviceId === 3) webProjects.push(id);
      else if (pricingModel === "retainer" || serviceId === 5) otherProjects.push(id);

      id++;
    }
  }

  // Pick the losers: 4 website builds + 4 others (retainers/ads).
  const webLosers = faker.helpers.arrayElements(webProjects, 4);
  const otherLosers = faker.helpers.arrayElements(otherProjects, 4);
  MONEY_LOSING_PROJECT_IDS.push(...webLosers, ...otherLosers);

  // The creep story: pick one retainer project as the standout.
  const retainers = rows.filter((r) => r.pricing_model === "retainer");
  if (retainers.length > 0) {
    CREEP_PROJECT.projectId = faker.helpers.arrayElement(retainers).id;
  }

  writeCsv(
    "data/projects.csv",
    ["id", "budget", "service_id", "client_id", "start_date", "deadline", "pricing_model"],
    rows,
  );
  console.log(`projects: wrote ${rows.length} rows`);
  console.log(`  money-losing projects: ${MONEY_LOSING_PROJECT_IDS.join(", ")}`);
  console.log(`  creep story project: ${CREEP_PROJECT.projectId}`);
}
import { faker, reseed } from "../lib/random.js";
import { writeCsv } from "../lib/csv.js";
import { toISODate, addDays, fromISODate } from "../lib/dates.js";
import { CLIENT_COUNT, clientWindow } from "../stories.js";
import { END_DATE, TODAY } from "../config.js";

// Services: 1 SEO, 2 AEO/GEO, 3 Web Development, 4 CRO, 5 Paid Ads
const SERVICE_IDS = [1, 2, 3, 4, 5];

// Pricing model follows the service, never random:
//   SEO, AEO/GEO, Paid Ads -> retainer (ongoing monthly work)
//   Web Development        -> fixed    (one-off build with a clear deliverable)
//   CRO                    -> hourly   (test-and-iterate work billed by time)
const PRICING_BY_SERVICE: Record<number, "retainer" | "fixed" | "hourly"> = {
  1: "retainer",
  2: "retainer",
  3: "fixed",
  4: "hourly",
  5: "retainer",
};

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

  for (let clientId = 1; clientId <= CLIENT_COUNT; clientId++) {
    const { start, end } = clientWindow(clientId);
    // Projects can run any time the client is active, up to the end of the data.
    const windowEnd = end ?? END_DATE;

    const count = faker.number.int({ min: 1, max: 3 });
    const services = faker.helpers.arrayElements(SERVICE_IDS, count);

    for (const serviceId of services) {
      const pricingModel = PRICING_BY_SERVICE[serviceId];

      // Budget ranges stay per service.
      let budget: number;
      if (serviceId === 4) {
        // CRO: high-value engagements (star margin story).
        budget = faker.number.int({ min: 25000, max: 60000 });
      } else if (serviceId === 3) {
        // Web Development: one-time build fee.
        budget = faker.helpers.arrayElement([8000, 10000, 12000, 15000]);
      } else {
        budget = faker.number.int({ min: 5000, max: 30000 });
      }

      let startDate: Date;
      let deadline: Date;
      if (pricingModel === "retainer") {
        // Retainers are ongoing: they start within the client's first 3 months
        // and run until the client leaves (or the data ends).
        const latestStart = toISODate(addDays(fromISODate(start), 90));
        const startTo = latestStart < windowEnd ? latestStart : windowEnd;
        startDate = faker.date.between({ from: fromISODate(start), to: fromISODate(startTo) });
        deadline = fromISODate(windowEnd);
      } else {
        // Web builds and CRO stay one-off projects.
        startDate = faker.date.between({ from: fromISODate(start), to: fromISODate(windowEnd) });
        deadline = addDays(startDate, faker.number.int({ min: 60, max: 365 }));
      }

      rows.push({
        id,
        budget,
        service_id: serviceId,
        client_id: clientId,
        start_date: toISODate(startDate),
        deadline: toISODate(deadline),
        pricing_model: pricingModel,
      });

      id++;
    }
  }

  // Stories only count if they're visible today, so pick from projects
  // that have already started. Otherwise a story could hide in 2027–2028.
  const visible = rows.filter((r) => r.start_date <= TODAY);
  const webProjects = visible.filter((r) => r.service_id === 3).map((r) => r.id);
  const retainerProjects = visible.filter((r) => r.pricing_model === "retainer").map((r) => r.id);

  // Pick the losers: 1 website build + 1 retainer.
  // Losing money should be the exception the dashboard uncovers, not the norm.
  const webLosers = faker.helpers.arrayElements(webProjects, 1);
  const otherLosers = faker.helpers.arrayElements(retainerProjects, 1);
  MONEY_LOSING_PROJECT_IDS.push(...webLosers, ...otherLosers);

  // The creep story: an SEO retainer that started at least a year ago,
  // so a year of creeping hours is visible on the dashboard today.
  const yearAgo = toISODate(addDays(fromISODate(TODAY), -365));
  let seoRetainers = rows.filter(
    (r) => r.service_id === 1 && r.start_date <= yearAgo && !MONEY_LOSING_PROJECT_IDS.includes(r.id),
  );
  if (seoRetainers.length === 0) {
    seoRetainers = rows.filter((r) => r.service_id === 1);
  }
  if (seoRetainers.length > 0) {
    CREEP_PROJECT.projectId = faker.helpers.arrayElement(seoRetainers).id;
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
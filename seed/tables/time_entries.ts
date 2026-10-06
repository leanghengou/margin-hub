import { faker, reseed } from "../lib/random.js";
import { writeCsv, readCsv } from "../lib/csv.js";
import { addDays, fromISODate, toISODate, isWeekday } from "../lib/dates.js";
import { ECOMMERCE_IDS, NEW_CLIENT_ID, clientWindow } from "../stories.js";
import { MONEY_LOSING_PROJECT_IDS, CREEP_PROJECT } from "./projects.js";

// Hours stop at yesterday: nobody logs time in the future.
// (Invoices go to Dec 2026 because fees are scheduled; hours aren't.)
const FIRST_DAY = "2025-01-01";
const LAST_DAY = "2026-10-05";

// Which team delivers each service.
// 1 SEO, 2 AEO/GEO -> SEO team; 3 Web Dev, 4 CRO -> Website team; 5 Paid Ads -> Ads team.
const SERVICE_TEAM: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 2, 5: 3 };

// Burnout story: SEO specialist #1 logs 50+ h/week for 13 weeks.
const BURNOUT_ID = 1;
const BURNOUT_FROM = "2026-06-29";
const BURNOUT_TO = "2026-09-25";

// Entries are logged in chunks of 15 min to 1.25 h, like a time tracker.
// Smaller chunks = more rows. Lower MAX_CHUNK if you want more volume.
const MAX_CHUNK = 1.25;

type Project = {
  id: number;
  clientId: number;
  serviceId: number;
  teamId: number;
  from: string; // first day hours can be logged
  to: string;   // last day hours can be logged
};

// Load projects and work out when each one can receive hours:
// between its start and deadline, but never outside the client's
// active window (so churned clients get no hours after they leave).
function loadProjects(): Project[] {
  return readCsv("data/projects.csv").map((r) => {
    const clientId = Number(r.client_id);
    const serviceId = Number(r.service_id);
    const { start, end } = clientWindow(clientId);
    const clientEnd = end ?? "2026-12-31";
    return {
      id: Number(r.id),
      clientId,
      serviceId,
      teamId: SERVICE_TEAM[serviceId],
      from: r.start_date > start ? r.start_date : start,
      to: r.deadline < clientEnd ? r.deadline : clientEnd,
    };
  });
}

// Whole months between two "YYYY-MM-DD" strings.
function monthsBetween(a: string, b: string): number {
  const [ya, ma] = [Number(a.slice(0, 4)), Number(a.slice(5, 7))];
  const [yb, mb] = [Number(b.slice(0, 4)), Number(b.slice(5, 7))];
  return (yb - ya) * 12 + (mb - ma);
}

// How strongly a project pulls hours on a given day.
// Every story except burnout is planted here: a bigger weight means
// the project soaks up a bigger share of the team's time.
function projectWeight(p: Project, day: string): number {
  let w = 1;
  const month = Number(day.slice(5, 7));

  // Money-losing projects: scope creep, 4x the normal share of hours.
  if (MONEY_LOSING_PROJECT_IDS.includes(p.id)) w *= 4;

  // Creep story: share grows ~40% over its first year, fee stays flat.
  if (p.id === CREEP_PROJECT.projectId) {
    const months = Math.min(monthsBetween(p.from, day), 12);
    w *= 2 * (1 + 0.4 * (months / 12));
  }

  // Seasonality: e-commerce Paid Ads work triples in Nov–Dec.
  if (p.serviceId === 5 && ECOMMERCE_IDS.includes(p.clientId) && month >= 11) w *= 3;

  // New client: heavy setup during its first month (March 2026).
  if (p.clientId === NEW_CLIENT_ID && day < "2026-04-01") w *= 5;

  return w;
}

// Total hours an employee logs on one day.
function hoursForDay(employeeId: number, teamId: number, day: string): number {
  // Burnout: 10.5–11.5 h/day = 52–57 h/week.
  if (employeeId === BURNOUT_ID && day >= BURNOUT_FROM && day <= BURNOUT_TO) {
    return faker.number.float({ min: 10.5, max: 11.5, multipleOf: 0.25 });
  }

  // ~5% of days off (sick, vacation).
  if (faker.datatype.boolean({ probability: 0.05 })) return 0;

  // Normal day: 6–8.5 h.
  let hours = faker.number.float({ min: 6, max: 8.5, multipleOf: 0.25 });

  // Paid Ads team works longer in the Nov–Dec rush.
  const month = Number(day.slice(5, 7));
  if (teamId === 3 && month >= 11) hours += 1.5;

  return hours;
}

export function generateTimeEntries(): void {
  reseed("time_entries");

  // Account Management (team 4) is overhead: no client hours.
  const employees = readCsv("data/employees.csv")
    .map((r) => ({ id: Number(r.id), teamId: Number(r.team_id), createdAt: r.created_at }))
    .filter((e) => e.teamId !== 4);

  const projects = loadProjects();
  const rows = [];
  let id = 1;

  // Walk every day in the range.
  for (let d = fromISODate(FIRST_DAY); d <= fromISODate(LAST_DAY); d = addDays(d, 1)) {
    if (!isWeekday(d)) continue; // weekdays only
    const day = toISODate(d);

    for (const emp of employees) {
      if (day < emp.createdAt) continue; // not hired yet

      // Projects this person can work on today: their team's service,
      // and the project is live. This guarantees service matches team
      // and project matches client + service.
      const active = projects.filter(
        (p) => p.teamId === emp.teamId && p.from <= day && day <= p.to,
      );
      if (active.length === 0) continue; // nothing to work on (idle day)

      const choices = active.map((p) => ({ weight: projectWeight(p, day), value: p }));
      let remaining = hoursForDay(emp.id, emp.teamId, day);

      // Split the day into chunks, each going to a weighted-random project.
      while (remaining > 0) {
        const chunk = Math.min(
          remaining,
          faker.number.float({ min: 0.25, max: MAX_CHUNK, multipleOf: 0.25 }),
        );
        const p = faker.helpers.weightedArrayElement(choices);

        rows.push({
          id: id++,
          employee_id: emp.id,
          client_id: p.clientId,
          service_id: p.serviceId,
          project_id: p.id,
          hour_spent: chunk,
          billable: faker.datatype.boolean({ probability: 0.9 }),
          work_date: day,
        });
        remaining -= chunk;
      }
    }
  }

  writeCsv(
    "data/time_entries.csv",
    ["id", "employee_id", "client_id", "service_id", "project_id", "hour_spent", "billable", "work_date"],
    rows,
  );
  console.log(`time_entries: wrote ${rows.length} rows`);
}
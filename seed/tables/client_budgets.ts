import { faker, reseed } from "../lib/random.js";
import { writeCsv, readCsv } from "../lib/csv.js";
import { toISODate, startOfMonth, fromISODate } from "../lib/dates.js";
import { CLIENT_COUNT, clientWindow } from "../stories.js";

// Recurring services only. Web Development (3) is a one-time fee,
// so it gets no monthly budget row.
const RECURRING_SERVICE_IDS = [1, 2, 4, 5];

// Build "which recurring services does each client actually have?"
// straight from projects, so billing matches delivery.
function recurringServicesByClient(): Map<number, Set<number>> {
  const map = new Map<number, Set<number>>();
  for (const r of readCsv("data/projects.csv")) {
    const clientId = Number(r.client_id);
    const serviceId = Number(r.service_id);
    if (!RECURRING_SERVICE_IDS.includes(serviceId)) continue;
    if (!map.has(clientId)) map.set(clientId, new Set());
    map.get(clientId)!.add(serviceId);
  }
  return map;
}

export function generateClientBudgets(): void {
  reseed("client_budgets");
  const byClient = recurringServicesByClient();
  const rows = [];
  let id = 1;

  for (let clientId = 1; clientId <= CLIENT_COUNT; clientId++) {
    const { start, end } = clientWindow(clientId);
    const windowEnd = end ?? "2026-12-31";
    const serviceIds = byClient.get(clientId) ?? new Set<number>();

    for (const serviceId of serviceIds) {
      const budgetedHour = faker.number.int({ min: 20, max: 80 });
      const monthlyFee = faker.number.int({ min: 2000, max: 12000 });

      let cursor = startOfMonth(fromISODate(start));
      const lastMonth = startOfMonth(fromISODate(windowEnd));

      while (cursor <= lastMonth) {
        rows.push({
          id: id++,
          client_id: clientId,
          service_id: serviceId,
          month: toISODate(cursor),
          budgeted_hour: budgetedHour,
          monthly_fee: monthlyFee,
        });
        cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1));
      }
    }
  }

  writeCsv(
    "data/client_budgets.csv",
    ["id", "client_id", "service_id", "month", "budgeted_hour", "monthly_fee"],
    rows,
  );
  console.log(`client_budgets: wrote ${rows.length} rows`);
}
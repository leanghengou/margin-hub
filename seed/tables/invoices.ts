import { faker, reseed } from "../lib/random.js";
import { writeCsv, readCsv } from "../lib/csv.js";
import { toISODate, startOfMonth, fromISODate, addDays } from "../lib/dates.js";
import { CLIENT_COUNT, clientWindow } from "../stories.js";

const RECURRING_SERVICE_IDS = [1, 2, 4, 5];
const WEB_DEV_SERVICE = 3;
const TODAY = fromISODate("2026-10-06");

// Read projects once, so invoices match the work that was actually done.
function loadProjects() {
  return readCsv("data/projects.csv").map((r) => ({
    clientId: Number(r.client_id),
    serviceId: Number(r.service_id),
    startDate: r.start_date,
    budget: Number(r.budget),
  }));
}

export function generateInvoices(): void {
  reseed("invoices");
  const projects = loadProjects();
  const rows = [];
  let id = 1;

  for (let clientId = 1; clientId <= CLIENT_COUNT; clientId++) {
    const { start, end } = clientWindow(clientId);
    const windowEnd = end ?? "2026-12-31";
    const clientProjects = projects.filter((p) => p.clientId === clientId);

    // Recurring services this client actually has projects for.
    const recurring = new Set(
      clientProjects
        .map((p) => p.serviceId)
        .filter((s) => RECURRING_SERVICE_IDS.includes(s)),
    );

    for (const serviceId of recurring) {
      const monthlyFee = faker.number.int({ min: 2000, max: 12000 });

      let cursor = startOfMonth(fromISODate(start));
      const lastMonth = startOfMonth(fromISODate(windowEnd));

      while (cursor <= lastMonth) {
        const invoiceDate = addDays(cursor, faker.number.int({ min: 0, max: 5 }));
        const isPast = invoiceDate < TODAY;
        const isPaid = isPast ? faker.datatype.boolean({ probability: 0.85 }) : false;

        rows.push({
          id: id++,
          client_id: clientId,
          service_id: serviceId,
          invoice_date: toISODate(invoiceDate),
          amount: monthlyFee,
          is_paid: isPaid,
          paid_date: isPaid
            ? toISODate(addDays(invoiceDate, faker.number.int({ min: 10, max: 40 })))
            : null,
        });

        cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1));
      }
    }

    // One-time Web Development invoice per web project, at its start.
    for (const p of clientProjects.filter((p) => p.serviceId === WEB_DEV_SERVICE)) {
      const buildDate = fromISODate(p.startDate < start ? start : p.startDate);
      const buildPaid = buildDate < TODAY ? faker.datatype.boolean({ probability: 0.9 }) : false;
      rows.push({
        id: id++,
        client_id: clientId,
        service_id: WEB_DEV_SERVICE,
        invoice_date: toISODate(buildDate),
        amount: p.budget,
        is_paid: buildPaid,
        paid_date: buildPaid
          ? toISODate(addDays(buildDate, faker.number.int({ min: 10, max: 40 })))
          : null,
      });
    }
  }

  writeCsv(
    "data/invoices.csv",
    ["id", "client_id", "service_id", "invoice_date", "amount", "is_paid", "paid_date"],
    rows,
  );
  console.log(`invoices: wrote ${rows.length} rows`);
}
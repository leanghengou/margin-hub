import { faker, reseed } from "../lib/random.js";
import { writeCsv } from "../lib/csv.js";
import { CLIENT_COUNT, ECOMMERCE_IDS, clientWindow } from "../stories.js";

// Industries we draw from for variety.
const INDUSTRIES = [
  "E-commerce", "SaaS", "Healthcare", "Finance", "Real Estate",
  "Education", "Hospitality", "Manufacturing", "Legal", "Fitness",
];

export function generateClients(): void {
  reseed("clients");
  const rows = [];

  for (let id = 1; id <= CLIENT_COUNT; id++) {
    const name = faker.company.name();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "");

    // Start and end dates come from stories.ts (shared with other tables).
    const { start, end } = clientWindow(id);

    // E-commerce for the spike clients, random otherwise.
    const industry = ECOMMERCE_IDS.includes(id)
      ? "E-commerce"
      : faker.helpers.arrayElement(INDUSTRIES);

    rows.push({
      id,
      name,
      industry,
      start_date: start,
      end_date: end,
      tier: faker.helpers.weightedArrayElement([
        { weight: 2, value: 1 },
        { weight: 5, value: 2 },
        { weight: 3, value: 3 },
      ]),
      location: faker.helpers.arrayElement([
        `${faker.location.city()}, ${faker.location.state({ abbreviated: true })}, USA`,
        `${faker.location.city()}, ${faker.helpers.arrayElement(["ON", "BC", "QC", "AB"])}, Canada`,
      ]),
      email: `${faker.helpers.arrayElement(["info", "contact", "hello", "marketing", "admin"])}@${slug}.com`,
    });
  }

  writeCsv(
    "data/clients.csv",
    ["id", "name", "industry", "start_date", "end_date", "tier", "location", "email"],
    rows,
  );
  console.log(`clients: wrote ${rows.length} rows`);
}
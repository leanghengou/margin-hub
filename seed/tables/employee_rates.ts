import { faker, reseed } from "../lib/random.js";
import { writeCsv } from "../lib/csv.js";

// Pay history. Each employee has at least one rate row.
// valid_to = null means "this is the current rate".
// Some employees get a raise mid-history: a second row, so
// costing an old month uses the rate that applied back then.

const EMPLOYEE_COUNT = 15;

// These employees get a raise partway through (a second rate row).
const RAISED = new Set([1, 4, 9]);

export function generateEmployeeRates(): void {
  reseed("employee_rates");
  const rows = [];
  let id = 1;

  for (let employeeId = 1; employeeId <= EMPLOYEE_COUNT; employeeId++) {
    // Starting hourly cost, somewhere between 30 and 70.
    const baseCost = faker.number.int({ min: 27, max: 70 });

    if (RAISED.has(employeeId)) {
      // First rate ends the day before the raise; raise lands mid-2025.
      const raiseDate = "2025-07-01";
      rows.push({
        id: id++,
        hourly_cost: baseCost,
        employee_id: employeeId,
        valid_from: "2025-01-01",
        valid_to: "2025-06-30",
      });
      rows.push({
        id: id++,
        hourly_cost: baseCost + faker.number.int({ min: 5, max: 12 }),
        employee_id: employeeId,
        valid_from: raiseDate,
        valid_to: null,
      });
    } else {
      // Single, still-current rate.
      rows.push({
        id: id++,
        hourly_cost: baseCost,
        employee_id: employeeId,
        valid_from: "2025-01-01",
        valid_to: null,
      });
    }
  }

  writeCsv(
    "data/employee_rates.csv",
    ["id", "hourly_cost", "employee_id", "valid_from", "valid_to"],
    rows,
  );
  console.log(`employee_rates: wrote ${rows.length} rows`);
}
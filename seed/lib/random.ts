import { faker } from "@faker-js/faker";
import { SEED, TODAY } from "../config.js";

export { faker };

// Give each table its own stable seed by adding up the letters
// of its name and combining that with the base SEED.
export function reseed(tableName: string): void {
  let sum = 0;
  for (const char of tableName) {
    sum += char.charCodeAt(0);
  }
  faker.seed(SEED + sum);

  faker.setDefaultRefDate(new Date(TODAY));
}
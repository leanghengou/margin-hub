import { writeFileSync, readFileSync } from "node:fs";

// Write rows to a CSV file for Postgres COPY.
//
// The important bit: an empty/missing value is written as a bare
// empty field, which COPY reads as NULL. An actual empty string
// is written as "" so COPY keeps it as empty text, not NULL.
export function writeCsv(
  path: string,
  columns: string[],
  rows: Record<string, unknown>[],
): void {
  const lines = [columns.join(",")];

  for (const row of rows) {
    const cells = columns.map((col) => formatCell(row[col]));
    lines.push(cells.join(","));
  }

  writeFileSync(path, lines.join("\n") + "\n");
}

// Turn one value into a safe CSV cell.
function formatCell(value: unknown): string {
  // null or undefined -> bare empty field -> NULL in Postgres.
  if (value === null || value === undefined) return "";

  const text = String(value);

  // Wrap in quotes if it contains a comma, quote, or newline.
  if (/[",\n]/.test(text)) {
    return '"' + text.replace(/"/g, '""') + '"';
  }

  return text;
}

export {};

export function readCsv(path: string): Record<string, string>[] {
  const [header, ...lines] = readFileSync(path, "utf8").trim().split(/\r?\n/);
  const columns = header.split(",");
  return lines.map((line) => {
    const cells = line.split(",");
    return Object.fromEntries(columns.map((c, i) => [c, cells[i] ?? ""]));
  });
}
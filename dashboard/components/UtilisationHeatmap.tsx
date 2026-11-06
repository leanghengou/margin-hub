import type { getEmployeeUtilisation } from "@/lib/queries";
import YearSelect from "./YearSelect";
const GREY = "#cbd5e1"; // team with no colour

// Rows straight from the query, same pattern as EmployeesTable
type UtilisationRow = Awaited<ReturnType<typeof getEmployeeUtilisation>>[number];

const cellColor = (util: number) =>
    util > 100 ? "bg-red-500"
  : util > 80 ? "bg-brand-700"
  : util > 60 ? "bg-brand-500"
  : util > 40 ? "bg-brand-300"
  : "bg-yellow-attention-100";

const swatch = "size-2.5 rounded-[2px]";

type Props = {
  rows: UtilisationRow[];
  teamColors: Record<string, string>; // set in team/page.tsx
  year: number; // selected year (?year=)
  years: number[]; // years offered in the toggle
};

// Every Monday in the year (the query's weeks start on Monday): { date: "2025-01-06", month: "Jan" }
const yearMondays = (year: number) => {
  const mondays: { date: string; month: string }[] = [];
  const d = new Date(Date.UTC(year, 0, 1));
  while (d.getUTCDay() !== 1) d.setUTCDate(d.getUTCDate() + 1); // first Monday
  for (; d.getUTCFullYear() === year; d.setUTCDate(d.getUTCDate() + 7)) {
    mondays.push({
      date: d.toISOString().slice(0, 10),
      month: d.toLocaleString("en-US", { month: "short", timeZone: "UTC" }),
    });
  }
  return mondays;
};

export default function UtilisationHeatmap({ rows, teamColors, year, years }: Props) {
  // Always the whole year (Jan–Dec): one column per Monday; weeks with no data show grey
  const mondays = yearMondays(year);
  const months = mondays.map((m) => m.month);
  const weekCount = mondays.length;
  // Columns shrink to fit the card (no sideways scroll), capped at 24px so squares don't balloon
  const weekGrid = { gridTemplateColumns: `repeat(${weekCount}, minmax(0, 1.5rem))` };

  return (
    <section className="flex flex-1 min-w-0 min-h-0 flex-col rounded-2xl bg-white p-5">
      <div className="mb-5 flex items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <h2 className="text-ink text-lg font-medium">Utilisation</h2>
          <YearSelect year={year} years={years} />
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span>≤40%</span>
          <span className={`${swatch} bg-yellow-attention-100`} />
          <span className={`${swatch} bg-brand-300`} />
          <span className={`${swatch} bg-brand-500`} />
          <span className={`${swatch} bg-brand-700`} />
          <span>100%</span>
          <span className={`${swatch} ml-2 bg-red-500`} />
          <span>&gt;100%</span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {/* Month labels: only on the first week of each month */}
        <div className="mb-1 flex gap-3">
          <div className="w-40 shrink-0" />
          <div className="grid flex-1 min-w-0 gap-1" style={weekGrid}>
            {months.map((month, key) => (
              <span key={key} className="whitespace-nowrap text-sm text-gray-500">
                {month !== months[key - 1] ? month : ""}
              </span>
            ))}
          </div>
        </div>

        {rows.map((item) => (
          // Rows share the card's height; the squares sit centred in each row
          <div key={item.employee_id} className="flex flex-1 items-center gap-3">
            <span className="flex w-40 shrink-0 items-center gap-2 text-[0.9rem] text-ink" title={item.employee_name}>
              <span
                className="inline-block size-2.5 shrink-0 rounded-full"
                style={{ background: teamColors[item.team] ?? GREY }}
              />
              <span className="truncate">{item.employee_name}</span>
            </span>

            <div className="grid flex-1 min-w-0 gap-1" style={weekGrid}>
              {(() => {
                // Week date -> utilisation, so each value lands in its own week's column
                const byWeek = new Map<string, number>();
                item.week_dates.forEach((date: string, i: number) => byWeek.set(date, Number(item.weeks[i])));

                return mondays.map(({ date }) => {
                  const util = byWeek.get(date);
                  // No data this week (before hire, after leaving, or still to come): grey
                  if (util === undefined) {
                    return <div key={date} className="aspect-square rounded-[4px] bg-gray-200" />;
                  }
                  return (
                    <div key={date} className={`group relative aspect-square cursor-pointer rounded-[4px] ${cellColor(util)}`}>
                      <span className="absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-900/90 px-2 py-1 text-xs text-white group-hover:block">
                        {item.employee_name} - {(util * 0.4).toFixed(1)} h
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

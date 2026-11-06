import type { getWorkerUtilisation } from "@/lib/queries";
const GREY = "#cbd5e1"; // team with no colour

// Rows straight from the query, same pattern as KpiCards
type EmployeeRow = Awaited<ReturnType<typeof getWorkerUtilisation>>[number];

// Same header style as the Home tables; line drawn as an inset shadow (a border on a sticky row doesn't paint)
const th = "sticky top-0 z-10 bg-white pb-3 text-left font-normal shadow-[inset_0_-1px_0_#d1d5db]";

type Props = {
  rows: EmployeeRow[];
  months: number; // selected period, shown in the pill
  teamColors: Record<string, string>; // set in team/page.tsx
  utilTone: (util: number) => string; // pill colour for a utilisation %, set in team/page.tsx
};

export default function EmployeesTable({ rows, months, teamColors, utilTone }: Props) {
  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-2xl bg-white p-5">
      <div className="mb-5 flex items-center gap-2">
        <h2 className="text-ink text-lg font-medium">Employee table</h2>
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">{months} months</span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full text-[0.9rem] text-ink tabular-nums">
          <thead>
            <tr className="text-sm text-gray-500">
              <th className={`${th} pr-4`}>Employee</th>
              <th className={`${th} pr-4`}>Team</th>
              <th className={`${th} pr-4`}>Hourly rate</th>
              <th className={th}>Weekly/Work</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const util = Number(r.worker_utilisation);
              return (
                <tr key={r.employee_id} className="border-b border-gray-100 last:border-b-0">
                  <td className="max-w-48 truncate py-2.5 pr-4" title={r.employee_name}>
                    {r.employee_name}
                  </td>
                  <td className="whitespace-nowrap py-2.5 pr-4">
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block size-2.5 shrink-0 rounded-full"
                        style={{ background: teamColors[r.team] ?? GREY }}
                      />
                      {r.team}
                    </span>
                  </td>
                  <td className="whitespace-nowrap py-2.5 pr-4">${Number(r.current_rate)}/hour</td>
                  <td className="whitespace-nowrap py-2.5">
                    {/* Same badge shape as the margin badge in TeamMarginCard */}
                    <span className={`whitespace-nowrap rounded-[3px] px-2 py-1 text-[0.65rem] leading-tight font-medium ${utilTone(util)}`}>
                      {util}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

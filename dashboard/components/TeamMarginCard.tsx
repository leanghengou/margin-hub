import type { getTeamEconomic, MarginRow } from "@/lib/queries";

// Rows straight from the query, same pattern as EmployeesTable
type EconomicRow = Awaited<ReturnType<typeof getTeamEconomic>>[number];

type Props = {
  months: number;
  economics: EconomicRow[];
  margin: MarginRow[];
  teamColors: Record<string, string>; // set in team/page.tsx
};

const dot = "inline-block size-2.5 shrink-0 rounded-full";
const GREY = "#cbd5e1"; // team with no colour

const LABOUR = "#5ccfc4";
const PROFIT = "#f9c66b";

// Thin vertical stripes, same as KpiClientCard
const stripes = (color: string) => `repeating-linear-gradient(90deg, ${color} 0 2px, transparent 2px 4px)`;

// Same header style as the other tables; line drawn as an inset shadow (a border on a sticky row doesn't paint)
const th = "sticky top-0 z-10 bg-white pb-3 pr-4 text-left font-normal shadow-[inset_0_-1px_0_#d1d5db]";

const money = (n: number) =>
  n.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

// 655099 -> "$655K", 1550202 -> "$1.6M"
const compact = (n: number) =>
  Math.abs(n) >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${Math.round(n / 1000)}K`;

export default function TeamMarginCard({ months, economics, margin, teamColors }: Props) {
  return (
    <section className="flex min-w-0 flex-1 flex-col rounded-2xl bg-white p-5">
      {/* Period selector lives in the page title row (team/page.tsx) */}
      <div className="flex items-center gap-2">
        <h2 className="text-ink text-lg font-medium">Team margin · revenue vs cost</h2>
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">{months} months</span>
      </div>

      <div className="mb-5 mt-3 flex gap-5 text-xs text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-[3px]" style={{ background: LABOUR }} />
          Labour cost
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-[3px]" style={{ background: PROFIT }} />
          Gross profit
        </span>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-8">
        {/* Left: one bar per team = revenue, split into labour cost + gross profit (getTeamLoggedMargin) */}
        {/* justify-between spreads the blocks when the card is taller than they need */}
        <div className="flex min-h-0 flex-col justify-between gap-6 overflow-auto">
          {margin.map((r) => {
            const labour = Number(r.labour_cost);
            const profit = Number(r.gross_profit);
            return (
              <div key={r.team}>
                <div className="flex items-center gap-2">
                  <span className={dot} style={{ background: teamColors[r.team] ?? GREY }} />
                  <h3 className="text-ink text-xl font-medium">
                    {r.team} {compact(Number(r.revenue))}
                  </h3>
                </div>
                {/* Segment widths follow each part's share; a loss leaves only labour */}
                <div className="mt-3 flex h-1.5 gap-1">
                  <div style={{ flex: `${Math.max(labour, 0)} 1 0`, background: stripes(LABOUR) }} />
                  <div style={{ flex: `${Math.max(profit, 0)} 1 0`, background: stripes(PROFIT) }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: team economics table */}
        <div className="flex min-h-0 flex-col">
          <div className="min-h-0 overflow-auto">
            <table className="w-full text-[0.9rem] text-ink tabular-nums">
              <thead>
                <tr className="text-sm text-gray-500">
                  <th className={th}>Team</th>
                  <th className={th}>Revenue</th>
                  <th className={th}>Hours</th>
                  <th className={th}>Rate</th>
                </tr>
              </thead>
              <tbody>
                {economics.map((t) => (
                  <tr key={t.team_id} className="border-b border-gray-100">
                    <td className="whitespace-nowrap py-2.5 pr-4">
                      <span className="flex items-center gap-2">
                        <span className={dot} style={{ background: teamColors[t.team] ?? GREY }} />
                        {t.team}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-2.5 pr-4">{money(Number(t.revenue))}</td>
                    <td className="whitespace-nowrap py-2.5 pr-4">{Number(t.hours).toLocaleString()} h</td>
                    <td className="whitespace-nowrap py-2.5 pr-4">
                      {t.rate ? `${money(Number(t.rate))}/h` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-gray-500">Rate = revenue ÷ logged hours.</p>
        </div>
      </div>
    </section>
  );
}

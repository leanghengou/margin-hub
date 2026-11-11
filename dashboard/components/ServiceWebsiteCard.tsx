import type { getWebsiteProject } from "@/lib/queries";

// Rows straight from the query: one row = one Web Development project
type ProjectRow = Awaited<ReturnType<typeof getWebsiteProject>>[number];

// Cost = yellow, same as the Budget burn bar; profit = solid green
const COST = "#fbbf24";
const PROFIT = "#6fbf2a";

const badge = "shrink-0 whitespace-nowrap rounded-[3px] px-2 py-1 text-[0.65rem] leading-tight font-medium";
const purple = "bg-[#F3E8FF] text-[#7E22CE]"; // revenue, same as the service cards at the top of the page

// 15000 -> "$15K"
const compact = (v: number) =>
  Math.abs(v) >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${Math.round(v / 1000)}K`;

// 1365.75 -> "$1,366" (exact dollars, same format as TeamMarginCard)
const money = (n: number) =>
  n.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

// postgres.js returns date columns as Date objects -> "Oct 2026"
const monthLabel = (d: Date) => d.toLocaleString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });

const LEGEND = [
  { label: "Cost", color: COST },
  { label: "Profit", color: PROFIT },
];

export default function ServiceWebsiteCard({ rows }: { rows: ProjectRow[] }) {
  // numerics are strings, so convert; newest project first
  const projects = rows
    .map((r) => ({
      id: Number(r.project_id),
      client: String(r.client_name),
      start: new Date(r.start_date),
      revenue: Number(r.revenue),
      cost: Number(r.labour_cost),
      profit: Number(r.profit),
    }))
    // Margin = profit ÷ revenue, whole percent
    .map((p) => ({ ...p, margin: p.revenue ? Math.round((100 * p.profit) / p.revenue) : 0 }))
    .sort((a, b) => b.start.getTime() - a.start.getTime());

  // Total revenue across every project, shown next to the title
  const totalRevenue = projects.reduce((sum, p) => sum + p.revenue, 0);

  return (
    <div className="flex min-w-0 flex-1 flex-col rounded-2xl bg-white p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="text-ink text-lg font-medium">Web Development</h2>
          {projects.length > 0 && <span className={`${badge} ${purple}`}>{compact(totalRevenue)} revenue</span>}
        </div>
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">All time</span>
      </div>
      <p className="mt-1 text-sm text-gray-500">{projects.length} projects · One time project</p>

      <div className="mb-3 mt-2 flex gap-4 text-sm text-gray-600">
        {LEGEND.map((l) => (
          <span key={l.label} className="flex items-center gap-2">
            <span className="size-3 rounded-full" style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>

      {/* One row per project; scrolls inside the card when there are many */}
      <ul className="min-h-0 flex-1 overflow-auto">
        {projects.map((p, index) => (
          <li key={index} className="py-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-sm text-ink" title={p.client}>{p.client}</span>
                <span className={`${badge} ${purple}`}>{compact(p.revenue)} budget</span>
              </div>
              <span className="shrink-0 text-xs text-gray-600">
                {monthLabel(p.start)}
              </span>
            </div>
            {/* Cost + profit = revenue; a loss leaves only cost */}
            <div
              className="mt-2 flex h-2 gap-0.5"
              title={`Revenue ${compact(p.revenue)} · Cost ${compact(p.cost)} · Profit ${compact(p.profit)} (${p.margin}%)`}
            >
              {/* Cost (solid green) on the left, profit (light green) on the right */}
              <div style={{ flex: `${Math.max(p.cost, 0)} 1 0`, background: COST }} />
              <div style={{ flex: `${Math.max(p.profit, 0)} 1 0`, background: PROFIT }} />
            </div>
            {/* Labels follow the bar: cost left, profit right */}
            <div className="mt-1.5 flex justify-between text-xs text-gray-500">
              <span>
                Cost <span className="text-ink font-medium">{money(p.cost)}</span>
              </span>
              <span>
                Profit{" "}
                <span className={`font-medium ${p.profit < 0 ? "text-[#C0392B]" : "text-[#3F7F1F]"}`}>
                  {money(p.profit)}
                </span>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

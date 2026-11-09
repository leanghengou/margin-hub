import type { getWebsiteProject } from "@/lib/queries";

// Rows straight from the query: one row = one Web Development project
type ProjectRow = Awaited<ReturnType<typeof getWebsiteProject>>[number];

const REVENUE = "#c084fc"; // legend only, same as the service cards above
const COST = "#14b8a6";
const PROFIT = "#f9c66b";

// Thin vertical stripes, same as TeamMarginCard
const stripes = (color: string) => `repeating-linear-gradient(90deg, ${color} 0 2px, transparent 2px 4px)`;

const badge = "shrink-0 whitespace-nowrap rounded-[3px] px-2 py-1 text-[0.65rem] leading-tight font-medium";
const green = "bg-[#E3F5D8] text-[#3F7F1F]";

// 15000 -> "$15K"
const compact = (v: number) =>
  Math.abs(v) >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${Math.round(v / 1000)}K`;

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
      deadline: new Date(r.deadline),
      revenue: Number(r.revenue),
      cost: Number(r.labour_cost),
      profit: Number(r.profit),
    }))
    .sort((a, b) => b.start.getTime() - a.start.getTime());

  // Total revenue across every project, shown next to the title
  const totalRevenue = projects.reduce((sum, p) => sum + p.revenue, 0);

  return (
    <div className="flex min-w-0 flex-1 flex-col rounded-2xl bg-white p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="text-ink text-lg font-medium">Web Development</h2>
          {projects.length > 0 && <span className={`${badge} ${green}`}>{compact(totalRevenue)} revenue</span>}
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
                <span className="truncate text-ink" title={p.client}>{p.client}</span>
                <span className={`${badge} ${green}`}>{compact(p.revenue)}</span>
              </div>
              <span className="shrink-0 text-xs text-gray-600">
                {monthLabel(p.start)}
              </span>
            </div>
            {/* Cost + profit = revenue; a loss leaves only cost */}
            <div
              className="mt-2 flex h-1.5 gap-1"
              title={`Revenue ${compact(p.revenue)} · Cost ${compact(p.cost)} · Profit ${compact(p.profit)}`}
            >
              <div style={{ flex: `${Math.max(p.cost, 0)} 1 0`, background: stripes(COST) }} />
              <div style={{ flex: `${Math.max(p.profit, 0)} 1 0`, background: stripes(PROFIT) }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

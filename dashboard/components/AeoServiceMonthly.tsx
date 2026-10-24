"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type Row = Record<string, unknown>;

// Fun palette
const GREEN = "#1aaf5d"; // revenue
const BLUE = "#4f7cff";  // labour cost
const RED = "#ff5468";   // loss: cost above revenue

const LEGEND = [
  { label: "Revenue", color: GREEN },
  { label: "Labour cost", color: BLUE },
  { label: "Loss", color: RED },
];

// Display order. Names must match the `service` column exactly.
// Any service not listed here goes at the end.
const ORDER = ["SEO", "AEO/GEO", "Paid Ads", "CRO", "Web Development"];

const money = (v: number) =>
  `${v < 0 ? "-" : ""}$${Math.abs(Math.round(v)).toLocaleString()}`;

// "2026-08" -> "Aug '26"
const monthLabel = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  const mon = new Date(Date.UTC(y, m - 1, 1)).toLocaleString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
  return `${mon} '${String(y).slice(2)}`;
};

// ---------- Wrapper: one chart per service, all in one row ----------
export default function ServiceMonthlyCharts({ rows }: { rows: Row[] }) {
  // Group the flat query result by service
  const byService = new Map<string, Row[]>();
  for (const r of rows) {
    const key = String(r.service);
    if (!byService.has(key)) byService.set(key, []);
    byService.get(key)!.push(r);
  }

  const rank = (s: string) => {
    const i = ORDER.indexOf(s);
    return i === -1 ? ORDER.length : i;
  };
  const services = [...byService.keys()].sort((a, b) => rank(a) - rank(b));

  if (services.length === 0) {
    return <p className="text-sm text-gray-500">No service data in this period.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {/* One shared header + legend instead of one legend per chart */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-800">
          Service P&amp;L · Monthly
        </h2>
        <div className="flex gap-4 text-xs text-gray-600">
          {LEGEND.map((l) => (
            <span key={l.label} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm" style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        {services.map((service) => (
          <ServiceChart key={service} title={service} rows={byService.get(service)!} />
        ))}
      </div>
    </div>
  );
}

// ---------- One service chart ----------
function ServiceChart({ title, rows }: { title: string; rows: Row[] }) {
  // postgres.js numerics are strings, so convert them.
  const points = rows
    .map((r) => {
      const revenue = Number(r.montly_revenue);
      const profit = Number(r.monthly_profit);
      const labour_cost = Number(r.labour_cost);
      return {
        month: String(r.work_month),
        labour_cost,
        revenue,
        profit,
        margin: revenue ? (100 * profit) / revenue : null,
        loss: labour_cost > revenue,
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month));

  const data = {
    labels: points.map((p) => monthLabel(p.month)),
    datasets: [
      {
        // Taller bar, behind: revenue (green) or, in a loss month, cost (red)
        label: "back",
        data: points.map((p) => Math.max(p.revenue, p.labour_cost)),
        backgroundColor: points.map((p) => (p.loss ? RED : GREEN)),
        barPercentage: 0.8,
        categoryPercentage: 0.9,
        grouped: false,
        order: 1,
      },
      {
        // Shorter bar, in front: cost (blue) or, in a loss month, revenue (green)
        label: "front",
        data: points.map((p) => Math.min(p.revenue, p.labour_cost)),
        backgroundColor: points.map((p) => (p.loss ? GREEN : BLUE)),
        barPercentage: 0.8,
        categoryPercentage: 0.9,
        grouped: false,
        order: 0,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1f2937",
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        filter: (item) => item.datasetIndex === 0, // one entry per month
        callbacks: {
          label: (ctx) => {
            const p = points[ctx.dataIndex];
            return [`Revenue: ${money(p.revenue)}`, `Labour cost: ${money(p.labour_cost)}`];
          },
          footer: (items) => {
            const p = points[items[0].dataIndex];
            return [
              `${p.loss ? "Loss" : "Gross profit"}: ${money(p.profit)}`,
              `Margin: ${p.margin === null ? "—" : p.margin.toFixed(1)}%`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#64748b", maxRotation: 0, autoSkip: true, font: { size: 11 } },
      },
      y: {
        min: 0,
        grid: { color: "#f1f5f9" },
        ticks: {
          color: "#64748b",
          font: { size: 11 },
          maxTicksLimit: 5,
          callback: (v) => `$${Math.round(Number(v) / 1000)}k`,
        },
      },
    },
  };

  return (
    <section className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white p-4">
      <h2
        className="mb-3 truncate text-xs font-semibold uppercase tracking-wide text-gray-800"
        title={title}
      >
        {title}
      </h2>
      <div className="relative h-56">
        <Bar data={data} options={options} />
      </div>
    </section>
  );
}
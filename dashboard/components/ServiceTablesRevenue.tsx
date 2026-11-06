"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { ServicesRevenueBoxes } from "@/lib/queries";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip);

type Props = {
  rows: ServicesRevenueBoxes[];
  months: number; // selected period, shown in each card's pill
};

// Only these four, in this order (Web Development has its own card below)
const SERVICES = ["SEO", "AEO/GEO", "Paid Ads", "CRO"];

// Badge styles copied from TeamMarginCard
const badge = "shrink-0 whitespace-nowrap rounded-[3px] px-2 py-1 text-[0.65rem] leading-tight font-medium";
const green = "bg-[#E3F5D8] text-[#3F7F1F]";
const red = "bg-[#FBE0E0] text-[#C0392B]";
const purple = "bg-[#F3E8FF] text-[#7E22CE]"; // matches the Revenue line

const REVENUE = "#c084fc";
const COST = "#14b8a6";
const TICK = "#94a3b8";

// 116875 -> "$117K", 1200000 -> "$1.2M"
const compact = (v: number) =>
  Math.abs(v) >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${Math.round(v / 1000)}K`;

// "2026-08" -> "Aug 2026"
const monthLabel = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
};

export default function ServiceTablesRevenue({ rows, months }: Props) {
  return (
    <div className="grid shrink-0 grid-cols-4 gap-3">
      {SERVICES.map((service) => (
        <ServiceCard
          key={service}
          title={service}
          months={months}
          rows={rows.filter((r) => r.service === service)}
        />
      ))}
    </div>
  );
}

function ServiceCard({ title, months, rows }: { title: string; months: number; rows: ServicesRevenueBoxes[] }) {
  // postgres.js numerics are strings, so convert; oldest month first
  const points = [...rows]
    .sort((a, b) => a.work_month.localeCompare(b.work_month))
    .map((r) => ({
      month: r.work_month,
      revenue: Number(r.monthly_revenue),
      cost: Number(r.labour_cost),
    }));

  // Total profit over the months shown; badge is red when it's a loss
  const profit = rows.reduce((sum, r) => sum + Number(r.monthly_profit), 0);
  const profitText = `${profit < 0 ? "−" : ""}${compact(Math.abs(profit))} profit`;
  // Total revenue over the same months
  const revenue = points.reduce((sum, p) => sum + p.revenue, 0);

  // Label the first, middle and last month
  const last = points.length - 1;
  const labelled = new Set([0, Math.round(last / 2), last]);
  // A single month can't draw a line, so show it as a dot
  const dot = points.length === 1 ? 4 : 0;

  const line = (label: string, color: string, values: number[]) => ({
    label,
    data: values,
    borderColor: color,
    backgroundColor: color,
    borderWidth: 2,
    tension: 0.3,
    cubicInterpolationMode: "monotone" as const,
    fill: false,
    clip: false as const,
    pointRadius: dot,
    pointHoverRadius: 4,
  });

  const data = {
    labels: points.map((p) => monthLabel(p.month)),
    datasets: [
      line("Revenue", REVENUE, points.map((p) => p.revenue)),
      line("Cost", COST, points.map((p) => p.cost)),
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false }, // HTML legend above the chart
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: $${Math.round(Number(ctx.parsed.y)).toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: TICK,
          font: { size: 11 },
          maxRotation: 0,
          autoSkip: false,
          align: points.length === 1 ? "center" : "inner",
          callback: (_, index) => (labelled.has(index) ? monthLabel(points[index].month) : null),
        },
      },
      y: {
        min: 0,
        grace: "10%",
        border: { display: false, dash: [4, 4] },
        grid: { color: "#e2e8f0", drawTicks: false },
        ticks: {
          color: TICK,
          font: { size: 11 },
          padding: 8,
          maxTicksLimit: 5,
          callback: (v) => compact(Number(v)),
        },
      },
    },
  };

  return (
    <div className="flex min-w-0 flex-col rounded-2xl bg-white p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="text-ink truncate text-lg font-medium" title={title}>{title}</h2>
          {rows.length > 0 && <span className={`${badge} ${profit < 0 ? red : green}`}>{profitText}</span>}
          {rows.length > 0 && <span className={`${badge} ${purple}`}>{compact(revenue)} revenue</span>}
        </div>
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">{months} months</span>
      </div>

      <div className="mb-3 mt-2 flex gap-4 text-sm text-gray-600">
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-full" style={{ background: REVENUE }} />
          Revenue
        </span>
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-full" style={{ background: COST }} />
          Cost
        </span>
      </div>

      <div className="relative h-44">
        {points.length > 0 ? (
          <Line data={data} options={options} />
        ) : (
          <p className="text-sm text-gray-500">No data in this period.</p>
        )}
      </div>
    </div>
  );
}

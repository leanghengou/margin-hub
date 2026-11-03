"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Filler, Tooltip, Legend);

type Row = Record<string, unknown>;


const GREEN = "#1aaf5d";
const GREEN_FILL = "rgba(26, 175, 93, 0.1)";
const GREY = "#94a3b8";
const RED = "#ff5468";
const PEAK = "#1e4d14"; // forest, from the theme

// Swatches match the chart: solid line, dashed line, dot
const LEGEND = [
  { label: "Revenue", className: "h-0.5 w-4", style: { background: GREEN } },
  { label: "Labour cost", className: "w-4 border-t-2 border-dashed", style: { borderColor: GREY } },
  { label: "Loss", className: "size-2 rounded-full", style: { background: RED } },
];


const ORDER = ["SEO", "AEO/GEO", "Paid Ads", "CRO", "Web Development"];

const money = (v: number) =>
  `${v < 0 ? "-" : ""}$${Math.abs(Math.round(v)).toLocaleString()}`;


const monthLabel = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  const mon = new Date(Date.UTC(y, m - 1, 1)).toLocaleString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
  return `${mon} '${String(y).slice(2)}`;
};

// Axis labels: month only ("Jan"); the tooltip keeps the year
const monthName = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleString("en-US", { month: "short", timeZone: "UTC" });
};


export default function ServiceMonthlyCharts({ rows }: { rows: Row[] }) {

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
              <span className={l.className} style={l.style} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      <Swiper slidesPerView={4.5} spaceBetween={12} className="w-full">
        {services.map((service) => (
          <SwiperSlide key={service}>
            <ServiceChart title={service} rows={byService.get(service)!} />
          </SwiperSlide>
        ))}
      </Swiper>
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

  // Best revenue month gets a ring; loss months get a red dot
  const peak = points.reduce((best, p, i) => (p.revenue > points[best].revenue ? i : best), 0);

  // Label the first and last month plus two evenly spaced ones between
  const last = points.length - 1;
  const labelled = new Set([0, Math.round(last / 3), Math.round((2 * last) / 3), last]);

  const data = {
    labels: points.map((p) => monthLabel(p.month)),
    datasets: [
      {
        label: "Revenue",
        data: points.map((p) => p.revenue),
        borderColor: GREEN,
        borderWidth: 2,
        backgroundColor: GREEN_FILL,
        fill: "origin",
        tension: 0.3,
        pointRadius: points.map((p, i) => (i === peak ? 5 : p.loss ? 3 : 0)),
        pointBackgroundColor: points.map((_, i) => (i === peak ? "#fff" : RED)),
        pointBorderColor: points.map((_, i) => (i === peak ? PEAK : RED)),
        pointBorderWidth: points.map((_, i) => (i === peak ? 2 : 0)),
        pointHoverRadius: 5,
      },
      {
        label: "Labour cost",
        data: points.map((p) => p.labour_cost),
        borderColor: GREY,
        borderWidth: 1.5,
        borderDash: [4, 4],
        fill: false,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 3,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
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
        // "inner" keeps the end labels inside the plot, so no extra side padding is reserved
        ticks: {
          color: "#94a3b8",
          font: { size: 12 },
          padding: 8,
          maxRotation: 0,
          autoSkip: false,
          align: "inner",
          callback: (_, index) => (labelled.has(index) ? monthName(points[index].month) : null),
        },
      },
      y: {
        min: 0,
        // Headroom so the line sits below the top edge and the peak ring isn't clipped
        grace: "20%",
        border: { display: false },
        grid: { color: "#f1f5f9", drawTicks: false },
        // Values live in the tooltip, so no y numbers
        ticks: { display: false, maxTicksLimit: 5 },
      },
    },
  };

  return (
    <section className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex min-w-0 items-baseline gap-2">
        <h2
          className="truncate text-xs font-semibold uppercase tracking-wide text-gray-800"
          title={title}
        >
          {title}
        </h2>
        <span className="shrink-0 text-xs text-gray-500">Monthly · revenue vs labour</span>
      </div>
      <div className="relative h-72">
        <Line data={data} options={options} />
      </div>
    </section>
  );
}
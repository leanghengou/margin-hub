"use client";

import { Chart as ChartJS, ArcElement, Tooltip, type ChartOptions, type Plugin } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import type { getRevenueIndustry } from "@/lib/queries";

ChartJS.register(ArcElement, Tooltip);

// Rows straight from the query: one row per industry, all time
type IndustryRow = Awaited<ReturnType<typeof getRevenueIndustry>>[number];

type Props = {
  rows: IndustryRow[];
  industryColors: Record<string, string>; // set in clients/page.tsx
};

const GREY = "#cbd5e1"; // industry with no colour

// 2700000 -> "$2.7M", 276000 -> "$276K"
const compact = (v: number) =>
  Math.abs(v) >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${Math.round(v / 1000)}K`;

// Writes each industry's client count on its segment (skipped when the segment is too thin to fit it)
const clientCountLabels = (counts: number[]): Plugin<"doughnut"> => ({
  id: "clientCountLabels",
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const arcs = chart.getDatasetMeta(0).data;
    ctx.save();
    ctx.font = "600 11px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    arcs.forEach((arc, i) => {
      const { startAngle, endAngle } = arc.getProps(["startAngle", "endAngle"], true);
      if (endAngle - startAngle < 0.3) return;
      const { x, y } = arc.tooltipPosition(true);
      if (x == null || y == null) return;
      ctx.fillText(String(counts[i]), x, y);
    });
    ctx.restore();
  },
});

export default function RevenueByIndustryCard({ rows, industryColors }: Props) {
  // postgres.js numerics are strings, so convert; biggest revenue first
  const industries = rows
    .map((r) => ({
      industry: String(r.industry),
      clients: Number(r.clients),
      revenue: Number(r.revenue),
      profit: Number(r.gross_profit),
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const colorOf = (industry: string) => industryColors[industry] ?? GREY;

  const data = {
    labels: industries.map((i) => i.industry),
    datasets: [
      {
        data: industries.map((i) => i.revenue),
        backgroundColor: industries.map((i) => colorOf(i.industry)),
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "62%",
    plugins: {
      legend: { display: false }, // the list below acts as the legend
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const i = industries[ctx.dataIndex];
            return [`Revenue: ${compact(i.revenue)}`, `Profit: ${compact(i.profit)}`, `Clients: ${i.clients}`];
          },
        },
      },
    },
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1 basis-0 flex-col rounded-2xl bg-white p-5">
      <div className="flex items-center gap-2">
        <h2 className="text-ink text-lg font-medium">Revenue by industry</h2>
        {/* The query has no date filter, so it covers every month */}
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">All time</span>
      </div>

      {/* Doughnut with the industry count in the middle */}
      <div className="relative mt-3 h-44 shrink-0">
        {industries.length > 0 ? (
          <>
            <Doughnut data={data} options={options} plugins={[clientCountLabels(industries.map((i) => i.clients))]} />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-medium text-ink">{industries.length}</span>
              <span className="text-xs text-gray-500">Industries</span>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500">No data.</p>
        )}
      </div>

      {/* List: same order and colours as the chart; scrolls inside the card */}
      <div className="mt-4 grid shrink-0 grid-cols-[1fr_auto_auto] gap-x-4 pb-2 text-xs text-gray-500 shadow-[inset_0_-1px_0_#d1d5db]">
        <span>Industry</span>
        <span className="w-16 text-right">Revenue</span>
        <span className="w-16 text-right">Profit</span>
      </div>
      <div className="relative min-h-0 flex-1">
        <ul className="absolute inset-0 overflow-auto">
          {industries.map((i) => (
            <li
              key={i.industry}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 border-b border-gray-100 py-2 text-sm last:border-b-0"
            >
              <span className="flex min-w-0 items-center gap-2 text-ink">
                <span className="size-3 shrink-0 rounded-full" style={{ background: colorOf(i.industry) }} />
                <span className="truncate">{i.industry}</span>
              </span>
              <span className="w-16 text-right font-medium text-ink">{compact(i.revenue)}</span>
              <span className={`w-16 text-right font-medium ${i.profit < 0 ? "text-red-600" : "text-ink"}`}>
                {compact(i.profit)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import type { getRevenueByTier } from "@/lib/queries";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

// Rows straight from the query: one row per tier, all time
type TierRow = Awaited<ReturnType<typeof getRevenueByTier>>[number];

type Props = {
  rows: TierRow[];
  months: number; // selected period, shown in the pill
  tierColors: Record<string, string>; // set in clients/page.tsx
};

const GREY = "#cbd5e1"; // tier with no colour
const TICK = "#94a3b8";

// 2700000 -> "$2.7M", 276000 -> "$276K"
const compact = (v: number) =>
  Math.abs(v) >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${Math.round(v / 1000)}K`;

export default function RevenueByTierTable({ rows, months, tierColors }: Props) {
  // postgres.js numerics are strings, so convert; Tier 1, 2, 3 in order
  const tiers = rows
    .map((r) => ({
      tier: String(r.tier),
      clients: Number(r.clients),
      revenue: Number(r.revenue),
      profit: Number(r.gross_profit),
    }))
    .sort((a, b) => Number(a.tier) - Number(b.tier));

  const colorOf = (tier: string) => tierColors[tier] ?? GREY;
  const top = Math.max(...tiers.map((t) => t.revenue), 0);

  const data = {
    labels: tiers.map((t) => `Tier ${t.tier}`),
    // Both overlap in the same spot (grouped: false); lower order is drawn on top
    datasets: [
      // Front: cost (revenue − profit) in the solid tier colour, at the bottom
      {
        label: "Cost",
        data: tiers.map((t) => t.revenue - t.profit),
        backgroundColor: tiers.map((t) => colorOf(t.tier)),
        borderRadius: 2,
        barPercentage: 0.5,
        categoryPercentage: 0.9,
        grouped: false,
        order: 0,
      },
      // Behind: revenue in a light shade (~40% opacity), so only the profit part above the cost shows
      {
        label: "Revenue",
        data: tiers.map((t) => t.revenue),
        backgroundColor: tiers.map((t) => `${colorOf(t.tier)}66`),
        borderRadius: 2,
        barPercentage: 0.5,
        categoryPercentage: 0.9,
        grouped: false,
        order: 1,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    // Hovering a bar shows revenue and profit together
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false }, // tier blocks below act as the legend
      tooltip: {
        itemSort: (a, b) => a.datasetIndex - b.datasetIndex, // Profit line first, then Revenue
        callbacks: {
          // The front bar is cost, but the tooltip shows profit (from the data) in its place
          label: (ctx) => {
            const t = tiers[ctx.dataIndex];
            return ctx.dataset.label === "Cost" ? `Profit: ${compact(t.profit)}` : `Revenue: ${compact(t.revenue)}`;
          },
          // Profit swatch uses the light shade, revenue the solid colour
          labelColor: (ctx) => {
            const c = colorOf(tiers[ctx.dataIndex].tier);
            const fill = ctx.dataset.label === "Cost" ? `${c}66` : c;
            return { borderColor: fill, backgroundColor: fill };
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: TICK, font: { size: 11 } },
      },
      y: {
        min: 0,
        max: top || undefined,
        border: { display: false, dash: [4, 4] },
        grid: { color: "#e2e8f0", drawTicks: false },
        // Ticks at 0, half and the top, so the middle line sits in the centre
        ticks: {
          color: TICK,
          font: { size: 11 },
          padding: 8,
          stepSize: top ? top / 2 : undefined,
          callback: (v) => compact(Number(v)),
        },
      },
    },
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1 basis-0 flex-col rounded-2xl bg-white p-5">
      <div className="flex items-center gap-2">
        <h2 className="text-ink text-lg font-medium">Revenue by tier</h2>
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">{months} months</span>
      </div>

      {/* Chart grows to fill the card's spare height (never below 160px) */}
      <div className="relative mt-3 min-h-40 flex-1">
        {tiers.length > 0 ? (
          <Bar data={data} options={options} />
        ) : (
          <p className="text-sm text-gray-500">No data.</p>
        )}
      </div>

      {/* One compact row per tier (tier, clients, revenue, profit), in the same order as the bars; natural height, sits under the chart */}
      <div className="mt-4 shrink-0">
        {tiers.map((t) => (
          <div
            key={t.tier}
            className="grid min-w-0 grid-cols-4 items-center gap-2 border-b border-gray-100 py-2 first:pt-0 last:border-b-0"
          >
            {/* Same label-over-value layout as the stats */}
            <div className="min-w-0">
              <div className="text-xs text-gray-500">Tier</div>
              <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-ink">
                <span className="size-3 shrink-0 rounded-[2px]" style={{ background: colorOf(t.tier) }} />
                <span className="truncate">Tier {t.tier}</span>
              </div>
            </div>
            <Stat label="Clients" value={String(t.clients)} />
            <Stat label="Revenue" value={compact(t.revenue)} />
            <Stat label="Profit" value={compact(t.profit)} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="truncate text-sm font-medium text-ink">{value}</div>
    </div>
  );
}

// components/TeamHoursChart.tsx
'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

type Row = {
  label: string;
  seo: string;
  cro: string;
  paid_ads: string;
  account_mgmt: string;
  website: string;
};

// Row column -> team name; the colour comes from the teamColors prop (set in team/page.tsx)
const teams = [
  { key: 'seo', label: 'SEO', team: 'SEO' },
  { key: 'paid_ads', label: 'Paid ads', team: 'Paid Ads' },
  { key: 'website', label: 'Website', team: 'Website' },
] as const;

const GREY = '#cbd5e1'; // team with no colour

const TICK = '#94a3b8';

// 1234 -> "1.2k h", 800 -> "800 h"
const hours = (v: number) => (Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(1)}k h` : `${Math.round(v)} h`);

type Props = {
  months: number; // selected period, same as the query's window
  rows: Row[];
  teamColors: Record<string, string>; // set in team/page.tsx
};

export default function TeamHoursChart({ months, rows, teamColors }: Props) {
  const colorOf = (team: string) => teamColors[team] ?? GREY;

  // Label 4 months spread across the axis (first, last, 2 between), like the Services charts
  const last = rows.length - 1;
  const labelled = new Set([0, Math.round(last / 3), Math.round((2 * last) / 3), last]);

  const data = {
    labels: rows.map((r) => r.label),
    datasets: teams.map((t) => ({
      label: t.label,
      data: rows.map((r) => Number(r[t.key])), // postgres.js numerics are strings
      borderColor: colorOf(t.team),
      backgroundColor: colorOf(t.team),
      borderWidth: 2,
      tension: 0.3,
      cubicInterpolationMode: 'monotone' as const, // curve never swings below 0 or above a peak
      fill: false,
      clip: false as const, // a line sitting on 0 would otherwise lose half its stroke at the chart edge
      pointRadius: 0,
      pointHoverRadius: 4,
    })),
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false }, // team legend is in the page title row (team/page.tsx)
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${Math.round(Number(ctx.parsed.y)).toLocaleString()} h`,
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
          align: 'inner',
          callback: (_, index) => (labelled.has(index) ? rows[index]?.label : null),
        },
      },
      y: {
        min: 0, // hours can't be negative; grace only adds headroom on top
        grace: '10%',
        border: { display: false, dash: [4, 4] },
        grid: { color: '#e2e8f0', drawTicks: false },
        ticks: {
          color: TICK,
          font: { size: 11 },
          padding: 8,
          maxTicksLimit: 5,
          callback: (v) => hours(Number(v)),
        },
      },
    },
  };

  return (
    <div className="flex w-[35%] min-w-0 flex-col rounded-2xl bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-ink text-lg font-medium">Logged hours by team</h2>
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">{months} months</span>
      </div>

      {/* Chart fills the rest of the card */}
      <div className="relative min-h-0 flex-1">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

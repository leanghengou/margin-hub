// components/TeamHoursChart.tsx
'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type Row = {
  label: string;
  seo: string;
  cro: string;
  paid_ads: string;
  account_mgmt: string;
};

// Canvas can't read Tailwind classes → hex values (swap in your brand-700/500/300)
const teams = [
{ key: 'seo', label: 'SEO', color: '#2f7d1f' },
{ key: 'paid_ads', label: 'Paid Ads', color: '#a8dc84' },
{ key: 'website', label: 'Website', color: '#cbd5e1' },
] as const;

export default function TeamHoursChart({ rows }: { rows:any }) {
  const data = {
    labels: rows.map((r) => r.label),
    datasets: teams.map((t) => ({
      label: t.label,
      data: rows.map((r) => Number(r[t.key])), // postgres.js numerics are strings
      backgroundColor: t.color,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        align: 'start' as const,
        labels: { boxWidth: 12, boxHeight: 12 },
      },
    },
    scales: {
      x: { stacked: true, grid: { display: false } },
      y: {
        stacked: true,
        ticks: {
          callback: (v: string | number) => `${(Number(v) / 1000).toFixed(1)}k h`,
        },
      },
    },
  };

  return (
    <div className="rounded-xl w-[35%] border border-gray-200 bg-white p-5">
<h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-800">
Logged hours by team · Monthly
</h2>
<div className="relative h-64">
<Bar data={data} options={options} />
</div>
</div>
  );
}
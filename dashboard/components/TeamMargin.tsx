// components/TeamMarginChart.tsx
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

type MarginRow = {
  team: string;
  revenue: string;
  labour_cost: string;
  gross_profit: string;
  margin_pct: string;
};

export default function TeamMarginChart({ rows }: { rows: MarginRow[] }) {
  const data = {
    labels: rows.map((r) => r.team),
    datasets: [
      {
        label: 'Revenue',
        data: rows.map((r) => Number(r.revenue)),
        backgroundColor: '#a8dc84',
      },
      {
        label: 'Labour cost',
        data: rows.map((r) => Number(r.labour_cost)),
        backgroundColor: '#cbd5e1',
      },
      {
        label: 'Gross profit',
        data: rows.map((r) => Number(r.gross_profit)),
        backgroundColor: '#2f7d1f',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: { boxWidth: 12, boxHeight: 12 },
      },
      tooltip: {
        callbacks: {
          afterBody: (items: { dataIndex: number }[]) =>
            `Margin: ${Number(rows[items[0].dataIndex].margin_pct)}%`,
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: { callback: (v: string | number) => `$${Number(v) / 1000}k` },
      },
    },
  };

  return (
  <div className="w-[35%] h-full bg-white border border-slate-200 rounded-xl p-5">
    <h5 className="text-[0.7rem] font-medium uppercase tracking-wide mb-3">
      Team margin · revenue vs cost
    </h5>
    <div className="relative h-64">
      <Bar data={data} options={options} />
    </div>
  </div>
);
}
// components/AgencyTrendChart.tsx
"use client";

import { Line } from "react-chartjs-2";
import {
  Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend,
} from "chart.js";
import PeriodSelect from "@/components/PeriodSelect";

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const compactUsd = new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD", notation: "compact",
});

export default function AgencyTrendChart({ rows }: { rows: any[] }) {
  const labels = rows.map((r) =>
    new Date(r.work_month + "-01").toLocaleString("en-US", {
      month: "short", year: "2-digit", timeZone: "UTC",
    })
  );

  return (
    <div className="bg-white w-1/2  border-[#F4F5F5] shadow-[0px_0px_0px_1px_rgba(0,0,0,0.05),inset_0px_0px_0px_1px_rgb(209,213,219)] shadow-sm mx-6 p-6">

      <PeriodSelect/>
      <h5 className="text-ink text-[0.7rem] font-medium uppercase tracking-wide mb-4">
        Revenue vs profit · 24 months
      </h5>
      <div className="relative h-72">
        <Line
          data={{
            labels,
            datasets: [
              {
                label: "Revenue",
                data: rows.map((r) => Number(r.revenue)),
                borderColor: "#2563eb",
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.4,
              },
              {
                label: "Profit",
                data: rows.map((r) => Number(r.profit)),
                borderColor: "#65a30d",
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.4,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: "index", intersect: false },
            plugins: {
              legend: {
                position: "top",
                align: "end",
                labels: { usePointStyle: true, boxWidth: 6, boxHeight: 6, font: { size: 11 } },
              },
              tooltip: {
                callbacks: {
                  label: (ctx) => `${ctx.dataset.label}: ${compactUsd.format(ctx.parsed.y)}`,
                },
              },
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { maxTicksLimit: 8, maxRotation: 0, color: "#9ca3af", font: { size: 11 } },
              },
              y: {
                grid: { color: "#f3f4f6" },
                border: { display: false },
                ticks: {
                  maxTicksLimit: 6,
                  color: "#9ca3af",
                  font: { size: 11 },
                  callback: (v) => compactUsd.format(Number(v)),
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
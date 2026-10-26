// components/AgencyTrendChart.tsx
"use client";
export const dynamic = 'force-dynamic'
import { Line } from "react-chartjs-2";
import {
  Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend,
} from "chart.js";
import PeriodSelect from "@/components/PeriodSelect";

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const compactUsd = new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD", notation: "compact",
});

export default function AgencyTrendChart({ rows, months }: { rows: any[], months:number }) {
  const labels = rows.map((r) =>
    new Date(r.work_month + "-01").toLocaleString("en-US", {
      month: "short", year: "2-digit", timeZone: "UTC",
    })
  );

  return (
    <div className="bg-white w-1/2 flex-1 overflow-hidden bg-white p-5 rounded-lg mx-6 p-6">

      <PeriodSelect/>
      <h5 className="text-ink text-[0.7rem] font-medium uppercase tracking-wide mb-4">
        {`Revenue vs profit · ${ months} months`}
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
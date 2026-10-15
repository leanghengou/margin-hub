"use client";

import { Line } from "react-chartjs-2";
import {
Chart,
LineElement,
PointElement,
LinearScale,
CategoryScale,
Tooltip,
Legend,
} from "chart.js";

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

export default function AgencyTrendChart({ rows }: { rows: any[] }) {
const labels = rows.map((r) =>
new Date(r.work_month + "-01").toLocaleString("en-US", { month: "short", year: "2-digit" })
);

return (
<div className="bg-white border border-gray-200 rounded-lg p-6 mt-10">
<h5 className="text-ink text-[0.7rem] font-medium uppercase tracking-wide mb-4">
Revenue vs profit · 24 months
</h5>
<div style={{ height: 300 }}>
<Line
data={{
labels,
datasets: [
{
label: "Revenue",
data: rows.map((r) => Number(r.revenue)),
borderColor: "#2563eb",
backgroundColor: "#2563eb",
borderWidth: 2,
pointRadius: 0,
tension: 0.4,
},
{
label: "Profit",
data: rows.map((r) => Number(r.profit)),
borderColor: "#65a30d",
backgroundColor: "#65a30d",
borderWidth: 2,
pointRadius: 0,
tension: 0.4,
},
],
}}
options={{
responsive: true,
maintainAspectRatio: false,
layout: { padding: { top: 8, right: 8 } },
plugins: {
legend: {
display: true,
position: "top",
align: "end",
labels: { boxWidth: 8, boxHeight: 8, usePointStyle: true, padding: 16 },
},
tooltip: {
callbacks: {
label: (ctx) => `${ctx.dataset.label}: $${Number(ctx.parsed.y).toLocaleString()}`,
},
},
},
scales: {
x: {
grid: { display: false },
ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 8 },
},
y: {
grid: { color: "#f5f5f5" },
border: { display: false },
ticks: { callback: (v) => `$${Number(v).toLocaleString()}`, maxTicksLimit: 6 },
},
},
}}
/>
</div>
</div>
);
}
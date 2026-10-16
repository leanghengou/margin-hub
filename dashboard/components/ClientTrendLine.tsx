"use client";

import { Line } from "react-chartjs-2";
import {
Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler,
} from "chart.js";

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler);

export default function ClientTrendLine({ values, labels }: { values: number[]; labels: string[] }) {
const positive = values[values.length - 1] >= 0;
return (
<Line
data={{
labels,
datasets: [{
data: values,
borderColor: positive ? "#65a30d" : "#dc2626",
backgroundColor: positive ? "rgba(101,163,13,0.15)" : "rgba(220,38,38,0.15)",
fill: true,
borderWidth: 2.5,
pointRadius: 0,
tension: 0.4,
}],
}}
options={{
responsive: true,
maintainAspectRatio: false,
plugins: {
legend: { display: false },
tooltip: {
callbacks: {
label: (ctx) => `$${Number(ctx.parsed.y).toLocaleString()}`,
title: (items) => items[0].label,
},
},
},
scales: { x: { display: false }, y: { display: false } },
}}
height={15}
/>
);
}
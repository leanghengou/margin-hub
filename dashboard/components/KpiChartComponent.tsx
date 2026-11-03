"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  type ChartOptions,
  type ScriptableContext,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Filler, Tooltip);

// Healthy = margin ≥ 30%, same rule as the client table badge
const TONES = {
  healthy: { top: "rgba(166, 212, 111, 0.6)", bottom: "rgba(166, 212, 111, 0)" },
  unhealthy: { top: "rgba(248, 113, 113, 0.6)", bottom: "rgba(248, 113, 113, 0)" },
};

const compactUsd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

const fullUsd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

type Props = {
  labels: string[];
  values: number[];
  tone: "healthy" | "unhealthy";
  format: "money" | "percent";
};

export default function KpiChartComponent({ labels, values, tone, format }: Props) {
  const colors = TONES[tone];
  const axisLabel = (v: number) => (format === "money" ? compactUsd.format(v) : `${Math.round(v)}%`);
  const tooltipLabel = (v: number) => (format === "money" ? fullUsd.format(v) : `${v.toFixed(1)}%`);

  // Label the first, middle and last month only
  const last = labels.length - 1;
  const labelled = new Set([0, Math.round(last / 2), last]);

  const data = {
    labels,
    datasets: [
      {
        data: values,
        fill: "start",
        // Fades from the tone colour at the top of the chart to transparent at the bottom
        backgroundColor: (ctx: ScriptableContext<"line">) => {
          const { ctx: canvas, chartArea } = ctx.chart;
          if (!chartArea) return colors.bottom;
          const gradient = canvas.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, colors.top);
          gradient.addColorStop(1, colors.bottom);
          return gradient;
        },
        borderWidth: 0,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointHoverBackgroundColor: colors.top,
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
        padding: 8,
        cornerRadius: 6,
        displayColors: false,
        callbacks: { label: (ctx) => tooltipLabel(Number(ctx.parsed.y)) },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: "#94a3b8",
          font: { size: 11 },
          maxRotation: 0,
          autoSkip: false,
          callback: (_, index) => (labelled.has(index) ? labels[index] : null),
        },
      },
      y: {
        grid: { color: "#f1f5f9" },
        border: { display: false },
        ticks: {
          color: "#94a3b8",
          font: { size: 11 },
          maxTicksLimit: 3,
          callback: (v) => axisLabel(Number(v)),
        },
      },
    },
  };

  return <Line data={data} options={options} />;
}

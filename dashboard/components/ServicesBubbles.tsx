'use client';

import type { getServiceMix } from '@/lib/queries';

// Rows straight from the query: one row per service per month
type MixRow = Awaited<ReturnType<typeof getServiceMix>>[number];

type Props = {
  rows: MixRow[];
  months: number; // selected period, shown in the pill
  serviceColors: Record<string, string>; // set in services/page.tsx
};

const GREY = '#cbd5e1'; // service with no colour

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' });

export default function ServiceRanking({ rows, months, serviceColors }: Props) {
  if (!rows?.length) return null;

  const colorOf = (service: string) => serviceColors[service] ?? GREY;

  // Add up each service's months (numerics are strings), biggest revenue first
  const totals = new Map<string, number>();
  for (const r of rows) {
    const service = String(r.service);
    totals.set(service, (totals.get(service) ?? 0) + Number(r.revenue));
  }
  const items = [...totals]
    .map(([service, revenue]) => ({ service, revenue }))
    .sort((a, b) => b.revenue - a.revenue);

  const total = items.reduce((sum, it) => sum + it.revenue, 0);
  const share = (v: number) => (total ? Math.round((v / total) * 100) : 0);

  return (
    <div className="flex min-w-0 flex-1 flex-col rounded-2xl bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-ink text-lg font-medium">Top services</h2>
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">{months} months</span>
      </div>

      {/* Stacked bar: each segment's width is its share of total revenue */}
      <div className="flex h-8 shrink-0 gap-0.5">
        {items.map((it) => (
          <div
            key={it.service}
            className="min-w-0"
            style={{ flex: `${it.revenue} 1 0`, background: colorOf(it.service) }}
            title={`${it.service}: ${money.format(it.revenue)} (${share(it.revenue)}%)`}
          />
        ))}
      </div>

      {/* List in the same order as the bar */}
      <ul className="mt-4 min-h-0 flex-1 overflow-auto">
        {items.map((it) => (
          <li key={it.service} className="flex items-center gap-3 border-b border-gray-100 py-2.5 last:border-b-0">
            <span className="size-3 shrink-0 rounded-full" style={{ background: colorOf(it.service) }} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-ink">{it.service}</div>
              <div className="text-xs text-gray-500">{share(it.revenue)}% of total revenue</div>
            </div>
            <div className="text-lg text-ink tabular-nums">{money.format(it.revenue)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

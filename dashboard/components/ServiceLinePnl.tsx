type Row = Record<string, unknown>;

// Swatch greens, darkest = highest revenue (rows arrive sorted by revenue DESC).
// Hex values so they never depend on which brand shades exist in the theme.
const SWATCH = ["#2f7a1f", "#3f9a2b", "#5cb83f", "#7fcb5c", "#a6dc85"];

// 1350000 -> "$1.35M", 363700 -> "$363.7k"
const compact = (v: number) => {
  const sign = v < 0 ? "-" : "";
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}k`;
  return `${sign}$${Math.round(abs)}`;
};

// 94 -> "$94/h", -12 -> "-$12/h"
const perHour = (v: number) => `${v < 0 ? "-" : ""}$${Math.abs(v)}/h`;

export default function ServiceLinePnl({ rows }: { rows: Row[] }) {
  // postgres.js numerics are strings, so convert them.
  const services = rows.map((r) => ({
    service: String(r.service),
    revenue: Number(r.revenue),
    grossProfit: Number(r.gross_profit),
    margin: r.margin_pct === null ? null : Number(r.margin_pct),
    rate: Number(r.rate_per_hour),
    cost: Number(r.cost_per_hour),
    profitPerHour: Number(r.profit_per_hour),
  }));

  return (
    <section className="w-[45%]  rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-800">
        Service line P&amp;L · 12 mo
      </h2>

      {services.length === 0 ? (
        <p className="text-sm text-gray-500">No service data in this period.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm tabular-nums">
            <thead>
              <tr className="border-b border-gray-300 text-[11px] uppercase tracking-wide text-gray-500">
                <th className="py-2 pr-4 text-left font-medium">Service</th>
                <th className="px-3 py-2 text-right font-medium">Revenue</th>
                <th className="px-3 py-2 text-right font-medium">Gross profit</th>
                <th className="px-3 py-2 text-right font-medium">Margin</th>
                <th className="px-3 py-2 text-right font-medium">Rate</th>
                <th className="px-3 py-2 text-right font-medium">Cost</th>
                <th className="py-2 pl-3 text-right font-medium">Profit/h</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s, i) => {
                const negative = s.grossProfit < 0;
                return (
                  <tr key={s.service} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 pr-4">
                      <span className="flex items-center gap-2 font-semibold text-gray-900">
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ background: SWATCH[i] ?? "#d1d5db" }}
                        />
                        {s.service}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right text-gray-900">{compact(s.revenue)}</td>
                    <td className={`px-3 py-3 text-right ${negative ? "text-red-600" : "text-gray-900"}`}>
                      {compact(s.grossProfit)}
                    </td>
                    <td className={`px-3 py-3 text-right font-semibold ${negative ? "text-red-600" : "text-gray-900"}`}>
                      {s.margin === null ? "—" : `${s.margin.toFixed(1)}%`}
                    </td>
                    <td className="px-3 py-3 text-right text-gray-900">{perHour(s.rate)}</td>
                    <td className="px-3 py-3 text-right text-gray-400">{perHour(s.cost)}</td>
                    <td className={`py-3 pl-3 text-right font-semibold ${s.profitPerHour < 0 ? "text-red-600" : "text-gray-900"}`}>
                      {perHour(s.profitPerHour)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-3 text-xs text-gray-500">
        Last 12 full months. Rate = revenue ÷ logged hours. Profit/h = rate − cost.
      </p>
    </section>
  );
}
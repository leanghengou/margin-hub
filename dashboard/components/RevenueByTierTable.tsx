import { getRevenueByTier } from '@/lib/queries'

const money = (n: number) => '$' + Math.round(n).toLocaleString('en-US')

export default async function RevenueByTierTable() {
  const rows = await getRevenueByTier()
  const best = [...rows].sort((a, b) => b.margin_pct - a.margin_pct)[0]

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-5">
      <div className="flex justify-between">
        <h2 className="text-sm font-semibold uppercase">Revenue by tier · Oct 2025 – Sep 2026</h2>
        <span className="text-xs text-stone-500">12 complete months</span>
      </div>

      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="border-b border-stone-800 text-left text-xs uppercase text-stone-500">
            <th className="pb-2 font-normal">Tier</th>
            <th className="pb-2 text-right font-normal">Clients</th>
            <th className="pb-2 text-right font-normal">Revenue</th>
            <th className="pb-2 text-right font-normal">Gross profit</th>
            <th className="pb-2 pl-6 font-normal" colSpan={2}>Margin %</th>
            <th className="pb-2 text-right font-normal">Rate</th>
          </tr>
        </thead>
        <tbody className="font-mono">
          {rows.map((r) => (
            <tr key={r.tier} className="border-b border-stone-200 last:border-0">
              <td className="py-4 font-sans font-semibold">Tier {r.tier}</td>
              <td className="py-4 text-right">{r.clients}</td>
              <td className="py-4 text-right">{money(r.revenue)}</td>
              <td className="py-4 text-right">{money(r.gross_profit)}</td>
              <td className="py-4 pl-6">
                <div className="h-3.5 w-32 bg-stone-100">
                  <div
                    className="h-full bg-green-700"
                    style={{ width: `${Math.min(Math.max(r.margin_pct, 0), 60) / 60 * 100}%` }}
                  />
                </div>
              </td>
              <td className="py-4 text-right font-semibold">{r.margin_pct.toFixed(1)}%</td>
              <td className="py-4 text-right font-semibold">${r.rate}/h</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-3 text-xs text-stone-500">
        Tier {best.tier} has the highest margin. Bar scale 0–60%. Rate = revenue ÷ logged hours.
      </p>
    </div>
  )
}
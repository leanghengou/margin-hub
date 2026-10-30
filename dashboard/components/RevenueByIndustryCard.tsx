import { getRevenueIndustry } from '@/lib/queries'

const money = (n: any) =>
  Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export default async function RevenueByIndustryCard() {
  const rows = await getRevenueIndustry()
  const best = [...rows].sort((a, b) => b.margin_pct - a.margin_pct)[0]

  return (
    <div className="flex max-h-[calc(100vh-4rem)] flex-col rounded-lg border border-stone-200 bg-white p-5">
      <div className="flex justify-between">
        <h2 className="text-sm font-semibold uppercase">Revenue by industry · Oct 2025 – Sep 2026</h2>
        <span className="text-xs text-stone-500">12 complete months</span>
      </div>

      <div className="mt-4 flex-1 overflow-auto">
        <table className="w-full whitespace-nowrap text-sm">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-stone-800 text-left text-xs uppercase text-stone-500">
              <th className="pb-2 font-normal">Industry</th>
              <th className="pb-2 text-right font-normal">Clients</th>
              <th className="pb-2 text-right font-normal">Revenue</th>
              <th className="pb-2 text-right font-normal">Gross profit</th>
              <th className="pb-2 pl-6 font-normal" colSpan={2}>Margin %</th>
              <th className="pb-2 text-right font-normal">Rate</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const loss = r.margin_pct < 0
              const width = (Math.min(Math.abs(r.margin_pct), 60) / 60) * 100

              return (
                <tr key={r.industry} className="border-b border-stone-200 last:border-0">
                  <td className="py-3 font-semibold">{r.industry}</td>
                  <td className="py-3 text-right">{r.clients}</td>
                  <td className="py-3 text-right">{money(r.revenue)}</td>
                  <td className={`py-3 text-right ${loss ? 'text-red-600' : ''}`}>{money(r.gross_profit)}</td>
                  <td className="py-3 pl-6">
                    <div className="h-3.5 w-32 bg-stone-100">
                      <div
                        className={`h-full ${loss ? 'bg-red-600' : 'bg-green-700'}`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </td>
                  <td className={`py-3 text-right font-semibold ${loss ? 'text-red-600' : ''}`}>
                    {r.margin_pct.toFixed(1)}%
                  </td>
                  <td className="py-3 text-right font-semibold">{r.rate == null ? '—' : `$${r.rate}/h`}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-stone-500">
        {best.industry} has the highest margin. Red bars are losses. Bar scale 0–60%. Rate = revenue ÷ logged hours.
      </p>
    </div>
  )
}
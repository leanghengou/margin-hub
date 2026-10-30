'use client';

const money = { style: "currency", currency: "USD", maximumFractionDigits: 0 } as const;
const dot: Record<string, string> = { SEO: "bg-green-800", CRO: "bg-green-600", "Paid Ads": "bg-lime-400" };

export default function PendingInvoiceTable({ rows }: { rows: any[] }) {
  const total = rows.reduce((sum, r) => sum + Number(r.amount), 0);

  return (
    <section className="flex max-h-[calc(50vh-4rem)] min-w-0 flex-1 flex-col rounded-lg border border-stone-200 bg-white p-5">
      <h2 className="mb-3 font-mono text-sm font-semibold uppercase">Unpaid invoices</h2>

      <div className="flex-1 overflow-auto">
        <table className="w-full whitespace-nowrap text-sm">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-stone-700 text-left text-xs uppercase text-stone-500">
              <th className="px-3 pb-2 font-normal">Client</th>
              <th className="px-3 pb-2 font-normal">Service</th>
              <th className="px-3 pb-2 font-normal">Month</th>
              <th className="px-3 pb-2 text-right font-normal">Amount</th>
              <th className="px-3 pb-2 text-right font-normal">Days overdue</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item, key) => {
              const days = Number(item.days_since_invoice);
              const badge = days >= 60 ? "bg-red-600 text-white" : days >= 30 ? "bg-amber-100" : "";

              return (
                <tr key={key} className="border-b border-stone-100">
                  <td className="px-3 py-2.5 font-medium">{item.client}</td>
                  <td className="px-3 py-2.5 text-stone-600">
                    <span className={`mr-2 inline-block h-2 w-2 rounded-full ${dot[item.service] ?? "bg-stone-400"}`} />
                    {item.service}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-stone-600">
                    {new Date(item.invoice_date).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono">
                    {Number(item.amount).toLocaleString("en-US", money)}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={`rounded px-2 py-0.5 font-mono font-semibold ${badge}`}>{days} d</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-right font-mono font-semibold">{total.toLocaleString("en-US", money)}</p>
    </section>
  );
}
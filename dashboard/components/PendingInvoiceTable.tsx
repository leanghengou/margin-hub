'use client';

import type { getInvoiceTable } from "@/lib/queries";
import Link from "next/link";

// Rows straight from the query: one row per unpaid invoice
type InvoiceRow = Awaited<ReturnType<typeof getInvoiceTable>>[number];

const money = { style: "currency", currency: "USD", maximumFractionDigits: 0 } as const;
const dot: Record<string, string> = { SEO: "bg-green-800", CRO: "bg-green-600", "Paid Ads": "bg-lime-400" };

// Same heading style as the Home client table; line drawn as an inset shadow (a border on a sticky row doesn't paint)
const th = "sticky top-0 z-10 bg-white pb-3 pr-4 text-left font-normal shadow-[inset_0_-1px_0_#d1d5db]";
const td = "py-2.5 pr-4";

export default function PendingInvoiceTable({ rows }: { rows: InvoiceRow[] }) {
  // postgres.js numerics are strings, so convert
  const total = rows.reduce((sum, r) => sum + Number(r.amount), 0);

  return (
    // flex-1: shares the right column's height evenly with the tier + industry row below
    <section className="flex min-h-0 min-w-0 flex-1 flex-col rounded-2xl bg-white p-5">
      <div className="mb-5 flex items-center gap-2">
        <h2 className="text-ink text-lg font-medium">Unpaid invoices</h2>
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">{rows.length} invoices</span>
      </div>

      {/* Table scrolls inside the card */}
      <div className="relative flex-1">
        <div className="absolute inset-0 overflow-auto">
          <table className="w-full whitespace-nowrap text-[0.9rem] text-ink">
            <thead>
              <tr className="text-sm text-gray-500">
                <th className={th}>Invoice</th>
                <th className={th}>Client</th>
                <th className={th}>Service</th>
                <th className={th}>Invoiced</th>
                <th className={`${th} text-right`}>Amount</th>
                <th className={`${th} pr-0 text-right`}>Overdue</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => {
                // Days past the 14-day due date
                const days = Number(item.days_overdue);
                const badge =
                  days >= 60 ? "bg-red-100 text-red-700" : days >= 30 ? "bg-amber-100 text-amber-700" : "text-gray-600";

                return (
                  <tr key={String(item.invoice_id)} className="relative cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                    {/* relative on the row keeps the client link's stretched click area inside this row */}

                    
                    <td className={`${td} text-gray-500`}>#{item.invoice_id}</td>
                    <td className={`${td} max-w-44 truncate`} title={String(item.client_name)}>
                      
                       <Link
                          href={`?client=${item.client_id}`}
                          scroll={false}
                          className="truncate after:absolute after:inset-0"
                        >
                         <span>{item.client_name}</span>
                        </Link>
                     </td>
                    <td className={`${td} text-gray-600`}>
                      <span className={`mr-2 inline-block size-2 rounded-full ${dot[String(item.service_name)] ?? "bg-gray-400"}`} />
                      {item.service_name}
                    </td>
                    {/* Already formatted by SQL, e.g. "Oct 21, 2026" */}
                    <td className={`${td} text-gray-600`}>{item.invoice_label}</td>
                    <td className={`${td} text-right`}>{Number(item.amount).toLocaleString("en-US", money)}</td>
                    <td className="py-2.5 text-right">
                      <span className={`px-2 py-0.5 text-xs font-medium ${badge}`}>{days} d</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
        <span className="text-sm text-gray-500">Total</span>
        <span className="text-ink font-medium">{total.toLocaleString("en-US", money)}</span>
      </div>
    </section>
  );
}

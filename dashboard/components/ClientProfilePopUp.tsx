"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { CA, US } from 'country-flag-icons/react/3x2';

const flags: Record<string, typeof CA> = { Canada: CA, USA: US };


const money = (v: any) => "$" + Math.round(Number(v)).toLocaleString();

export default function ClientProfilePopup({ open, data }: { open: boolean; data?: any[] | null }) {
  
  const router = useRouter();
  const close = () => router.push("?", { scroll: false });

  const rows = data ?? [];
  const info = rows[0];

  // location is "City, ST, Country"; the country picks the flag
  const country: string | undefined = info?.location?.split(", ").at(-1);
  const Flag = country ? flags[country] : undefined;

  // Count from the query; amount adds up the unpaid rows ("No invoice" rows aren't counted)
  const unpaidCount = Number(info?.missing_invoices ?? 0);
  const unpaidAmount = rows.filter((r) => r.is_paid === false).reduce((sum, r) => sum + Number(r.revenue), 0);

  const label = "text-[0.8rem] text-gray-500";
  const pill = "mt-1 inline-block rounded px-1.5 py-0.5 text-xs";
  const grey = "bg-gray-100 text-gray-600";
  const detailTitle = "text-[0.8rem] font-medium text-gray-700";
  const cell = "py-2 pr-4";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />

          <motion.aside
            key="drawer"
            className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-[560px] flex-col bg-white shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
          >
            <button onClick={close} className="absolute right-5 top-5 text-gray-400 hover:text-gray-700">
              ✕
            </button>

            {/* Header */}
            <div className="border-b border-gray-200 p-6 pr-14">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[0.8rem] text-gray-500">
                  {Flag && <Flag title={country} className="h-3 w-auto shrink-0 rounded-[2px]" />}
                  {info?.location}
                </p>
                <h2 className="truncate text-[1.1rem] font-medium text-ink">{info?.client}</h2>
                <p className="truncate text-[0.85rem] text-gray-500">{info?.email}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
              <div>
                <p className={detailTitle}>Industry</p>
                <span className={`${pill} ${grey}`}>{info?.industry}</span>
              </div>
              <div>
                <p className={detailTitle}>Tier</p>
                <span className={`${pill} ${grey}`}>{info?.tier}</span>
              </div>
              <div>
                <p className={detailTitle}>Join</p>
                <span className={`${pill} ${grey}`}>{info?.joined}</span>
              </div>
              <div>
                <p className={detailTitle}>End</p>
                <span className={`${pill} ${info?.ended === "Active" ? "bg-green-100 text-green-700" : grey}`}>
                  {info?.ended}
                </span>
              </div>
              <div>
                <p className={detailTitle}>Unpaid invoices{unpaidCount > 0 && ` (${unpaidCount})`}</p>
                <span className={`${pill} ${unpaidCount > 0 ? "bg-red-100 text-red-700" : grey}`}>
                  {unpaidCount > 0 ? money(unpaidAmount) : "None"}
                </span>
              </div>
              </div>
            </div>

          
            <div className="flex-1 overflow-y-auto p-6">
              <table className="w-full text-[0.8rem] text-ink">
                <thead>
                  <tr className={`border-b border-gray-200 text-left ${label}`}>
                     <th className={`${cell} font-normal`}>Invoice ID</th>
                    <th className={`${cell} font-normal`}>Period</th>
                    <th className={`${cell} font-normal`}>Service</th>
                    <th className={`${cell} font-normal text-right`}>Revenue</th>
                 
                    <th className="py-2 font-normal text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={`${r.month_label}-${r.service}`} className="border-b border-gray-100">
                      <td className={cell}><span className="py-2.5 pr-4 text-gray-500">#{r.invoice_id}</span></td>
                      <td className={cell}>{r.month_label}</td>
                      <td className={cell}>{r.service}</td>
                      <td className={`${cell} text-right`}>{money(r.revenue)}</td>
                     
                      <td className="py-2 text-right">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[0.7rem] font-medium ${
                            r.is_paid == null
                              ? "bg-gray-100 text-gray-500"
                              : r.is_paid
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {r.is_paid == null ? "No invoice" : r.is_paid ? "Paid" : "Unpaid"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
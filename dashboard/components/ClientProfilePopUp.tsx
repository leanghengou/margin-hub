"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";

const money = (v: any) => "$" + Math.round(Number(v)).toLocaleString();

export default function ClientProfilePopup({ open, data }: { open: boolean; data?: any[] | null }) {
  const router = useRouter();
  const close = () => router.push("?", { scroll: false });

  const rows = data ?? [];
  const info = rows[0];

  const label = "text-[0.65rem] text-gray-500";
  const cell = "py-2 pr-4";
console.log( info)
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
            <div className="flex gap-10 border-b border-gray-200 p-6 pr-14">
              <div className="min-w-0 flex-1">
                <p className={label}>{info?.location}</p>
                <h2 className="truncate text-[1.1rem] font-medium text-ink">
                  {info?.client} <span className={label}>· Tier {info?.tier}</span>
                </h2>
                <p className="truncate text-[0.85rem] text-gray-500">{info?.email}</p>
              </div>
              <div>
                <p className={label}>Join</p>
                <p className="text-[0.85rem] text-ink">{info?.joined}</p>
              </div>
              <div>
                <p className={label}>End</p>
                <p className="text-[0.85rem] text-ink">{info?.ended}</p>
              </div>
            </div>

            {/* Monthly history */}
            <div className="flex-1 overflow-y-auto p-6">
              <table className="w-full text-[0.8rem] text-ink">
                <thead>
                  <tr className={`border-b border-gray-200 text-left ${label}`}>
                    <th className={`${cell} font-normal`}>Month</th>
                    <th className={`${cell} font-normal`}>Service</th>
                    <th className={`${cell} font-normal text-right`}>Revenue</th>
                    <th className={`${cell} font-normal text-right`}>Margin</th>
                    <th className="py-2 font-normal text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={`${r.work_month}-${r.service}`} className="border-b border-gray-100">
                      <td className={cell}>{r.work_month}</td>
                      <td className={cell}>{r.service}</td>
                      <td className={`${cell} text-right`}>{money(r.revenue)}</td>
                      <td className={`${cell} text-right ${Number(r.margin_pct) < 0 ? "text-red-600" : ""}`}>
                        {r.margin_pct}%
                      </td>
                      <td className="py-2 text-right">
                        {r.is_paid != null && (
                          <span
                            className={`rounded-md px-2 py-0.5 text-[0.7rem] font-medium ${
                              r.is_paid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}
                          >
                            {r.is_paid ? "Paid" : "Unpaid"}
                          </span>
                        )}
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
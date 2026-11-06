import Link from "next/link";
import type { getClientListTable } from "@/lib/queries";

// Rows straight from the query: one row per client, all time
type ClientRow = Awaited<ReturnType<typeof getClientListTable>>[number];

const money = { style: "currency", currency: "USD", maximumFractionDigits: 0 } as const;

// joined is a Date, ended is a date string or "--" (still active) -> "Oct 2026"
function showDate(value: unknown) {
  if (!(value instanceof Date) && typeof value !== "string") return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}

// Same heading style as the Home client table; line drawn as an inset shadow (a border on a sticky row doesn't paint)
const th = "sticky top-0 z-10 bg-white pb-3 pr-4 text-left font-normal shadow-[inset_0_-1px_0_#d1d5db]";
const td = "py-2.5 pr-4";

type Props = {
  rows: ClientRow[];
  tierColors: Record<string, string>; // set in clients/page.tsx, same map as the Revenue by tier card
};

export default function ClientListTable({ rows, tierColors }: Props) {
  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col rounded-2xl bg-white p-5">
      <div className="mb-5 flex items-center gap-2">
        <h2 className="text-ink text-lg font-medium">Client list</h2>
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">All time</span>
      </div>

      {/* Table scrolls inside the card */}
      <div className="relative flex-1">
        <div className="absolute inset-0 overflow-auto">
          <table className="w-full whitespace-nowrap text-[0.9rem] text-ink">
            <thead>
              <tr className="text-sm text-gray-500">
                <th className={th}>Client</th>
                <th className={th}>Industry</th>
                <th className={th}>Status</th>
                <th className={th}>Joined</th>
                {/* Hidden for now: some end dates are in the future */}
                {/* <th className={th}>Ended</th> */}
                <th className={`${th} text-right`}>Lifetime rev.</th>
                <th className={`${th} text-right`}>Lifetime GP</th>
                <th className={`${th} pr-0 text-right`}>Margin</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => {
                // postgres.js numerics are strings, so convert
                const gp = Number(item.lifetime_gp);
                const margin = Number(item.margin_pct);
                const churned = item.status === "Churned";

                return (
                  <tr
                    key={String(item.client_id)}
                    className="relative cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                  >
                    {/* Name + tier badge. Long names cut off with "…" (full name on hover) but the badge stays.
                        The link stretches over the whole row, so clicking anywhere opens the client pop-up (same as the homepage) */}
                    <td className={td} title={String(item.client)}>
                      <div className="flex max-w-64 items-center gap-2">
                        <Link
                          href={`?client=${item.client_id}`}
                          scroll={false}
                          className="truncate after:absolute after:inset-0"
                        >
                          {item.client}
                        </Link>
                        {/* Tier colour as text on a ~15% tint; grey if the tier has no colour */}
                        <span
                          className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600"
                          style={
                            tierColors[String(item.tier)]
                              ? { color: tierColors[String(item.tier)], background: `${tierColors[String(item.tier)]}26` }
                              : undefined
                          }
                        >
                          T{item.tier}
                        </span>
                      </div>
                    </td>
                    <td className={`${td} text-gray-600`}>{item.industry}</td>
                    <td className={td}>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium ${
                          churned ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className={`${td} text-gray-500`}>{showDate(item.joined)}</td>
                    {/* <td className={`${td} text-gray-500`}>{showDate(item.ended)}</td> */}
                    <td className={`${td} text-right`}>{Number(item.lifetime_revenue).toLocaleString("en-US", money)}</td>
                    <td className={`${td} text-right ${gp < 0 ? "text-red-600" : ""}`}>
                      {gp.toLocaleString("en-US", money)}
                    </td>
                    <td className={`py-2.5 text-right ${margin < 0 ? "text-red-600" : ""}`}>
                      {item.margin_pct == null ? "—" : `${margin.toFixed(1)}%`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

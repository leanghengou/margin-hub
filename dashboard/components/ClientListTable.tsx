const money = { style: "currency", currency: "USD", maximumFractionDigits: 0 } as const;

// Handles both a Date object and text like "Apr 2021"
function showDate(value: any) {
  if (!value || value === "--" || value === "—") return "—";
  if (value instanceof Date) {
    return value.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
  }
  return value;
}

export default function ClientListTable({ rows }: any) {
  return (
    <section className="w-[70%] rounded-lg flex flex-1 flex-row bg-white p-5">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b w-[10%] border-gray-200 text-left text-[11px] uppercase text-stone-500">
            <th className="pb-2">Client</th>
            <th className="pb-2">Tier</th>
            <th className="pb-2">Industry</th>
            <th className="pb-2">Status</th>
            <th className="pb-2">Joined</th>
            <th className="pb-2">Ended</th>
            <th className="pb-2 text-right">Lifetime rev.</th>
            <th className="pb-2 text-right">Lifetime GP</th>
            <th className="pb-2 text-right">Margin</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item: any) => {
            return (
              <tr key={item.client_id ?? item.client} className="border-b border-gray-200">
                <td className="py-2 font-semibold">{item.client}</td>
                <td className="py-2">T{item.tier}</td>
                <td className="py-2 text-stone-600">{item.industry}</td>
                <td className="py-2">
                  <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-800">
                    {item.status}
                  </span>
                </td>
                <td className="py-2 text-stone-500">{showDate(item.joined)}</td>
                <td className="py-2 text-stone-500">{showDate(item.ended)}</td>
                <td className="py-2 text-right">
                  {Number(item.lifetime_revenue).toLocaleString("en-US", money)}
                </td>
                <td className={`py-2 text-right font-semibold ${Number(item.lifetime_gp) < 0 ? "text-red-600" : ""}`}>
                  {Number(item.lifetime_gp).toLocaleString("en-US", money)}
                </td>
                <td className={`py-2 text-right ${Number(item.margin_pct) < 0 ? "text-red-600" : ""}`}>
                  {item.margin_pct ?? "—"}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
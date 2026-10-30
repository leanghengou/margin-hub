const money = { style: "currency", currency: "USD", maximumFractionDigits: 0 } as const;

function showDate(value: any) {
  if (!value || value === "—") return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}

const th = "sticky top-0 bg-white px-3 pb-2 font-medium";
const td = "px-3 py-3";

export default function ClientListTable({ rows }: any) {
  return (
   <section className="flex max-h-[calc(100vh-4rem)] flex-1 flex-col rounded-lg bg-white p-5">
      <div className="flex-1 overflow-auto">
        <table className="w-full whitespace-nowrap text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase text-stone-500">
              <th className={th}>Client</th>
              <th className={th}>Tier</th>
              <th className={th}>Industry</th>
              <th className={th}>Status</th>
              <th className={th}>Joined</th>
              <th className={th}>Ended</th>
              <th className={`${th} text-right`}>Lifetime rev.</th>
              <th className={`${th} text-right`}>Lifetime GP</th>
              <th className={`${th} text-right`}>Margin</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item: any) => {
              const gp = Number(item.lifetime_gp);
              const margin = Number(item.margin_pct);

              return (
                <tr key={item.client_id ?? item.client} className="border-b border-stone-100">
                  <td className={`${td} font-semibold`}>{item.client}</td>
                  <td className={td}>T{item.tier}</td>
                  <td className={`${td} text-stone-600`}>{item.industry}</td>
                  <td className={td}>
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs ${
                        item.status === "Churned" ? "bg-stone-100 text-stone-600" : "bg-green-100 text-green-800"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className={`${td} text-stone-500`}>{showDate(item.joined)}</td>
                  <td className={`${td} text-stone-500`}>{showDate(item.ended)}</td>
                  <td className={`${td} text-right`}>
                    {Number(item.lifetime_revenue).toLocaleString("en-US", money)}
                  </td>
                  <td className={`${td} text-right font-semibold ${gp < 0 ? "text-red-600" : ""}`}>
                    {gp.toLocaleString("en-US", money)}
                  </td>
                  <td className={`${td} text-right ${margin < 0 ? "text-red-600" : ""}`}>
                    {item.margin_pct == null ? "—" : `${margin.toFixed(1)}%`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
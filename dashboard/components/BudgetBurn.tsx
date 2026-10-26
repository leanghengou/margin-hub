type BurnRow = {
  client: string;
  service: string;
  budgeted_hour: string | number;
  hours_spent_by_team: string | number;
};

const FLAG = 80; // % of budget that triggers the warning (plan: flag over 80%)

// Same palette as the service charts
const GREEN = "#1aaf5d";
const YELLOW = "#ffd84d";
const RED = "#ff5468";

export default function BudgetBurn({ budgetBurn }: { budgetBurn: BurnRow[] }) {
  // postgres.js numerics are strings, so convert; then worst burn first
  const rows = budgetBurn
    .map((item) => {
      const budget = Number(item.budgeted_hour);
      const used = Number(item.hours_spent_by_team);
      return {
        client: item.client,
        service: item.service,
        left: budget - used,
        burn: budget ? (used / budget) * 100 : 0,
      };
    })
    .sort((a, b) => b.burn - a.burn);

  const month = new Date().toLocaleString("en-US", { month: "short" });

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-800">
        Budget burn · {month} · {rows.length} clients
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm tabular-nums">
          <thead>
            <tr className="border-b border-gray-300 text-left text-[11px] uppercase tracking-wide text-gray-500">
              <th className="py-2 pr-4 font-medium">Client</th>
              <th className="py-2 pr-4 font-medium">Service</th>
              <th className="py-2 pr-4 text-right font-medium">Left</th>
              <th className="w-2/5 py-2 font-medium">Burn</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const color = r.burn > 100 ? RED : r.burn >= FLAG ? YELLOW : GREEN;
              return (
                <tr key={`${r.client}-${r.service}`} className="border-b border-gray-100 last:border-0">
                  <td className="py-3 pr-4">
                    <div className="w-48 truncate text-gray-900" title={r.client}>
                      {r.client}
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-3 pr-4 text-gray-900">{r.service}</td>
                  <td
                    className={`whitespace-nowrap py-3 pr-4 text-right ${
                      r.left < 0 ? "text-red-600" : "text-gray-900"
                    }`}
                  >
                    {Number(r.left.toFixed(2))} h
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-2 flex-1 rounded-sm bg-gray-100">
                        <div
                          className="h-full rounded-sm"
                          style={{ width: `${Math.min(r.burn, 100)}%`, background: color }}
                        />
                        {/* Flag marker at 80% */}
                        <div className="absolute -inset-y-1 w-px bg-gray-400" style={{ left: `${FLAG}%` }} />
                      </div>
                      <span className="w-10 text-right text-xs text-gray-500">
                        {Math.round(r.burn)}%
                      </span>
                    </div>
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
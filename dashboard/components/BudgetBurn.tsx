type BurnRow = {
  client: string;
  service: string;
  budgeted_hour: string | number;
  hours_spent_by_team: string | number;
};

const FLAG = 80; // % of budget that triggers the warning (plan: flag over 80%)
const SCALE = 200; // the track shows 0–200% of budget, so the budget line sits in the middle

const GREEN = "#6fbf2a";
const YELLOW = "#fbbf24";
const RED = "#ef4444";

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
    <section className="rounded-2xl bg-white p-5 flex flex-col min-h-0 flex-1">
      <div className="mb-5 flex items-center gap-2">
        <h2 className="text-ink text-lg font-medium">Budget burn</h2>
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
          {month} · {rows.length} projects
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        <table className="w-full text-sm tabular-nums">
          <thead className="sticky top-0 z-10 bg-white">
            {/* Line drawn as an inset shadow: a border on a sticky header row doesn't paint */}
            <tr className="text-left text-sm text-gray-500">
              <th className="pb-3 pr-4 font-normal shadow-[inset_0_-1px_0_#d1d5db]">Client</th>
              <th className="pb-3 pr-4 font-normal shadow-[inset_0_-1px_0_#d1d5db]">Service</th>
              <th className="pb-3 pr-4 text-right font-normal shadow-[inset_0_-1px_0_#d1d5db]">Left</th>
              <th className="w-2/5 pb-3 font-normal shadow-[inset_0_-1px_0_#d1d5db]">Burn</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const color = r.burn > 100 ? RED : r.burn >= FLAG ? YELLOW : GREEN;
              return (
                <tr key={`${r.client}-${r.service}`} className="border-b border-gray-100 last:border-0">
                  <td className="py-2.5 pr-4">
                    <div className="w-48 truncate text-gray-900" title={r.client}>
                      {r.client}
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-2.5 pr-4 text-gray-900">{r.service}</td>
                  <td
                    className={`whitespace-nowrap py-2.5 pr-4 text-right ${
                      r.left < 0 ? "text-red-600" : "text-gray-900"
                    }`}
                  >
                    {Number(r.left.toFixed(2))} h
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="relative h-2 flex-1 rounded-[2px] bg-gray-200">
                        <div
                          className="h-full rounded-[2px]"
                          style={{ width: `${(Math.min(r.burn, SCALE) / SCALE) * 100}%`, background: color }}
                        />
                        {/* Budget line (100%) in the middle of the track */}
                        <div className="absolute -inset-y-1 left-1/2 w-px bg-gray-500" />
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
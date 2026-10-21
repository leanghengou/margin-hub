"use client"
import DropdownComponent from "./DropdownComponent";

const teamColors: Record<string, string> = {
  SEO: "bg-brand-700",
  CRO: "bg-brand-500",
  "Paid Ads": "bg-brand-300",
};

export default function TeamEconomics({ teams, months }: { teams: any[], months:number}) {


const formatMoney = (n: number) =>
n.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });






  return (
    <div className="w-full max-w-xl bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
      <h5 className="text-ink text-[0.7rem] font-medium uppercase tracking-wide">
        Team economics · {months} months
      </h5>
      <DropdownComponent /></div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-300 text-xs text-slate-500">
            <th className="py-2 text-left font-normal">Team</th>
            <th className="py-2 text-right font-normal">Rev.</th>
            <th className="py-2 text-right font-normal">Hours</th>
            <th className="py-2 text-right font-normal">Rate</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr key={team.team_id} className="border-b border-slate-100 last:border-0">
              <td className="py-3">
                <span className="flex items-center gap-2">
                  <span className={`size-2.5 ${teamColors[team.team] ?? "bg-slate-300"}`} />
                  {team.team}
                </span>
              </td>
              <td className="py-3 text-right tabular-nums">{formatMoney(Number(team.revenue))}</td>
              <td className="py-3 text-right tabular-nums">{Number(team.hours).toLocaleString()} h</td>
              <td className="py-3 text-right tabular-nums font-semibold">
                {team.rate ? `${formatMoney(Number(team.rate))}/h` : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-3 text-xs text-slate-500">Rate = revenue ÷ logged hours.</p>
    </div>
  );
}
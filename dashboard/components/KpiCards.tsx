import { formatMoney } from "@/lib/queries";

export default async function KpiCards({ kpis, clientStatus }: any) {
  const revenueUp = Number(kpis.revenue_mom) >= 0;
  const profitUp = Number(kpis.profit_mom) >= 0;
  const marginUp = Number(kpis.margin_mom_pts) >= 0;

  const badge = "mt-2 inline-block rounded-[3px] px-2 py-0.5 text-[0.7rem] font-medium";
  const green = "bg-[#E3F5D8] text-[#3F7F1F]";
  const red = "bg-[#FBE0E0] text-[#C0392B]";

  return (
    <section className="flex gap-4 flex-row m-5">
      {/* Revenue */}
      <div className="flex-1 overflow-hidden bg-white p-5 rounded-lg">
        <h5 className="text-ink text-[0.8rem] font-medium">Revenue - {kpis.current_month_label}</h5>
        <h3 className="text-ink text-[2rem] font-medium">{formatMoney(kpis.current_month_revenue)}</h3>
        <span className={`${badge} ${revenueUp ? green : red}`}>
          {revenueUp ? "▲" : "▼"} {Math.abs(Number(kpis.revenue_mom))}% vs {kpis.last_month_label}
        </span>
      </div>

      {/* Gross profit */}
      <div className="flex-1 overflow-hidden bg-white p-5 rounded-lg">
        <h5 className="text-ink text-[0.8rem] font-medium">Gross Profit - {kpis.current_month_label}</h5>
        <h3 className="text-ink text-[2rem] font-medium">{formatMoney(kpis.current_month_profit)}</h3>
        <span className={`${badge} ${profitUp ? green : red}`}>
          {profitUp ? "▲" : "▼"} {Math.abs(Number(kpis.profit_mom))}% vs {kpis.last_month_label}
        </span>
      </div>

      {/* Margin */}
      <div className="flex-1 overflow-hidden bg-white p-5 rounded-lg">
        <h5 className="text-ink text-[0.8rem] font-medium">Margin - {kpis.current_month_label}</h5>
        <h3 className="text-ink text-[2rem] font-medium">{Number(kpis.current_avg_margin).toFixed(1)}%</h3>
        <span className={`${badge} ${marginUp ? green : red}`}>
          {marginUp ? "▲" : "▼"} {Math.abs(Number(kpis.margin_mom_pts))} pts vs {kpis.last_month_label}
        </span>
      </div>

      {/* Clients */}
      <div className="flex-1 overflow-hidden bg-white p-5 rounded-lg">
        <h5 className="text-ink text-[0.8rem] font-medium">Clients</h5>
        <h3 className="text-ink text-[2rem] font-medium">
          {clientStatus.active_clients} <span className="text-[0.7rem]">active</span>
        </h3>
        <p className="text-ink text-[0.7rem] font-medium mt-2">
          {clientStatus.churned_clients} churned ·{" "}
          <span className="text-red-600">{clientStatus.losing_clients} losing money</span>
        </p>
      </div>
    </section>
  );
}
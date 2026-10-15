import { formatMoney } from "@/lib/queries";
export const dynamic = 'force-dynamic'

export default async function KpiCards({ kpis, clientStatus }: any) {
  return(
<div>
    <section className="flex flex-row">
      <div className="flex-1 overflow-hidden  bg-white shadow-md  p-2">
      <h5 className="text-ink text-[0.7rem] font-medium">Revenue - {kpis.month_label}</h5>
      <h3 className="text-ink text-[1.5rem] font-bold">{formatMoney(kpis.month_revenue)}</h3>
      </div>

       <div className="flex-1 overflow-hidden  bg-white shadow-md  p-2">
      <h5 className="text-ink text-[0.7rem] font-medium">Gross Profit - {kpis.month_label}</h5>
      <h3 className="text-ink text-[1.5rem] font-bold">{formatMoney(kpis.month_profit)}</h3>
      </div>

       <div className="flex-1 overflow-hidden  bg-white shadow-md  p-2">
      <h5 className="text-ink text-[0.7rem] font-medium">Margin - {kpis.month_label}</h5>
      <h3 className="text-ink text-[1.5rem] font-bold">{Number(kpis.month_margin).toFixed(2)}%</h3>
      </div>


       <div className="flex-1 overflow-hidden  bg-white shadow-md  p-2">
      <h5 className="text-ink  text-[0.7rem] font-medium">Revenue - 24 Month</h5>
      <h3 className="text-ink text-[1.5rem] font-bold">{formatMoney(kpis.total_revenue)}</h3>
      </div>

       <div className="flex-1 overflow-hidden  bg-white shadow-md  p-2">
      <h5 className="text-ink  text-[0.7rem] font-medium">Gross Profit - 24 Month</h5>
      <h3 className="text-ink text-[1.5rem] font-bold">{formatMoney(kpis.total_profit)}</h3>
      </div>

       <div className="flex-1 overflow-hidden  bg-white shadow-md  p-2">
      <h5 className="text-ink text-[0.7rem] font-medium">Clients</h5>
      <h3 className="text-ink text-[1.5rem] font-bold p-0">{clientStatus.active_clients} <span className="text-[0.7rem]">active</span></h3>
      <p className="text-ink text-[0.7rem] font-medium mt-0">{clientStatus.churned_clients} churned - <span className="text-red">{clientStatus.losing_money} losing money</span></p>
      </div>

   
    </section>

</div>
  )
}
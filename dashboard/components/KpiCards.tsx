import { formatMoney } from "@/lib/queries";
export const dynamic = 'force-dynamic'

export default async function KpiCards({ kpis, clientStatus, months }: any) {
  return(

    <section className="flex flex-row m-5 border-[#F4F5F5] shadow-[0px_0px_0px_1px_rgba(0,0,0,0.05),inset_0px_0px_0px_1px_rgb(209,213,219)]">
      <div className="flex-1 overflow-hidden  bg-white border-r border-gray-200 p-5">
      <h5 className="text-ink text-[0.7rem] font-medium">Revenue - {kpis.month_label}</h5>
      <h3 className="text-ink text-[1.5rem] font-medium">{formatMoney(kpis.month_revenue)}</h3>
      </div>

       <div className="flex-1 overflow-hidden  bg-white  border-r border-gray-200 p-5">
      <h5 className="text-ink text-[0.7rem] font-medium">Gross Profit - {kpis.month_label}</h5>
      <h3 className="text-ink text-[1.5rem] font-medium">{formatMoney(kpis.month_profit)}</h3>
      </div>

       <div className="flex-1 overflow-hidden  bg-white  border-r border-gray-200 p-5">
      <h5 className="text-ink text-[0.7rem] font-medium">Margin - {kpis.month_label}</h5>
      <h3 className="text-ink text-[1.5rem] font-medium">{Number(kpis.month_margin).toFixed(2)}%</h3>
      </div>


       <div className="flex-1 overflow-hidden  bg-white  border-r border-gray-200 p-5">
      <h5 className="text-ink  text-[0.7rem] font-medium">{`Revenue - ${months} Month`}</h5>
      <h3 className="text-ink text-[1.5rem] font-medium">{formatMoney(kpis.total_revenue)}</h3>
      </div>

       <div className="flex-1 overflow-hidden  bg-white  border-r border-gray-200 p-5">
      <h5 className="text-ink  text-[0.7rem] font-medium">{`Gross Profit - ${months} Month`}</h5>
      <h3 className="text-ink text-[1.5rem] font-medium">{formatMoney(kpis.total_profit)}</h3>
      </div>

       <div className="flex-1 overflow-hidden  bg-white  p-5">
      <h5 className="text-ink text-[0.7rem] font-medium">Clients</h5>
      <h3 className="text-ink text-[1.5rem] font-medium p-0">{clientStatus.active_clients} <span className="text-[0.7rem]">active</span></h3>
      <p className="text-ink text-[0.7rem] font-medium mt-0">{clientStatus.churned_clients} churned - <span className="text-red">{clientStatus.losing_money} losing money</span></p>
      </div>

   
    </section>


  )
}
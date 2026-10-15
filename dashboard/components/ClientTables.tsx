import { formatMoney } from "@/lib/queries";
import ClientTrendLine from "./ClientTrendLine";
import AgencyTrendChart from "./AgencyTrendChart";
export const dynamic = 'force-dynamic'

export default async function ClientTables({ BudgetBurn, ClientRowTables, agencyTrend}: any) {

    console.log("ClientRowTable", ClientRowTables)
  return(

<section className="flex flex-row">





<div className="flex-1 overflow-hidden bg-white shadow-md p-2 w-1/2 p-5">
  <h5 className="text-ink text-[0.7rem] font-medium uppercase tracking-wide mb-3 mt-4">
       Client profitibility - 24 months
  </h5>
  <table className="w-full table-fixed text-ink text-[0.9rem]">
    <thead>
      <tr className="text-left text-[0.7rem] text-gray-500 border-b border-gray-300">
        <th className="font-normal py-1">Client</th>
        <th className="font-normal py-1">Revenue</th>
    
        <th className="font-normal">Gross profit</th>
         <th className="font-normal">Margin</th>
        <th className="font-normal">12-mo trend</th>
      </tr>
    </thead>
    <tbody>
      {ClientRowTables.map((item:any) => {
      
        return (
          <tr key={`${item.client}-${item.service}`} className="hover:bg-gray-50 cursor-pointer border-b border-gray-300 last:border-b-0">
            <td className="pr-20 max-w-[160px] py-0.5 font-medium truncate px-1">{item.client}</td>
            <td className="py-0.5 max-w-[50px] font-medium truncate">{formatMoney(item.revenue)}</td>
            <td className={`py-0.5 max-w-[50px] font-medium truncate ${item.gross_profit < 0 ? "text-red-600":""}`}>{formatMoney(item.gross_profit)}</td>
            <td className={`py-0.5 max-w-[50px] font-medium truncate ${item.gross_profit < 0 ? "text-red-600":""}`}>{item.margin_pct}%</td>
            <td className={`py-0.5 w-1/2 pr-10 font-medium truncate ${item.gross_profit < 0 ? "text-red-600":""}`}><ClientTrendLine values={item.monthly_profit} labels={item.monthly_labels}/></td>
           
          </tr>
        );
      })}
    </tbody>
  </table>
</div>


<div className="flex-1 overflow-hidden bg-white shadow-md p-2 w-1/2 p-5">
<AgencyTrendChart rows={agencyTrend}/>
  <h5 className="text-ink text-[0.7rem] font-medium uppercase tracking-wide mb-3 mt-4">
        Budget burn · {new Date().toLocaleString("en-US", { month: "short" })} · {BudgetBurn.length} clients
  </h5>
  <table className="w-full table-fixed text-ink text-[0.9rem]">
    <thead>
      <tr className="text-left text-[0.7rem] text-gray-500 border-b border-gray-300">
        <th className="font-normal py-1">Client</th>
        <th className="font-normal">Service</th>
        <th className="font-normal text-right pr-3">Left</th>
        <th className="font-normal w-1/2">Burn</th>
      </tr>
    </thead>
    <tbody>
      {BudgetBurn.map((item:any) => {
        const left = item.budgeted_hour - item.hours_spent_by_team;
        const burn = (item.hours_spent_by_team / item.budgeted_hour) * 100;
        const color = burn > 100 ? "bg-red-500" : burn >= 80 ? "bg-amber-500" : "bg-lime-500";
        return (
          <tr key={`${item.client}-${item.service}`} className="border-b border-gray-300 last:border-b-0">
            <td className="py-0.5 font-medium truncate">{item.client}</td>
            <td>{item.service}</td>
            <td className={`text-right pr-3 tabular-nums ${left < 0 ? "text-red-600" : ""}`}>{left} h</td>
            <td>
              <div className="relative h-2 bg-gray-100">
                <div className={`h-full ${color}`} style={{ width: `${Math.min(burn, 100)}%` }} />
                <div className="absolute -inset-y-1 left-[80%] w-px bg-gray-400" />
              </div>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>






</div>






</section>
  )
}
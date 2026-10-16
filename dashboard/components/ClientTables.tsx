import Link from "next/link";
import { formatMoney } from "@/lib/queries";
import ClientTrendLine from "./ClientTrendLine";
import AgencyTrendChart from "./AgencyTrendChart";
import ServiceBubble from "./ServicesBubbles";
export const dynamic = 'force-dynamic'

export default async function ClientTables({ BudgetBurn, ClientRowTables, agencyTrend, serviceMix, months}: any) {

const th = "sticky top-0 z-10 bg-white font-normal py-1 text-left shadow-[inset_0_-1px_0_#d1d5db]";
    console.log("ClientRowTable", ClientRowTables)
  return(
<section className="flex flex-1 flex-row m-5">

<div className="w-1/2 bg-white rounded-lg p-5 flex flex-col"> {/* CHANGED: added flex flex-col */}
  <h5 className="text-ink text-[0.7rem] font-medium uppercase tracking-wide mb-3">
    {`Client profitability · ${months} months`}
  </h5>

  {/* CHANGED: one div became two */}
  <div className="relative flex-1 min-h-[400px]">
    <div className="absolute inset-0 overflow-y-auto">
      <table className="w-full text-ink text-[0.9rem]">
        <thead className="sticky top-0 z-10 bg-white"> {/* CHANGED: header stays visible on scroll */}
          <tr className="text-[0.7rem] text-gray-500">
            <th className={th}>Client</th>
            <th className={th}>Revenue</th>
            <th className={th}>Gross profit</th>
            <th className={th}>Margin</th>
            <th className={th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {ClientRowTables.map((item: any) => (
          <tr
            key={item.client_id}
            className="hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 p-5 relative"
          >
            <td className="font-medium  px-1 py-1.5">  
            <Link
            href={`?client=${item.client_id}`}
            scroll={false}
            className="block w-64 truncate font-medium after:absolute after:inset-0"
          >
            <div className="w-55 truncate">{item.client}</div>
            </Link>
            </td>
            <td className=" font-medium truncate">{formatMoney(item.revenue)}</td>
            <td className={` font-medium truncate ${item.gross_profit < 0 ? "text-red-600" : ""}`}>
              {formatMoney(item.gross_profit)}
            </td>
            <td className={` font-medium truncate ${item.gross_profit < 0 ? "text-red-600" : ""}`}>
              {item.margin_pct}%
            </td>
            <td className="">
     

              <span className={`rounded-5 px-2 py-0.5 text-xs font-medium ${
  Number(item.margin_pct) < 0 ? "bg-red-100 text-red-700"
: Number(item.margin_pct) < 30 ? "bg-amber-100 text-amber-700"
: "bg-green-100 text-green-700" }`}>
{Number(item.margin_pct) < 0 ? "Losing" : Number(item.margin_pct) < 30 ? "Watch" : "Healthy"}
</span>
            </td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  </div>
</div>


<div className="flex-1 overflow-hidden w-1/2 ">
<div className="p-5 bg-white flex-1 overflow-hidden bg-white p-5 rounded-lg ml-6">
  <h5 className="text-ink text-[0.7rem] font-medium uppercase tracking-wide mb-3">
        Budget burn · {new Date().toLocaleString("en-US", { month: "short" })} · {BudgetBurn.length} clients
  </h5>
 <table className="w-full table-auto border-collapse text-[0.9rem] text-ink">
  <thead>
    <tr className="border-b border-gray-200 text-left text-[0.7rem] ">
      <th className="font-normal py-2 pr-5">Client</th>
      <th className="font-normal py-2 pr-5">Service</th>
      <th className="font-normal py-2 pr-3 text-right">Left</th>
      <th className="font-normal py-2">Burn</th>
    </tr>
  </thead>
  <tbody>
    {BudgetBurn.map((item: any) => {
      const left = item.budgeted_hour - item.hours_spent_by_team;
      const burn = (item.hours_spent_by_team / item.budgeted_hour) * 100;
      const color = burn > 100 ? "bg-red-500" : burn >= 50 ? "bg-amber-500" : "bg-lime-500";
      return (
        <tr key={`${item.client}-${item.service}`} className="border-b border-gray-100 last:border-b-0">
          <td className="py-2 pr-5 whitespace-nowrap">
        
            {item.client}

          </td>
          <td className="py-2 pr-5 whitespace-nowrap">{item.service}</td>
          <td className={`py-2 pr-3 text-right tabular-nums whitespace-nowrap ${left < 0 ? "text-red-600" : ""}`}>
            {left} h
          </td>
          <td className="py-2 w-full">
            <div className="relative h-2 bg-gray-100">
              <div className={`h-full ${color} rounded-sm`} style={{ width: `${Math.min(burn, 100)}%` }} />
              <div className="absolute -inset-y-1 left-[50%] w-px bg-gray-400" />
            </div>
          </td>
        </tr>
      );
    })}
  </tbody>
</table>
</div>



<div className="flex-1 flex mt-6">
<AgencyTrendChart months={months} rows={agencyTrend}/>
<ServiceBubble rows={serviceMix}/>
</div>





</div>






</section>
  )
}
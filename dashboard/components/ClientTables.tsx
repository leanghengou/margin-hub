import { formatMoney } from "@/lib/queries";
import ClientTrendLine from "./ClientTrendLine";
import AgencyTrendChart from "./AgencyTrendChart";
import ServiceBubble from "./ServicesBubbles";
export const dynamic = 'force-dynamic'

export default async function ClientTables({ BudgetBurn, ClientRowTables, agencyTrend, serviceMix, months}: any) {

const th = "sticky top-0 z-10 bg-white font-normal py-1 text-left shadow-[inset_0_-1px_0_#d1d5db]";
    console.log("ClientRowTable", ClientRowTables)
  return(

<section className="flex flex-row m-5">

<div className="w-1/2 bg-white border-[#F4F5F5] shadow-[0px_0px_0px_1px_rgba(0,0,0,0.05),inset_0px_0px_0px_1px_rgb(209,213,219)] shadow-sm p-5">
  <h5 className="text-ink text-[0.7rem] font-medium uppercase tracking-wide mb-3">
    {`Client profitability · ${months} months`}
  </h5>

  <div className="max-h-[620px] overflow-y-auto">
    <table className="w-full text-ink text-[0.9rem]">
      <thead>
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
            className="hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 p-5"
          >
            <td className="font-medium  px-1 py-1.5"><div className="w-55 truncate">{item.client}</div></td>
            <td className=" font-medium truncate">{formatMoney(item.revenue)}</td>
            <td className={` font-medium truncate ${item.gross_profit < 0 ? "text-red-600" : ""}`}>
              {formatMoney(item.gross_profit)}
            </td>
            <td className={` font-medium truncate ${item.gross_profit < 0 ? "text-red-600" : ""}`}>
              {item.margin_pct}%
            </td>
            <td className="">
              {/* <ClientTrendLine values={item.monthly_profit} labels={item.monthly_labels} /> */}

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


<div className="flex-1 overflow-hidden w-1/2">
<div className="flex-1 flex">
<AgencyTrendChart rows={agencyTrend}/>
<ServiceBubble rows={serviceMix}/>
</div>
<div className="p-5 bg-white  border-[#F4F5F5] shadow-[0px_0px_0px_1px_rgba(0,0,0,0.05),inset_0px_0px_0px_1px_rgb(209,213,219)] shadow-sm mt-6 ml-6">
  <h5 className="text-ink text-[0.7rem] font-medium uppercase tracking-wide mb-3">
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
        const color = burn > 100 ? "bg-red-500" : burn >= 50 ? "bg-amber-500" : "bg-lime-500";
        return (
          <tr key={`${item.client}-${item.service}`} className="border-b border-gray-300 last:border-b-0">
            <td className="font-medium truncate py-1">{item.client}</td>
            <td>{item.service}</td>
            <td className={`text-right pr-3 tabular-nums ${left < 0 ? "text-red-600" : ""}`}>{left} h</td>
            <td>
              <div className="relative h-2 bg-gray-100">
                <div className={`h-full ${color}`} style={{ width: `${Math.min(burn, 100)}%` }} />
                <div className="absolute -inset-y-1 left-[50%] w-px bg-gray-400" />
              </div>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>





</div>






</section>
  )
}
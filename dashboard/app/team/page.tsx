
import { getEmployeeUtilisation, getTeamEconomic, getWorkerUtilisation } from "../../lib/queries";
import TeamEconomics from "@/components/TeamEconomic";
export const dynamic = 'force-dynamic'


export default async function Team({ searchParams }: { searchParams: any }) {
const { months } = await searchParams;
const period = Number(months) || 3;
const [employeeUtilisation, teamEconomic,workerUtilisation] = await Promise.all([getEmployeeUtilisation(), getTeamEconomic( Number(period)), getWorkerUtilisation()]);
  console.log("EmployeeUtilisation", teamEconomic)
  return(
    <div className="p-5">
    <div className="flex">



<div className="w-fit bg-white border border-slate-200 rounded-xl p-5"> 

  <h5 className="text-[0.7rem] font-medium uppercase tracking-wide mb-3">
    Over capacity · last 30 days
  </h5>

  <div className="flex justify-between border-b border-slate-300 pb-2 text-xs text-slate-500">
    <span>Name</span>
    <span>Util.</span>
  </div>

  <ul className="max-h-[380px] overflow-y-auto pr-5">
    {workerUtilisation
      .filter(item => Number(item.worker_utilisation))
      .map(item => {
        return (
          <li key={item.employee_id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
            <div>
              <h3 className="w-[200px] truncate text-[16px] font-medium text-slate-900">{item.employee_name}</h3>
              <p className="text-xs text-slate-500">
                {item.name} · {Number(item.billable_hours).toLocaleString()} h
              </p>
            </div>
            <span className={`text-lg font-semibold ${item.worker_utilisation > 100 ? "text-red-500" : item.worker_utilisation < 60 ? "text-slate-400" : "text-slate-900"} tabular-nums`}>
              {item.worker_utilisation}%
            </span>
          </li>
        )
      })}
  </ul>
</div>







      
      
    <div className="w-fit bg-white border border-slate-200 rounded-xl p-5">
     <div className="flex items-center justify-between gap-6 mb-3">
  <h5 className="text-ink text-[0.7rem] font-medium uppercase tracking-wide">
    Utilisation · billable h ÷ 40 h · {employeeUtilisation.length} staff × {employeeUtilisation[0].weeks.length} wks
  </h5>

  <div className="flex items-center gap-1 text-[0.7rem] text-slate-500">
    <span>≤40%</span>
    <span className="size-3 bg-brand-100"></span>
    <span className="size-3 bg-brand-300"></span>
    <span className="size-3 bg-brand-500"></span>
    <span className="size-3 bg-brand-700"></span>
    <span>100%</span>
    <span className="size-3 bg-red-500 ml-2"></span>
    <span>&gt;100%</span>
  </div>
</div>
<ul className="flex gap-0.5 flex-col">
  <li className="flex gap-0.5">
    <h3 className="w-[200px] shrink-0"></h3>
    <div className="controll-employees-utilisation-table flex-1 min-w-0">
      <ul className="grid grid-cols-40 gap-1">
        {employeeUtilisation[0].months.map((month: string, key: number) => {
          return (
            <li key={key} className="text-[16px] text-slate-500 whitespace-nowrap">
              {month !== employeeUtilisation[0].months[key - 1] ? month : ""}
            </li>
          )
        })}
      </ul>
    </div>
  </li>

  {employeeUtilisation.map(item => {
    return (
   <li key={item.employee_id} className="flex items-center gap-0.5">
        <h3 className="w-[200px] shrink-0 truncate text-[16px] font-medium text-slate-900">{item.employee_name}</h3>

        <ul className="grid grid-cols-40 flex-1 min-w-0 gap-1">
          {item.weeks.map((week: number, key: number) => {
            return (
              <li
                key={key}
                className={`relative group aspect-square w-full cursor-pointer ${
                    Number(week) > 100 ? "bg-red-500"
                  : Number(week) > 80 ? "bg-brand-700"
                  : Number(week) > 60 ? "bg-brand-500"
                  : Number(week) > 40 ? "bg-brand-300"
                  : "bg-yellow-attention-100"
                }`}
              >
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block whitespace-nowrap rounded bg-slate-900/90 px-2 py-1 text-xs text-white">
                  {item.employee_name} - {(Number(week) * 0.4).toFixed(1)} h
                </span>
              </li>
            )
          })}
        </ul>
      </li>
    )
  })}
</ul>
</div>
</div>





{/* ------------------------------------------- */}
<TeamEconomics months={months} teams={teamEconomic}/>

</div>
  )
}
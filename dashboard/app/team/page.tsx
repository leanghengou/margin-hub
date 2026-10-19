
import { getEmployeeUtilisation, getTeamEconomic } from "../../lib/queries";
import TeamEconomics from "@/components/TeamEconomic";
export const dynamic = 'force-dynamic'


export default async function Team({ searchParams }: { searchParams: any }) {
const { months } = await searchParams;
const period = Number(months) || 3;
const [employeeUtilisation, teamEconomic] = await Promise.all([getEmployeeUtilisation(), getTeamEconomic( Number(period))]);
  console.log("EmployeeUtilisation", teamEconomic)
  return(
    <div>
    <div className="w-fit m-5 bg-white border border-slate-200 rounded-xl p-5">
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
<ul className="flex gap-0.5 flex-col ">


  <li className="flex gap-0.5">
    <h3 className="w-[200px]"></h3>
    <div className="controll-employees-utilisation-table">
      <ul className="grid grid-cols-13 gap-0.5">
        {employeeUtilisation[0].months.map((month:string, key:number)=>{
          return(
            <li key={key} className="text-[16px] text-slate-500 whitespace-nowrap">
            {month !== employeeUtilisation[0].months[key - 1] ? month : ""}
        
            </li>
          )
        })}
      </ul>
    </div>
  </li>

  {employeeUtilisation.map(item=>{
    return(
      <li key={item.employee_id} className="flex gap-0.5">
        <h3 className="w-[200px] truncate text-[16px] font-medium text-slate-900">{item.employee_name} </h3>

        <ul className="grid grid-cols-13 gap-0.5">
        {item.weeks.map((week:number, key:number)=>{
          return(
          <li
          key={key}
          className={`relative group aspect-square size-7 cursor-pointer ${
              Number(week) > 100 ? "bg-red-500"
            : Number(week) > 80 ? "bg-brand-700"
            : Number(week) > 60 ? "bg-brand-500"
            : Number(week) > 40 ? "bg-brand-300"
            : "bg-brand-100"
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

<TeamEconomics months={months} teams={teamEconomic}/>

</div>
  )
}
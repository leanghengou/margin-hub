import { getKpis, getClientStatus, getBudgetBurn, getClientTables ,getAgencyTrend, getServiceMix, getClientDetail, getClientRetention} from "../lib/queries";
import KpiCards from "@/components/KpiCards";
import ClientTables from "@/components/ClientTables";
import ClientProfilePopup from "@/components/ClientProfilePopUp";
import PeriodSelect from "@/components/PeriodSelect";
export const dynamic = 'force-dynamic'


export default async function Home({ searchParams }: any) {
  const { months =3, client } = await searchParams;
 const [kpis, clientStatus, BudgetBurn, ClientRowTables, agencyTrend, serviceMix, clientDetail, clientRetention] = await Promise.all([getKpis(Number(months)), getClientStatus(), getBudgetBurn(), getClientTables(Number(months)), getAgencyTrend(Number(months)), getServiceMix(), client ? getClientDetail(Number(client),) : null, getClientRetention()]);

  return(
<div className="flex h-full bg-[#3f3f3f]">

<div className="flex-1 min-w-0 bg-[#F5F6FA] rounded-tl-md h-full flex flex-col gap-5 p-5 overflow-hidden">
  
  <ClientProfilePopup data={clientDetail}  open={Boolean(client)} />
  <KpiCards months={Number(months)} clientRetention={clientRetention}  agencyTrend={agencyTrend} kpis={kpis} clientStatus={clientStatus}  />
  <ClientTables months={Number(months)} budgetBurn={BudgetBurn} ClientRowTables={ClientRowTables} agencyTrend={agencyTrend} serviceMix={serviceMix}  />
  </div>
</div>
  )
}
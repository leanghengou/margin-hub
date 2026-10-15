import { getKpis, getClientStatus, getBudgetBurn, getClientTables ,getAgencyTrend, getServiceMix} from "../lib/queries";
import KpiCards from "@/components/KpiCards";
import ClientTables from "@/components/ClientTables";
export const dynamic = 'force-dynamic'


export default async function Home() {
 const [kpis, clientStatus, BudgetBurn, ClientRowTables, agencyTrend , serviceMix] = await Promise.all([getKpis(), getClientStatus(), getBudgetBurn(), getClientTables(), getAgencyTrend(), getServiceMix()]);
  return(
<div>
  <KpiCards kpis={kpis} clientStatus={clientStatus}  />
  <ClientTables BudgetBurn={BudgetBurn} ClientRowTables={ClientRowTables} agencyTrend={agencyTrend} serviceMix={serviceMix}  />
</div>
  )
}
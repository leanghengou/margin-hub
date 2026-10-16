import { getKpis, getClientStatus, getBudgetBurn, getClientTables ,getAgencyTrend, getServiceMix} from "../lib/queries";
import KpiCards from "@/components/KpiCards";
import ClientTables from "@/components/ClientTables";
export const dynamic = 'force-dynamic'


export default async function Home({ searchParams }: any) {
  const { months =3 } = await searchParams;
 const [kpis, clientStatus, BudgetBurn, ClientRowTables, agencyTrend , serviceMix] = await Promise.all([getKpis(Number(months)), getClientStatus(), getBudgetBurn(), getClientTables(Number(months)), getAgencyTrend(), getServiceMix()]);

  return(
<div>
  <KpiCards months={Number(months)}  kpis={kpis} clientStatus={clientStatus}  />
  <ClientTables months={Number(months)} BudgetBurn={BudgetBurn} ClientRowTables={ClientRowTables} agencyTrend={agencyTrend} serviceMix={serviceMix}  />
</div>
  )
}
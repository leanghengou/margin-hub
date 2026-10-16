import { getKpis, getClientStatus, getBudgetBurn, getClientTables ,getAgencyTrend, getServiceMix, getClientDetail} from "../lib/queries";
import KpiCards from "@/components/KpiCards";
import ClientTables from "@/components/ClientTables";
import ClientProfilePopup from "@/components/ClientProfilePopUp";
export const dynamic = 'force-dynamic'


export default async function Home({ searchParams }: any) {
  const { months =3, client } = await searchParams;
 const [kpis, clientStatus, BudgetBurn, ClientRowTables, agencyTrend, serviceMix, clientDetail] = await Promise.all([getKpis(Number(months)), getClientStatus(), getBudgetBurn(), getClientTables(Number(months)), getAgencyTrend(Number(months)), getServiceMix(), client ? getClientDetail(Number(client)) : null]);

  return(
<div >
  <ClientProfilePopup data={clientDetail}  open={Boolean(client)} />
  <KpiCards months={Number(months)}  kpis={kpis} clientStatus={clientStatus}  />
  <ClientTables months={Number(months)} BudgetBurn={BudgetBurn} ClientRowTables={ClientRowTables} agencyTrend={agencyTrend} serviceMix={serviceMix}  />
</div>
  )
}
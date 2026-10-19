import { getKpis, getClientStatus, getBudgetBurn, getClientTables ,getAgencyTrend, getServiceMix, getClientDetail} from "../lib/queries";
import KpiCards from "@/components/KpiCards";
import ClientTables from "@/components/ClientTables";
import ClientProfilePopup from "@/components/ClientProfilePopUp";
import SideNavigation from "@/components/SideNavigation";
export const dynamic = 'force-dynamic'


export default async function Home({ searchParams }: any) {
  const { months =3, client } = await searchParams;
 const [kpis, clientStatus, BudgetBurn, ClientRowTables, agencyTrend, serviceMix, clientDetail] = await Promise.all([getKpis(Number(months)), getClientStatus(), getBudgetBurn(), getClientTables(Number(months)), getAgencyTrend(Number(months)), getServiceMix(), client ? getClientDetail(Number(client)) : null]);

  return(
<div className="flex h-screen bg-[#3f3f3f]">
  
<div className="flex-1 min-w-0 bg-[#f1f1f1] rounded-tl-md overflow-y-auto">
  <ClientProfilePopup data={clientDetail}  open={Boolean(client)} />
  <KpiCards months={Number(months)}  kpis={kpis} clientStatus={clientStatus}  />
  <ClientTables months={Number(months)} BudgetBurn={BudgetBurn} ClientRowTables={ClientRowTables} agencyTrend={agencyTrend} serviceMix={serviceMix}  />
  </div>
</div>
  )
}
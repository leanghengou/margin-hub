import { getBudgetBurn, getClientTables ,getAgencyTrend, getClientDetail, getClientRetention} from "../lib/queries";
import KpiCards from "@/components/KpiCards";
import ClientTables from "@/components/ClientTables";
import ClientProfilePopup from "@/components/ClientProfilePopUp";
export const dynamic = 'force-dynamic'


export default async function Home({ searchParams }: any) {
  const { months =3, client } = await searchParams;
 const [BudgetBurn, ClientRowTables, agencyTrend, clientDetail, clientRetention] = await Promise.all([getBudgetBurn(), getClientTables(Number(months)), getAgencyTrend(Number(months)), client ? getClientDetail(Number(client),) : null, getClientRetention()]);

  return(
<div className="flex h-full bg-[#3f3f3f]">

<div className="flex-1 min-w-0 bg-[#F5F6FA] rounded-tl-md h-full flex flex-col gap-5 p-5 overflow-hidden">
  
  <ClientProfilePopup data={clientDetail}  open={Boolean(client)} />
  <KpiCards months={Number(months)} clientRetention={clientRetention}  agencyTrend={agencyTrend} />
  <ClientTables months={Number(months)} budgetBurn={BudgetBurn} ClientRowTables={ClientRowTables} />
  </div>
</div>
  )
}
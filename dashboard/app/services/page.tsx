import { getServicesRevenueTable , getBudgetBurn, getServiceMix, getWebsiteProject, getClientDetail} from "@/lib/queries";
import ClientProfilePopup from "@/components/ClientProfilePopUp";
import ServiceWebsiteCard from "@/components/ServiceWebsiteCard";
import ServiceTablesRevenue from "@/components/ServiceTablesRevenue";
import BudgetBurn from "@/components/BudgetBurn";
import ServiceBubble from "../../components/ServicesBubbles";
import PeriodSelect from "@/components/PeriodSelect";

export const dynamic = "force-dynamic";
   
export default async function ServicesPage({searchParams}:any) {
   // ?client=<id> opens the client pop-up (clicked from Budget burn), same as the Clients page
   const { months =3, client } = await searchParams;
  const [servicesRevenueTable, budgetBurn, serviceMix, websiteProjects, clientDetail] = await Promise.all([getServicesRevenueTable(Number(months)), getBudgetBurn(), getServiceMix(Number(months)), getWebsiteProject(), client ? getClientDetail(Number(client)) : null]);

  const serviceColors: Record<string, string> = {
    "SEO": "#c084fc",
    "Paid Ads": "#2563eb",
    "AEO/GEO": "#fb923c",
    "CRO": "#22c55e",
    "Web Development": "#d1d5db",
  };

  return (
    <div className="h-full flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-ink text-2xl font-medium">Services overview</h2>
        <PeriodSelect />
      </div>
      <ClientProfilePopup data={clientDetail} open={Boolean(client)} />
      <ServiceTablesRevenue rows={servicesRevenueTable} months={Number(months)} />
      <div className="grid flex-1 min-h-0 grid-cols-4 gap-3">

   <div className="col-span-1 flex min-h-0 min-w-0">
             <ServiceWebsiteCard rows={websiteProjects}/>
           </div>


          <div className="col-span-1 flex min-h-0 min-w-0">
             <ServiceBubble rows={serviceMix} months={Number(months)} serviceColors={serviceColors}/>
           </div>

        

           <div className="relative col-span-2 min-w-0">
             <div className="absolute inset-0 flex flex-col">
               <BudgetBurn budgetBurn={budgetBurn}/>
             </div>
           </div>

         
       </div>
    </div>
  );
}
import { getAeoServiceMonthly , getServiceLinePnl , getBudgetBurn, getServiceMix} from "@/lib/queries";
import AeoMonthlyChart from "@/components/AeoServiceMonthly";
import ServiceLinePnl from "@/components/ServiceLinePnl";
import BudgetBurn from "@/components/BudgetBurn";
import ServiceBubble from "../../components/ServicesBubbles";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const [aeoServiceMonthly , serviceLinePnl, budgetBurn, serviceMix] = await Promise.all([getAeoServiceMonthly(), getServiceLinePnl(), getBudgetBurn(), getServiceMix()]);

  return (
    <div className="h-full flex flex-col gap-3 p-5">
      <AeoMonthlyChart rows={aeoServiceMonthly} />
      <div className="flex flex-1 min-h-0 gap-3">
           <div className="relative w-[35%] shrink-0">
             <div className="absolute inset-0 flex flex-col">
               <BudgetBurn budgetBurn={budgetBurn}/>
             </div>
           </div>
           <div className="flex w-[25%] shrink-0">
             <ServiceBubble rows={serviceMix}/>
           </div>
           <ServiceLinePnl rows={serviceLinePnl}/>

         
       </div>
    </div>
  );
}
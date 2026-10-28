import { getAeoServiceMonthly , getServiceLinePnl , getBudgetBurn, getServiceMix} from "@/lib/queries";
import AeoMonthlyChart from "@/components/AeoServiceMonthly";
import ServiceLinePnl from "@/components/ServiceLinePnl";
import BudgetBurn from "@/components/BudgetBurn";
import ServiceBubble from "../../components/ServicesBubbles";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const [aeoServiceMonthly , serviceLinePnl, budgetBurn, serviceMix] = await Promise.all([getAeoServiceMonthly(), getServiceLinePnl(), getBudgetBurn(), getServiceMix()]);

  return (
    <div className="flex flex-col gap-3 p-5">
      <AeoMonthlyChart rows={aeoServiceMonthly} />
      <div className="flex gap-3">
           <BudgetBurn budgetBurn={budgetBurn}/>
            <ServiceBubble rows={serviceMix}/>
           <ServiceLinePnl rows={serviceLinePnl}/>

         
       </div>
    </div>
  );
}
import { getAeoServiceMonthly , getServiceLinePnl , getBudgetBurn} from "@/lib/queries";
import AeoMonthlyChart from "@/components/AeoServiceMonthly";
import ServiceLinePnl from "@/components/ServiceLinePnl";
import BudgetBurn from "@/components/BudgetBurn";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const [aeoServiceMonthly , serviceLinePnl, budgetBurn] = await Promise.all([getAeoServiceMonthly(), getServiceLinePnl(), getBudgetBurn()]);

  return (
    <div className="flex flex-col gap-3 p-5">
      <AeoMonthlyChart rows={aeoServiceMonthly} />
      <div className="flex">
       <ServiceLinePnl rows={serviceLinePnl} />
       <BudgetBurn budgetBurn={budgetBurn}/>
       </div>
    </div>
  );
}
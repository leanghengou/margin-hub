import { getClientListTable, getInvoiceTable, getRevenueByTier, getClientDetail, getRevenueIndustry} from "@/lib/queries";
import ClientListTable from "@/components/ClientListTable";
import ClientProfilePopup from "@/components/ClientProfilePopUp";
import PendingInvoiceTable from "@/components/PendingInvoiceTable";
import RevenueByTierTable from "@/components/RevenueByTierTable";
import RevenueByIndustryCard from "@/components/RevenueByIndustryCard";
import PeriodSelect from "@/components/PeriodSelect";

export const dynamic = "force-dynamic";

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ client?: string; months?: string }> }) {
  // ?client=<id> opens the client pop-up; ?months= is the selected period (3, 6, 12 or 24)
  const { client, months = "3" } = await searchParams;
  const [clientListTable, invoiceTable, revenueByTier, clientDetail, revenueByIndustry] = await Promise.all([getClientListTable(), getInvoiceTable(), getRevenueByTier(Number(months)), client ? getClientDetail(Number(client)) : null, getRevenueIndustry()]);

  const tierColors: Record<string, string> = {
    "1": "#2563eb",
    "2": "#c084fc",
    "3": "#fb923c",
  };

  // Industry colours for the Revenue by industry card (keys match the industry names in the database)
  const industryColors: Record<string, string> = {
    "E-commerce": "#c084fc",
    Education: "#2563eb",
    Finance: "#fb923c",
    Healthcare: "#14b8a6",
    SaaS: "#facc15",
    "Real Estate": "#ec4899",
    Hospitality: "#6366f1",
    Manufacturing: "#f59e0b",
    Legal: "#3b82f6",
    Fitness: "#22c55e",
  };

  return (
    <div className="h-full flex flex-col gap-3 p-5">

      <ClientProfilePopup data={clientDetail} open={Boolean(client)} />

      <div className="flex items-center justify-between gap-2">
        <h2 className="text-ink text-2xl font-medium">Clients overview</h2>
        <PeriodSelect />
      </div>

      <div className="flex flex-1 min-h-0 flex-row gap-3">

         <div className="w-[46%] shrink-0 min-w-0 min-h-0 flex flex-col gap-3">
           <div className="flex flex-[1.35] min-h-0 gap-3">
            <RevenueByTierTable rows={revenueByTier} months={Number(months)} tierColors={tierColors}/>
            <RevenueByIndustryCard rows={revenueByIndustry} industryColors={industryColors}/>
          </div>
          <PendingInvoiceTable rows={invoiceTable}/>
         
        </div>

        <ClientListTable rows={clientListTable} tierColors={tierColors}/>
       
      </div>
    </div>
  );
}
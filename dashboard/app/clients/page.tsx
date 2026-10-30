import { getClientListTable, getInvoiceTable, getRevenueByTier} from "@/lib/queries";
import ClientListTable from "@/components/ClientListTable";
import PendingInvoiceTable from "@/components/PendingInvoiceTable";
import RevenueByTierTable from "@/components/RevenueByTierTable";
import RevenueByIndustryCard from "@/components/RevenueByIndustryCard";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const [clientListTable, invoiceTable, revenueByTier] = await Promise.all([getClientListTable(), getInvoiceTable(), getRevenueByTier()]);
  return (
    <div className="flex flex-row gap-3 p-5">
        <ClientListTable rows={clientListTable}/>
    <div className="w-[40%] flex flex-col gap-3">
        <PendingInvoiceTable rows={invoiceTable}/>
        <RevenueByTierTable/>
        <RevenueByIndustryCard/>
    </div>
    </div>
  );
}
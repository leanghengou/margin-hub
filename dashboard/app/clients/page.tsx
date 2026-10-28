import { getClientListTable, getInvoiceTable} from "@/lib/queries";
import ClientListTable from "@/components/ClientListTable";
import PendingInvoiceTable from "@/components/PendingInvoiceTable";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const [clientListTable, invoiceTable] = await Promise.all([getClientListTable(), getInvoiceTable()]);
  return (
    <div className="flex flex-row gap-3 p-5">
        <ClientListTable rows={clientListTable}/>
        <PendingInvoiceTable rows={invoiceTable}/>
    </div>
  );
}
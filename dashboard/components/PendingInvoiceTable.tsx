'use client';

export default function PendingInvoiceTable({ rows }: { rows: any[] }) {

    console.log("pending invoice", rows)
  return (
    <div className="bg-white w-1/2 flex-1 overflow-hidden bg-white p-5 rounded-lg p-6">
          <table className="w-full text-sm">
        <thead>
          <tr className="border-b w-[10%] border-gray-200 text-left text-[11px] uppercase text-stone-500">
            <th className="pb-2">Client</th>
            <th className="pb-2">Service</th>
            <th className="pb-2">Month</th>
            <th className="pb-2">Amount</th>
            <th className="pb-2">Days overdue</th>
        
          </tr>
        </thead>
        <tbody>
          {rows.map((item: any, key) => {
            return (
              <tr key={key} className="border-b border-gray-200">
              <td>{item.client}</td>
              <td>{item.service}</td>
            <td>{item.invoice_date}</td>
            <td>{item.amount}</td>
             <td>{item.days_since_invoice}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
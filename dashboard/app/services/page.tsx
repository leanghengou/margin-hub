import { getAeoServiceMonthly } from "@/lib/queries";
import AeoMonthlyChart from "@/components/AeoServiceMonthly";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const [aeoServiceMonthly] = await Promise.all([getAeoServiceMonthly()]);

  return (
    <div className="flex flex-col gap-3 p-5">
      <AeoMonthlyChart rows={aeoServiceMonthly} />
    </div>
  );
}
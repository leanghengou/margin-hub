import {
  getEmployeeUtilisation,
  getTeamEconomic,
  getWorkerUtilisation,
  getTeamLoggedHour,
  getTeamLoggedMargin,
} from "@/lib/queries";
import TeamHoursChart from "@/components/TeamHoursChart";
import TeamMarginCard from "@/components/TeamMarginCard";
import EmployeesTable from "@/components/EmployeesTable";
import UtilisationHeatmap from "@/components/UtilisationHeatmap";
import PeriodSelect from "@/components/PeriodSelect";

export const dynamic = "force-dynamic";

export default async function Team({ searchParams }: { searchParams: any }) {
  const { months } = await searchParams;
  const period = Number(months) || 3;

  const [employeeUtilisation, teamEconomic, workerUtilisation, teamLoggedHour, teamLoggedMargin] =
    await Promise.all([
      getEmployeeUtilisation(),
      getTeamEconomic(period),
      getWorkerUtilisation(),
      getTeamLoggedHour(period),
      getTeamLoggedMargin(period),
    ]);

  // Team colours for every card on this page (keys match the team names in the database)
  const teamColors: Record<string, string> = {
    SEO: "#c084fc",
    Website: "#22c55e",
    "Paid Ads": "#2563eb",
  };

  // Utilisation % -> pill colour: same tiers as the heatmap, as soft tints like the margin badge
  const utilTone = (util: number) =>
      util > 100 ? "bg-[#FBE0E0] text-[#C0392B]"
    : util > 80 ? "bg-[#D3EDC2] text-[#2F6B17]"
    : util > 60 ? "bg-[#E3F5D8] text-[#3F7F1F]"
    : util > 40 ? "bg-[#F0F9E8] text-[#5A8F3A]"
    : "bg-[#FFF4D1] text-[#9A6B00]";

  return (
    <div className="h-full p-5 flex flex-col gap-3">
      {/* Page title row, same layout as "Overview" on Home: title left, team legend + period right */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-ink text-2xl font-medium">Team overview</h2>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-5 text-sm text-gray-600">
            {Object.entries(teamColors).map(([team, color]) => (
              <span key={team} className="flex items-center gap-2">
                <span className="size-3 rounded-full" style={{ background: color }} />
                {team}
              </span>
            ))}
          </div>
          <PeriodSelect />
        </div>
      </div>

      {/* Row 2: charts; only as tall as its content */}
      <div className="flex min-h-[340px] shrink-0 gap-3">
        <TeamMarginCard months={period} economics={teamEconomic} margin={teamLoggedMargin} teamColors={teamColors} />
        <TeamHoursChart months={period} rows={teamLoggedHour} teamColors={teamColors} />
      </div>
      {/* Row 1: over capacity + heatmap; takes the height Row 2 doesn't need */}
      <div className="flex flex-1 min-h-0 gap-3">
        {/* Height follows the heatmap; the table scrolls inside */}
        <div className="relative w-[30%] shrink-0">
          <div className="absolute inset-0 flex flex-col">
            <EmployeesTable rows={workerUtilisation} teamColors={teamColors} utilTone={utilTone} />
          </div>
        </div>

        <UtilisationHeatmap rows={employeeUtilisation} teamColors={teamColors} />
      </div>

    </div>
  );
}
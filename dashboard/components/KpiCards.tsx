import { formatMoney, getAgencyTrend } from "@/lib/queries";
import PeriodSelect from "./PeriodSelect";
import KpiChartComponent from "./KpiChartComponent";
import KpiClientCard from "./KpiClientCard";

type TrendRow = Awaited<ReturnType<typeof getAgencyTrend>>[number];

const total = (rows: TrendRow[], key: "revenue" | "profit") =>
  rows.reduce((sum, r) => sum + Number(r[key]), 0);

// "2026-05" -> "May"
const monthName = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleString("en-US", { month: "short", timeZone: "UTC" });
};

const badge = "shrink-0 whitespace-nowrap rounded-[3px] px-2 py-1 text-[0.65rem] leading-tight font-medium";
const green = "bg-[#E3F5D8] text-[#3F7F1F]";
const red = "bg-[#FBE0E0] text-[#C0392B]";

// Change vs the previous period; nothing when there is no comparison
function Change({ value, unit, label }: { value: number | null; unit: string; label: string }) {
  if (value === null) return null;
  const up = value >= 0;
  return (
    <span className={`${badge} ${up ? green : red}`}>
      {up ? "▲" : "▼"} {Math.abs(value).toFixed(1)}{unit} vs {label}
    </span>
  );
}

export default async function KpiCards({ agencyTrend, months, clientRetention }: any) {
  // Selected period + the same length before it, from the existing trend query
  const trend = await getAgencyTrend(months * 2);
  const cutoff: string | undefined = agencyTrend[0]?.work_month;
  const current = trend.filter((r) => cutoff !== undefined && r.work_month >= cutoff);
  const previous = trend.filter((r) => cutoff !== undefined && r.work_month < cutoff);

  const revenue = total(current, "revenue");
  const profit = total(current, "profit");
  const margin = revenue ? (100 * profit) / revenue : null;

  const prevRevenue = total(previous, "revenue");
  const prevProfit = total(previous, "profit");
  const prevMargin = prevRevenue ? (100 * prevProfit) / prevRevenue : null;

  // Only compare against a full previous period (no data before the first month)
  const comparable = current.length > 0 && previous.length === current.length;
  const revenueChange = comparable && prevRevenue ? (100 * (revenue - prevRevenue)) / prevRevenue : null;
  const profitChange = comparable && prevProfit ? (100 * (profit - prevProfit)) / Math.abs(prevProfit) : null;
  const marginChange = comparable && margin !== null && prevMargin !== null ? margin - prevMargin : null;

  // Months the badge compares against, e.g. "May–Jul"
  const prevLabel = previous.length
    ? `${monthName(String(previous[0].work_month))}–${monthName(String(previous[previous.length - 1].work_month))}`
    : "";

  // Chart colour follows margin health, same 30% rule as the client table
  const tone = margin !== null && margin >= 30 ? "healthy" : "unhealthy";
  const labels = current.map((r) => monthName(String(r.work_month)));
  const chart = "relative mt-3 h-32";
  const top = "flex items-start justify-between gap-2";

  return (
    <div className="flex flex-col gap-3 shrink-0">
    <div className="flex items-center justify-between gap-2">
      <h2 className="text-ink text-2xl font-medium">Overview</h2>
      <PeriodSelect/>
    </div>
    <section className="flex gap-4 flex-row">
      {/* Revenue */}
      <div className="flex-1 overflow-hidden bg-white p-5 rounded-lg">
        <div className={top}>
          <div>
            <h5 className="text-ink text-[0.8rem] font-medium">Revenue · {months} months</h5>
            <h3 className="text-ink text-[2rem] font-medium">{formatMoney(revenue)}</h3>
          </div>
          <Change value={revenueChange} unit="%" label={prevLabel} />
        </div>
        <div className={chart}>
          <KpiChartComponent labels={labels} values={current.map((r) => Number(r.revenue))} tone={tone} format="money" />
        </div>
      </div>

      {/* Gross profit */}
      <div className="flex-1 overflow-hidden bg-white p-5 rounded-lg">
        <div className={top}>
          <div>
            <h5 className="text-ink text-[0.8rem] font-medium">Gross Profit · {months} months</h5>
            <h3 className="text-ink text-[2rem] font-medium">{formatMoney(profit)}</h3>
          </div>
          <Change value={profitChange} unit="%" label={prevLabel} />
        </div>
        <div className={chart}>
          <KpiChartComponent labels={labels} values={current.map((r) => Number(r.profit))} tone={tone} format="money" />
        </div>
      </div>

      {/* Margin */}
      <div className="flex-1 overflow-hidden bg-white p-5 rounded-lg">
        <div className={top}>
          <div>
            <h5 className="text-ink text-[0.8rem] font-medium">Margin · {months} months</h5>
            <h3 className="text-ink text-[2rem] font-medium">{margin === null ? "—" : `${margin.toFixed(1)}%`}</h3>
          </div>
          <Change value={marginChange} unit=" pts" label={prevLabel} />
        </div>
        <div className={chart}>
          <KpiChartComponent labels={labels} values={current.map((r) => Number(r.margin))} tone={tone} format="percent" />
        </div>
      </div>

      {/* Clients */}
      <KpiClientCard
        total={Number(clientRetention.total)}
        active={Number(clientRetention.active)}
        churned={Number(clientRetention.churned)}
      />
    </section>
    </div>
  );
}
// Same badge styles as KpiCards (copied: importing them would be circular)
const badge = "shrink-0 whitespace-nowrap rounded-[3px] px-2 py-1 text-[0.65rem] leading-tight font-medium";
const green = "bg-[#E3F5D8] text-[#3F7F1F]";
const red = "bg-[#FBE0E0] text-[#C0392B]";

const ACTIVE = "#6fbf2a";
const CHURNED = "#f87171";

// Thin vertical stripes, like a tick-mark bar
const stripes = (color: string) => `repeating-linear-gradient(90deg, ${color} 0 2px, transparent 2px 4px)`;

type Props = { total: number; active: number; churned: number };

export default function KpiClientCard({ total, active, churned }: Props) {
  const share = (n: number) => (total ? Math.round((100 * n) / total) : 0);
  const retained = share(active);

  return (
    <div className="flex-1 overflow-hidden bg-white p-5 rounded-2xl">
      {/* All clients ever, not the selected period */}
      <h5 className="text-ink text-[0.8rem] font-medium">Clients · Active</h5>
      <div className="flex items-center gap-2">
        <h3 className="text-ink text-[2rem] font-medium">{active}</h3>
        <span className={`${badge} bg-gray-100 text-gray-600`}>{retained}% retained</span>
      </div>

      {/* Segment widths follow each group's share of all clients */}
      <div className="mt-4 flex h-1.5 gap-1">
        <div style={{ flex: `${active} 1 0`, background: stripes(ACTIVE) }} />
        <div style={{ flex: `${churned} 1 0`, background: stripes(CHURNED) }} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Segment label="All time" value={total} share={share(active)} color={ACTIVE} tone={green} />
        <Segment label="Churned" value={churned} share={share(churned)} color={CHURNED} tone={red} />
      </div>
    </div>
  );
}

function Segment({ label, value, share, color, tone }: {
  label: string;
  value: number;
  share: number;
  color: string;
  tone: string;
}) {
  return (
    <div className="rounded-lg border border-gray-100 p-3">
      <p className="flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-wide text-gray-500">
        <span className="size-1.5 rounded-full" style={{ background: color }} />
        {label}
      </p>
      <div className="mt-1 flex items-center gap-2">
        <span className="text-ink text-xl font-medium">{value}</span>
        <span className={`${badge} ${tone}`}>{share}%</span>
      </div>
    </div>
  );
}

const ACTIVE = "#6fbf2a";
const CHURNED = "#f87171";
const TOTAL = "#9ca3af"; // grey: all clients, not one part of the bar

// Thin vertical stripes, like a tick-mark bar
const stripes = (color: string) => `repeating-linear-gradient(90deg, ${color} 0 2px, transparent 2px 4px)`;

type Props = { total: number; active: number; churned: number };

export default function KpiClientCard({ total, active, churned }: Props) {
  return (
    <div className="flex-1 overflow-hidden bg-white p-5 rounded-2xl">
      {/* Clients active right now */}
      <h5 className="text-ink text-[0.8rem] font-medium">Clients · Active</h5>
      <h3 className="text-ink text-[2rem] font-medium">{active}</h3>

      {/* Segment widths follow each group's share of all clients */}
      <div className="mt-4 flex h-1.5 gap-1">
        <div style={{ flex: `${active} 1 0`, background: stripes(ACTIVE) }} />
        <div style={{ flex: `${churned} 1 0`, background: stripes(CHURNED) }} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Segment label="All time" value={total} color={TOTAL} />
        <Segment label="Churned" value={churned} color={CHURNED} />
      </div>
    </div>
  );
}

function Segment({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border border-gray-100 p-3">
      <p className="flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-wide text-gray-500">
        <span className="size-1.5 rounded-full" style={{ background: color }} />
        {label}
      </p>
      <span className="text-ink mt-1 block text-xl font-medium">{value}</span>
    </div>
  );
}

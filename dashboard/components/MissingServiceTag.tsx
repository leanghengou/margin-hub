// A service with no revenue in the selected period: muted row with the reason
type Props = {
  service: string;
  reason: string;
};

export default function MissingServiceTag({ service, reason }: Props) {
  return (
    <li className="flex items-center gap-3 border-b border-gray-100 py-2.5 last:border-b-0">
      {/* Outlined dot: the service exists but isn't in the bar */}
      <span className="size-3 shrink-0 rounded-full border-2 border-gray-300" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-gray-500">{service}</span>
          <span className="shrink-0 whitespace-nowrap rounded-[3px] bg-gray-100 px-2 py-1 text-[0.65rem] leading-tight font-medium text-gray-600">
            No revenue
          </span>
        </div>
        <div className="text-xs text-gray-400">{reason}</div>
      </div>
    </li>
  );
}

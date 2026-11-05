"use client";
import { useRouter, useSearchParams } from "next/navigation";

const options = [
  { value: "3", label: "3 mo", fullLabel: "Last 3 months" },
  { value: "6", label: "6 mo", fullLabel: "Last 6 months" },
  { value: "12", label: "12 mo", fullLabel: "Last 12 months" },
  { value: "24", label: "All time", fullLabel: "All time" },
];

export default function PeriodSelect() {
  const router = useRouter();
  const months = useSearchParams().get("months") ?? "3";

  return (
    // Toggle style: grey track, the active option is a white box
    <div className="inline-flex items-center gap-0.5 rounded-lg bg-gray-200 p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={months === option.value}
          aria-label={option.fullLabel}
          title={option.fullLabel}
          onClick={() => router.push(`?months=${option.value}`)}
          className={`cursor-pointer rounded-md px-3 py-1 text-xs font-medium transition-colors ${
            months === option.value
              ? "bg-white text-ink shadow-sm"
              : "text-gray-500 hover:text-ink"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

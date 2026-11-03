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
    <div className="inline-flex items-center gap-0.5 rounded-lg bg-white p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={months === option.value}
          aria-label={option.fullLabel}
          title={option.fullLabel}
          onClick={() => router.push(`?months=${option.value}`)}
          className={`cursor-pointer rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
            months === option.value
              ? "bg-black text-white"
              : "text-ink hover:bg-gray-100"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

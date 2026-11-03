"use client";
import { useRouter, useSearchParams } from "next/navigation";

const options = [
  { value: "3", label: "3 months" },
  { value: "6", label: "6 months" },
  { value: "12", label: "12 months" },
  { value: "24", label: "All time" },
];

export default function PeriodSelect() {
  const router = useRouter();
  const months = useSearchParams().get("months") ?? "3";

  return (
    <div className="inline-flex rounded-md border border-line bg-surface p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={months === option.value}
          onClick={() => router.push(`?months=${option.value}`)}
          className={`cursor-pointer rounded px-3 py-1.5 text-sm font-medium transition-colors ${
            months === option.value
              ? "bg-leaf text-white"
              : "text-muted hover:text-ink"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

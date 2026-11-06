"use client";
import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  year: number; // selected year, set in team/page.tsx
  years: number[]; // buttons to show, e.g. [2025, 2026]
};

// Same toggle style as PeriodSelect; sets ?year= and keeps the other URL params (e.g. ?months=)
export default function YearSelect({ year, years }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pick = (value: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", String(value));
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg bg-gray-200 p-0.5">
      {years.map((value) => (
        <button
          key={value}
          type="button"
          aria-pressed={year === value}
          onClick={() => pick(value)}
          className={`cursor-pointer rounded-md px-3 py-1 text-xs font-medium transition-colors ${
            year === value ? "bg-white text-ink shadow-sm" : "text-gray-500 hover:text-ink"
          }`}
        >
          {value}
        </button>
      ))}
    </div>
  );
}

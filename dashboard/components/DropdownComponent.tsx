"use client";
import { useRouter, useSearchParams } from "next/navigation";

export default function DropdownComponent() {

  const router = useRouter();
 const months = useSearchParams().get("months") ?? "3";

  return (
    <select
  value={months}
  onChange={(e) => router.push(`?months=${e.target.value}`)}
  className="text-ink rounded-md border font-medium border-gray-200 bg-white px-3 py-1.5 text-sm"
>
  <option value="3">Last 3 months</option>
  <option value="6">Last 6 months</option>
  <option value="12">Last 12 months</option>
  <option value="24">All time</option>
</select>
  );
}
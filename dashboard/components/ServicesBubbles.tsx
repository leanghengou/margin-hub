// components/ServiceRanking.tsx
const money = new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD", notation: "compact",
});

// Drop icon files in /public/icons and fill these in, e.g. "/icons/seo.png".
// Leave a value blank to show the first letter instead.
const icons: Record<string, string> = {
  SEO: "",
  "Paid Ads": "",
  "AEO/GEO": "",
  CRO: "",
  "Web Development": "",
};

const medals = [
  "bg-[#f5c518] text-[#7a5f00]", // gold
  "bg-[#cfd6de] text-[#4b5563]", // silver
  "bg-[#e3a376] text-[#6b3a18]", // bronze
];

export default function ServiceRanking({ rows }: { rows: any[] }) {
  if (!rows?.length) return null;
const total = rows.reduce((sum, r) => sum + Number(r.revenue), 0);
  return (
    <div className="bg-white w-1/2  border-[#F4F5F5] shadow-[0px_0px_0px_1px_rgba(0,0,0,0.05),inset_0px_0px_0px_1px_rgb(209,213,219)] shadow-sm p-6">
      <h5 className="text-ink text-[0.7rem] font-medium uppercase tracking-wide mb-3">
        Top services · Jan – {rows[0].selected_month} {rows[0].selected_year}
      </h5>

      <ul>
        {rows.map((r, i) => {
          const revenue = Number(r.revenue);
          const margin = (Number(r.profit) / revenue) * 100;
          const icon = icons[r.service];

          return (
            <li
              key={r.service}
              className="flex items-center gap-4 py-2.5 border-b border-gray-100 last:border-b-0"
            >
              {/* rank */}
              <div className="w-8 flex justify-center">
                {i < 3 ? (
                  <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${medals[i]}`}>
                    {i + 1}
                  </span>
                ) : (
                  <span className="text-sm font-bold text-gray-700">{i + 1}</span>
                )}
              </div>


              {/* name + margin */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-ink truncate">{r.service}</div>
                <div className="text-xs font-semibold text-ink">
                  {Math.round((revenue / total) * 100)}% of total revenue
                </div>
              </div>

              {/* revenue */}
              <div className="text-sm text-gray-500 tabular-nums">{money.format(revenue)}</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
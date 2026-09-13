import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";
import { POPULAR_SERVICES } from "@/lib/services-catalog";

export default function ServicesPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = (searchParams.q ?? "").toLowerCase().trim();
  const filtered = query
    ? POPULAR_SERVICES.filter((s) => s.label.toLowerCase().includes(query))
    : POPULAR_SERVICES;

  return (
    <div>
      <form className="relative mb-4">
        <Search
          size={18}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          name="q"
          defaultValue={searchParams.q ?? ""}
          placeholder="Search a service"
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
        />
      </form>

      <p className="mb-2 px-1 text-sm font-medium text-slate-500">
        {query ? `Results for "${searchParams.q}"` : "Popular services"}
      </p>

      {filtered.length === 0 ? (
        <p className="px-1 text-sm text-slate-400">No matches.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {filtered.map((item, i) => (
            <Link
              key={item.product}
              href={`/dashboard/services/${item.product}`}
              className={`flex items-center gap-3 px-4 py-3 active:bg-slate-50 ${
                i !== 0 ? "border-t border-slate-100" : ""
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base font-semibold text-white ${item.colorClass}`}
              >
                {item.label.charAt(0)}
              </div>
              <p className="flex-1 text-sm font-medium text-slate-900">
                {item.label}
              </p>
              <ChevronRight size={16} className="text-slate-300" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

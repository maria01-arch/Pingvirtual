import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";
import { MOCK_SERVICES } from "@/lib/mock-services";

export default function ServicesPage() {
  return (
    <div>
      <div className="relative mb-4">
        <Search
          size={18}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Search a service or country"
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
        />
      </div>

      <p className="mb-2 px-1 text-sm font-medium text-slate-500">
        Popular right now
      </p>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {MOCK_SERVICES.map((item, i) => (
          <Link
            key={item.slug}
            href={`/dashboard/services/${item.slug}`}
            className={`flex items-center gap-3 px-4 py-3 active:bg-slate-50 ${
              i !== 0 ? "border-t border-slate-100" : ""
            }`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base font-semibold text-white ${item.colorClass}`}
            >
              {item.service.charAt(0)}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">
                {item.service}{" "}
                <span className="font-normal text-slate-500">
                  {item.flag} {item.country}
                </span>
              </p>
              <p className="text-xs text-slate-400">
                {item.available.toLocaleString()} numbers available
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <span className="text-sm font-semibold text-slate-900">
                ${(item.priceCents / 100).toFixed(2)}
              </span>
              <ChevronRight size={16} className="text-slate-300" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

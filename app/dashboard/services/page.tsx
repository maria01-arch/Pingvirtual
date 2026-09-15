import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";
import { getServicesList } from "@/lib/providers/herosms";
import { POPULAR_LABELS, colorForLabel } from "@/lib/services-catalog";

const SEARCH_RESULT_LIMIT = 60;

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = (searchParams.q ?? "").toLowerCase().trim();
  const allServices = await getServicesList();

  let list;
  let heading;

  if (query) {
    list = allServices
      .filter((s) => s.name.toLowerCase().includes(query))
      .slice(0, SEARCH_RESULT_LIMIT);
    heading = `Results for "${searchParams.q}"`;
  } else {
    // Popular shortlist first, in our curated order, matched against
    // whatever HeroSMS actually has live right now.
    list = POPULAR_LABELS.map((label) =>
      allServices.find((s) => s.name.toLowerCase() === label.toLowerCase())
    ).filter((s): s is NonNullable<typeof s> => Boolean(s));
    heading = "Popular services";
  }

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
          placeholder={`Search ${allServices.length || "700+"} services`}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
        />
      </form>

      <p className="mb-2 px-1 text-sm font-medium text-slate-500">{heading}</p>

      {allServices.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          Couldn't load the service catalog right now. Try again shortly.
        </p>
      ) : list.length === 0 ? (
        <p className="px-1 text-sm text-slate-400">No matches.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {list.map((item, i) => (
            <Link
              key={item.code}
              href={`/dashboard/services/${item.code}`}
              className={`flex items-center gap-3 px-4 py-3 active:bg-slate-50 ${
                i !== 0 ? "border-t border-slate-100" : ""
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base font-semibold text-white ${colorForLabel(item.name)}`}
              >
                {item.name.charAt(0).toUpperCase()}
              </div>
              <p className="flex-1 text-sm font-medium text-slate-900">
                {item.name}
              </p>
              <ChevronRight size={16} className="text-slate-300" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

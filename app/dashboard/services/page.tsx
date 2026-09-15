import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";
import { getServicesList } from "@/lib/providers/herosms";
import { colorForLabel } from "@/lib/services-catalog";
import { CATEGORIES, categoryForName } from "@/lib/categories";

const SEARCH_RESULT_LIMIT = 60;
const SHELF_LIMIT = 8;
const CATEGORY_FULL_LIMIT = 100;

function ServiceRow({ code, name }: { code: string; name: string }) {
  return (
    <Link
      href={`/dashboard/services/${code}`}
      className="flex items-center gap-3 px-4 py-3 transition active:bg-slate-50"
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-base font-semibold text-white shadow-sm ${colorForLabel(name)}`}
      >
        {name.charAt(0).toUpperCase()}
      </div>
      <p className="flex-1 truncate text-[15px] font-medium text-slate-900">
        {name}
      </p>
      <ChevronRight size={16} className="text-slate-300" />
    </Link>
  );
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string };
}) {
  const query = (searchParams.q ?? "").toLowerCase().trim();
  const activeCategory = searchParams.category ?? null;

  let allServices: Awaited<ReturnType<typeof getServicesList>> = [];
  let loadError: string | null = null;
  try {
    allServices = await getServicesList();
  } catch (err: any) {
    loadError = err.message ?? "Could not load services.";
  }

  const searchBar = (
    <form className="relative mb-5">
      <Search
        size={18}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        type="text"
        name="q"
        defaultValue={searchParams.q ?? ""}
        placeholder={`Search ${allServices.length || "700+"} services`}
        className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm shadow-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
    </form>
  );

  if (loadError) {
    return (
      <div>
        {searchBar}
        <p className="rounded-2xl border border-dashed border-red-300 bg-red-50 p-6 text-center text-sm text-red-600">
          {loadError}
        </p>
      </div>
    );
  }

  // --- Search mode: flat results across the whole live catalog ---
  if (query) {
    const results = allServices
      .filter((s) => s.name.toLowerCase().includes(query))
      .slice(0, SEARCH_RESULT_LIMIT);

    return (
      <div>
        {searchBar}
        <p className="mb-2 px-1 text-sm font-medium text-slate-500">
          Results for "{searchParams.q}"
        </p>
        {results.length === 0 ? (
          <p className="px-1 text-sm text-slate-400">No matches.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {results.map((item, i) => (
              <div key={item.code} className={i !== 0 ? "border-t border-slate-100" : ""}>
                <ServiceRow code={item.code} name={item.name} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- Single category mode: full list for one category ---
  if (activeCategory) {
    const cat = CATEGORIES.find((c) => c.label === activeCategory);
    const results = allServices
      .filter((s) => categoryForName(s.name) === activeCategory)
      .slice(0, CATEGORY_FULL_LIMIT);

    return (
      <div>
        {searchBar}
        <Link
          href="/dashboard/services"
          className="mb-3 inline-block text-sm text-slate-500"
        >
          ← All categories
        </Link>
        <p className="mb-2 px-1 text-sm font-medium text-slate-500">
          {cat?.icon} {activeCategory}
        </p>
        {results.length === 0 ? (
          <p className="px-1 text-sm text-slate-400">No services found.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {results.map((item, i) => (
              <div key={item.code} className={i !== 0 ? "border-t border-slate-100" : ""}>
                <ServiceRow code={item.code} name={item.name} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- Default mode: category shelves ---
  const shelves = CATEGORIES.map((cat) => ({
    ...cat,
    items: allServices.filter((s) => categoryForName(s.name) === cat.label),
  })).filter((shelf) => shelf.items.length > 0);

  return (
    <div>
      {searchBar}

      {/* Quick category chips */}
      <div className="mb-6 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {shelves.map((cat) => (
          <Link
            key={cat.label}
            href={`/dashboard/services?category=${encodeURIComponent(cat.label)}`}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm active:bg-slate-50"
          >
            <span>{cat.icon}</span>
            {cat.label}
          </Link>
        ))}
      </div>

      <div className="space-y-7">
        {shelves.map((cat) => (
          <div key={cat.label}>
            <div className="mb-2 flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold text-slate-800">
                {cat.icon} {cat.label}
              </h2>
              {cat.items.length > SHELF_LIMIT && (
                <Link
                  href={`/dashboard/services?category=${encodeURIComponent(cat.label)}`}
                  className="text-xs font-medium text-brand"
                >
                  See all {cat.items.length}
                </Link>
              )}
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {cat.items.slice(0, SHELF_LIMIT).map((item, i) => (
                <div key={item.code} className={i !== 0 ? "border-t border-slate-100" : ""}>
                  <ServiceRow code={item.code} name={item.name} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-8 px-1 text-center text-xs text-slate-400">
        Looking for something else? Use the search bar above -{" "}
        {allServices.length.toLocaleString()} services available.
      </p>
    </div>
  );
}

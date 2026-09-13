import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getPricesForProduct, getCountries } from "@/lib/providers/5sim";
import { POPULAR_SERVICES, MARKUP_MULTIPLIER } from "@/lib/services-catalog";
import { isoToFlagEmoji } from "@/lib/flag";

// The [slug] segment here is actually the 5SIM product identifier
// (e.g. "whatsapp"). This page lists every country it's available in,
// with live prices, fetched straight from 5SIM - not hardcoded.
export default async function ProductCountriesPage({
  params,
}: {
  params: { slug: string };
}) {
  const service = POPULAR_SERVICES.find((s) => s.product === params.slug);
  if (!service) return notFound();

  const [prices, countries] = await Promise.all([
    getPricesForProduct(params.slug),
    getCountries(),
  ]);

  const countryMap = new Map(countries.map((c) => [c.slug, c]));

  return (
    <div>
      <Link
        href="/dashboard/services"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500"
      >
        <ArrowLeft size={16} />
        Back to Services
      </Link>

      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl text-base font-semibold text-white ${service.colorClass}`}
        >
          {service.label.charAt(0)}
        </div>
        <h1 className="text-lg font-semibold text-slate-900">
          {service.label}
        </h1>
      </div>

      {prices.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          No countries currently have this service in stock. Try again
          shortly.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {prices.map((p, i) => {
            const country = countryMap.get(p.countrySlug);
            const flag = country ? isoToFlagEmoji(country.iso) : "🏳️";
            const name = country?.name ?? p.countrySlug;
            const priceCents = Math.round(p.cost * 100 * MARKUP_MULTIPLIER);

            return (
              <Link
                key={p.countrySlug}
                href={`/dashboard/services/${params.slug}/${p.countrySlug}`}
                className={`flex items-center gap-3 px-4 py-3 active:bg-slate-50 ${
                  i !== 0 ? "border-t border-slate-100" : ""
                }`}
              >
                <span className="text-xl">{flag}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {p.count.toLocaleString()} available
                  </p>
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  ${(priceCents / 100).toFixed(2)}
                </span>
                <ChevronRight size={16} className="text-slate-300" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

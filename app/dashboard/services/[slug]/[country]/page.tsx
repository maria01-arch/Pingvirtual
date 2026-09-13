import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getProductPrice, getCountries } from "@/lib/providers/5sim";
import { POPULAR_SERVICES, MARKUP_MULTIPLIER } from "@/lib/services-catalog";
import { isoToFlagEmoji } from "@/lib/flag";
import BuyButton from "./buy-button";

export default async function ServiceCountryDetailPage({
  params,
}: {
  params: { slug: string; country: string };
}) {
  const service = POPULAR_SERVICES.find((s) => s.product === params.slug);
  if (!service) return notFound();

  const [priceInfo, countries] = await Promise.all([
    getProductPrice(params.country, params.slug),
    getCountries(),
  ]);

  const country = countries.find((c) => c.slug === params.country);
  const flag = country ? isoToFlagEmoji(country.iso) : "🏳️";
  const countryName = country?.name ?? params.country;

  if (!priceInfo || priceInfo.count < 1) {
    return (
      <div>
        <Link
          href={`/dashboard/services/${params.slug}`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
        <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          This just sold out. Go back and pick another country.
        </p>
      </div>
    );
  }

  const priceCents = Math.round(priceInfo.cost * 100 * MARKUP_MULTIPLIER);

  return (
    <div>
      <Link
        href={`/dashboard/services/${params.slug}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500"
      >
        <ArrowLeft size={16} />
        Back
      </Link>

      <div className="rounded-xl border border-slate-200 bg-white p-5 text-center">
        <div
          className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-semibold text-white ${service.colorClass}`}
        >
          {service.label.charAt(0)}
        </div>
        <h1 className="text-lg font-semibold text-slate-900">
          {service.label} - {flag} {countryName}
        </h1>
        <p className="mt-1 text-2xl font-bold text-slate-900">
          ${(priceCents / 100).toFixed(2)}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {priceInfo.count.toLocaleString()} numbers available
        </p>

        <BuyButton product={params.slug} country={params.country} />
      </div>
    </div>
  );
}

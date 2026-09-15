import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getProductPrice as get5simPrice, getCountries as get5simCountries } from "@/lib/providers/5sim";
import { findServiceCode, getPricesForService, getCountriesList } from "@/lib/providers/herosms";
import { POPULAR_SERVICES, MARKUP_MULTIPLIER } from "@/lib/services-catalog";
import { usdToKobo, formatP } from "@/lib/currency";
import { isoToFlagEmoji } from "@/lib/flag";
import BuyButton from "./buy-button";

export default async function ServiceCountryDetailPage({
  params,
  searchParams,
}: {
  params: { slug: string; country: string };
  searchParams: { provider?: string };
}) {
  const service = POPULAR_SERVICES.find((s) => s.product === params.slug);
  if (!service) return notFound();

  const provider = searchParams.provider === "5sim" ? "5sim" : "herosms";

  let priceKobo: number | null = null;
  let count = 0;
  let countryName = params.country;
  let flag = "🌍";

  if (provider === "5sim") {
    const [priceInfo, countries] = await Promise.all([
      get5simPrice(params.country, params.slug),
      get5simCountries(),
    ]);
    if (priceInfo && priceInfo.count > 0) {
      priceKobo = Math.round(usdToKobo(priceInfo.cost) * MARKUP_MULTIPLIER);
      count = priceInfo.count;
    }
    const c = countries.find((c) => c.slug === params.country);
    if (c) {
      countryName = c.name;
      flag = isoToFlagEmoji(c.iso);
    }
  } else {
    const serviceCode = await findServiceCode(params.slug);
    if (serviceCode) {
      const [prices, countries] = await Promise.all([
        getPricesForService(serviceCode),
        getCountriesList(),
      ]);
      const match = prices.find((p) => p.countryId === params.country);
      if (match) {
        priceKobo = Math.round(usdToKobo(match.cost) * MARKUP_MULTIPLIER);
        count = match.count;
      }
      const c = countries.find((c) => c.id === params.country);
      if (c) countryName = c.name;
    }
  }

  if (priceKobo === null || count < 1) {
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
          {formatP(priceKobo)}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {count.toLocaleString()} numbers available
        </p>

        <BuyButton product={params.slug} country={params.country} provider={provider} />
      </div>
    </div>
  );
}

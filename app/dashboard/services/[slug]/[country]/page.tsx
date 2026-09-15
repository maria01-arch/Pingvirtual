import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getProductPrice as get5simPrice, getCountries as get5simCountries } from "@/lib/providers/5sim";
import { getPricesForService, getCountriesList, getServicesList } from "@/lib/providers/herosms";
import { MARKUP_MULTIPLIER } from "@/lib/services-catalog";
import { usdCostToKobo, formatP } from "@/lib/currency";
import { isoToFlagEmoji } from "@/lib/flag";
import ServiceIcon from "../../service-icon";
import BuyButton from "./buy-button";

export default async function ServiceCountryDetailPage({
  params,
  searchParams,
}: {
  params: { slug: string; country: string };
  searchParams: { provider?: string };
}) {
  let services: Awaited<ReturnType<typeof getServicesList>> = [];
  let loadError: string | null = null;
  try {
    services = await getServicesList();
  } catch (err: any) {
    loadError = err.message ?? "Could not load service info.";
  }

  const service = services.find((s) => s.code === params.slug);
  if (!loadError && !service) return notFound();

  const provider = searchParams.provider === "5sim" ? "5sim" : "herosms";

  let priceKobo: number | null = null;
  let count = 0;
  let countryName = params.country;
  let flag = "🌍";

  if (!loadError) {
    try {
      if (provider === "5sim") {
        const [priceInfo, countries] = await Promise.all([
          get5simPrice(params.country, "whatsapp"),
          get5simCountries(),
        ]);
        if (priceInfo && priceInfo.count > 0) {
          priceKobo = usdCostToKobo(priceInfo.cost, MARKUP_MULTIPLIER);
          count = priceInfo.count;
        }
        const c = countries.find((c) => c.slug === params.country);
        if (c) {
          countryName = c.name;
          flag = isoToFlagEmoji(c.iso);
        }
      } else {
        const [prices, countries] = await Promise.all([
          getPricesForService(params.slug),
          getCountriesList(),
        ]);
        const match = prices.find((p) => p.countryId === params.country);
        if (match) {
          priceKobo = usdCostToKobo(match.cost, MARKUP_MULTIPLIER);
          count = match.count;
        }
        const c = countries.find((c) => c.id === params.country);
        if (c) countryName = c.name;
      }
    } catch (err: any) {
      loadError = err.message ?? "Could not load pricing.";
    }
  }

  if (loadError) {
    return (
      <div>
        <Link
          href={`/dashboard/services/${params.slug}`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-700"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
        <p className="rounded-2xl border border-dashed border-red-300 bg-red-50 p-6 text-center text-sm text-red-700">
          {loadError}
        </p>
      </div>
    );
  }

  if (priceKobo === null || count < 1) {
    return (
      <div>
        <Link
          href={`/dashboard/services/${params.slug}`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-700"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
        <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-700">
          This just sold out. Go back and pick another country.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Link
        href={`/dashboard/services/${params.slug}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-700"
      >
        <ArrowLeft size={16} />
        Back
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto mb-4 flex justify-center">
          <ServiceIcon name={service!.name} size={64} />
        </div>
        <h1 className="text-lg font-bold text-slate-900">
          {service!.name} - {flag} {countryName}
        </h1>
        <p className="mt-2 text-3xl font-bold text-brand">
          {formatP(priceKobo)}
        </p>
        <p className="mt-1 text-xs font-medium text-slate-600">
          {count.toLocaleString()} numbers available
        </p>

        <BuyButton product={params.slug} country={params.country} provider={provider} />
      </div>
    </div>
  );
}

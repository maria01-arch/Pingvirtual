import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getCountryOptions } from "@/lib/pricing";
import { getServicesList } from "@/lib/providers/herosms";
import { colorForLabel } from "@/lib/services-catalog";
import { formatP } from "@/lib/currency";

// [slug] is the real HeroSMS service code (e.g. "wa"). Country options come
// live from 5SIM (WhatsApp+USA only) and HeroSMS (everything else).
export default async function ProductCountriesPage({
  params,
}: {
  params: { slug: string };
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

  const options = loadError
    ? []
    : await getCountryOptions(params.slug, service!.name).catch((err) => {
        loadError = err.message ?? "Could not load pricing.";
        return [];
      });

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
          className={`flex h-11 w-11 items-center justify-center rounded-xl text-base font-semibold text-white ${colorForLabel(service?.name ?? params.slug)}`}
        >
          {(service?.name ?? params.slug).charAt(0).toUpperCase()}
        </div>
        <h1 className="text-lg font-semibold text-slate-900">
          {service?.name ?? params.slug}
        </h1>
      </div>

      {loadError ? (
        <p className="rounded-xl border border-dashed border-red-300 bg-red-50 p-6 text-center text-sm text-red-600">
          {loadError}
        </p>
      ) : options.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          No countries currently have this service in stock. Try again
          shortly.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {options.map((item, i) => (
            <Link
              key={`${item.provider}-${item.countryParam}`}
              href={`/dashboard/services/${params.slug}/${item.countryParam}?provider=${item.provider}`}
              className={`flex items-center gap-3 px-4 py-3 active:bg-slate-50 ${
                i !== 0 ? "border-t border-slate-100" : ""
              }`}
            >
              <span className="text-xl">{item.flag}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">
                  {item.name}
                </p>
                <p className="text-xs text-slate-400">
                  {item.count.toLocaleString()} available
                </p>
              </div>
              <span className="text-sm font-semibold text-slate-900">
                {formatP(item.priceKobo)}
              </span>
              <ChevronRight size={16} className="text-slate-300" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

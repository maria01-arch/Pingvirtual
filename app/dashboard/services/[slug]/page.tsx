import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getCountryOptions } from "@/lib/pricing";
import { getServicesList } from "@/lib/providers/herosms";
import { formatP } from "@/lib/currency";
import ServiceIcon from "../service-icon";

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

  const displayName = service?.name ?? params.slug;

  return (
    <div>
      <Link
        href="/dashboard/services"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-700"
      >
        <ArrowLeft size={16} />
        Back to Services
      </Link>

      <div className="mb-5 flex items-center gap-3">
        <ServiceIcon name={displayName} size={48} />
        <h1 className="text-xl font-bold text-slate-900">{displayName}</h1>
      </div>

      {loadError ? (
        <p className="rounded-2xl border border-dashed border-red-300 bg-red-50 p-6 text-center text-sm text-red-700">
          {loadError}
        </p>
      ) : options.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-700">
          No countries currently have this service in stock. Try again
          shortly.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {options.map((item, i) => (
            <Link
              key={`${item.provider}-${item.countryParam}`}
              href={`/dashboard/services/${params.slug}/${item.countryParam}?provider=${item.provider}`}
              className={`flex items-center gap-3 px-4 py-3.5 transition active:bg-slate-50 ${
                i !== 0 ? "border-t border-slate-100" : ""
              }`}
            >
              <span className="text-2xl">{item.flag}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium text-slate-900">
                  {item.name}
                </p>
                <p className="text-xs font-medium text-slate-600">
                  {item.count.toLocaleString()} available
                </p>
              </div>
              <span className="rounded-full bg-brand-light px-2.5 py-1 text-sm font-semibold text-brand">
                {formatP(item.priceKobo)}
              </span>
              <ChevronRight size={16} className="text-slate-400" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

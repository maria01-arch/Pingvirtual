import { getProductPrice as get5simPrice, getCountries as get5simCountries } from "./providers/5sim";
import { findServiceCode, getPricesForService, getCountriesList } from "./providers/herosms";
import { usdToKobo } from "./currency";
import { isoToFlagEmoji } from "./flag";
import { MARKUP_MULTIPLIER } from "./services-catalog";

export type CountryOption = {
  countryParam: string; // what goes in the URL
  provider: "5sim" | "herosms";
  name: string;
  flag: string;
  priceKobo: number;
  count: number;
};

// WhatsApp + USA stays on 5SIM (it's reliable there and already tested).
// Every other product/country combination routes to HeroSMS.
export function routeFor(product: string, country: string): "5sim" | "herosms" {
  return product === "whatsapp" && country === "usa" ? "5sim" : "herosms";
}

export async function getCountryOptions(product: string): Promise<CountryOption[]> {
  const options: CountryOption[] = [];

  // 1. The one 5SIM-backed option, only for WhatsApp.
  if (product === "whatsapp") {
    try {
      const price = await get5simPrice("usa", "whatsapp");
      if (price && price.count > 0) {
        const countries = await get5simCountries();
        const usa = countries.find((c) => c.slug === "usa");
        options.push({
          countryParam: "usa",
          provider: "5sim",
          name: usa?.name ?? "United States",
          flag: usa ? isoToFlagEmoji(usa.iso) : "🇺🇸",
          priceKobo: Math.round(usdToKobo(price.cost) * MARKUP_MULTIPLIER),
          count: price.count,
        });
      }
    } catch {
      // If 5SIM is briefly unreachable, just skip this one option -
      // HeroSMS options below still render.
    }
  }

  // 2. Everything else - all countries HeroSMS has this service in stock in.
  try {
    const serviceCode = await findServiceCode(product);
    if (serviceCode) {
      const [prices, countries] = await Promise.all([
        getPricesForService(serviceCode),
        getCountriesList(),
      ]);
      const countryMap = new Map(countries.map((c) => [c.id, c.name]));

      for (const p of prices) {
        if (product === "whatsapp" && p.countryId === "usa") continue; // avoid duplicate
        options.push({
          countryParam: p.countryId,
          provider: "herosms",
          name: countryMap.get(p.countryId) ?? p.countryId,
          flag: "🌍",
          priceKobo: Math.round(usdToKobo(p.cost) * MARKUP_MULTIPLIER),
          count: p.count,
        });
      }
    }
  } catch {
    // If HeroSMS is briefly unreachable, whatever 5SIM options we got above
    // still render rather than showing a fully empty list.
  }

  return options.sort((a, b) => a.priceKobo - b.priceKobo);
}

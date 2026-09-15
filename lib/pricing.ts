import { getProductPrice as get5simPrice, getCountries as get5simCountries } from "./providers/5sim";
import { getPricesForService, getCountriesList } from "./providers/herosms";
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

// serviceCode is the HeroSMS code (e.g. "wa" for WhatsApp) - it's the
// canonical identifier now, since the Services tab lists HeroSMS's live
// catalog directly. WhatsApp gets one extra 5SIM-backed USA option because
// that specific combination is already proven reliable.
export async function getCountryOptions(
  serviceCode: string,
  serviceLabel: string
): Promise<CountryOption[]> {
  const options: CountryOption[] = [];
  const isWhatsApp = serviceLabel.toLowerCase() === "whatsapp";

  if (isWhatsApp) {
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
      // 5SIM briefly unreachable - HeroSMS options below still render.
    }
  }

  try {
    const [prices, countries] = await Promise.all([
      getPricesForService(serviceCode),
      getCountriesList(),
    ]);
    const countryMap = new Map(countries.map((c) => [c.id, c.name]));

    for (const p of prices) {
      if (isWhatsApp && p.countryId === "usa") continue; // avoid duplicate
      options.push({
        countryParam: p.countryId,
        provider: "herosms",
        name: countryMap.get(p.countryId) ?? p.countryId,
        flag: "🌍",
        priceKobo: Math.round(usdToKobo(p.cost) * MARKUP_MULTIPLIER),
        count: p.count,
      });
    }
  } catch {
    // HeroSMS briefly unreachable - whatever 5SIM option we got still renders.
  }

  return options.sort((a, b) => a.priceKobo - b.priceKobo);
}

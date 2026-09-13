export function isoToFlagEmoji(iso2: string): string {
  if (!iso2 || iso2.length !== 2) return "🏳️";
  return iso2
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join("");
}

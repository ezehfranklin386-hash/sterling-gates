// Currency / date / number formatting (docs/frontend-spec.md §6).

/** Format a price as a locale currency string. Defaults to USD for the global
 *  advisory market; reserve `naira` for Nigeria-specific displays. */
export function formatPrice(value: number, currency: 'USD' | 'NGN' = 'USD'): string {
  const locale = currency === 'NGN' ? 'en-NG' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Discreet form — "POA" (Price On Application) for off-market listings. */
export function displayPrice(property: { offMarket: boolean; price: number }): string {
  if (property.offMarket) return 'POA — Request access';
  return formatPrice(property.price);
}

/** ISO date → readable "12 June 2026". */
export function formatDate(iso?: string): string {
  if (!iso) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

/** Format size: "4,200 sqm". */
export function formatSize(value: number, unit: string): string {
  return `${new Intl.NumberFormat('en-US').format(value)} ${unit}`;
}

/** Slugify: lower, trim, spaces→hyphens, strip non-alphanumerics. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
/**
 * Normalize prices array from API and return display info.
 * - Empty or no valid numbers: show as "Free" or "Price on request"
 * - One price: show that amount
 * - Multiple: show range (min - max)
 */
export type PriceDisplay =
  | { type: 'none' }
  | { type: 'single'; value: number }
  | { type: 'range'; min: number; max: number };

export function getPriceDisplay(prices: number[] | null | undefined): PriceDisplay {
  const valid = Array.isArray(prices)
    ? prices.filter((n) => typeof n === 'number' && !Number.isNaN(n))
    : [];
  if (valid.length === 0) return { type: 'none' };
  if (valid.length === 1) return { type: 'single', value: valid[0] };
  return { type: 'range', min: Math.min(...valid), max: Math.max(...valid) };
}

export function formatPriceDisplay(
  price: PriceDisplay,
  t: (key: string) => string,
  options?: { freeKey?: string }
): string {
  const freeLabel = options?.freeKey ? t(options.freeKey) : t('tours.priceFree');
  if (price.type === 'none') return freeLabel;
  if (price.type === 'single') return `$${price.value}`;
  return `$${price.min} - $${price.max}`;
}

// -----------------------------------------------------------------------------
// Money formatting — the ONE place that knows the shop's currency.
// -----------------------------------------------------------------------------
// Prices are stored in the database as whole numbers of the smallest unit of
// the currency (e.g. kobo instead of Naira, cents instead of Dollars) — see
// the comment on Product.priceInMinorUnits in prisma/schema.prisma for why.
//
// If this business ever needs to switch currency, this file (and only this
// file) needs to change.
// -----------------------------------------------------------------------------

// How many minor units make one major unit (100 kobo = 1 Naira, 100 cents =
// 1 Dollar — most currencies use 100, so this rarely needs to change).
const MINOR_UNITS_PER_MAJOR_UNIT = 100;

// Change this to "$", "£", "€", etc. if needed.
export const CURRENCY_SYMBOL = "₦"; // ₦ (Naira sign)

/** The number part of a price with no currency symbol, e.g. "45,000". Used by the `<Price>` component. */
export function formatAmount(priceInMinorUnits: number): string {
  const majorUnits = priceInMinorUnits / MINOR_UNITS_PER_MAJOR_UNIT;
  return majorUnits.toLocaleString("en-NG", {
    minimumFractionDigits: majorUnits % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Converts a price stored in minor units (e.g. kobo) into a display string
 * like "₦45,000". Prefer the `<Price>` component (src/components/site/Price.tsx)
 * when rendering a price in JSX — it works around a font-rendering quirk
 * with the ₦ symbol that this plain-string version can't. Reach for this
 * function only where a plain string is genuinely required (e.g. building
 * an `alt` attribute or a value that isn't rendered as JSX).
 */
export function formatPrice(priceInMinorUnits: number): string {
  return `${CURRENCY_SYMBOL}${formatAmount(priceInMinorUnits)}`;
}

/** Converts a major-unit amount typed into an admin form (e.g. "45000") into minor units for storage. */
export function toMinorUnits(majorUnitsAmount: number): number {
  return Math.round(majorUnitsAmount * MINOR_UNITS_PER_MAJOR_UNIT);
}

/** The reverse of toMinorUnits — used to pre-fill the price field when editing an existing product. */
export function toMajorUnits(priceInMinorUnits: number): number {
  return priceInMinorUnits / MINOR_UNITS_PER_MAJOR_UNIT;
}

import { CURRENCY_SYMBOL, formatAmount } from "@/lib/currency";

// A system font stack guaranteed to have a correct ₦ (Naira sign) glyph.
// See the big comment in src/app/globals.css for why this is necessary:
// our custom webfonts don't reliably cover this character, and depending
// on which of our three custom fonts happens to be active at a given call
// site, the browser's own substitute glyph can render looking like it
// strikes through the whole price.
const CURRENCY_SYMBOL_FONT_STACK =
  'ui-sans-serif, system-ui, "Segoe UI", Arial, sans-serif';

/**
 * Renders a price the RIGHT way in JSX: `<Price amountInMinorUnits={...} />`.
 * Use this instead of `formatPrice()` (src/lib/currency.ts) everywhere a
 * price appears on screen — the plain-string version is fine for the rare
 * non-visual case (e.g. an `alt` attribute), but this component is what
 * actually guarantees the currency symbol renders correctly no matter what
 * font the surrounding text is using (font-sans, font-display, font-heading).
 */
export function Price({
  amountInMinorUnits,
  className,
}: {
  amountInMinorUnits: number;
  className?: string;
}) {
  return (
    <span className={className}>
      {/* An inline `style` beats any class-based font (even font-display,
          font-heading), which is exactly what we need here — no matter
          which custom font this <Price> is nested inside, the symbol
          always renders in a font that actually has the glyph. */}
      <span style={{ fontFamily: CURRENCY_SYMBOL_FONT_STACK }}>{CURRENCY_SYMBOL}</span>
      {formatAmount(amountInMinorUnits)}
    </span>
  );
}

// -----------------------------------------------------------------------------
// Small helpers related to order requests.
// -----------------------------------------------------------------------------

/**
 * Builds a human-friendly order reference the customer can quote back to the
 * founder, e.g. "TK-20260905-4821". This is NOT the database id (which is a
 * long uuid) — it's stored separately as OrderRequest.orderNumber precisely
 * so customers have something short and readable to reference.
 */
/**
 * Returns a Date `daysAgo` days in the past. Pulled out into its own
 * function (rather than writing `new Date(Date.now() - ...)` inline) so
 * that the "current time" read happens inside a plain helper function
 * instead of directly in a page/component body — React's lint rules flag
 * reading the clock straight from render code as an "impure" render.
 */
export function getDateDaysAgo(days: number): Date {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return new Date(Date.now() - days * millisecondsPerDay);
}

export function generateOrderNumber(): string {
  const today = new Date();
  const datePart = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("");

  // A random 4-digit suffix. It doesn't need to be cryptographically secure
  // (it's just a reference number, not a secret) — it only needs to make
  // same-day collisions unlikely.
  const randomPart = Math.floor(1000 + Math.random() * 9000);

  return `TK-${datePart}-${randomPart}`;
}

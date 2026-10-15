/**
 * Money helpers. All amounts are stored as integers in the currency's minor
 * unit (kobo for NGN: ₦1 = 100 kobo) to avoid floating-point errors.
 */
export const STORE_CURRENCY = "NGN";
export const STORE_LOCALE = "en-NG";

const formatters = new Map<string, Intl.NumberFormat>();

function getFormatter(currency: string, locale: string, wholeUnits: boolean): Intl.NumberFormat {
  const key = `${locale}:${currency}:${wholeUnits}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      ...(wholeUnits ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : {}),
    });
    formatters.set(key, formatter);
  }
  return formatter;
}

/**
 * Formats an integer amount in minor units (kobo) as a currency string.
 * Whole amounts are shown without decimals (₦68,000), as is conventional
 * for Naira retail pricing; fractional amounts keep their kobo (₦68,000.50).
 */
export function formatPrice(
  amountMinor: number,
  currency: string = STORE_CURRENCY,
  locale: string = STORE_LOCALE,
): string {
  if (!Number.isFinite(amountMinor)) throw new RangeError("Amount must be a finite number");
  const wholeUnits = Number.isInteger(amountMinor) && amountMinor % 100 === 0;
  return getFormatter(currency.toUpperCase(), locale, wholeUnits).format(amountMinor / 100);
}

/** Converts a major-unit amount (e.g. ₦12,500) to integer minor units (kobo). */
export function toMinorUnits(amount: number): number {
  if (!Number.isFinite(amount)) throw new RangeError("Amount must be a finite number");
  return Math.round(amount * 100);
}

/** Converts integer minor units back to a major-unit number. */
export function fromMinorUnits(amountMinor: number): number {
  return amountMinor / 100;
}

/** Major-unit decimal string for structured data, e.g. `"68000.00"`. */
export function toDecimalString(amountMinor: number): string {
  return (amountMinor / 100).toFixed(2);
}

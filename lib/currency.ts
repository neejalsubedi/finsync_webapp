/**
 * Currency configuration — single source of truth.
 * Change these to update currency across the entire app.
 */
export const CURRENCY_SYMBOL = "Rs.";
export const CURRENCY_CODE = "NPR";
export const CURRENCY_LOCALE = "en-NP";

/**
 * Format an amount with currency symbol.
 * e.g. formatCurrency(1500) → "Rs. 1,500.00"
 */
export function formatCurrency(
  amount: number,
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number },
): string {
  const { minimumFractionDigits = 2, maximumFractionDigits = 2 } =
    options ?? {};
  return `${CURRENCY_SYMBOL} ${amount.toLocaleString("en-IN", {
    minimumFractionDigits,
    maximumFractionDigits,
  })}`;
}

/**
 * Format amount without the symbol (just the number with locale formatting).
 */
export function formatAmount(
  amount: number,
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number },
): string {
  const { minimumFractionDigits = 0, maximumFractionDigits = 2 } =
    options ?? {};
  return amount.toLocaleString("en-IN", {
    minimumFractionDigits,
    maximumFractionDigits,
  });
}

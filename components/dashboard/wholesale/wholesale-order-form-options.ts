export const WHOLESALE_PAYMENT_PLATFORM_OPTIONS = [
  "银行转账",
  "支付宝",
  "微信支付",
  "PayPal",
  "Wise",
  "Payoneer",
  "WorldFirst",
  "PingPong",
  "Stripe",
  "现金",
  "其他",
] as const;

export function dedupeWholesaleCurrencyOptions<T extends { currency: string }>(
  options: T[],
) {
  const seenCurrencies = new Set<string>();

  return options.filter((option) => {
    if (seenCurrencies.has(option.currency)) {
      return false;
    }

    seenCurrencies.add(option.currency);
    return true;
  });
}

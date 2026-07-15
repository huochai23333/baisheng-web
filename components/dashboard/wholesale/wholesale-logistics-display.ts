import type {
  WholesaleCustomer,
  WholesaleProfile,
} from "@/lib/wholesale";

export function isWholesaleLogisticsCostMissing(
  amount: number | null | undefined,
) {
  return amount === null || amount === undefined || Number(amount) === 0;
}

export function formatWholesaleLogisticsMoney(
  amount: number,
  currency: string,
  locale: string,
) {
  const normalizedCurrency = currency === "RMB" ? "CNY" : currency;

  try {
    return new Intl.NumberFormat(locale, {
      currency: normalizedCurrency === "UNKNOWN" ? undefined : normalizedCurrency,
      currencyDisplay: "code",
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
      style: normalizedCurrency === "UNKNOWN" ? "decimal" : "currency",
    }).format(amount);
  } catch {
    return `${normalizedCurrency} ${Number(amount).toFixed(2)}`;
  }
}

export function formatWholesaleLogisticsDateTime(
  value: string | null | undefined,
  locale: string,
) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function getWholesaleLogisticsProfileName(
  profilesById: Map<string, WholesaleProfile>,
  userId: string | null,
  fallback: string,
) {
  if (!userId) return fallback;
  const profile = profilesById.get(userId);
  return profile?.name || profile?.email || fallback;
}

export function getWholesaleLogisticsCustomerName(
  customersById: Map<string, WholesaleCustomer>,
  customerId: string | null,
  fallback: string,
) {
  return customerId
    ? customersById.get(customerId)?.unique_name ?? fallback
    : fallback;
}

export function getActiveSalesProfiles(profiles: WholesaleProfile[]) {
  return profiles
    .filter((profile) => profile.role === "salesman" && profile.status === "active")
    .sort((left, right) =>
      (left.name || left.email || "").localeCompare(
        right.name || right.email || "",
        "zh-CN",
      ),
    );
}

import {
  normalizeOrderDateRange,
  type OrderSearchMode,
} from "./order-date-range";
import type {
  AdminOrdersFilters,
  OrderUserOption,
} from "./admin-orders-types";
import {
  normalizeOptionalString,
  normalizePositiveInteger,
  normalizeSearchText,
} from "./value-normalizers";

export function normalizeAdminOrdersFilters(
  filters?: Partial<AdminOrdersFilters> | null,
): AdminOrdersFilters {
  const dateRange = normalizeOrderDateRange({
    fromDate: filters?.createdFromDate,
    toDate: filters?.createdToDate,
  });
  const orderNumber = normalizeOptionalString(filters?.orderNumber) ?? "";
  return {
    createdFromDate: dateRange.fromDate,
    createdToDate: dateRange.toDate,
    orderEntryUser: normalizeOptionalString(filters?.orderEntryUser) ?? "",
    orderNumber,
    orderingUser: normalizeOptionalString(filters?.orderingUser) ?? "",
    searchMode:
      filters?.searchMode === "exact_all_time" && orderNumber
        ? "exact_all_time"
        : "date_range",
  };
}

export function parseAdminOrdersSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
) {
  return {
    filters: normalizeAdminOrdersFilters({
      createdFromDate: getSingleSearchParam(searchParams.createdFromDate),
      createdToDate: getSingleSearchParam(searchParams.createdToDate),
      orderEntryUser: getSingleSearchParam(searchParams.orderEntryUser),
      orderNumber: getSingleSearchParam(searchParams.orderNumber),
      orderingUser: getSingleSearchParam(searchParams.orderingUser),
      searchMode: getSingleSearchParam(searchParams.searchMode) as
        | OrderSearchMode
        | undefined,
    }),
    page: normalizePositiveInteger(getSingleSearchParam(searchParams.page), 1),
  };
}

export function resolveAdminOrderUserFilter(
  userOptions: OrderUserOption[],
  rawValue: string,
): { hasNoMatches: boolean; userIds?: string[] } {
  const normalizedValue = normalizeSearchText(rawValue);
  if (!normalizedValue) return { hasNoMatches: false };

  const userIds = userOptions
    .filter((option) =>
      normalizeSearchText(getOrderUserSearchLabel(option)).includes(
        normalizedValue,
      ),
    )
    .map((option) => option.user_id);
  return userIds.length === 0
    ? { hasNoMatches: true, userIds: [] }
    : { hasNoMatches: false, userIds };
}

function getOrderUserSearchLabel(option: OrderUserOption) {
  const name = normalizeOptionalString(option.name);
  const email = normalizeOptionalString(option.email);
  if (name && email) return `${name} / ${email}`;
  return name ?? email ?? option.user_id;
}

function getSingleSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

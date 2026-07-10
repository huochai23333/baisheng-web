"use client";

import { useDeferredValue, useMemo, useState } from "react";

import { getBeijingDateString } from "@/lib/exchange-rates";
import type { WholesaleOrderFilters } from "@/lib/wholesale-order-page";

export function createDefaultWholesaleOrderFilters(): WholesaleOrderFilters {
  const today = getBeijingDateString();
  const year = Number(today.slice(0, 4));
  const month = Number(today.slice(5, 7));
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const monthText = String(month).padStart(2, "0");

  return {
    customerId: "",
    orderedFromDate: `${year}-${monthText}-01`,
    orderedToDate: `${year}-${monthText}-${String(lastDay).padStart(2, "0")}`,
    salesUserId: "",
    searchText: "",
    status: "all",
  };
}

/**
 * 页面只通过这个 hook 管理筛选。搜索文字使用延迟值，用户连续输入时不会每个按键都发请求。
 */
export function useWholesaleOrderFilters() {
  const [filters, setFilters] = useState<WholesaleOrderFilters>(() =>
    createDefaultWholesaleOrderFilters(),
  );
  const deferredSearchText = useDeferredValue(filters.searchText);
  const queryFilters = useMemo(
    () => ({ ...filters, searchText: deferredSearchText.trim() }),
    [deferredSearchText, filters],
  );
  const hasActiveFilters = Object.values(filters).some((value) =>
    typeof value === "string" ? value.length > 0 && value !== "all" : false,
  );

  const updateFilter = <Key extends keyof WholesaleOrderFilters>(
    key: Key,
    value: WholesaleOrderFilters[Key],
  ) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  return {
    clearFilters: () =>
      setFilters({
        customerId: "",
        orderedFromDate: "",
        orderedToDate: "",
        salesUserId: "",
        searchText: "",
        status: "all",
      }),
    filters,
    hasActiveFilters,
    queryFilters,
    updateFilter,
  };
}

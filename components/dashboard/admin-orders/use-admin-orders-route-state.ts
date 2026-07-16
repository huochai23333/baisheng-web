"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  type AdminOrdersFilters,
  type AdminOrdersPageData,
} from "@/lib/admin-orders";
import {
  getOrderDatePresetRange,
  type OrderDatePreset,
} from "@/lib/order-date-range";
import { useWorkspaceSyncEffect } from "@/components/dashboard/workspace-session-provider";

import {
  areOrderFiltersEqual,
  createDefaultAdminOrderFilters,
} from "./admin-orders-client-config";

export function useAdminOrdersRouteState({
  initialFilters,
  pagination,
}: {
  initialFilters: AdminOrdersFilters;
  pagination: AdminOrdersPageData["pagination"];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startRouteTransition] = useTransition();
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const replaceOrdersRoute = useCallback(
    (next: {
      filters?: AdminOrdersFilters;
      page?: number;
    }) => {
      const nextFilters = next.filters ?? filters;
      const nextPage = next.page ?? pagination.page;
      const nextParams = new URLSearchParams(searchParams.toString());

      if (nextFilters.orderNumber) {
        nextParams.set("orderNumber", nextFilters.orderNumber);
      } else {
        nextParams.delete("orderNumber");
      }

      if (nextFilters.createdFromDate) {
        nextParams.set("createdFromDate", nextFilters.createdFromDate);
      } else {
        nextParams.delete("createdFromDate");
      }

      if (nextFilters.createdToDate) {
        nextParams.set("createdToDate", nextFilters.createdToDate);
      } else {
        nextParams.delete("createdToDate");
      }

      if (nextFilters.orderEntryUser) {
        nextParams.set("orderEntryUser", nextFilters.orderEntryUser);
      } else {
        nextParams.delete("orderEntryUser");
      }

      if (nextFilters.orderingUser) {
        nextParams.set("orderingUser", nextFilters.orderingUser);
      } else {
        nextParams.delete("orderingUser");
      }

      if (nextFilters.searchMode === "exact_all_time") {
        nextParams.set("searchMode", nextFilters.searchMode);
      } else {
        nextParams.delete("searchMode");
      }

      if (nextPage > 1) {
        nextParams.set("page", String(nextPage));
      } else {
        nextParams.delete("page");
      }

      const nextQuery = nextParams.toString();

      startRouteTransition(() => {
        router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
          scroll: false,
        });
      });
    },
    [filters, pagination.page, pathname, router, searchParams, startRouteTransition],
  );

  useEffect(() => {
    if (areOrderFiltersEqual(filters, initialFilters)) {
      return;
    }

    const timeoutId = globalThis.setTimeout(() => {
      replaceOrdersRoute({
        filters,
        page: 1,
      });
    }, 250);

    return () => {
      globalThis.clearTimeout(timeoutId);
    };
  }, [filters, initialFilters, replaceOrdersRoute]);

  const refreshOrdersRoute = useCallback(() => {
    startRouteTransition(() => {
      router.refresh();
    });
  }, [router, startRouteTransition]);

  useWorkspaceSyncEffect(refreshOrdersRoute);

  const goToPage = useCallback(
    (page: number) => {
      replaceOrdersRoute({
        filters,
        page,
      });
    },
    [filters, replaceOrdersRoute],
  );

  const ordersPaginationState = useMemo(
    () => ({
      endIndex: pagination.endIndex,
      hasNextPage: pagination.hasNextPage,
      hasPreviousPage: pagination.hasPreviousPage,
      onNextPage: () => goToPage(pagination.page + 1),
      onPreviousPage: () => goToPage(pagination.page - 1),
      page: pagination.page,
      pageCount: pagination.pageCount,
      startIndex: pagination.startIndex,
      totalItems: pagination.totalItems,
    }),
    [
      goToPage,
      pagination.endIndex,
      pagination.hasNextPage,
      pagination.hasPreviousPage,
      pagination.page,
      pagination.pageCount,
      pagination.startIndex,
      pagination.totalItems,
    ],
  );

  const handleOrderNumberChange = useCallback((value: string) => {
    setFilters((current) => ({
      ...current,
      orderNumber: value,
      searchMode: "date_range",
    }));
  }, []);

  const handleOrderEntryUserChange = useCallback((value: string) => {
    setFilters((current) => ({
      ...current,
      orderEntryUser: value,
    }));
  }, []);

  const handleOrderingUserChange = useCallback((value: string) => {
    setFilters((current) => ({
      ...current,
      orderingUser: value,
    }));
  }, []);

  const handleCreatedFromDateChange = useCallback((value: string) => {
    setFilters((current) => ({
      ...current,
      createdFromDate: value || current.createdFromDate,
      createdToDate:
        value && current.createdToDate < value
          ? value
          : current.createdToDate,
      searchMode: "date_range",
    }));
  }, []);

  const handleCreatedToDateChange = useCallback((value: string) => {
    setFilters((current) => {
      const nextValue = value || current.createdToDate;

      return {
        ...current,
        createdFromDate:
          nextValue < current.createdFromDate
            ? nextValue
            : current.createdFromDate,
        createdToDate: nextValue,
        searchMode: "date_range",
      };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(createDefaultAdminOrderFilters());
  }, []);

  const handleDatePresetChange = useCallback(
    (preset: Exclude<OrderDatePreset, "custom">) => {
      const range = getOrderDatePresetRange(preset);

      setFilters((current) => ({
        ...current,
        createdFromDate: range.fromDate,
        createdToDate: range.toDate,
        searchMode: "date_range",
      }));
    },
    [],
  );

  const searchExactOrderAllTime = useCallback(() => {
    setFilters((current) => {
      const orderNumber = current.orderNumber.trim();

      if (!orderNumber) {
        return current;
      }

      return {
        ...current,
        orderEntryUser: "",
        orderNumber,
        orderingUser: "",
        searchMode: "exact_all_time",
      };
    });
  }, []);

  const exitExactAllTimeSearch = useCallback(() => {
    setFilters((current) => ({
      ...current,
      searchMode: "date_range",
    }));
  }, []);

  return {
    clearFilters,
    filters,
    exitExactAllTimeSearch,
    handleCreatedFromDateChange,
    handleCreatedToDateChange,
    handleDatePresetChange,
    handleOrderEntryUserChange,
    handleOrderNumberChange,
    handleOrderingUserChange,
    ordersPaginationState,
    refreshOrdersRoute,
    searchExactOrderAllTime,
  };
}

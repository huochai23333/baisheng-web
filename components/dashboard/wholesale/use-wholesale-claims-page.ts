"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import { getDefaultOrderDateRange } from "@/lib/order-date-range";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import {
  getWholesaleClaimPage,
  type WholesaleClaimBoardKey,
  type WholesaleClaimFilters,
  type WholesaleClaimPage,
} from "@/lib/wholesale-claims-page";

export function createDefaultWholesaleClaimFilters(): WholesaleClaimFilters {
  return {
    ...getDefaultOrderDateRange(),
    exactOrderNumber: "",
    recipientName: "",
    searchMode: "date_range",
    searchText: "",
  };
}

export function useWholesaleClaimsPage(initialPage: WholesaleClaimPage) {
  const [activeBoard, setActiveBoard] =
    useState<WholesaleClaimBoardKey>(initialPage.board);
  const [filters, setFilters] = useState<WholesaleClaimFilters>(
    createDefaultWholesaleClaimFilters,
  );
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const deferredSearchText = useDeferredValue(filters.searchText);
  const deferredRecipientName = useDeferredValue(filters.recipientName);
  const requestVersion = useRef(0);
  const initialKey = useRef<string | null>(null);

  const queryFilters = useMemo(
    () => ({
      ...filters,
      recipientName: deferredRecipientName.trim(),
      searchText: deferredSearchText.trim(),
    }),
    [deferredRecipientName, deferredSearchText, filters],
  );
  const queryKey = JSON.stringify([activeBoard, queryFilters]);

  const loadFirstPage = useCallback(async () => {
    const supabase = getBrowserSupabaseClient();
    if (!supabase) {
      setLoadError("1688 订单暂时没有加载成功，请刷新页面后重试。");
      return;
    }

    const version = ++requestVersion.current;
    setLoading(true);
    setLoadError(null);

    try {
      const nextPage = await getWholesaleClaimPage(
        supabase,
        activeBoard,
        queryFilters,
      );
      if (version === requestVersion.current) setPage(nextPage);
    } catch (error) {
      if (version === requestVersion.current) {
        setLoadError(
          error instanceof Error
            ? error.message
            : "1688 订单暂时没有加载成功，请稍后重试。",
        );
      }
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, [activeBoard, queryFilters]);

  useEffect(() => {
    if (initialKey.current === null) {
      initialKey.current = queryKey;
      return;
    }
    void loadFirstPage();
  }, [loadFirstPage, queryKey]);

  const loadMore = useCallback(async () => {
    if (!page.nextCursor || loadingMore) return;
    const supabase = getBrowserSupabaseClient();
    if (!supabase) {
      setLoadError("更多 1688 订单暂时没有加载成功，请刷新页面后重试。");
      return;
    }

    setLoadingMore(true);
    setLoadError(null);
    try {
      const nextPage = await getWholesaleClaimPage(
        supabase,
        activeBoard,
        queryFilters,
        page.nextCursor,
      );
      setPage((current) => ({
        ...nextPage,
        groupRows: mergeRows(current.groupRows, nextPage.groupRows, (row) =>
          row.claimGroup.id,
        ),
        rows: mergeRows(current.rows, nextPage.rows, (row) =>
          row.purchaseOrder.id,
        ),
      }));
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "更多 1688 订单暂时没有加载成功，请稍后重试。",
      );
    } finally {
      setLoadingMore(false);
    }
  }, [activeBoard, loadingMore, page.nextCursor, queryFilters]);

  const updateFilters = useCallback(
    (changes: Partial<WholesaleClaimFilters>) => {
      setFilters((current) => ({
        ...current,
        ...changes,
        ...(current.searchMode === "exact_all_time" &&
        changes.searchText !== undefined
          ? { exactOrderNumber: "", searchMode: "date_range" as const }
          : {}),
      }));
    },
    [],
  );

  return {
    activeBoard,
    activateExactSearch: () => {
      const exactOrderNumber = filters.searchText.trim();
      if (!exactOrderNumber) return false;
      setFilters((current) => ({
        ...current,
        exactOrderNumber,
        searchMode: "exact_all_time",
      }));
      return true;
    },
    exitExactSearch: () =>
      setFilters((current) => ({
        ...current,
        exactOrderNumber: "",
        searchMode: "date_range",
      })),
    filters,
    loadError,
    loading,
    loadingMore,
    loadMore,
    page,
    refreshFirstPage: loadFirstPage,
    resetFilters: () => setFilters(createDefaultWholesaleClaimFilters()),
    setActiveBoard,
    updateFilters,
  };
}

function mergeRows<Row>(
  current: Row[],
  next: Row[],
  getId: (row: Row) => string,
) {
  return Array.from(
    new Map([...current, ...next].map((row) => [getId(row), row])).values(),
  );
}

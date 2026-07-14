"use client";

import { useCallback, useDeferredValue, useEffect, useRef, useState } from "react";

import { getBrowserSupabaseClient } from "@/lib/supabase";
import {
  EMPTY_WHOLESALE_LOGISTICS_FEE_FILTERS,
  EMPTY_WHOLESALE_LOGISTICS_STATUS_FILTERS,
  getWholesaleLogisticsFeePage,
  getWholesaleLogisticsStatusPage,
  type WholesaleLogisticsFeeFilters,
  type WholesaleLogisticsFeePage,
  type WholesaleLogisticsStatusFilters,
  type WholesaleLogisticsStatusPage,
} from "@/lib/wholesale-logistics-page";

export function useWholesaleLogisticsLists({
  initialFeePage,
  initialStatusPage,
}: {
  initialFeePage: WholesaleLogisticsFeePage;
  initialStatusPage: WholesaleLogisticsStatusPage;
}) {
  const [statusFilters, setStatusFilters] = useState(
    EMPTY_WHOLESALE_LOGISTICS_STATUS_FILTERS,
  );
  const [feeFilters, setFeeFilters] = useState(
    EMPTY_WHOLESALE_LOGISTICS_FEE_FILTERS,
  );
  const deferredStatusSearchText = useDeferredValue(statusFilters.searchText);
  const deferredFeeSearchText = useDeferredValue(feeFilters.searchText);
  const statusQueryFilters = {
    ...statusFilters,
    searchText: deferredStatusSearchText,
  };
  const feeQueryFilters = {
    ...feeFilters,
    searchText: deferredFeeSearchText,
  };

  const statusList = useLogisticsStatusPage({
    filters: statusQueryFilters,
    initialPage: initialStatusPage,
  });
  const feeList = useLogisticsFeePage({
    filters: feeQueryFilters,
    initialPage: initialFeePage,
  });

  return {
    feeFilters,
    feeList,
    setFeeFilters: (changes: Partial<WholesaleLogisticsFeeFilters>) =>
      setFeeFilters((current) => ({ ...current, ...changes })),
    setStatusFilters: (changes: Partial<WholesaleLogisticsStatusFilters>) =>
      setStatusFilters((current) => ({ ...current, ...changes })),
    statusFilters,
    statusList,
    clearFeeFilters: () =>
      setFeeFilters(EMPTY_WHOLESALE_LOGISTICS_FEE_FILTERS),
    clearStatusFilters: () =>
      setStatusFilters(EMPTY_WHOLESALE_LOGISTICS_STATUS_FILTERS),
  };
}

function useLogisticsStatusPage({
  filters,
  initialPage,
}: {
  filters: WholesaleLogisticsStatusFilters;
  initialPage: WholesaleLogisticsStatusPage;
}) {
  const [page, setPage] = useState<WholesaleLogisticsStatusPage | null>(
    initialPage,
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const filterKey = JSON.stringify(filters);
  const previousFilterKey = useRef(filterKey);
  const requestVersion = useRef(0);

  const loadFirstPage = useCallback(async () => {
    const supabase = getBrowserSupabaseClient();
    if (!supabase) {
      setLoadError("物流核对记录暂时没有加载成功，请刷新页面后重试。");
      return;
    }

    const version = ++requestVersion.current;
    setLoading(true);
    setLoadError(null);
    // 筛选变化时清空旧批次，避免把不符合新条件的记录误当成新结果。
    setPage(null);

    try {
      const nextPage = await getWholesaleLogisticsStatusPage(supabase, filters);
      if (version === requestVersion.current) setPage(nextPage);
    } catch (error) {
      if (version === requestVersion.current) {
        setLoadError(readLoadError(error, "物流核对记录暂时没有加载成功。"));
      }
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (previousFilterKey.current === filterKey) return;
    previousFilterKey.current = filterKey;
    void loadFirstPage();
  }, [filterKey, loadFirstPage]);

  const loadMore = useCallback(async () => {
    if (!page?.nextCursor || loadingMore) return;
    const supabase = getBrowserSupabaseClient();
    if (!supabase) {
      setLoadError("更多物流核对记录暂时没有加载成功，请刷新后重试。");
      return;
    }

    const version = requestVersion.current;
    setLoadingMore(true);
    setLoadError(null);
    try {
      const nextPage = await getWholesaleLogisticsStatusPage(
        supabase,
        filters,
        page.nextCursor,
      );
      if (version === requestVersion.current) {
        setPage((current) =>
          current ? mergeStatusPages(current, nextPage) : nextPage,
        );
      }
    } catch (error) {
      if (version === requestVersion.current) {
        setLoadError(readLoadError(error, "更多物流核对记录暂时没有加载成功。"));
      }
    } finally {
      if (version === requestVersion.current) setLoadingMore(false);
    }
  }, [filters, loadingMore, page]);

  return { loadError, loading, loadingMore, loadMore, page, reload: loadFirstPage };
}

function useLogisticsFeePage({
  filters,
  initialPage,
}: {
  filters: WholesaleLogisticsFeeFilters;
  initialPage: WholesaleLogisticsFeePage;
}) {
  const [page, setPage] = useState<WholesaleLogisticsFeePage | null>(initialPage);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const filterKey = JSON.stringify(filters);
  const previousFilterKey = useRef(filterKey);
  const requestVersion = useRef(0);

  const loadFirstPage = useCallback(async () => {
    const supabase = getBrowserSupabaseClient();
    if (!supabase) {
      setLoadError("物流费用记录暂时没有加载成功，请刷新页面后重试。");
      return;
    }

    const version = ++requestVersion.current;
    setLoading(true);
    setLoadError(null);
    setPage(null);
    try {
      const nextPage = await getWholesaleLogisticsFeePage(supabase, filters);
      if (version === requestVersion.current) setPage(nextPage);
    } catch (error) {
      if (version === requestVersion.current) {
        setLoadError(readLoadError(error, "物流费用记录暂时没有加载成功。"));
      }
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (previousFilterKey.current === filterKey) return;
    previousFilterKey.current = filterKey;
    void loadFirstPage();
  }, [filterKey, loadFirstPage]);

  const loadMore = useCallback(async () => {
    if (!page?.nextCursor || loadingMore) return;
    const supabase = getBrowserSupabaseClient();
    if (!supabase) {
      setLoadError("更多物流费用记录暂时没有加载成功，请刷新后重试。");
      return;
    }

    const version = requestVersion.current;
    setLoadingMore(true);
    setLoadError(null);
    try {
      const nextPage = await getWholesaleLogisticsFeePage(
        supabase,
        filters,
        page.nextCursor,
      );
      if (version === requestVersion.current) {
        setPage((current) =>
          current ? mergeFeePages(current, nextPage) : nextPage,
        );
      }
    } catch (error) {
      if (version === requestVersion.current) {
        setLoadError(readLoadError(error, "更多物流费用记录暂时没有加载成功。"));
      }
    } finally {
      if (version === requestVersion.current) setLoadingMore(false);
    }
  }, [filters, loadingMore, page]);

  return { loadError, loading, loadingMore, loadMore, page, reload: loadFirstPage };
}

function mergeStatusPages(
  current: WholesaleLogisticsStatusPage,
  next: WholesaleLogisticsStatusPage,
): WholesaleLogisticsStatusPage {
  return { ...next, rows: mergeRows(current.rows, next.rows) };
}

function mergeFeePages(
  current: WholesaleLogisticsFeePage,
  next: WholesaleLogisticsFeePage,
): WholesaleLogisticsFeePage {
  return { ...next, rows: mergeRows(current.rows, next.rows) };
}

function mergeRows<Row extends { id: string }>(current: Row[], next: Row[]) {
  return Array.from(
    new Map([...current, ...next].map((row) => [row.id, row])).values(),
  );
}

function readLoadError(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

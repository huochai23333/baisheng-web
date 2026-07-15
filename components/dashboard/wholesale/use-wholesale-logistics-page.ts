"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { getBrowserSupabaseClient } from "@/lib/supabase";
import {
  getInitialWholesaleLogisticsData,
  getWholesaleLogisticsPage,
  requestWholesaleLogisticsRefresh,
  type WholesaleLogisticsFilters,
  type WholesaleLogisticsPage,
  type WholesaleLogisticsStoreAssignment,
  type WholesaleLogisticsStoreOption,
} from "@/lib/wholesale-logistics-page";

import {
  assignWholesaleLogisticsStores,
  changeWholesaleLogisticsAssignment,
  endWholesaleLogisticsAssignment,
  type ChangeWholesaleLogisticsAssignmentInput,
} from "./wholesale-logistics-mutations";

type Feedback = {
  message: string;
  scope: "assignment" | "page";
  tone: "error" | "success";
} | null;

export function useWholesaleLogisticsPage({
  initialAssignments,
  initialFilters,
  initialPage,
  initialStoreOptions,
}: {
  initialAssignments: WholesaleLogisticsStoreAssignment[];
  initialFilters: WholesaleLogisticsFilters;
  initialPage: WholesaleLogisticsPage;
  initialStoreOptions: WholesaleLogisticsStoreOption[];
}) {
  const [filters, setFilters] = useState(initialFilters);
  const deferredSearchText = useDeferredValue(filters.searchText);
  const queryFilters = useMemo(
    () => ({ ...filters, searchText: deferredSearchText }),
    [deferredSearchText, filters],
  );
  const [page, setPage] = useState(initialPage);
  const [assignments, setAssignments] = useState(initialAssignments);
  const [storeOptions, setStoreOptions] = useState(initialStoreOptions);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [updatingSource, setUpdatingSource] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const requestVersion = useRef(0);
  const didRequestSourceRefresh = useRef(false);
  const filterKey = JSON.stringify(queryFilters);
  const previousFilterKey = useRef(filterKey);

  const reloadPage = useCallback(async () => {
    const supabase = getBrowserSupabaseClient();
    if (!supabase) {
      setLoadError("当前无法读取物流记录，请刷新页面后重试。");
      return;
    }

    const version = ++requestVersion.current;
    setLoading(true);
    setLoadError(null);
    try {
      const nextPage = await getWholesaleLogisticsPage(supabase, queryFilters);
      if (version === requestVersion.current) setPage(nextPage);
    } catch (error) {
      if (version === requestVersion.current) {
        setLoadError(readError(error, "物流记录暂时没有加载成功。"));
      }
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, [queryFilters]);

  const reloadAll = useCallback(async () => {
    const supabase = getBrowserSupabaseClient();
    if (!supabase) throw new Error("当前无法连接系统，请刷新页面后重试。");

    const data = await getInitialWholesaleLogisticsData(supabase, queryFilters);
    setAssignments(data.logisticsAssignments);
    setPage(data.logisticsPage);
    setStoreOptions(data.logisticsStoreOptions);
  }, [queryFilters]);

  useEffect(() => {
    if (previousFilterKey.current === filterKey) return;
    previousFilterKey.current = filterKey;
    void reloadPage();
  }, [filterKey, reloadPage]);

  useEffect(() => {
    if (didRequestSourceRefresh.current) return;
    didRequestSourceRefresh.current = true;

    const refresh = async () => {
      const supabase = getBrowserSupabaseClient();
      if (!supabase) return;

      setUpdatingSource(true);
      try {
        await requestWholesaleLogisticsRefresh(supabase);
        await reloadAll();
      } catch {
        // 自动更新失败时继续展示永久档案，避免短暂网络问题让整个物流页面不可用。
        setFeedback({
          message: "已显示现有物流记录，最新数据稍后会继续更新。",
          scope: "page",
          tone: "error",
        });
      } finally {
        setUpdatingSource(false);
      }
    };

    void refresh();
  }, [reloadAll]);

  const loadMore = useCallback(async () => {
    if (!page.nextCursor || loadingMore) return;
    const supabase = getBrowserSupabaseClient();
    if (!supabase) return;

    const version = requestVersion.current;
    setLoadingMore(true);
    setLoadError(null);
    try {
      const nextPage = await getWholesaleLogisticsPage(
        supabase,
        queryFilters,
        page.nextCursor,
      );
      if (version === requestVersion.current) {
        setPage((current) => ({
          ...nextPage,
          rows: mergeRows(current.rows, nextPage.rows),
        }));
      }
    } catch (error) {
      setLoadError(readError(error, "更多物流记录暂时没有加载成功。"));
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, page.nextCursor, queryFilters]);

  const runMutation = useCallback(
    async (key: string, successMessage: string, action: () => Promise<void>) => {
      setPendingKey(key);
      setFeedback(null);
      try {
        await action();
        await reloadAll();
        setFeedback({
          message: successMessage,
          scope: "assignment",
          tone: "success",
        });
        return true;
      } catch (error) {
        setFeedback({
          message: readMutationError(error),
          scope: "assignment",
          tone: "error",
        });
        return false;
      } finally {
        setPendingKey(null);
      }
    },
    [reloadAll],
  );

  return {
    assignments,
    feedback,
    filters,
    loadError,
    loading,
    loadingMore,
    page,
    pendingKey,
    storeOptions,
    updatingSource,
    clearFilters: () => setFilters(initialFilters),
    dismissFeedback: () => setFeedback(null),
    loadMore,
    reloadPage,
    setFilters: (changes: Partial<WholesaleLogisticsFilters>) =>
      setFilters((current) => ({ ...current, ...changes })),
    assignStores: (
      storeNames: string[],
      salesUserId: string,
      customerId: string | null,
    ) =>
      runMutation("assign", "店铺归属已保存。", async () => {
        const supabase = requireBrowserClient();
        await assignWholesaleLogisticsStores(supabase, {
          customerId,
          salesUserId,
          storeNames,
        });
      }),
    changeAssignment: (input: ChangeWholesaleLogisticsAssignmentInput) =>
      runMutation(`change:${input.assignmentId}`, "店铺归属已调整。", async () => {
        await changeWholesaleLogisticsAssignment(requireBrowserClient(), input);
      }),
    endAssignment: (assignmentId: string, effectiveTo: string) =>
      runMutation(`end:${assignmentId}`, "店铺归属已结束。", async () => {
        await endWholesaleLogisticsAssignment(
          requireBrowserClient(),
          assignmentId,
          effectiveTo,
        );
      }),
  };
}

function requireBrowserClient() {
  const supabase = getBrowserSupabaseClient();
  if (!supabase) throw new Error("当前无法连接系统，请刷新页面后重试。");
  return supabase;
}

function mergeRows<Row extends { id: string }>(current: Row[], next: Row[]) {
  return Array.from(
    new Map([...current, ...next].map((row) => [row.id, row])).values(),
  );
}

function readError(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function readMutationError(error: unknown) {
  const message = readError(error, "店铺归属暂时没有保存成功，请稍后重试。");
  if (message.includes("already_assigned")) return "所选店铺已经有归属记录。";
  if (message.includes("split_outside_range")) return "所选生效时间不在当前归属区间内。";
  if (message.includes("invalid_logistics_sales_user")) return "请选择正常使用中的业务员账号。";
  if (message.includes("manage_denied")) return "当前账号不能修改店铺归属。";
  return "店铺归属暂时没有保存成功，请稍后重试。";
}

"use client";

import * as FormControls from "@/components/ui/form-controls";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslations } from "next-intl";

import type { WholesaleCustomer, WholesaleOrder } from "@/lib/wholesale";
import { Button } from "@/components/ui/button";
import { DashboardFilterField } from "@/components/dashboard/dashboard-section-panel";
import { Select } from "@/components/ui/select";
import { getDefaultOrderDateRange } from "@/lib/order-date-range";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import { getWholesaleClaimOrderCandidatePage } from "@/lib/wholesale-claims-page";

import {
  formatWholesaleOrderLinkOption,
  getWholesaleOrderLinkOptionsForCustomer,
} from "./wholesale-order-link-options";

/**
 * 单条和批量认领共用同一份客户、多订单联动状态。
 * 客户改变后必须清空旧订单，防止把其他客户的订单编号提交到新认领组。
 */
export function useWholesaleClaimTarget({
  initialCustomerId = "",
  initialOrderIds = [],
  initialOrders = [],
}: {
  initialCustomerId?: string;
  initialOrderIds?: string[];
  initialOrders?: WholesaleOrder[];
}) {
  const [selectedCustomerId, setSelectedCustomerId] =
    useState(initialCustomerId);
  const [selectedOrderIds, setSelectedOrderIds] =
    useState<string[]>(initialOrderIds);
  const [orderSearchText, setOrderSearchText] = useState("");
  const [matchingOrders, setMatchingOrders] = useState(() =>
    getWholesaleOrderLinkOptionsForCustomer(initialOrders, initialCustomerId),
  );
  const [nextCursor, setNextCursor] = useState<{
    id: string;
    orderedAt: string;
  } | null>(null);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [candidateLoadingMore, setCandidateLoadingMore] = useState(false);
  const [candidateError, setCandidateError] = useState<string | null>(null);
  const [exactOrderNumber, setExactOrderNumber] = useState("");
  const [searchMode, setSearchMode] = useState<"date_range" | "exact_all_time">(
    "date_range",
  );
  const deferredSearchText = useDeferredValue(orderSearchText);
  const requestVersion = useRef(0);
  const includedOrderIds = useRef(initialOrderIds);
  const [dateRange] = useState(getDefaultOrderDateRange);

  const loadCandidates = useCallback(
    async (cursor: { id: string; orderedAt: string } | null = null) => {
      if (!selectedCustomerId) {
        setMatchingOrders([]);
        setNextCursor(null);
        return;
      }

      const supabase = getBrowserSupabaseClient();
      if (!supabase) {
        setCandidateError("批发订单选项暂时没有加载成功，请刷新页面后重试。");
        return;
      }

      const version = ++requestVersion.current;
      if (cursor) {
        setCandidateLoadingMore(true);
      } else {
        setCandidateLoading(true);
      }
      setCandidateError(null);

      try {
        const page = await getWholesaleClaimOrderCandidatePage(supabase, {
          cursor,
          customerId: selectedCustomerId,
          dateRange,
          exactOrderNumber,
          includeOrderIds: includedOrderIds.current,
          searchMode,
          searchText:
            searchMode === "date_range" ? deferredSearchText.trim() : "",
        });
        if (version !== requestVersion.current) return;
        setMatchingOrders((current) =>
          cursor ? mergeOrders(current, page.orders) : page.orders,
        );
        setNextCursor(page.nextCursor);
      } catch (error) {
        if (version === requestVersion.current) {
          setCandidateError(
            error instanceof Error
              ? error.message
              : "批发订单选项暂时没有加载成功，请稍后重试。",
          );
        }
      } finally {
        if (version === requestVersion.current) {
          setCandidateLoading(false);
          setCandidateLoadingMore(false);
        }
      }
    },
    [
      dateRange,
      deferredSearchText,
      exactOrderNumber,
      searchMode,
      selectedCustomerId,
    ],
  );

  useEffect(() => {
    void loadCandidates();
  }, [loadCandidates]);

  return {
    canSubmit: Boolean(selectedCustomerId && selectedOrderIds.length > 0),
    activateExactOrderSearch: () => {
      const orderNumber = orderSearchText.trim();
      if (!orderNumber) return false;
      setExactOrderNumber(orderNumber);
      setSearchMode("exact_all_time");
      return true;
    },
    candidateError,
    candidateLoading,
    candidateLoadingMore,
    exactSearchActive: searchMode === "exact_all_time",
    exitExactOrderSearch: () => {
      setExactOrderNumber("");
      setSearchMode("date_range");
    },
    hasMoreOrders: Boolean(nextCursor),
    loadMoreOrders: () => (nextCursor ? loadCandidates(nextCursor) : undefined),
    matchingOrders,
    orderSearchText,
    selectedCustomerId,
    selectedOrderIds,
    setOrderSearchText: (value: string) => {
      setOrderSearchText(value);
      if (searchMode === "exact_all_time") {
        setExactOrderNumber("");
        setSearchMode("date_range");
      }
    },
    setSelectedCustomerId: (customerId: string) => {
      setSelectedCustomerId(customerId);
      setSelectedOrderIds([]);
      setOrderSearchText("");
      setExactOrderNumber("");
      setSearchMode("date_range");
      includedOrderIds.current = [];
    },
    toggleOrder: (orderId: string) => {
      setSelectedOrderIds((current) =>
        current.includes(orderId)
          ? current.filter((selectedId) => selectedId !== orderId)
          : [...current, orderId],
      );
    },
    visibleOrders: matchingOrders,
  };
}

function mergeOrders(current: WholesaleOrder[], next: WholesaleOrder[]) {
  return Array.from(
    new Map([...current, ...next].map((order) => [order.id, order])).values(),
  );
}

export function WholesaleClaimTargetFields({
  candidateError,
  candidateLoading,
  candidateLoadingMore,
  customers,
  exactSearchActive,
  hasMoreOrders,
  matchingOrders,
  onExactSearch,
  onExitExactSearch,
  onCustomerChange,
  onLoadMoreOrders,
  onOrderSearchChange,
  onToggleOrder,
  orderSearchText,
  selectedCustomerId,
  selectedOrderIds,
  visibleOrders,
}: {
  candidateError: string | null;
  candidateLoading: boolean;
  candidateLoadingMore: boolean;
  customers: WholesaleCustomer[];
  exactSearchActive: boolean;
  hasMoreOrders: boolean;
  matchingOrders: WholesaleOrder[];
  onExactSearch: () => void;
  onExitExactSearch: () => void;
  onCustomerChange: (customerId: string) => void;
  onLoadMoreOrders: () => void;
  onOrderSearchChange: (value: string) => void;
  onToggleOrder: (orderId: string) => void;
  orderSearchText: string;
  selectedCustomerId: string;
  selectedOrderIds: string[];
  visibleOrders: WholesaleOrder[];
}) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_claims_dialogs",
  );

  return (
    <>
      <DashboardFilterField label={uiText("attribute005")}>
        <Select
          aria-label={uiText("attribute005")}
          name="customer_id"
          onValueChange={onCustomerChange}
          options={[
            { label: uiText("text009"), value: "" },
            ...customers.map((customer) => ({
              label: customer.unique_name,
              value: customer.id,
            })),
          ]}
          required
          value={selectedCustomerId}
        />
      </DashboardFilterField>

      <div className="grid min-w-0 gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-content-muted">
            {uiText("attribute006")}
          </span>
          <span className="text-xs text-content-muted">
            {uiText("selectedOrderCount", {
              count: selectedOrderIds.length,
            })}
          </span>
        </div>

        <FormControls.Input
          aria-label={uiText("orderSearchLabel")}
          className="h-11 min-w-0 rounded-control-default border border-border bg-surface-interactive px-3 text-sm text-content-strong outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-surface-inset"
          disabled={!selectedCustomerId}
          onChange={(event) => onOrderSearchChange(event.target.value)}
          placeholder={
            selectedCustomerId
              ? uiText("orderSearchPlaceholder")
              : uiText("selectCustomerFirst")
          }
          type="search"
          value={orderSearchText}
        />

        {selectedCustomerId ? (
          <div className="flex flex-wrap items-center gap-2">
            {exactSearchActive ? (
              <>
                <span className="rounded-full bg-surface-inset px-3 py-1.5 text-xs font-semibold text-content-muted">
                  {uiText("exactSearchActive")}
                </span>
                <Button
                  onClick={onExitExactSearch}
                  type="button"
                  variant="outline"
                  size="compact"
                >
                  {uiText("exitExactSearch")}
                </Button>
              </>
            ) : (
              <Button
                disabled={!orderSearchText.trim()}
                onClick={onExactSearch}
                type="button"
                variant="outline"
                size="compact"
              >
                {uiText("exactSearchAction")}
              </Button>
            )}
          </div>
        ) : null}

        {candidateError ? (
          <p className="text-sm leading-6 text-content-muted">
            {candidateError}
          </p>
        ) : null}

        <div
          aria-label={uiText("attribute006")}
          className="max-h-64 min-w-0 overflow-y-auto rounded-record-card border border-border bg-surface-inset p-2"
          role="group"
        >
          {!selectedCustomerId ? (
            <p className="px-2 py-4 text-sm leading-6 text-content-muted">
              {uiText("selectCustomerFirst")}
            </p>
          ) : candidateLoading ? (
            <p className="px-2 py-4 text-sm leading-6 text-content-muted">
              {uiText("loadingOrders")}
            </p>
          ) : matchingOrders.length === 0 ? (
            <p className="px-2 py-4 text-sm leading-6 text-status-warning">
              {uiText("text010")}
            </p>
          ) : (
            <div className="grid gap-1.5">
              {visibleOrders.map((order) => (
                <FormControls.ChoiceField
                  checked={selectedOrderIds.includes(order.id)}
                  key={order.id}
                  label={
                    <span className="min-w-0 break-words [overflow-wrap:anywhere]">
                      {formatWholesaleOrderLinkOption(order)}
                    </span>
                  }
                  onChange={() => onToggleOrder(order.id)}
                />
              ))}
            </div>
          )}
        </div>
        {hasMoreOrders ? (
          <Button
            disabled={candidateLoadingMore}
            onClick={onLoadMoreOrders}
            type="button"
            variant="outline"
            size="compact"
          >
            {candidateLoadingMore
              ? uiText("loadingOrders")
              : uiText("loadMoreOrders")}
          </Button>
        ) : null}
      </div>
    </>
  );
}

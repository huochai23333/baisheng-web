"use client";

import { useCallback, useMemo, useState } from "react";

import type { WholesaleOrder } from "@/lib/wholesale";

type UseWholesaleOrderRateSelectionOptions = {
  canUpdateSettlementRate: (order: WholesaleOrder) => boolean;
  orders: WholesaleOrder[];
};

export function useWholesaleOrderRateSelection({
  canUpdateSettlementRate,
  orders,
}: UseWholesaleOrderRateSelectionOptions) {
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(
    () => new Set(),
  );
  const selectedRateOrders = useMemo(
    () =>
      orders.filter(
        (order) => selectedOrderIds.has(order.id) && canUpdateSettlementRate(order),
      ),
    [canUpdateSettlementRate, orders, selectedOrderIds],
  );
  const clearSelectedOrders = useCallback(() => {
    setSelectedOrderIds(new Set());
  }, []);
  const toggleOrderSelection = useCallback((orderId: string, selected: boolean) => {
    setSelectedOrderIds((current) => {
      const next = new Set(current);

      if (selected) {
        next.add(orderId);
      } else {
        next.delete(orderId);
      }

      return next;
    });
  }, []);

  return {
    clearSelectedOrders,
    selectedOrderIds,
    selectedRateOrders,
    toggleOrderSelection,
  };
}

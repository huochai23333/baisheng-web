"use client";

import { useMemo } from "react";

import type { WholesaleOrderPage } from "@/lib/wholesale-order-page";

/**
 * 表格、手机卡片和弹窗共用同一组按订单 ID 建立的索引，避免每个展示组件重复遍历。
 */
export function useWholesaleOrderViewData(page: WholesaleOrderPage | null) {
  return useMemo(() => {
    const orders = page?.orders ?? [];

    return {
      logisticsOrdersByOrderId: groupByOrderId(
        page?.logisticsOrders ?? [],
        (row) => row.wholesale_order_id,
      ),
      logisticsStatusesByOrderId: groupByOrderId(
        page?.logisticsStatuses ?? [],
        (row) => row.wholesale_order_id,
      ),
      ordersById: new Map(orders.map((order) => [order.id, order])),
      orderSettlementsByOrderId: groupByOrderId(
        page?.orderSettlements ?? [],
        (row) => row.order_id,
      ),
      purchaseOrdersByOrderId: groupByOrderId(
        page?.purchaseOrders ?? [],
        (row) => row.wholesale_order_id,
      ),
    };
  }, [page]);
}

function groupByOrderId<Row>(
  rows: Row[],
  getOrderId: (row: Row) => string | null,
) {
  const grouped = new Map<string, Row[]>();

  for (const row of rows) {
    const orderId = getOrderId(row);
    if (!orderId) continue;
    grouped.set(orderId, [...(grouped.get(orderId) ?? []), row]);
  }

  return grouped;
}

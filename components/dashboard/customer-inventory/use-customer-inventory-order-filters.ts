"use client";

import { useMemo, useState } from "react";

import type {
  CustomerInventoryOrder,
  CustomerInventoryPageData,
  CustomerInventoryPaymentStatus,
} from "@/lib/customer-inventory-types";
import {
  getDefaultOrderDateRange,
  getOrderDatePresetRange,
  isOrderDateValue,
  type OrderDatePreset,
} from "@/lib/order-date-range";

import { getInventoryShanghaiDateKey } from "./customer-inventory-display";

export type InventoryOrderFilters = {
  currency: string;
  customerId: string;
  fromDate: string;
  keyword: string;
  paymentStatus: "all" | CustomerInventoryPaymentStatus;
  salesUserId: string;
  toDate: string;
};

type QuickOrderDatePreset = Exclude<OrderDatePreset, "custom">;

/**
 * 默认日期每次都按当前上海业务日期生成，不能在模块加载时写死。
 * 这样页面跨过午夜后再次恢复筛选，仍会回到真正的“最近30天”。
 */
export function createDefaultInventoryOrderFilters(): InventoryOrderFilters {
  const range = getDefaultOrderDateRange();

  return {
    currency: "all",
    customerId: "all",
    fromDate: range.fromDate,
    keyword: "",
    paymentStatus: "all",
    salesUserId: "all",
    toDate: range.toDate,
  };
}

/**
 * 订单筛选放在独立 view-model hook 中。
 * 展示区块只接收筛选后的订单，避免把搜索规则、表格和操作按钮塞进同一个组件。
 */
export function useCustomerInventoryOrderFilters(
  data: CustomerInventoryPageData,
) {
  const [filters, setFilters] = useState<InventoryOrderFilters>(() =>
    createDefaultInventoryOrderFilters(),
  );
  const customerNames = useMemo(
    () =>
      new Map(
        data.customers.map((customer) => [customer.id, customer.unique_name]),
      ),
    [data.customers],
  );
  const profileNames = useMemo(
    () =>
      new Map(
        data.profiles.map((profile) => [
          profile.user_id,
          profile.name ?? profile.email ?? profile.user_id,
        ]),
      ),
    [data.profiles],
  );
  const itemSearchText = useMemo(() => {
    const grouped = new Map<string, string[]>();
    for (const item of data.items) {
      const values = grouped.get(item.order_id) ?? [];
      values.push(item.product_name, item.source_url ?? "");
      grouped.set(item.order_id, values);
    }
    return new Map(
      Array.from(grouped, ([orderId, values]) => [
        orderId,
        values.join(" "),
      ]),
    );
  }, [data.items]);
  const filteredOrders = useMemo(
    () =>
      data.orders.filter((order) =>
        matchesInventoryOrder({
          customerName: customerNames.get(order.customer_id) ?? "",
          filters,
          itemText: itemSearchText.get(order.id) ?? "",
          order,
          salesmanName: profileNames.get(order.sales_user_id) ?? "",
        }),
      ),
    [customerNames, data.orders, filters, itemSearchText, profileNames],
  );
  const defaultFilters = createDefaultInventoryOrderFilters();
  // 起止日期共同表示一个筛选条件，因此日期范围发生变化时只显示一个活动条件。
  const activeFilterCount = [
    filters.currency !== defaultFilters.currency,
    filters.customerId !== defaultFilters.customerId,
    filters.fromDate !== defaultFilters.fromDate ||
      filters.toDate !== defaultFilters.toDate,
    filters.keyword !== defaultFilters.keyword,
    filters.paymentStatus !== defaultFilters.paymentStatus,
    filters.salesUserId !== defaultFilters.salesUserId,
  ].filter(Boolean).length;

  return {
    activeFilterCount,
    applyDatePreset: (preset: QuickOrderDatePreset) => {
      const range = getOrderDatePresetRange(preset);
      setFilters((current) => ({
        ...current,
        fromDate: range.fromDate,
        toDate: range.toDate,
      }));
    },
    clearFilters: () => setFilters(createDefaultInventoryOrderFilters()),
    filteredOrders,
    filters,
    setFilter: <Key extends keyof InventoryOrderFilters>(
      key: Key,
      value: InventoryOrderFilters[Key],
    ) =>
      setFilters((current) => {
        // 日期是必填范围。用户手动修改一端时，若新日期越过另一端，
        // 同步移动另一端，保证筛选始终是有效且连续的日期区间。
        if (
          (key === "fromDate" || key === "toDate") &&
          !isOrderDateValue(value)
        ) {
          return current;
        }

        const next = { ...current, [key]: value };
        if (key === "fromDate" && next.fromDate > next.toDate) {
          next.toDate = next.fromDate;
        }
        if (key === "toDate" && next.toDate < next.fromDate) {
          next.fromDate = next.toDate;
        }
        return next;
      }),
  };
}

function matchesInventoryOrder({
  customerName,
  filters,
  itemText,
  order,
  salesmanName,
}: {
  customerName: string;
  filters: InventoryOrderFilters;
  itemText: string;
  order: CustomerInventoryOrder;
  salesmanName: string;
}) {
  const keyword = normalizeSearchText(filters.keyword);
  const createdDate = getInventoryShanghaiDateKey(order.created_at);
  const searchableText = normalizeSearchText(
    [
      order.order_number,
      customerName,
      salesmanName,
      order.currency,
      order.notes,
      itemText,
    ].join(" "),
  );

  return (
    (!keyword || searchableText.includes(keyword)) &&
    (filters.customerId === "all" ||
      order.customer_id === filters.customerId) &&
    (filters.salesUserId === "all" ||
      order.sales_user_id === filters.salesUserId) &&
    (filters.paymentStatus === "all" ||
      order.payment_status === filters.paymentStatus) &&
    (filters.currency === "all" || order.currency === filters.currency) &&
    (!filters.fromDate || createdDate >= filters.fromDate) &&
    (!filters.toDate || createdDate <= filters.toDate)
  );
}

function normalizeSearchText(value: string | null) {
  return (value ?? "").trim().toLocaleLowerCase();
}

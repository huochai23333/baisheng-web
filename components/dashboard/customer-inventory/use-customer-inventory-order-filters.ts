"use client";

import { useMemo, useState } from "react";

import type {
  CustomerInventoryOrder,
  CustomerInventoryPageData,
  CustomerInventoryPaymentStatus,
} from "@/lib/customer-inventory-types";

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

const defaultOrderFilters: InventoryOrderFilters = {
  currency: "all",
  customerId: "all",
  fromDate: "",
  keyword: "",
  paymentStatus: "all",
  salesUserId: "all",
  toDate: "",
};

/**
 * 订单筛选放在独立 view-model hook 中。
 * 展示区块只接收筛选后的订单，避免把搜索规则、表格和操作按钮塞进同一个组件。
 */
export function useCustomerInventoryOrderFilters(
  data: CustomerInventoryPageData,
) {
  const [filters, setFilters] =
    useState<InventoryOrderFilters>(defaultOrderFilters);
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
  const filteredOrders = useMemo(
    () =>
      data.orders.filter((order) =>
        matchesInventoryOrder({
          customerName: customerNames.get(order.customer_id) ?? "",
          filters,
          order,
          salesmanName: profileNames.get(order.sales_user_id) ?? "",
        }),
      ),
    [customerNames, data.orders, filters, profileNames],
  );
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    const defaultValue =
      defaultOrderFilters[key as keyof InventoryOrderFilters];
    return value !== defaultValue;
  }).length;

  return {
    activeFilterCount,
    clearFilters: () => setFilters(defaultOrderFilters),
    filteredOrders,
    filters,
    setFilter: <Key extends keyof InventoryOrderFilters>(
      key: Key,
      value: InventoryOrderFilters[Key],
    ) => setFilters((current) => ({ ...current, [key]: value })),
  };
}

function matchesInventoryOrder({
  customerName,
  filters,
  order,
  salesmanName,
}: {
  customerName: string;
  filters: InventoryOrderFilters;
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

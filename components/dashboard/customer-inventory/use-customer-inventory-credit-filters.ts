"use client";

import { useMemo, useState } from "react";

import {
  getCustomerInventoryDueState,
  type CustomerInventoryCreditApplication,
  type CustomerInventoryCreditStatus,
  type CustomerInventoryCreditTier,
  type CustomerInventoryDueState,
  type CustomerInventoryPageData,
} from "@/lib/customer-inventory-types";

import { getInventoryShanghaiDateKey } from "./customer-inventory-display";

export type InventoryCreditFilters = {
  customerId: string;
  dueState: "all" | CustomerInventoryDueState;
  fromDate: string;
  keyword: string;
  status: "all" | CustomerInventoryCreditStatus;
  tier: "all" | CustomerInventoryCreditTier;
  toDate: string;
};

const defaultCreditFilters: InventoryCreditFilters = {
  customerId: "all",
  dueState: "all",
  fromDate: "",
  keyword: "",
  status: "all",
  tier: "all",
  toDate: "",
};

/**
 * 信贷筛选属于页面状态和数据派生逻辑，因此放在 view-model hook 中。
 * 卡片区只负责显示传入的信贷，后续新增筛选条件时也不会继续撑大区块组件。
 */
export function useCustomerInventoryCreditFilters({
  data,
  tierLabels,
}: {
  data: CustomerInventoryPageData;
  tierLabels: Record<CustomerInventoryCreditTier, string>;
}) {
  const [filters, setFilters] =
    useState<InventoryCreditFilters>(defaultCreditFilters);
  const customerNames = useMemo(
    () =>
      new Map(
        data.customers.map((customer) => [customer.id, customer.unique_name]),
      ),
    [data.customers],
  );
  const orderNumbers = useMemo(
    () => new Map(data.orders.map((order) => [order.id, order.order_number])),
    [data.orders],
  );
  const filteredCredits = useMemo(
    () =>
      data.credits.filter((credit) =>
        matchesInventoryCredit({
          credit,
          currentBusinessDate: data.currentBusinessDate,
          customerName: customerNames.get(credit.customer_id) ?? "",
          filters,
          orderNumber: orderNumbers.get(credit.order_id) ?? "",
          tierLabel: tierLabels[credit.tier],
        }),
      ),
    [
      customerNames,
      data.credits,
      data.currentBusinessDate,
      filters,
      orderNumbers,
      tierLabels,
    ],
  );
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    const defaultValue =
      defaultCreditFilters[key as keyof InventoryCreditFilters];
    return value !== defaultValue;
  }).length;

  return {
    activeFilterCount,
    clearFilters: () => setFilters(defaultCreditFilters),
    filteredCredits,
    filters,
    setFilter: <Key extends keyof InventoryCreditFilters>(
      key: Key,
      value: InventoryCreditFilters[Key],
    ) => setFilters((current) => ({ ...current, [key]: value })),
  };
}

function matchesInventoryCredit({
  credit,
  currentBusinessDate,
  customerName,
  filters,
  orderNumber,
  tierLabel,
}: {
  credit: CustomerInventoryCreditApplication;
  currentBusinessDate: string;
  customerName: string;
  filters: InventoryCreditFilters;
  orderNumber: string;
  tierLabel: string;
}) {
  const keyword = normalizeSearchText(filters.keyword);
  const applicationDate = getInventoryShanghaiDateKey(credit.created_at);
  const dueState = getCustomerInventoryDueState(credit, currentBusinessDate);
  const searchableText = normalizeSearchText(
    [
      orderNumber,
      customerName,
      tierLabel,
      credit.application_note,
      credit.review_note,
    ].join(" "),
  );

  return (
    (!keyword || searchableText.includes(keyword)) &&
    (filters.customerId === "all" ||
      credit.customer_id === filters.customerId) &&
    (filters.tier === "all" || credit.tier === filters.tier) &&
    (filters.status === "all" || credit.status === filters.status) &&
    (filters.dueState === "all" || dueState === filters.dueState) &&
    (!filters.fromDate || applicationDate >= filters.fromDate) &&
    (!filters.toDate || applicationDate <= filters.toDate)
  );
}

function normalizeSearchText(value: string | null) {
  return (value ?? "").trim().toLocaleLowerCase();
}

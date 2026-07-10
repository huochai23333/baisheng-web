"use client";

import { RefreshCcw } from "lucide-react";

import {
  DashboardFilterField,
  dashboardFilterInputClassName,
} from "@/components/dashboard/dashboard-section-panel";
import { Button } from "@/components/ui/button";
import type { WholesaleCustomer, WholesaleProfile } from "@/lib/wholesale";
import type { WholesaleOrderFilters } from "@/lib/wholesale-order-page";

type WholesaleOrderFiltersProps = {
  customers: WholesaleCustomer[];
  filters: WholesaleOrderFilters;
  hasActiveFilters: boolean;
  onClear: () => void;
  onUpdate: <Key extends keyof WholesaleOrderFilters>(
    key: Key,
    value: WholesaleOrderFilters[Key],
  ) => void;
  salesAccounts: WholesaleProfile[];
};

export function WholesaleOrderFiltersPanel({
  customers,
  filters,
  hasActiveFilters,
  onClear,
  onUpdate,
  salesAccounts,
}: WholesaleOrderFiltersProps) {
  return (
    <section className="rounded-[24px] border border-[#e7e2db] bg-white/90 p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#253640]">查找订单</h2>
          <p className="mt-1 text-sm text-[#71808d]">
            可以按订单、关联单号、客户、业务员、状态和日期查找。
          </p>
        </div>
        <Button
          className="rounded-full border border-[#d8dde2] bg-white text-[#486782] hover:bg-[#eef3f6]"
          disabled={!hasActiveFilters}
          onClick={onClear}
          type="button"
          variant="outline"
        >
          <RefreshCcw className="size-4" />
          清空筛选
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <DashboardFilterField label="搜索订单">
          <input
            className={dashboardFilterInputClassName}
            onChange={(event) => onUpdate("searchText", event.target.value)}
            placeholder="订单号、客户、1688 单号或物流号"
            type="search"
            value={filters.searchText}
          />
        </DashboardFilterField>
        <DashboardFilterField label="订单状态">
          <select
            className={dashboardFilterInputClassName}
            onChange={(event) =>
              onUpdate(
                "status",
                event.target.value as WholesaleOrderFilters["status"],
              )
            }
            value={filters.status}
          >
            <option value="all">全部状态</option>
            <option value="unsettled">未结汇</option>
            <option value="partial_settled">部分结汇</option>
            <option value="settled">已结汇</option>
          </select>
        </DashboardFilterField>
        <DashboardFilterField label="客户">
          <select
            className={dashboardFilterInputClassName}
            onChange={(event) => onUpdate("customerId", event.target.value)}
            value={filters.customerId}
          >
            <option value="">全部客户</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.unique_name}
              </option>
            ))}
          </select>
        </DashboardFilterField>
        <DashboardFilterField label="业务员">
          <select
            className={dashboardFilterInputClassName}
            onChange={(event) => onUpdate("salesUserId", event.target.value)}
            value={filters.salesUserId}
          >
            <option value="">全部业务员</option>
            {salesAccounts.map((profile) => (
              <option key={profile.user_id} value={profile.user_id}>
                {profile.name || profile.email}
              </option>
            ))}
          </select>
        </DashboardFilterField>
        <DashboardFilterField label="下单日期从">
          <input
            className={dashboardFilterInputClassName}
            onChange={(event) => {
              const nextDate = event.target.value;
              onUpdate("orderedFromDate", nextDate);

              if (
                filters.orderedToDate &&
                nextDate &&
                filters.orderedToDate < nextDate
              ) {
                onUpdate("orderedToDate", nextDate);
              }
            }}
            type="date"
            value={filters.orderedFromDate}
          />
        </DashboardFilterField>
        <DashboardFilterField label="下单日期到">
          <input
            className={dashboardFilterInputClassName}
            min={filters.orderedFromDate || undefined}
            onChange={(event) => onUpdate("orderedToDate", event.target.value)}
            type="date"
            value={filters.orderedToDate}
          />
        </DashboardFilterField>
      </div>
    </section>
  );
}

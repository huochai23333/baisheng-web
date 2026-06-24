"use client";

import { useMemo, useState } from "react";

import { RefreshCcw, Search, UserCheck, UsersRound } from "lucide-react";

import { DashboardDialog } from "@/components/dashboard/dashboard-dialog";
import {
  DashboardFilterField,
  DashboardFilterPanel,
  DashboardListSection,
  dashboardFilterInputClassName,
} from "@/components/dashboard/dashboard-section-panel";
import { DashboardSectionHeader } from "@/components/dashboard/dashboard-section-header";
import { EmptyState } from "@/components/dashboard/dashboard-shared-ui";
import { useLocale } from "@/components/i18n/locale-provider";
import { Button } from "@/components/ui/button";
import type { AdminPeoplePageData, AdminPersonRow } from "@/lib/admin-people";
import { cn } from "@/lib/utils";
import { normalizeSearchText } from "@/lib/value-normalizers";

import {
  getTourismPersonName,
  isTourismCustomer,
} from "./tourism-people-display";
import { TourismPersonDetails } from "./tourism-people-client";
import { TourismPeopleTable } from "./tourism-people-table";

const ALL = "all";

export function TourismCustomersClient({
  initialData,
}: {
  initialData: AdminPeoplePageData;
}) {
  const { locale } = useLocale();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [selectedCustomer, setSelectedCustomer] =
    useState<AdminPersonRow | null>(null);

  // 旅游客户从账号目录里筛出，但在业务下以独立客户板块展示。
  const tourismCustomers = useMemo(
    () => initialData.people.filter(isTourismCustomer),
    [initialData.people],
  );
  const filteredCustomers = useMemo(() => {
    const searchValue = normalizeSearchText(searchText);

    return tourismCustomers.filter((customer) => {
      if (statusFilter !== ALL && customer.status !== statusFilter) {
        return false;
      }

      if (!searchValue) {
        return true;
      }

      return [
        customer.name ?? "",
        customer.email ?? "",
        customer.phone ?? "",
        customer.city ?? "",
        customer.referral_code ?? "",
        customer.referrer_name ?? "",
        customer.referrer_email ?? "",
        customer.team_name ?? "",
      ].some((value) => normalizeSearchText(value).includes(searchValue));
    });
  }, [searchText, statusFilter, tourismCustomers]);
  const hasFilters = searchText || statusFilter !== ALL;
  const activeCount = tourismCustomers.filter(
    (customer) => customer.status === "active",
  ).length;

  if (!initialData.hasPermission) {
    return (
      <section className="mx-auto flex w-full max-w-[1320px] flex-col gap-8">
        <DashboardListSection
          description="只有正常启用的管理员账号可以查看旅游客户。"
          title="没有旅游客户管理权限"
        >
          <EmptyState
            description="请使用正常启用的管理员账号查看旅游客户。"
            icon={<UsersRound className="size-5" />}
            title="暂无权限"
          />
        </DashboardListSection>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-[1320px] flex-col gap-8">
      <DashboardSectionHeader
        badge="旅游业务"
        badgeIcon={<UsersRound className="size-4" />}
        description="这里单独查看旅游客户资料。账号身份、状态和城市调整仍在全局账号管理中处理。"
        metrics={[
          {
            accent: "blue",
            icon: <UsersRound className="size-5" />,
            label: "旅游客户",
            value: tourismCustomers.length,
          },
          {
            accent: "green",
            icon: <UserCheck className="size-5" />,
            label: "当前正常",
            value: activeCount,
          },
        ]}
        metricsClassName="grid-cols-1 sm:grid-cols-2"
        metricsPlacement="below"
        title="旅游客户管理"
      />

      <DashboardListSection
        actions={
          <Button
            className="rounded-full border border-[#d8dde2] bg-white text-[#486782] hover:bg-[#eef3f6]"
            disabled={!hasFilters}
            onClick={() => {
              setSearchText("");
              setStatusFilter(ALL);
            }}
            type="button"
            variant="outline"
          >
            <RefreshCcw className="size-4" />
            清空筛选
          </Button>
        }
        description={`共 ${tourismCustomers.length} 位客户，当前显示 ${filteredCustomers.length} 位。`}
        title="旅游客户"
      >
        <DashboardFilterPanel gridClassName="sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <DashboardFilterField label="搜索客户">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8a949c]" />
              <input
                className={cn(dashboardFilterInputClassName, "pl-10")}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="姓名、手机号、邮箱、城市或推荐码"
                type="search"
                value={searchText}
              />
            </div>
          </DashboardFilterField>
          <DashboardFilterField label="账号状态">
            <select
              className={dashboardFilterInputClassName}
              onChange={(event) => setStatusFilter(event.target.value)}
              value={statusFilter}
            >
              <option value={ALL}>全部状态</option>
              <option value="active">正常</option>
              <option value="inactive">未启用</option>
              <option value="suspended">已停用</option>
            </select>
          </DashboardFilterField>
        </DashboardFilterPanel>

        <div className="mt-5">
          <TourismPeopleTable
            locale={locale}
            onSelect={setSelectedCustomer}
            people={filteredCustomers}
            tab="customers"
          />
        </div>
      </DashboardListSection>

      <DashboardDialog
        onOpenChange={(open) => {
          if (!open) setSelectedCustomer(null);
        }}
        open={Boolean(selectedCustomer)}
        title={
          selectedCustomer
            ? getTourismPersonName(selectedCustomer)
            : "客户详情"
        }
      >
        {selectedCustomer ? (
          <TourismPersonDetails locale={locale} person={selectedCustomer} />
        ) : null}
      </DashboardDialog>
    </section>
  );
}

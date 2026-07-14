"use client";

import { LoaderCircle, PackageCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import {
  DashboardFilterField,
  DashboardFilterPanel,
  dashboardFilterInputClassName,
} from "@/components/dashboard/dashboard-section-panel";
import { PageBanner } from "@/components/dashboard/dashboard-shared-ui";
import { Button } from "@/components/ui/button";
import type {
  WholesaleCustomer,
  WholesaleOrderLinkOption,
} from "@/lib/wholesale";
import type {
  WholesaleLogisticsStatusFilters,
  WholesaleLogisticsStatusPage,
} from "@/lib/wholesale-logistics-page";

import { formatDateTime, getCustomerName } from "./wholesale-display";
import type { WholesaleLogisticsLinkTarget } from "./wholesale-logistics-dialogs";
import {
  WholesaleEmptyState,
  WholesalePanel,
  WholesaleStatusBadge,
  WholesaleTable,
  WholesaleTd,
  WholesaleTh,
  wholesaleStickyFirstTdClassName,
  wholesaleStickyFirstThClassName,
} from "./wholesale-ui";

export function WholesaleLogisticsStatusSection({
  canEdit,
  customers,
  customersById,
  filters,
  loadError,
  loading,
  loadingMore,
  onAssociate,
  onClearFilters,
  onFiltersChange,
  onLoadMore,
  onReload,
  onUnlink,
  ordersById,
  page,
  pendingKey,
}: {
  canEdit: boolean;
  customers: WholesaleCustomer[];
  customersById: Map<string, WholesaleCustomer>;
  filters: WholesaleLogisticsStatusFilters;
  loadError: string | null;
  loading: boolean;
  loadingMore: boolean;
  onAssociate: (target: WholesaleLogisticsLinkTarget) => void;
  onClearFilters: () => void;
  onFiltersChange: (changes: Partial<WholesaleLogisticsStatusFilters>) => void;
  onLoadMore: () => Promise<void>;
  onReload: () => Promise<void>;
  onUnlink: (target: WholesaleLogisticsLinkTarget) => void;
  ordersById: Map<string, WholesaleOrderLinkOption>;
  page: WholesaleLogisticsStatusPage | null;
  pendingKey: string | null;
}) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_logistics_section",
  );
  const t = useTranslations("WholesaleBusiness.logisticsUi");
  const locale = useLocale();
  const hasFilters =
    filters.searchText !== "" ||
    filters.customerId !== "" ||
    filters.linkState !== "all" ||
    filters.statusKind !== "all";

  return (
    <WholesalePanel
      description={uiText("statusListDescription")}
      title={uiText("attribute013")}
    >
      <DashboardFilterPanel
        className="mb-4 sm:mb-6"
        gridClassName="md:grid-cols-2 xl:grid-cols-4"
      >
        <DashboardFilterField label={uiText("filterKeyword")}>
          <input
            className={dashboardFilterInputClassName}
            onChange={(event) =>
              onFiltersChange({ searchText: event.target.value })
            }
            placeholder={uiText("statusSearchPlaceholder")}
            type="search"
            value={filters.searchText}
          />
        </DashboardFilterField>
        <DashboardFilterField label={uiText("filterCustomer")}>
          <select
            className={dashboardFilterInputClassName}
            onChange={(event) =>
              onFiltersChange({ customerId: event.target.value })
            }
            value={filters.customerId}
          >
            <option value="">{uiText("allCustomers")}</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.unique_name}
              </option>
            ))}
          </select>
        </DashboardFilterField>
        <DashboardFilterField label={uiText("filterLinkState")}>
          <select
            className={dashboardFilterInputClassName}
            onChange={(event) =>
              onFiltersChange({
                linkState: event.target
                  .value as WholesaleLogisticsStatusFilters["linkState"],
              })
            }
            value={filters.linkState}
          >
            <option value="all">{uiText("allLinkStates")}</option>
            <option value="linked">{uiText("linkedOnly")}</option>
            <option value="unlinked">{uiText("unlinkedOnly")}</option>
          </select>
        </DashboardFilterField>
        <DashboardFilterField label={uiText("filterStatus")}>
          <select
            className={dashboardFilterInputClassName}
            onChange={(event) =>
              onFiltersChange({
                statusKind: event.target
                  .value as WholesaleLogisticsStatusFilters["statusKind"],
              })
            }
            value={filters.statusKind}
          >
            <option value="all">{uiText("allStatuses")}</option>
            <option value="checking">{t("statuses.checking")}</option>
            <option value="delivered">{t("statuses.delivered")}</option>
            <option value="exception">{t("statuses.exception")}</option>
            <option value="stopped">{t("statuses.stopped")}</option>
          </select>
        </DashboardFilterField>
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 md:col-span-2 xl:col-span-4">
          <p className="break-words text-sm leading-6 text-[#6f7b85] [overflow-wrap:anywhere]">
            {uiText("showingCount", {
              shown: page?.rows.length ?? 0,
              total: page?.totalCount ?? 0,
            })}
          </p>
          <Button
            className="min-h-9 rounded-full px-3"
            disabled={!hasFilters}
            onClick={onClearFilters}
            type="button"
            variant="outline"
          >
            {uiText("clearFilters")}
          </Button>
        </div>
      </DashboardFilterPanel>

      {loadError ? (
        <div className="mb-4 space-y-3 sm:mb-6">
          <PageBanner tone="error">{loadError}</PageBanner>
          <Button onClick={() => void onReload()} type="button" variant="outline">
            {uiText("retry")}
          </Button>
        </div>
      ) : null}

      {loading ? (
        <div className="flex min-h-36 items-center justify-center gap-2 text-sm text-[#6f7b85]">
          <LoaderCircle className="size-4 animate-spin" />
          {uiText("loading")}
        </div>
      ) : page && page.rows.length === 0 ? (
        <WholesaleEmptyState
          description={
            hasFilters ? uiText("filteredEmpty") : uiText("attribute014")
          }
          icon={<PackageCheck className="size-5" />}
          title={uiText("attribute015")}
        />
      ) : page ? (
        <>
          <WholesaleTable minWidth={canEdit ? 1380 : 1180}>
            <thead>
              <tr>
                <WholesaleTh className={wholesaleStickyFirstThClassName}>
                  {uiText("text004")}
                </WholesaleTh>
                <WholesaleTh>{uiText("text005")}</WholesaleTh>
                <WholesaleTh>{uiText("text006")}</WholesaleTh>
                <WholesaleTh>{uiText("text007")}</WholesaleTh>
                <WholesaleTh>{uiText("text008")}</WholesaleTh>
                <WholesaleTh>{uiText("text009")}</WholesaleTh>
                <WholesaleTh>{uiText("text010")}</WholesaleTh>
                {canEdit ? <WholesaleTh>{uiText("actions")}</WholesaleTh> : null}
              </tr>
            </thead>
            <tbody>
              {page.rows.map((row) => {
                const rowPending =
                  pendingKey === `logistics-link:status:${row.id}`;
                const target: WholesaleLogisticsLinkTarget = {
                  customerId: row.customer_id,
                  recordId: row.id,
                  recordType: "status",
                  trackingNumber: row.tracking_number,
                  wholesaleOrderId: row.wholesale_order_id,
                };

                return (
                  <tr className="group" key={row.id}>
                    <WholesaleTd className={wholesaleStickyFirstTdClassName}>
                      <div className="font-semibold [overflow-wrap:anywhere]">
                        {row.tracking_number}
                      </div>
                      {row.last_error ? (
                        <div className="mt-2 text-xs leading-5 text-[#a46a1f]">
                          {uiText("text011")}
                        </div>
                      ) : null}
                    </WholesaleTd>
                    <WholesaleTd className="min-w-[160px] whitespace-normal">
                      {row.customer_id
                        ? getCustomerName(customersById, row.customer_id)
                        : row.customer_name}
                    </WholesaleTd>
                    <WholesaleTd className="min-w-[160px] whitespace-normal">
                      {row.wholesale_order_id
                        ? (ordersById.get(row.wholesale_order_id)?.order_number ??
                          t("notLinked"))
                        : t("notLinked")}
                    </WholesaleTd>
                    <WholesaleTd className="min-w-[240px] whitespace-normal">
                      {row.status_text}
                    </WholesaleTd>
                    <WholesaleTd>
                      <WholesaleStatusBadge tone={getLogisticsStatusTone(row.status_kind)}>
                        {t(`statuses.${row.status_kind}`)}
                      </WholesaleStatusBadge>
                    </WholesaleTd>
                    <WholesaleTd>
                      {formatDateTime(row.last_checked_at, t("notRecorded"), locale)}
                    </WholesaleTd>
                    <WholesaleTd>
                      {row.is_terminal
                        ? t("stoppedChecking")
                        : formatDateTime(
                            row.next_check_at,
                            t("notRecorded"),
                            locale,
                          )}
                    </WholesaleTd>
                    {canEdit ? (
                      <WholesaleTd className="min-w-[190px] whitespace-normal">
                        {row.can_manage_link ? (
                          <div className="flex flex-wrap gap-2">
                            <Button
                              className="h-auto min-h-8 whitespace-normal px-3 py-2 text-center leading-5"
                              disabled={rowPending}
                              onClick={() => onAssociate(target)}
                              type="button"
                              variant="outline"
                            >
                              {uiText(
                                row.wholesale_order_id
                                  ? "adjustLink"
                                  : "associateOrder",
                              )}
                            </Button>
                            {row.wholesale_order_id ? (
                              <Button
                                className="h-auto min-h-8 whitespace-normal px-3 py-2 text-center leading-5"
                                disabled={rowPending}
                                onClick={() => onUnlink(target)}
                                type="button"
                                variant="destructive"
                              >
                                {uiText("unlink")}
                              </Button>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-xs text-[#7d8890]">
                            {uiText("viewOnly")}
                          </span>
                        )}
                      </WholesaleTd>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </WholesaleTable>
          {page.nextCursor ? (
            <div className="mt-4 flex justify-center sm:mt-6">
              <Button
                className="min-h-10 rounded-full px-5"
                disabled={loadingMore}
                onClick={() => void onLoadMore()}
                type="button"
                variant="outline"
              >
                {loadingMore ? <LoaderCircle className="size-4 animate-spin" /> : null}
                {uiText("loadMore")}
              </Button>
            </div>
          ) : null}
        </>
      ) : null}
    </WholesalePanel>
  );
}

function getLogisticsStatusTone(statusKind: string) {
  if (statusKind === "delivered") return "success";
  if (statusKind === "exception" || statusKind === "stopped") return "danger";
  return "warning";
}

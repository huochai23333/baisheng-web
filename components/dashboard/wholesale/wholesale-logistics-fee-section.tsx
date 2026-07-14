"use client";

import { LoaderCircle, ReceiptText } from "lucide-react";
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
  WholesaleLogisticsFeeFilters,
  WholesaleLogisticsFeePage,
} from "@/lib/wholesale-logistics-page";

import {
  formatCurrency,
  formatDateTime,
  getCustomerName,
} from "./wholesale-display";
import type { WholesaleLogisticsLinkTarget } from "./wholesale-logistics-dialogs";
import {
  WholesaleEmptyState,
  WholesalePanel,
  WholesaleTable,
  WholesaleTd,
  WholesaleTh,
  wholesaleStickyFirstTdClassName,
  wholesaleStickyFirstThClassName,
} from "./wholesale-ui";

export function WholesaleLogisticsFeeSection({
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
  filters: WholesaleLogisticsFeeFilters;
  loadError: string | null;
  loading: boolean;
  loadingMore: boolean;
  onAssociate: (target: WholesaleLogisticsLinkTarget) => void;
  onClearFilters: () => void;
  onFiltersChange: (changes: Partial<WholesaleLogisticsFeeFilters>) => void;
  onLoadMore: () => Promise<void>;
  onReload: () => Promise<void>;
  onUnlink: (target: WholesaleLogisticsLinkTarget) => void;
  ordersById: Map<string, WholesaleOrderLinkOption>;
  page: WholesaleLogisticsFeePage | null;
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
    filters.linkState !== "all";

  return (
    <WholesalePanel
      description={uiText("feeListDescription")}
      title={uiText("attribute017")}
    >
      <DashboardFilterPanel
        className="mb-4 sm:mb-6"
        gridClassName="md:grid-cols-2 xl:grid-cols-3"
      >
        <DashboardFilterField label={uiText("filterKeyword")}>
          <input
            className={dashboardFilterInputClassName}
            onChange={(event) =>
              onFiltersChange({ searchText: event.target.value })
            }
            placeholder={uiText("feeSearchPlaceholder")}
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
                  .value as WholesaleLogisticsFeeFilters["linkState"],
              })
            }
            value={filters.linkState}
          >
            <option value="all">{uiText("allLinkStates")}</option>
            <option value="linked">{uiText("linkedOnly")}</option>
            <option value="unlinked">{uiText("unlinkedOnly")}</option>
          </select>
        </DashboardFilterField>
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 md:col-span-2 xl:col-span-3">
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
            hasFilters ? uiText("filteredEmpty") : uiText("feeEmptyDescription")
          }
          icon={<ReceiptText className="size-5" />}
          title={uiText("feeEmptyTitle")}
        />
      ) : page ? (
        <>
          <WholesaleTable minWidth={canEdit ? 1420 : 1180}>
            <thead>
              <tr>
                <WholesaleTh className={wholesaleStickyFirstThClassName}>
                  {uiText("text012")}
                </WholesaleTh>
                <WholesaleTh>{uiText("text013")}</WholesaleTh>
                <WholesaleTh>{uiText("text014")}</WholesaleTh>
                <WholesaleTh>{uiText("text015")}</WholesaleTh>
                <WholesaleTh>{uiText("text016")}</WholesaleTh>
                <WholesaleTh>{uiText("text017")}</WholesaleTh>
                <WholesaleTh>{uiText("text018")}</WholesaleTh>
                <WholesaleTh>{uiText("text019")}</WholesaleTh>
                {canEdit ? <WholesaleTh>{uiText("actions")}</WholesaleTh> : null}
              </tr>
            </thead>
            <tbody>
              {page.rows.map((row) => {
                const rowPending = pendingKey === `logistics-link:fee:${row.id}`;
                const target: WholesaleLogisticsLinkTarget = {
                  customerId: row.customer_id,
                  recordId: row.id,
                  recordType: "fee",
                  trackingNumber: row.international_tracking_number,
                  wholesaleOrderId: row.wholesale_order_id,
                };

                return (
                  <tr className="group" key={row.id}>
                    <WholesaleTd className={wholesaleStickyFirstTdClassName}>
                      <div className="font-semibold [overflow-wrap:anywhere]">
                        {row.international_tracking_number}
                      </div>
                      <div className="mt-2 break-words text-xs leading-5 text-[#71808d] [overflow-wrap:anywhere]">
                        {uiText("text020")}
                        {row.destination_tracking_number ?? t("notRecorded")}
                      </div>
                    </WholesaleTd>
                    <WholesaleTd className="min-w-[160px] whitespace-normal">
                      {getCustomerName(customersById, row.customer_id)}
                    </WholesaleTd>
                    <WholesaleTd className="min-w-[160px] whitespace-normal">
                      {row.source_workflow_order_number ?? t("notRecorded")}
                    </WholesaleTd>
                    <WholesaleTd className="min-w-[160px] whitespace-normal">
                      {row.wholesale_order_id
                        ? (ordersById.get(row.wholesale_order_id)?.order_number ??
                          t("notLinked"))
                        : t("notLinked")}
                    </WholesaleTd>
                    <WholesaleTd className="min-w-[140px] whitespace-normal">
                      {row.freight_forwarder ?? t("notRecorded")}
                    </WholesaleTd>
                    <WholesaleTd className="min-w-[220px] whitespace-normal">
                      {row.latest_status ?? t("notRecorded")}
                    </WholesaleTd>
                    <WholesaleTd>
                      {formatCurrency(row.logistics_fee, row.currency)}
                    </WholesaleTd>
                    <WholesaleTd>
                      {formatDateTime(
                        row.latest_checkpoint_at ?? row.updated_at,
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

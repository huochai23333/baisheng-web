"use client";

import { memo } from "react";

import { useTranslations } from "next-intl";
import { ClipboardList, Plus } from "lucide-react";

import { useLocale } from "@/components/i18n/locale-provider";
import {
  type AdminOrderRow,
  type AdminOrdersFilters,
} from "@/lib/admin-orders";
import { type OrderDatePreset } from "@/lib/order-date-range";

import { Button } from "../../ui/button";
import {
  DashboardOrderListSection,
  DashboardOrderPaginationActions,
} from "../dashboard-order-list-section";
import { DashboardSectionHeader } from "../dashboard-section-header";
import { DashboardTableFrame } from "../dashboard-section-panel";
import { EmptyState, formatDateTime } from "../dashboard-shared-ui";
import {
  OrderHeaderCell,
  OrderStatusChip,
  OrderTypeChip,
  OrderValueCell,
} from "./admin-orders-ui";
import {
  formatMoneyValue,
  createOrdersUiCopy,
  getOrderTypeMetaFromCategory,
  resolveOrderTypeMeta,
  resolveOrderUserLabel,
} from "./admin-orders-utils";
import { AdminOrdersFilterPanel } from "./admin-orders-filters";

type OrdersHeaderSectionProps = {
  badge: string;
  canCreateOrders: boolean;
  canOpenCreateDialog: boolean;
  createTitle: string;
  description: string;
  noCreateTargetHint: string | null;
  onCreate: () => void;
  title: string;
};

type OrdersPaginationState = {
  endIndex: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
  page: number;
  pageCount: number;
  startIndex: number;
  totalItems: number;
};

type OrdersTableSectionProps = {
  canViewOrderCosts: boolean;
  filters: AdminOrdersFilters;
  matchedOrdersCount: number;
  onClearFilters: () => void;
  onCreatedFromDateChange: (value: string) => void;
  onCreatedToDateChange: (value: string) => void;
  onDatePresetChange: (preset: Exclude<OrderDatePreset, "custom">) => void;
  onExitExactAllTimeSearch: () => void;
  onOrderEntryUserChange: (value: string) => void;
  onOrderNumberChange: (value: string) => void;
  onOrderingUserChange: (value: string) => void;
  onSearchExactOrderAllTime: () => void;
  onSelectOrder: (order: AdminOrderRow) => void;
  orderTypeMetaById: Map<
    string,
    ReturnType<typeof getOrderTypeMetaFromCategory>
  >;
  pagination: OrdersPaginationState;
  rows: AdminOrderRow[];
  showCreatedAtColumn: boolean;
  showOrderEntryColumn: boolean;
  showOrderEntryFilter: boolean;
  showOrderingColumn: boolean;
  showOrderingFilter: boolean;
  summary: {
    completed: number;
    pending: number;
    total: number;
  };
  totalOrdersCount: number;
  userLabelById: Map<string, string>;
};

export const OrdersHeaderSection = memo(function OrdersHeaderSection({
  badge,
  canCreateOrders,
  canOpenCreateDialog,
  createTitle,
  description,
  noCreateTargetHint,
  onCreate,
  title,
}: OrdersHeaderSectionProps) {
  return (
    <DashboardSectionHeader
      actions={
        canCreateOrders ? (
          <Button
            variant="primary"
            size="default"
            disabled={!canOpenCreateDialog}
            onClick={onCreate}
            type="button"
          >
            <Plus className="size-4" />
            {createTitle}
          </Button>
        ) : null
      }
      asideFooter={
        noCreateTargetHint && !canOpenCreateDialog ? (
          <p className="text-sm text-content-muted">{noCreateTargetHint}</p>
        ) : null
      }
      badge={badge}
      contentClassName="max-w-2xl"
      description={description}
      title={title}
    />
  );
});

export const OrdersTableSection = memo(function OrdersTableSection({
  canViewOrderCosts,
  filters,
  matchedOrdersCount,
  onClearFilters,
  onCreatedFromDateChange,
  onCreatedToDateChange,
  onDatePresetChange,
  onExitExactAllTimeSearch,
  onOrderEntryUserChange,
  onOrderNumberChange,
  onOrderingUserChange,
  onSearchExactOrderAllTime,
  onSelectOrder,
  orderTypeMetaById,
  pagination,
  rows,
  showCreatedAtColumn,
  showOrderEntryColumn,
  showOrderEntryFilter,
  showOrderingColumn,
  showOrderingFilter,
  summary,
  totalOrdersCount,
  userLabelById,
}: OrdersTableSectionProps) {
  const t = useTranslations("Orders");
  const ordersUiT = useTranslations("OrdersUI");
  const frameworkT = useTranslations("OrderListFramework");
  const { locale } = useLocale();
  const orderUiCopy = createOrdersUiCopy(ordersUiT);

  return (
    <>
      <AdminOrdersFilterPanel
        filters={filters}
        matchedOrdersCount={matchedOrdersCount}
        onClearFilters={onClearFilters}
        onCreatedFromDateChange={onCreatedFromDateChange}
        onCreatedToDateChange={onCreatedToDateChange}
        onDatePresetChange={onDatePresetChange}
        onExitExactAllTimeSearch={onExitExactAllTimeSearch}
        onOrderEntryUserChange={onOrderEntryUserChange}
        onOrderNumberChange={onOrderNumberChange}
        onOrderingUserChange={onOrderingUserChange}
        onSearchExactOrderAllTime={onSearchExactOrderAllTime}
        showOrderEntryFilter={showOrderEntryFilter}
        showOrderingFilter={showOrderingFilter}
        totalOrdersCount={totalOrdersCount}
      />

      <DashboardOrderListSection
        controls={
          matchedOrdersCount > 0 ? (
            <DashboardOrderPaginationActions
              hasNextPage={pagination.hasNextPage}
              hasPreviousPage={pagination.hasPreviousPage}
              onNextPage={pagination.onNextPage}
              onPreviousPage={pagination.onPreviousPage}
              page={pagination.page}
              pageCount={pagination.pageCount}
            />
          ) : undefined
        }
        description={frameworkT("list.description")}
        progress={
          matchedOrdersCount > 0
            ? {
                end: pagination.endIndex,
                kind: "range",
                start: pagination.startIndex,
                total: pagination.totalItems,
                unit: "orders",
              }
            : null
        }
        title={frameworkT("list.title")}
      >
        <div className="mb-5 grid gap-2 text-sm sm:grid-cols-3">
          <p className="rounded-xl bg-surface-inset px-3 py-2 text-content-muted">
            {t("summary.total")}:{" "}
            <strong className="text-content-strong">{summary.total}</strong>
          </p>
          <p className="rounded-xl bg-surface-inset px-3 py-2 text-content-muted">
            {t("summary.pending")}:{" "}
            <strong className="text-content-strong">{summary.pending}</strong>
          </p>
          <p className="rounded-xl bg-surface-inset px-3 py-2 text-content-muted">
            {t("summary.completed")}:{" "}
            <strong className="text-content-strong">{summary.completed}</strong>
          </p>
        </div>

        {matchedOrdersCount === 0 ? (
          <EmptyState
            description={t("states.noMatchDescription")}
            icon={<ClipboardList className="size-6" />}
            title={t("states.noMatchTitle")}
          />
        ) : (
          <DashboardTableFrame>
            <table className="min-w-[1120px] w-full table-fixed border-collapse">
              <thead className="bg-surface-inset">
                <tr className="border-b border-border-subtle">
                  <OrderHeaderCell>{t("table.orderNumber")}</OrderHeaderCell>
                  <OrderHeaderCell>{t("table.rmbAmount")}</OrderHeaderCell>
                  <OrderHeaderCell>{t("table.serviceFee")}</OrderHeaderCell>
                  {canViewOrderCosts ? (
                    <OrderHeaderCell>{t("table.costAmount")}</OrderHeaderCell>
                  ) : null}
                  {showOrderEntryColumn ? (
                    <OrderHeaderCell>
                      {t("table.orderEntryUser")}
                    </OrderHeaderCell>
                  ) : null}
                  {showOrderingColumn ? (
                    <OrderHeaderCell>{t("table.orderingUser")}</OrderHeaderCell>
                  ) : null}
                  <OrderHeaderCell>{t("table.orderStatus")}</OrderHeaderCell>
                  <OrderHeaderCell>{t("table.orderType")}</OrderHeaderCell>
                  {showCreatedAtColumn ? (
                    <OrderHeaderCell>{t("table.createdAt")}</OrderHeaderCell>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {rows.map((order) => (
                  <tr
                    key={order.order_number}
                    className="cursor-pointer border-b border-border-subtle transition-colors hover:bg-surface-inset last:border-b-0"
                    onClick={() => onSelectOrder(order)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelectOrder(order);
                      }
                    }}
                    tabIndex={0}
                  >
                    <OrderValueCell strong value={order.order_number} />
                    <OrderValueCell
                      value={formatMoneyValue(order.rmb_amount, locale)}
                    />
                    <OrderValueCell
                      value={formatMoneyValue(order.service_fee_amount, locale)}
                    />
                    {canViewOrderCosts ? (
                      <OrderValueCell
                        value={formatMoneyValue(order.cost_amount, locale)}
                      />
                    ) : null}
                    {showOrderEntryColumn ? (
                      <OrderValueCell
                        value={resolveOrderUserLabel(
                          order.order_entry_user,
                          userLabelById,
                        )}
                      />
                    ) : null}
                    {showOrderingColumn ? (
                      <OrderValueCell
                        value={resolveOrderUserLabel(
                          order.ordering_user,
                          userLabelById,
                        )}
                      />
                    ) : null}
                    <OrderValueCell
                      value={<OrderStatusChip status={order.order_status} />}
                    />
                    <OrderValueCell
                      value={
                        <OrderTypeChip
                          meta={resolveOrderTypeMeta(
                            order.order_type,
                            orderTypeMetaById,
                            orderUiCopy,
                          )}
                        />
                      }
                    />
                    {showCreatedAtColumn ? (
                      <OrderValueCell
                        value={formatDateTime(order.created_at, locale)}
                      />
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </DashboardTableFrame>
        )}
      </DashboardOrderListSection>
    </>
  );
});

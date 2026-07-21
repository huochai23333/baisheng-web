"use client";
import { UiMessage } from "@/components/i18n/ui-message";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hasWholesaleOrderInternalFields } from "@/lib/wholesale";
import type { WholesaleOrderListItem } from "@/lib/wholesale";
import { useWholesaleOrderFilters } from "./use-wholesale-order-filters";
import { useWholesaleOrderPage } from "./use-wholesale-order-page";
import { useWholesaleOrderListHandlers } from "./use-wholesale-order-list-handlers";
import { WholesaleOrderAssessmentPanel } from "./wholesale-order-assessment-panel";
import { WholesaleOrderChangeSections } from "./wholesale-order-change-sections";
import { WholesaleOrderEditDialog } from "./wholesale-order-edit-dialog";
import {
  canCurrentUserManageWholesaleOrder,
  getWholesaleOrderEditMode,
} from "./wholesale-order-edit-rules";
import { WholesaleOrderFiltersPanel } from "./wholesale-order-filters";
import { WholesaleOrderFormDialog } from "./wholesale-order-form-dialog";
import { WholesaleOrderSettlementDialog } from "./wholesale-order-rate-dialogs";
import { WholesaleOrderSummary } from "./wholesale-order-summary";
import { useWholesaleOrderViewData } from "./wholesale-order-view-data";
import { WholesaleOrdersListSection } from "./wholesale-orders-list-section";
import type { WholesaleOrderEditAction } from "./wholesale-orders-table";
import type { WholesaleOrdersSectionProps } from "./wholesale-orders-section-types";
import { WholesalePageShell } from "./wholesale-ui";
export function WholesaleOrdersSection({
  canBypassEditWindow,
  canEdit,
  canManageEveryOrder,
  canReassignOrder,
  canReviewOrderEditRequests,
  currentRole,
  currentUserId,
  customers,
  customersById,
  exchangeRates,
  initialPage,
  onApproveOrderEditRequest,
  onCreateOrder,
  onDeleteOrderListAttachment,
  onMarkOrderSettled,
  onRejectOrderEditRequest,
  onRequestOrderEdit,
  onUpdateOrder,
  onUploadOrderListAttachments,
  orderEditWindowDays,
  pendingKey,
  profilesById,
  salesAccounts,
}: WholesaleOrdersSectionProps) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_orders_section",
  );
  const t = useTranslations("WholesaleBusiness.ordersUi");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedEditOrder, setSelectedEditOrder] =
    useState<WholesaleOrderListItem | null>(null);
  const [selectedSettlementOrder, setSelectedSettlementOrder] =
    useState<WholesaleOrderListItem | null>(null);
  const filterState = useWholesaleOrderFilters();
  const pageState = useWholesaleOrderPage({
    filters: filterState.queryFilters,
    initialPage,
  });
  const page = pageState.page;
  const viewData = useWholesaleOrderViewData(page);
  const assessmentFilters = useMemo(
    () => ({
      customerId: filterState.queryFilters.customerId,
      orderedFromDate: filterState.queryFilters.orderedFromDate,
      orderedToDate: filterState.queryFilters.orderedToDate,
      salesUserId: filterState.queryFilters.salesUserId,
      searchText: filterState.queryFilters.searchText,
      status: filterState.queryFilters.status,
    }),
    [filterState.queryFilters],
  );
  const canMarkOrderSettled = useCallback(
    (order: WholesaleOrderListItem) =>
      order.status !== "settled" &&
      canCurrentUserManageWholesaleOrder({
        canEdit,
        canManageEveryOrder,
        currentUserId,
        customer: customersById.get(order.customer_id),
        order,
      }),
    [canEdit, canManageEveryOrder, currentUserId, customersById],
  );
  const getOrderEditAction = useCallback(
    (order: WholesaleOrderListItem): WholesaleOrderEditAction | null => {
      if (
        !hasWholesaleOrderInternalFields(order) ||
        !canCurrentUserManageWholesaleOrder({
          canEdit,
          canManageEveryOrder,
          currentUserId,
          customer: customersById.get(order.customer_id),
          order,
        })
      ) {
        return null;
      }
      return getWholesaleOrderEditMode({
        canBypassEditWindow,
        editWindowDays: orderEditWindowDays,
        order,
      }) === "direct"
        ? { label: t("actions.edit"), tone: "direct" }
        : { label: t("actions.requestEdit"), tone: "request" };
    },
    [
      canEdit,
      canBypassEditWindow,
      canManageEveryOrder,
      currentUserId,
      customersById,
      orderEditWindowDays,
      t,
    ],
  );
  const refreshAfter = useCallback(
    async (action: () => boolean | Promise<boolean>) => {
      const succeeded = await action();
      // 请求失败时页面数据没有变化，也不能用旧的服务端结果覆盖用户正在处理的内容。
      if (!succeeded) return false;
      await pageState.refreshFirstPage();
      return true;
    },
    [pageState],
  );
  const orderListHandlers = useWholesaleOrderListHandlers({
    attachmentsByOrderId: viewData.orderListAttachmentsByOrderId,
    canEdit,
    canManageEveryOrder,
    currentRole,
    currentUserId,
    customersById,
    onDelete: onDeleteOrderListAttachment,
    onDeleted: pageState.removeOrderListAttachment,
    onUpload: onUploadOrderListAttachments,
    refreshAfter,
  });
  const selectedEditMode = selectedEditOrder
    ? getWholesaleOrderEditMode({
        canBypassEditWindow,
        editWindowDays: orderEditWindowDays,
        order: selectedEditOrder,
      })
    : "direct";
  return (
    <WholesalePageShell
      actions={
        canEdit ? (
          <Button
            variant="primary"
            size="default"
            onClick={() => setCreateDialogOpen(true)}
            type="button"
          >
            <Plus className="size-4" />
            <UiMessage id="components_dashboard_wholesale_wholesale_orders_section.text001" />
          </Button>
        ) : null
      }
      title={uiText("attribute003")}
    >
      <WholesaleOrderFiltersPanel
        customers={customers}
        filters={filterState.filters}
        hasActiveFilters={filterState.hasActiveFilters}
        onClear={filterState.clearFilters}
        onExactSearch={filterState.activateExactSearch}
        onExitExactSearch={filterState.exitExactSearch}
        onSelectDatePreset={filterState.applyDatePreset}
        onUpdate={filterState.updateFilter}
        salesAccounts={salesAccounts}
      />

      {page ? <WholesaleOrderSummary summary={page.summary} /> : null}

      <WholesaleOrdersListSection
        assessmentPanel={
          page?.canViewInternalFields ? (
            <WholesaleOrderAssessmentPanel
              filters={assessmentFilters}
              matchedOrderCount={page.totalCount}
            />
          ) : undefined
        }
        loadError={pageState.loadError}
        loading={pageState.loading}
        loadingMore={pageState.loadingMore}
        onLoadMore={() => void pageState.loadMore()}
        onRetry={() => void pageState.refreshFirstPage()}
        page={page}
        renderProps={{
          canMarkOrderSettled,
          canManageOrderListAttachments:
            orderListHandlers.canManageOrderListAttachments,
          customersById,
          getOrderEditAction,
          onDeleteOrderListAttachment:
            orderListHandlers.deleteOrderListAttachment,
          onOpenOrderEdit: setSelectedEditOrder,
          onOpenOrderSettlement: setSelectedSettlementOrder,
          onUploadOrderListAttachments:
            orderListHandlers.uploadOrderListAttachments,
          orderListAttachmentsByOrderId: viewData.orderListAttachmentsByOrderId,
          orderSettlementsByOrderId: viewData.orderSettlementsByOrderId,
          pendingKey,
          profilesById,
          purchaseOrdersByOrderId: viewData.purchaseOrdersByOrderId,
        }}
      />

      {page?.canViewInternalFields ? (
        <WholesaleOrderChangeSections
          canReviewRequests={canReviewOrderEditRequests}
          customersById={customersById}
          logs={page.orderChangeLogs}
          onApproveRequest={(requestId) =>
            refreshAfter(() => onApproveOrderEditRequest(requestId))
          }
          onRejectRequest={(requestId) =>
            refreshAfter(() => onRejectOrderEditRequest(requestId))
          }
          ordersById={viewData.ordersById}
          pendingKey={pendingKey}
          profilesById={profilesById}
          requests={page.orderEditRequests}
        />
      ) : null}

      <WholesaleOrderFormDialog
        customers={customers}
        exchangeRates={exchangeRates}
        onCreateOrder={(formData) =>
          refreshAfter(() => onCreateOrder(formData))
        }
        onOpenChange={setCreateDialogOpen}
        open={createDialogOpen}
        pending={pendingKey === "order:create"}
        salesAccounts={salesAccounts}
      />

      {selectedEditOrder &&
      hasWholesaleOrderInternalFields(selectedEditOrder) ? (
        <WholesaleOrderEditDialog
          canReassignOrder={canReassignOrder}
          customers={customers}
          editWindowDays={orderEditWindowDays}
          exchangeRates={exchangeRates}
          key={`${selectedEditOrder.id}-${selectedEditMode}`}
          mode={selectedEditMode}
          onOpenChange={(open) => {
            if (!open) setSelectedEditOrder(null);
          }}
          onRequestOrderEdit={(formData) =>
            refreshAfter(() => onRequestOrderEdit(formData))
          }
          onUpdateOrder={(formData) =>
            refreshAfter(() => onUpdateOrder(formData))
          }
          open
          order={selectedEditOrder}
          pending={
            pendingKey === `order:update:${selectedEditOrder.id}` ||
            pendingKey === `order:edit-request:${selectedEditOrder.id}`
          }
          salesAccounts={salesAccounts}
        />
      ) : null}

      {selectedSettlementOrder && page ? (
        <WholesaleOrderSettlementDialog
          exchangeRates={exchangeRates}
          onOpenChange={(open) => {
            if (!open) setSelectedSettlementOrder(null);
          }}
          onSettleOrder={(formData) =>
            refreshAfter(() => onMarkOrderSettled(formData))
          }
          order={selectedSettlementOrder}
          settlements={
            viewData.orderSettlementsByOrderId.get(
              selectedSettlementOrder.id,
            ) ?? []
          }
          pending={pendingKey === `order:settle:${selectedSettlementOrder.id}`}
        />
      ) : null}
    </WholesalePageShell>
  );
}

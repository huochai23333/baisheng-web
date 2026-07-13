"use client";
import { UiMessage } from "@/components/i18n/ui-message";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import { LoaderCircle, Plus, ReceiptText } from "lucide-react";
import { PageBanner } from "@/components/dashboard/dashboard-shared-ui";
import { DashboardListSection } from "@/components/dashboard/dashboard-section-panel";
import { Button } from "@/components/ui/button";
import { hasWholesaleOrderInternalFields } from "@/lib/wholesale";
import type {
  WholesaleOrderListItem,
} from "@/lib/wholesale";
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
import { WholesaleOrdersMobileList } from "./wholesale-orders-mobile-list";
import {
  WholesaleOrdersTable,
  type WholesaleOrderEditAction,
} from "./wholesale-orders-table";
import type { WholesaleOrdersSectionProps } from "./wholesale-orders-section-types";
import { WholesaleEmptyState, WholesalePageShell } from "./wholesale-ui";
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
            className="h-11 rounded-full bg-[#486782] px-5 text-white hover:bg-[#3e5f79]"
            onClick={() => setCreateDialogOpen(true)}
            type="button"
          >
            <Plus className="size-4" />
            <UiMessage id="components_dashboard_wholesale_wholesale_orders_section.text001" />
          </Button>
        ) : null
      }
      description={uiText("attribute001")}
      eyebrow={uiText("attribute002")}
      title={uiText("attribute003")}
    >
      <WholesaleOrderFiltersPanel
        customers={customers}
        filters={filterState.filters}
        hasActiveFilters={filterState.hasActiveFilters}
        onClear={filterState.clearFilters}
        onUpdate={filterState.updateFilter}
        salesAccounts={salesAccounts}
      />

      {page ? <WholesaleOrderSummary summary={page.summary} /> : null}

      {pageState.loadError ? (
        <div className="space-y-3">
          <PageBanner tone="error">{pageState.loadError}</PageBanner>
          <Button
            className="rounded-full border border-[#d8dde2] bg-white text-[#486782]"
            onClick={() => void pageState.refreshFirstPage()}
            type="button"
            variant="outline"
          >
            <UiMessage id="components_dashboard_wholesale_wholesale_orders_section.text002" />
          </Button>
        </div>
      ) : null}

      {page?.warnings.map((warning) => (
        <PageBanner key={`${warning.area}:${warning.message}`} tone="info">
          {warning.message}
        </PageBanner>
      ))}

      <DashboardListSection
        description={
          page
            ? t("listCount", {
                shown: page.orders.length,
                total: page.totalCount,
              })
            : t("loadingList")
        }
        title={uiText("attribute004")}
      >
        {page ? (
          <div className="mb-5">
            {page.canViewInternalFields ? (
              <WholesaleOrderAssessmentPanel
                filters={assessmentFilters}
                matchedOrderCount={page.totalCount}
              />
            ) : null}
          </div>
        ) : null}

        {pageState.loading ? (
          <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-[#71808d]">
            <LoaderCircle className="size-4 animate-spin" />
            <UiMessage id="components_dashboard_wholesale_wholesale_orders_section.text003" />
          </div>
        ) : page && page.orders.length === 0 ? (
          <WholesaleEmptyState
            description={uiText("attribute005")}
            icon={<ReceiptText className="size-5" />}
            title={uiText("attribute006")}
          />
        ) : page ? (
          <>
            <div className="hidden md:block">
              <WholesaleOrdersTable
                canMarkOrderSettled={canMarkOrderSettled}
                canManageOrderListAttachments={
                  orderListHandlers.canManageOrderListAttachments
                }
                canViewInternalFields={page.canViewInternalFields}
                customersById={customersById}
                getOrderEditAction={getOrderEditAction}
                logisticsOrdersByOrderId={viewData.logisticsOrdersByOrderId}
                logisticsStatusesByOrderId={viewData.logisticsStatusesByOrderId}
                orderSettlementsByOrderId={viewData.orderSettlementsByOrderId}
                onOpenOrderEdit={setSelectedEditOrder}
                onOpenOrderSettlement={setSelectedSettlementOrder}
                onDeleteOrderListAttachment={
                  orderListHandlers.deleteOrderListAttachment
                }
                onUploadOrderListAttachments={
                  orderListHandlers.uploadOrderListAttachments
                }
                orders={page.orders}
                orderListAttachmentsByOrderId={
                  viewData.orderListAttachmentsByOrderId
                }
                pendingKey={pendingKey}
                profilesById={profilesById}
                purchaseOrdersByOrderId={viewData.purchaseOrdersByOrderId}
              />
            </div>
            <WholesaleOrdersMobileList
              canMarkOrderSettled={canMarkOrderSettled}
              canManageOrderListAttachments={
                orderListHandlers.canManageOrderListAttachments
              }
              canViewInternalFields={page.canViewInternalFields}
              customersById={customersById}
              getOrderEditAction={getOrderEditAction}
              logisticsOrdersByOrderId={viewData.logisticsOrdersByOrderId}
              logisticsStatusesByOrderId={viewData.logisticsStatusesByOrderId}
              onOpenOrderEdit={setSelectedEditOrder}
              onOpenOrderSettlement={setSelectedSettlementOrder}
              onDeleteOrderListAttachment={
                orderListHandlers.deleteOrderListAttachment
              }
              onUploadOrderListAttachments={
                orderListHandlers.uploadOrderListAttachments
              }
              orders={page.orders}
              orderListAttachmentsByOrderId={
                viewData.orderListAttachmentsByOrderId
              }
              orderSettlementsByOrderId={viewData.orderSettlementsByOrderId}
              profilesById={profilesById}
              purchaseOrdersByOrderId={viewData.purchaseOrdersByOrderId}
              pendingKey={pendingKey}
            />
          </>
        ) : null}

        {page?.nextCursor ? (
          <div className="mt-5 flex justify-center">
            <Button
              className="min-h-11 rounded-full border border-[#d8dde2] bg-white px-5 text-[#486782] hover:bg-[#eef3f6]"
              disabled={pageState.loadingMore}
              onClick={() => void pageState.loadMore()}
              type="button"
              variant="outline"
            >
              {pageState.loadingMore ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : null}
              <UiMessage id="components_dashboard_wholesale_wholesale_orders_section.text004" />
            </Button>
          </div>
        ) : null}
      </DashboardListSection>

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

      {selectedEditOrder && hasWholesaleOrderInternalFields(selectedEditOrder) ? (
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

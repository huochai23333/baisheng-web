"use client";

import { useCallback, useMemo, useState } from "react";

import { LoaderCircle, Plus, ReceiptText } from "lucide-react";

import { PageBanner } from "@/components/dashboard/dashboard-shared-ui";
import { DashboardListSection } from "@/components/dashboard/dashboard-section-panel";
import { Button } from "@/components/ui/button";
import type { ExchangeRateRow } from "@/lib/exchange-rates";
import type {
  WholesaleCustomer,
  WholesaleOrder,
  WholesaleProfile,
} from "@/lib/wholesale";
import type { WholesaleOrderPage } from "@/lib/wholesale-order-page";

import { useWholesaleOrderFilters } from "./use-wholesale-order-filters";
import { useWholesaleOrderPage } from "./use-wholesale-order-page";
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
import {
  WholesaleEmptyState,
  WholesalePageShell,
} from "./wholesale-ui";

type WholesaleOrdersSectionProps = {
  canEdit: boolean;
  canManageAllOrders: boolean;
  currentUserId: string | null;
  customers: WholesaleCustomer[];
  customersById: Map<string, WholesaleCustomer>;
  exchangeRates: ExchangeRateRow[];
  initialPage: WholesaleOrderPage;
  onApproveOrderEditRequest: (requestId: string) => void | Promise<void>;
  onCreateOrder: (formData: FormData) => void | Promise<void>;
  onMarkOrderSettled: (formData: FormData) => void | Promise<void>;
  onRejectOrderEditRequest: (requestId: string) => void | Promise<void>;
  onRequestOrderEdit: (formData: FormData) => void | Promise<void>;
  onUpdateOrder: (formData: FormData) => void | Promise<void>;
  orderEditWindowDays: number;
  pendingKey: string | null;
  profilesById: Map<string, WholesaleProfile>;
  salesAccounts: WholesaleProfile[];
};

export function WholesaleOrdersSection({
  canEdit,
  canManageAllOrders,
  currentUserId,
  customers,
  customersById,
  exchangeRates,
  initialPage,
  onApproveOrderEditRequest,
  onCreateOrder,
  onMarkOrderSettled,
  onRejectOrderEditRequest,
  onRequestOrderEdit,
  onUpdateOrder,
  orderEditWindowDays,
  pendingKey,
  profilesById,
  salesAccounts,
}: WholesaleOrdersSectionProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedEditOrder, setSelectedEditOrder] = useState<WholesaleOrder | null>(null);
  const [selectedSettlementOrder, setSelectedSettlementOrder] =
    useState<WholesaleOrder | null>(null);
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
    (order: WholesaleOrder) =>
      order.status !== "settled" &&
      canCurrentUserManageWholesaleOrder({
        canEdit,
        canManageAllOrders,
        currentUserId,
        customer: customersById.get(order.customer_id),
        order,
      }),
    [canEdit, canManageAllOrders, currentUserId, customersById],
  );
  const getOrderEditAction = useCallback(
    (order: WholesaleOrder): WholesaleOrderEditAction | null => {
      if (
        !canCurrentUserManageWholesaleOrder({
          canEdit,
          canManageAllOrders,
          currentUserId,
          customer: customersById.get(order.customer_id),
          order,
        })
      ) {
        return null;
      }

      return getWholesaleOrderEditMode({
        canManageAllOrders,
        editWindowDays: orderEditWindowDays,
        order,
      }) === "direct"
        ? { label: "修改订单", tone: "direct" }
        : { label: "申请修改", tone: "request" };
    },
    [
      canEdit,
      canManageAllOrders,
      currentUserId,
      customersById,
      orderEditWindowDays,
    ],
  );
  const refreshAfter = useCallback(
    async (action: () => void | Promise<void>) => {
      await action();
      await pageState.refreshFirstPage();
    },
    [pageState],
  );
  const selectedEditMode = selectedEditOrder
    ? getWholesaleOrderEditMode({
        canManageAllOrders,
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
            新建订单
          </Button>
        ) : null
      }
      description="按条件分批查看批发订单。电脑端保留完整表格，手机端点击订单卡片查看费用、利润、结汇和关联记录。"
      eyebrow="批发业务"
      title="批发订单"
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
            重新加载
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
            ? `已显示 ${page.orders.length} / ${page.totalCount} 笔订单。`
            : "正在按当前条件加载订单。"
        }
        title="订单列表"
      >
        {page ? (
          <div className="mb-5">
            <WholesaleOrderAssessmentPanel
              filters={assessmentFilters}
              matchedOrderCount={page.totalCount}
            />
          </div>
        ) : null}

        {pageState.loading ? (
          <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-[#71808d]">
            <LoaderCircle className="size-4 animate-spin" />
            正在加载订单…
          </div>
        ) : page && page.orders.length === 0 ? (
          <WholesaleEmptyState
            description="没有匹配的批发订单。可以调整筛选条件，或新建一笔订单。"
            icon={<ReceiptText className="size-5" />}
            title="暂无匹配订单"
          />
        ) : page ? (
          <>
            <div className="hidden md:block">
              <WholesaleOrdersTable
                canMarkOrderSettled={canMarkOrderSettled}
                customersById={customersById}
                getOrderEditAction={getOrderEditAction}
                logisticsOrdersByOrderId={viewData.logisticsOrdersByOrderId}
                logisticsStatusesByOrderId={viewData.logisticsStatusesByOrderId}
                orderSettlementsByOrderId={viewData.orderSettlementsByOrderId}
                onOpenOrderEdit={setSelectedEditOrder}
                onOpenOrderSettlement={setSelectedSettlementOrder}
                orders={page.orders}
                pendingKey={pendingKey}
                profilesById={profilesById}
                purchaseOrdersByOrderId={viewData.purchaseOrdersByOrderId}
              />
            </div>
            <WholesaleOrdersMobileList
              canMarkOrderSettled={canMarkOrderSettled}
              customersById={customersById}
              getOrderEditAction={getOrderEditAction}
              logisticsOrdersByOrderId={viewData.logisticsOrdersByOrderId}
              logisticsStatusesByOrderId={viewData.logisticsStatusesByOrderId}
              onOpenOrderEdit={setSelectedEditOrder}
              onOpenOrderSettlement={setSelectedSettlementOrder}
              orders={page.orders}
              orderSettlementsByOrderId={viewData.orderSettlementsByOrderId}
              profilesById={profilesById}
              purchaseOrdersByOrderId={viewData.purchaseOrdersByOrderId}
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
              继续加载
            </Button>
          </div>
        ) : null}
      </DashboardListSection>

      {page ? (
        <WholesaleOrderChangeSections
          canReviewRequests={canManageAllOrders}
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
        onCreateOrder={(formData) => refreshAfter(() => onCreateOrder(formData))}
        onOpenChange={setCreateDialogOpen}
        open={createDialogOpen}
        pending={pendingKey === "order:create"}
        salesAccounts={salesAccounts}
      />

      {selectedEditOrder ? (
        <WholesaleOrderEditDialog
          canManageAllOrders={canManageAllOrders}
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
            viewData.orderSettlementsByOrderId.get(selectedSettlementOrder.id) ?? []
          }
          pending={pendingKey === `order:settle:${selectedSettlementOrder.id}`}
        />
      ) : null}
    </WholesalePageShell>
  );
}

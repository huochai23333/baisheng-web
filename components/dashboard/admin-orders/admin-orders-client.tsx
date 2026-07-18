"use client";

import { useMemo } from "react";

import { useTranslations } from "next-intl";

import { type AdminOrdersPageData } from "@/lib/admin-orders";

import {
  DashboardAccessState,
  DashboardPageShell,
} from "@/components/dashboard/dashboard-page-shell";

import {
  OrdersHeaderSection,
  OrdersTableSection,
} from "./admin-orders-sections";
import { type OrdersClientMode } from "./admin-orders-client-config";
import { OrderDetailsDialog, OrderFormDialog } from "./admin-orders-ui";
import { buildOrderCurrencyOptions } from "./admin-orders-utils";
import { useAdminOrdersViewModel } from "./use-admin-orders-view-model";

export function AdminOrdersClient({
  initialData,
  mode = "admin",
}: {
  initialData: AdminOrdersPageData;
  mode?: OrdersClientMode;
}) {
  const t = useTranslations("Orders");
  const viewModel = useAdminOrdersViewModel({
    initialData,
    mode,
  });
  const orderCurrencyOptions = useMemo(
    () => buildOrderCurrencyOptions(viewModel.orderCurrencyRates),
    [viewModel.orderCurrencyRates],
  );

  return (
    <DashboardPageShell
      feedback={viewModel.pageFeedback}
      header={
        <OrdersHeaderSection
          badge={viewModel.viewConfig.badge}
          canCreateOrders={viewModel.canCreateOrders}
          canOpenCreateDialog={viewModel.canOpenCreateDialog}
          createTitle={viewModel.viewConfig.createTitle}
          description={viewModel.viewConfig.description}
          noCreateTargetHint={viewModel.viewConfig.noCreateTargetHint}
          onCreate={viewModel.openCreateDialog}
          title={viewModel.viewConfig.title}
        />
      }
    >
      {viewModel.canViewOrders === false ? (
        <DashboardAccessState
          description={viewModel.viewConfig.noPermissionDescription}
          kind="permission"
          title={t("states.noViewPermissionTitle")}
        />
      ) : (
        <OrdersTableSection
          canViewOrderCosts={viewModel.canViewOrderCosts}
          filters={viewModel.filters}
          matchedOrdersCount={viewModel.matchedOrdersCount}
          onClearFilters={viewModel.clearFilters}
          onCreatedFromDateChange={viewModel.handleCreatedFromDateChange}
          onCreatedToDateChange={viewModel.handleCreatedToDateChange}
          onDatePresetChange={viewModel.handleDatePresetChange}
          onExitExactAllTimeSearch={viewModel.exitExactAllTimeSearch}
          onOrderEntryUserChange={viewModel.handleOrderEntryUserChange}
          onOrderNumberChange={viewModel.handleOrderNumberChange}
          onOrderingUserChange={viewModel.handleOrderingUserChange}
          onSearchExactOrderAllTime={viewModel.searchExactOrderAllTime}
          onSelectOrder={viewModel.handleSelectOrder}
          orderTypeMetaById={viewModel.orderTypeMetaById}
          pagination={viewModel.ordersPaginationState}
          rows={viewModel.orders}
          showCreatedAtColumn={viewModel.viewConfig.showCreatedAtColumn}
          showOrderEntryColumn={viewModel.viewConfig.showOrderEntryColumn}
          showOrderEntryFilter={viewModel.viewConfig.showOrderEntryFilter}
          showOrderingColumn={viewModel.viewConfig.showOrderingColumn}
          showOrderingFilter={viewModel.viewConfig.showOrderingFilter}
          summary={viewModel.summary}
          totalOrdersCount={viewModel.totalOrdersCount}
          userLabelById={viewModel.userLabelById}
        />
      )}

      <OrderFormDialog
        currencyOptions={orderCurrencyOptions}
        description={viewModel.viewConfig.createDescription}
        feedback={viewModel.createDialogFeedback}
        formState={viewModel.createFormState}
        lockExchangeRateFields
        lockOrderEntryUser={viewModel.viewConfig.lockOrderEntryToCurrentViewer}
        mode="create"
        open={viewModel.createDialogOpen}
        serviceFeePreview={viewModel.createServiceFeePreview}
        orderDiscountOptions={viewModel.orderDiscountOptions}
        orderEntryUserOptions={viewModel.orderEntryUserOptions}
        orderTypeOptions={viewModel.orderTypeOptions}
        orderUserOptions={viewModel.userOptions}
        orderingUserOptions={viewModel.orderingUserOptions}
        pending={viewModel.createPending}
        purchaseOrderTypeOptions={viewModel.purchaseOrderTypeOptions}
        serviceOrderPriceOptions={viewModel.serviceOrderPriceOptions}
        serviceOrderTypeOptions={viewModel.serviceOrderTypeOptions}
        showCostField={viewModel.canViewOrderCosts}
        submitLabel={viewModel.viewConfig.createTitle}
        title={viewModel.viewConfig.createTitle}
        onFieldChange={viewModel.updateCreateFormField}
        onOpenChange={viewModel.handleCreateDialogOpenChange}
        onSubmit={viewModel.handleCreateOrder}
      />

      <OrderFormDialog
        currencyOptions={orderCurrencyOptions}
        description={t("dialogs.editDescription")}
        feedback={viewModel.editDialogFeedback}
        formState={viewModel.editFormState}
        lockCurrencyField
        lockExchangeRateFields
        mode="edit"
        open={viewModel.editDialogOpen}
        orderDiscountOptions={viewModel.orderDiscountOptions}
        orderTypeOptions={viewModel.orderTypeOptions}
        orderUserOptions={viewModel.userOptions}
        pending={viewModel.editPending}
        purchaseOrderTypeOptions={viewModel.purchaseOrderTypeOptions}
        serviceFeePreview={viewModel.editServiceFeePreview}
        serviceOrderPriceOptions={viewModel.serviceOrderPriceOptions}
        serviceOrderTypeOptions={viewModel.serviceOrderTypeOptions}
        showCostField={viewModel.canViewOrderCosts}
        supplementaryLoading={viewModel.editSupplementaryLoading}
        submitLabel={t("dialogs.saveChanges")}
        title={t("dialogs.editTitle")}
        onFieldChange={viewModel.updateEditFormField}
        onOpenChange={viewModel.handleEditDialogOpenChange}
        onSubmit={viewModel.handleEditOrder}
      />

      <OrderDetailsDialog
        canDelete={viewModel.canDeleteOrders}
        canEdit={viewModel.canEditOrders}
        canViewCost={viewModel.canViewOrderCosts}
        deletePending={viewModel.deletePending}
        forceDeletePending={viewModel.forceDeletePending}
        onDelete={viewModel.handleDeleteOrder}
        onEdit={viewModel.openEditDialog}
        onForceDelete={viewModel.handleForceDeleteOrder}
        onOpenChange={viewModel.handleOrderDetailsOpenChange}
        order={viewModel.selectedOrder}
        orderTypeMetaById={viewModel.orderTypeMetaById}
        showOrderEntryUser={viewModel.viewConfig.showOrderEntryDetail}
        showOrderingUser={viewModel.viewConfig.showOrderingDetail}
        supabase={viewModel.supabase}
        userLabelById={viewModel.userLabelById}
      />
    </DashboardPageShell>
  );
}

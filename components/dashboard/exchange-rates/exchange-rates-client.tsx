"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  DashboardAccessState,
  DashboardPageShell,
} from "@/components/dashboard/dashboard-page-shell";
import { Button } from "@/components/ui/button";
import type { ExchangeRatesPageData } from "@/lib/exchange-rates";

import { ExchangeRateSyncSection } from "./exchange-rate-sync-section";
import {
  ExchangeRateFormDialog,
  ExchangeRatesHeaderSection,
  ExchangeRatesHistorySection,
  ExchangeRatesLatestSection,
} from "./exchange-rates-sections";
import { useExchangeRatesViewModel } from "./use-exchange-rates-view-model";

type ExchangeRatesClientProps = {
  embedded?: boolean;
  homeHref: string;
  initialData: ExchangeRatesPageData;
  mode: "manage" | "readonly";
};

// Client 组件只组装页面区块，查询、筛选和 mutation 都由 view-model 负责。
export function ExchangeRatesClient({
  embedded = false,
  homeHref,
  initialData,
  mode,
}: ExchangeRatesClientProps) {
  const t = useTranslations("ExchangeRates");
  const viewModel = useExchangeRatesViewModel({ initialData, mode });
  const {
    canManage,
    createDialogFeedback,
    createDialogOpen,
    createFormState,
    createPending,
    deletePendingId,
    editDialogFeedback,
    editDialogOpen,
    editFormState,
    editPending,
    filteredHistoryRows,
    filteredLatestRows,
    filters,
    handleCreateRate,
    handleDeleteRow,
    handleEditRate,
    hasActiveFilters,
    hasPermission,
    historyPagination,
    latestPagination,
    latestRows,
    openCreateDialog,
    openEditDialog,
    pageFeedback,
    rates,
    syncSettings,
  } = viewModel;
  const latestPaginationState = {
    ...latestPagination,
    onNextPage: latestPagination.goToNextPage,
    onPreviousPage: latestPagination.goToPreviousPage,
  };
  const historyPaginationState = {
    ...historyPagination,
    onNextPage: historyPagination.goToNextPage,
    onPreviousPage: historyPagination.goToPreviousPage,
  };

  return (
    <DashboardPageShell
      className={embedded ? "max-w-none" : undefined}
      feedback={pageFeedback}
      header={
        !embedded ? (
          <ExchangeRatesHeaderSection canManage={canManage} onCreate={openCreateDialog} />
        ) : undefined
      }
    >
      {embedded && canManage ? (
        <div className="flex justify-end">
          <Button
            className="h-11 rounded-full bg-[#486782] px-5 text-white hover:bg-[#3e5f79]"
            onClick={openCreateDialog}
            type="button"
          >
            <Plus className="size-4" />
            {t("actions.create")}
          </Button>
        </div>
      ) : null}

      {hasPermission === false ? (
        <DashboardAccessState
          description={
            mode === "manage"
              ? t("states.noManageDescription")
              : t("states.noViewDescription")
          }
          kind="permission"
          title={mode === "manage" ? t("states.noManageTitle") : t("states.noViewTitle")}
        />
      ) : (
        <>
          {canManage ? (
            <ExchangeRateSyncSection
              addPairPending={syncSettings.addPairPending}
              feedback={syncSettings.feedback}
              manualCurrencies={syncSettings.manualCurrencies}
              manualFetchPending={syncSettings.manualFetchPending}
              manualResults={syncSettings.manualResults}
              pairInput={syncSettings.pairInput}
              removePairPendingId={syncSettings.removePairPendingId}
              settingsPending={syncSettings.settingsPending}
              syncState={syncSettings.syncState}
              onAddManualCurrency={syncSettings.handleAddManualCurrency}
              onAddPair={syncSettings.handleAddPair}
              onAutoSyncChange={syncSettings.handleAutoSyncChange}
              onManualCurrencyChange={syncSettings.handleManualCurrencyChange}
              onManualFetch={syncSettings.handleManualFetch}
              onPairInputChange={syncSettings.setPairInput}
              onRemoveManualCurrency={syncSettings.handleRemoveManualCurrency}
              onRemovePair={syncSettings.handleRemovePair}
            />
          ) : null}

          <ExchangeRatesLatestSection
            filteredRowsCount={filteredLatestRows.length}
            pagination={latestPaginationState}
            rows={latestPagination.items}
            totalLatestRows={latestRows.length}
            totalRates={rates.length}
          />
          <ExchangeRatesHistorySection
            canManage={canManage}
            deletePendingId={deletePendingId}
            filteredRowsCount={filteredHistoryRows.length}
            filters={filters}
            hasActiveFilters={hasActiveFilters}
            homeHref={homeHref}
            onClearFilters={viewModel.clearFilters}
            onDeleteRow={handleDeleteRow}
            onEditRow={openEditDialog}
            onOriginalCurrencyChange={viewModel.setOriginalCurrency}
            onTargetCurrencyChange={viewModel.setTargetCurrency}
            pagination={historyPaginationState}
            rows={historyPagination.items}
            showBackLink={!embedded}
            totalRates={rates.length}
          />
        </>
      )}

      <ExchangeRateFormDialog
        feedback={createDialogFeedback}
        formState={createFormState}
        mode="create"
        open={createDialogOpen}
        pending={createPending}
        onFieldChange={viewModel.updateCreateFormField}
        onOpenChange={viewModel.setCreateDialogVisibility}
        onSubmit={handleCreateRate}
      />
      <ExchangeRateFormDialog
        feedback={editDialogFeedback}
        formState={editFormState}
        mode="edit"
        open={editDialogOpen}
        pending={editPending}
        onFieldChange={viewModel.updateEditFormField}
        onOpenChange={viewModel.setEditDialogVisibility}
        onSubmit={handleEditRate}
      />
    </DashboardPageShell>
  );
}

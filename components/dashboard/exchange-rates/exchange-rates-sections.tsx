"use client";

import * as FormControls from "@/components/ui/form-controls";

import { memo } from "react";
import type { ReactNode } from "react";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowLeftRight,
  History,
  LoaderCircle,
  PencilLine,
  Plus,
  Trash2,
} from "lucide-react";

import { useLocale } from "@/components/i18n/locale-provider";
import type {
  ExchangeRateLatestRow,
  ExchangeRateRow,
} from "@/lib/exchange-rates";
import { normalizeCurrencyCode } from "@/lib/exchange-rates";

import { Button } from "../../ui/button";
import { DashboardPaginationFooter } from "../dashboard-collection-section";
import { DashboardSectionHeader } from "../dashboard-section-header";
import {
  DashboardFilterField,
  DashboardFilterPanel,
  DashboardListSection,
  DashboardTableFrame,
  dashboardFilterInputClassName,
} from "../dashboard-section-panel";
import { EmptyState, formatDateTime } from "../dashboard-shared-ui";
import { formatExchangeRateValue } from "./exchange-rates-utils";
import { ExchangeRateFormDialog } from "./exchange-rates-form-dialog";
import { LatestRateCard } from "./exchange-rates-latest-card";

export { ExchangeRateFormDialog };

type PaginationState = {
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

type ExchangeRatesHeaderSectionProps = {
  canManage: boolean;
  onCreate: () => void;
};

type ExchangeRatesLatestSectionProps = {
  filteredRowsCount: number;
  pagination: PaginationState;
  rows: ExchangeRateLatestRow[];
  totalLatestRows: number;
  totalRates: number;
};

type ExchangeRatesHistorySectionProps = {
  canManage: boolean;
  deletePendingId: string | null;
  filteredRowsCount: number;
  filters: {
    originalCurrency: string;
    targetCurrency: string;
  };
  hasActiveFilters: boolean;
  homeHref: string;
  onClearFilters: () => void;
  onDeleteRow: (row: ExchangeRateRow) => void;
  onEditRow: (row: ExchangeRateRow) => void;
  onOriginalCurrencyChange: (value: string) => void;
  onTargetCurrencyChange: (value: string) => void;
  pagination: PaginationState;
  rows: ExchangeRateRow[];
  showBackLink?: boolean;
  totalRates: number;
};

export const ExchangeRatesHeaderSection = memo(
  function ExchangeRatesHeaderSection({
    canManage,
    onCreate,
  }: ExchangeRatesHeaderSectionProps) {
    const t = useTranslations("ExchangeRates");

    return (
      <DashboardSectionHeader
        actions={
          canManage ? (
            <Button
              variant="primary"
              size="default"
              onClick={onCreate}
              type="button"
            >
              <Plus className="size-4" />
              {t("actions.create")}
            </Button>
          ) : null
        }
        badge={t("header.badge")}
        contentClassName="max-w-2xl"
        description={t("header.description")}
        title={t("header.title")}
      />
    );
  },
);

export const ExchangeRatesLatestSection = memo(
  function ExchangeRatesLatestSection({
    filteredRowsCount,
    pagination,
    rows,
    totalLatestRows,
    totalRates,
  }: ExchangeRatesLatestSectionProps) {
    const t = useTranslations("ExchangeRates");

    return (
      <DashboardListSection
        actions={
          <div className="rounded-full bg-surface-inset px-4 py-2 text-sm text-content-muted">
            {t("latest.countSummary", { count: totalLatestRows })}
          </div>
        }
        description={t("latest.description")}
        eyebrow={t("latest.eyebrow")}
        title={t("latest.title")}
      >
        {filteredRowsCount === 0 ? (
          <EmptyState
            description={
              totalRates === 0
                ? t("latest.emptyDescription")
                : t("latest.noMatchDescription")
            }
            icon={<ArrowLeftRight className="size-6" />}
            title={
              totalRates === 0
                ? t("latest.emptyTitle")
                : t("latest.noMatchTitle")
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((row) => (
              <LatestRateCard
                key={row.pairKey}
                historyCountLabel={t("latest.card.historyCount", {
                  count: row.historyCount,
                })}
                latestBadge={t("latest.card.latestBadge")}
                row={row}
              />
            ))}
          </div>
        )}

        <DashboardPaginationFooter
          endIndex={pagination.endIndex}
          hasNextPage={pagination.hasNextPage}
          hasPreviousPage={pagination.hasPreviousPage}
          onNextPage={pagination.onNextPage}
          onPreviousPage={pagination.onPreviousPage}
          page={pagination.page}
          pageCount={pagination.pageCount}
          startIndex={pagination.startIndex}
          totalItems={pagination.totalItems}
        />
      </DashboardListSection>
    );
  },
);

export const ExchangeRatesHistorySection = memo(
  function ExchangeRatesHistorySection({
    canManage,
    deletePendingId,
    filteredRowsCount,
    filters,
    hasActiveFilters,
    homeHref,
    onClearFilters,
    onDeleteRow,
    onEditRow,
    onOriginalCurrencyChange,
    onTargetCurrencyChange,
    pagination,
    rows,
    showBackLink = true,
    totalRates,
  }: ExchangeRatesHistorySectionProps) {
    const t = useTranslations("ExchangeRates");
    const { locale } = useLocale();

    return (
      <DashboardListSection
        actions={
          showBackLink ? (
            <Link
              className="inline-flex h-9 items-center justify-center rounded-full border border-border-subtle bg-white px-4 text-sm font-medium text-content-muted transition-colors hover:bg-surface-inset"
              href={homeHref}
            >
              {t("history.backHome")}
            </Link>
          ) : null
        }
        bodyClassName="flex flex-col gap-5"
        eyebrow={t("history.eyebrow")}
        title={t("history.title")}
      >
        <DashboardFilterPanel gridClassName="lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
          <DashboardFilterField label={t("filters.originalCurrencyLabel")}>
            <FormControls.Input
              className={dashboardFilterInputClassName}
              onChange={(event) => onOriginalCurrencyChange(event.target.value)}
              placeholder={t("filters.originalCurrencyPlaceholder")}
              type="text"
              value={filters.originalCurrency}
            />
          </DashboardFilterField>

          <DashboardFilterField label={t("filters.targetCurrencyLabel")}>
            <FormControls.Input
              className={dashboardFilterInputClassName}
              onChange={(event) => onTargetCurrencyChange(event.target.value)}
              placeholder={t("filters.targetCurrencyPlaceholder")}
              type="text"
              value={filters.targetCurrency}
            />
          </DashboardFilterField>

          <div className="flex flex-col justify-end gap-3 lg:items-end">
            <p className="text-sm text-content-muted">
              {t("filters.resultSummary", {
                matched: filteredRowsCount,
                total: totalRates,
              })}
            </p>
            <Button
              disabled={!hasActiveFilters}
              onClick={onClearFilters}
              type="button"
              variant="outline"
            >
              {t("filters.clear")}
            </Button>
          </div>
        </DashboardFilterPanel>

        {filteredRowsCount === 0 ? (
          <EmptyState
            description={
              totalRates === 0
                ? t("history.emptyDescription")
                : t("history.noMatchDescription")
            }
            icon={<History className="size-6" />}
            title={
              totalRates === 0
                ? t("history.emptyTitle")
                : t("history.noMatchTitle")
            }
          />
        ) : (
          <DashboardTableFrame
            footer={
              <DashboardPaginationFooter
                endIndex={pagination.endIndex}
                hasNextPage={pagination.hasNextPage}
                hasPreviousPage={pagination.hasPreviousPage}
                onNextPage={pagination.onNextPage}
                onPreviousPage={pagination.onPreviousPage}
                page={pagination.page}
                pageCount={pagination.pageCount}
                startIndex={pagination.startIndex}
                totalItems={pagination.totalItems}
              />
            }
          >
            <table className="min-w-[880px] w-full table-fixed border-collapse">
              <thead className="bg-surface-inset">
                <tr className="border-b border-border-subtle">
                  <HistoryHeaderCell>
                    {t("history.columns.originalCurrency")}
                  </HistoryHeaderCell>
                  <HistoryHeaderCell>
                    {t("history.columns.targetCurrency")}
                  </HistoryHeaderCell>
                  <HistoryHeaderCell>
                    {t("history.columns.rate")}
                  </HistoryHeaderCell>
                  <HistoryHeaderCell>
                    {t("history.columns.updatedAt")}
                  </HistoryHeaderCell>
                  {canManage ? (
                    <HistoryHeaderCell>
                      {t("history.columns.actions")}
                    </HistoryHeaderCell>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const deleting = deletePendingId === row.id;

                  return (
                    <tr
                      key={row.id}
                      className="border-b border-border-subtle transition-colors hover:bg-surface-inset last:border-b-0"
                    >
                      <HistoryValueCell
                        value={normalizeCurrencyCode(row.original_currency)}
                      />
                      <HistoryValueCell
                        value={normalizeCurrencyCode(row.target_currency)}
                      />
                      <HistoryValueCell
                        value={formatExchangeRateValue(
                          row.daily_exchange_rate,
                          locale,
                          t("summary.noRecord"),
                        )}
                      />
                      <HistoryValueCell
                        value={formatDateTime(row.created_at, locale)}
                      />
                      {canManage ? (
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              className="rounded-full"
                              onClick={() => onEditRow(row)}
                              size="compact"
                              type="button"
                              variant="outline"
                            >
                              <PencilLine className="size-3.5" />
                              {t("actions.edit")}
                            </Button>
                            <Button
                              className="rounded-full text-status-danger hover:text-status-danger"
                              disabled={deleting}
                              onClick={() => onDeleteRow(row)}
                              size="compact"
                              type="button"
                              variant="outline"
                            >
                              {deleting ? (
                                <LoaderCircle className="size-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="size-3.5" />
                              )}
                              {t("actions.delete")}
                            </Button>
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </DashboardTableFrame>
        )}
      </DashboardListSection>
    );
  },
);

function HistoryHeaderCell({ children }: { children: ReactNode }) {
  return (
    <th className="px-5 py-4 text-left text-xs font-semibold tracking-[0.18em] text-content-muted uppercase">
      {children}
    </th>
  );
}

function HistoryValueCell({ value }: { value: ReactNode }) {
  return <td className="px-5 py-4 text-sm text-content-muted">{value}</td>;
}

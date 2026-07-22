import { memo } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeftRight, Plus } from "lucide-react";

import type { ExchangeRateLatestRow } from "@/lib/exchange-rates";

import { Button } from "../../ui/button";
import { DashboardPaginationFooter } from "../dashboard-collection-section";
import { DashboardSectionHeader } from "../dashboard-section-header";
import { DashboardListSection } from "../dashboard-section-panel";
import { EmptyState } from "../dashboard-shared-ui";
import { ExchangeRateFormDialog } from "./exchange-rates-form-dialog";
import { LatestRateCard } from "./exchange-rates-latest-card";

export { ExchangeRateFormDialog };
export { ExchangeRatesHistorySection } from "./exchange-rates-history-section";

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
              onClick={onCreate}
              size="default"
              type="button"
              variant="primary"
            >
              <Plus className="size-4" />
              {t("actions.create")}
            </Button>
          ) : null
        }
        presentation="work"
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

"use client";

import { useTranslations } from "next-intl";

import { DashboardTableFrame } from "@/components/dashboard/dashboard-section-panel";
import { RecordCard } from "@/components/ui/data-display";
import type {
  BusinessVipRequest,
  BusinessVipReviewAction,
  BusinessVipRow,
} from "@/lib/business-vip-management";
import type { Locale } from "@/lib/locale";

import {
  BusinessVipCustomerCell,
  BusinessVipStatusBlock,
  BusinessVipStatusChip,
} from "./business-vip-row-shared";
import {
  BusinessVipActionButtons,
  BusinessVipHistoryList,
  BusinessVipRequestList,
} from "./business-vip-tourism-row-parts";

type BusinessVipRowListProps = {
  canAdmin: boolean;
  canRequest: boolean;
  locale: Locale;
  onOpenAdjust: (row: BusinessVipRow) => void;
  onOpenRequest: (row: BusinessVipRow) => void;
  onOpenReview: (
    row: BusinessVipRow,
    request: BusinessVipRequest,
    action: BusinessVipReviewAction,
  ) => void;
  pendingActionKey: string | null;
};

export function BusinessVipTable({
  canAdmin,
  canRequest,
  locale,
  onOpenAdjust,
  onOpenRequest,
  onOpenReview,
  pendingActionKey,
  rows,
}: BusinessVipRowListProps & {
  rows: BusinessVipRow[];
}) {
  const t = useTranslations("BusinessVip");

  return (
    <DashboardTableFrame>
      <table className="w-full min-w-[1180px] table-fixed text-left text-sm">
        <colgroup>
          <col className="w-[18%]" />
          <col className="w-[14%]" />
          <col className="w-[25%]" />
          <col className="w-[25%]" />
          <col className="w-[18%]" />
        </colgroup>
        <thead className="bg-surface-inset text-xs font-semibold text-content-muted">
          <tr>
            <th className="px-3 py-3">{t("directory.columns.customer")}</th>
            <th className="px-3 py-3">{t("directory.columns.status")}</th>
            <th className="px-3 py-3">{t("directory.columns.requests")}</th>
            <th className="px-3 py-3">{t("directory.columns.records")}</th>
            <th className="px-3 py-3">{t("directory.columns.actions")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {rows.map((row) => (
            <tr className="align-top" key={row.targetId}>
              <td className="px-3 py-4">
                <BusinessVipCustomerCell row={row} />
              </td>
              <td className="px-3 py-4">
                <BusinessVipStatusBlock locale={locale} row={row} />
              </td>
              <td className="px-3 py-4">
                <BusinessVipRequestList
                  canAdmin={canAdmin}
                  locale={locale}
                  onOpenReview={onOpenReview}
                  pendingActionKey={pendingActionKey}
                  row={row}
                />
              </td>
              <td className="px-3 py-4">
                <BusinessVipHistoryList locale={locale} row={row} />
              </td>
              <td className="px-3 py-4">
                <BusinessVipActionButtons
                  canAdmin={canAdmin}
                  canRequest={canRequest}
                  onOpenAdjust={onOpenAdjust}
                  onOpenRequest={onOpenRequest}
                  pendingActionKey={pendingActionKey}
                  row={row}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DashboardTableFrame>
  );
}

export function BusinessVipMobileCard({
  canAdmin,
  canRequest,
  locale,
  onOpenAdjust,
  onOpenRequest,
  onOpenReview,
  pendingActionKey,
  row,
}: BusinessVipRowListProps & {
  row: BusinessVipRow;
}) {
  const t = useTranslations("BusinessVip");

  return (
    <RecordCard>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <BusinessVipCustomerCell row={row} />
        <BusinessVipStatusChip status={row.status} />
      </div>
      <div className="mt-4 grid gap-4">
        <section>
          <h4 className="text-xs font-semibold text-content-muted">
            {t("directory.columns.status")}
          </h4>
          <div className="mt-2">
            <BusinessVipStatusBlock locale={locale} row={row} />
          </div>
        </section>
        <section>
          <h4 className="text-xs font-semibold text-content-muted">
            {t("directory.columns.requests")}
          </h4>
          <div className="mt-2">
            <BusinessVipRequestList
              canAdmin={canAdmin}
              locale={locale}
              onOpenReview={onOpenReview}
              pendingActionKey={pendingActionKey}
              row={row}
            />
          </div>
        </section>
        <section>
          <h4 className="text-xs font-semibold text-content-muted">
            {t("directory.columns.records")}
          </h4>
          <div className="mt-2">
            <BusinessVipHistoryList locale={locale} row={row} />
          </div>
        </section>
        <BusinessVipActionButtons
          canAdmin={canAdmin}
          canRequest={canRequest}
          onOpenAdjust={onOpenAdjust}
          onOpenRequest={onOpenRequest}
          pendingActionKey={pendingActionKey}
          row={row}
        />
      </div>
    </RecordCard>
  );
}

"use client";

import { BadgePlus, Clock3, FileClock, RotateCw } from "lucide-react";
import { useTranslations } from "next-intl";

import { DashboardTableFrame } from "@/components/dashboard/dashboard-section-panel";
import { Button } from "@/components/ui/button";
import type {
  BusinessVipMembershipAction,
  BusinessVipRow,
} from "@/lib/business-vip-management";
import type { Locale } from "@/lib/locale";

import {
  BusinessVipCustomerCell,
  BusinessVipStatusBlock,
} from "./business-vip-row-shared";

type WholesaleVipCustomerListProps = {
  canManage: boolean;
  locale: Locale;
  onOpenAction: (row: BusinessVipRow, action: BusinessVipMembershipAction) => void;
  onOpenRecords: (row: BusinessVipRow) => void;
  pendingActionKey: string | null;
  rows: BusinessVipRow[];
};

export function BusinessVipWholesaleCustomerList({
  canManage,
  locale,
  onOpenAction,
  onOpenRecords,
  pendingActionKey,
  rows,
}: WholesaleVipCustomerListProps) {
  const t = useTranslations("BusinessVip");

  return (
    <>
      <div className="hidden lg:block">
        <DashboardTableFrame innerClassName="overflow-x-visible">
          <table className="w-full table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[44%]" />
              <col className="w-[32%]" />
              <col className="w-[24%]" />
            </colgroup>
            <thead className="bg-[#f6f4f0] text-xs font-semibold text-[#66727d]">
              <tr>
                <th className="px-4 py-3">{t("directory.columns.customer")}</th>
                <th className="px-4 py-3">{t("directory.columns.status")}</th>
                <th className="px-4 py-3 text-right">
                  {t("directory.columns.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eee9e1]">
              {rows.map((row) => (
                <tr className="align-top" key={row.targetId}>
                  <td className="px-4 py-4">
                    <WholesaleVipCustomerRecordButton
                      onOpenRecords={onOpenRecords}
                      row={row}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <BusinessVipStatusBlock locale={locale} row={row} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end">
                      <WholesaleVipActionButton
                        canManage={canManage}
                        onOpenAction={onOpenAction}
                        pendingActionKey={pendingActionKey}
                        row={row}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DashboardTableFrame>
      </div>

      <div className="grid gap-3 lg:hidden">
        {rows.map((row) => (
          <article
            className="rounded-[18px] border border-[#ebe7e1] bg-white p-4 shadow-[0_10px_24px_rgba(96,113,128,0.05)]"
            key={row.targetId}
          >
            <div className="flex flex-col gap-3">
              <WholesaleVipCustomerRecordButton
                onOpenRecords={onOpenRecords}
                row={row}
              />
            </div>
            <div className="mt-4">
              <BusinessVipStatusBlock locale={locale} row={row} />
            </div>
            <div className="mt-4">
              <WholesaleVipActionButton
                canManage={canManage}
                onOpenAction={onOpenAction}
                pendingActionKey={pendingActionKey}
                row={row}
              />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function WholesaleVipCustomerRecordButton({
  onOpenRecords,
  row,
}: {
  onOpenRecords: (row: BusinessVipRow) => void;
  row: BusinessVipRow;
}) {
  const t = useTranslations("BusinessVip");

  return (
    <button
      aria-label={t("actions.viewCustomerRecords", {
        name: row.customerLabel,
      })}
      className="group block w-full min-w-0 rounded-[16px] p-2 text-left transition-colors hover:bg-[#f6f9fb] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#bfd2e1]/40"
      onClick={() => onOpenRecords(row)}
      type="button"
    >
      <BusinessVipCustomerCell row={row} />
      <span className="mt-2 inline-flex min-h-7 items-center gap-1.5 rounded-full bg-[#eef3f6] px-2.5 text-xs font-semibold text-[#486782] transition-colors group-hover:bg-[#e2edf4]">
        <FileClock className="size-3.5" />
        {t("actions.viewRecords")}
      </span>
    </button>
  );
}

function WholesaleVipActionButton({
  canManage,
  onOpenAction,
  pendingActionKey,
  row,
}: {
  canManage: boolean;
  onOpenAction: (row: BusinessVipRow, action: BusinessVipMembershipAction) => void;
  pendingActionKey: string | null;
  row: BusinessVipRow;
}) {
  const t = useTranslations("BusinessVip");
  const action = getWholesaleVipAction(row);
  const actionKey = `wholesale:${action}:${row.targetId}`;
  const pending = pendingActionKey === actionKey;

  return (
    <Button
      className="h-10 w-full rounded-full bg-[#486782] px-4 text-white hover:bg-[#3e5f79] disabled:bg-[#d9dee2] disabled:text-[#7c8790] sm:w-auto"
      disabled={!canManage || Boolean(pendingActionKey)}
      onClick={() => onOpenAction(row, action)}
      type="button"
    >
      {pending ? (
        <Clock3 className="size-4" />
      ) : action === "open" ? (
        <BadgePlus className="size-4" />
      ) : (
        <RotateCw className="size-4" />
      )}
      {action === "open" ? t("actions.open") : t("actions.directRenew")}
    </Button>
  );
}

function getWholesaleVipAction(row: BusinessVipRow): BusinessVipMembershipAction {
  return row.status === "active" || row.status === "expired" ? "renew" : "open";
}

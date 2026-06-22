"use client";

import { useTranslations } from "next-intl";

import type { BusinessVipRow } from "@/lib/business-vip-management";
import type { Locale } from "@/lib/locale";

import {
  formatBusinessVipDate,
  getBusinessVipStatusChipClass,
} from "./business-vip-display";

export function BusinessVipCustomerCell({ row }: { row: BusinessVipRow }) {
  return (
    <div className="min-w-0">
      <p className="break-words font-semibold text-[#23313a] [overflow-wrap:anywhere]">
        {row.customerLabel}
      </p>
      <p className="mt-1 break-words text-xs leading-5 text-[#7b858d] [overflow-wrap:anywhere]">
        {row.contactLabel}
      </p>
      {row.secondaryLabel ? (
        <p className="mt-1 break-words text-xs leading-5 text-[#8a949c] [overflow-wrap:anywhere]">
          {row.secondaryLabel}
        </p>
      ) : null}
    </div>
  );
}

export function BusinessVipStatusBlock({
  locale,
  row,
}: {
  locale: Locale;
  row: BusinessVipRow;
}) {
  const t = useTranslations("BusinessVip");
  const fallback = t("fallback.noRecord");

  return (
    <div className="flex min-w-0 flex-col items-start gap-2">
      <BusinessVipStatusChip status={row.status} />
      {row.business === "wholesale" ? (
        <p className="text-xs leading-5 text-[#6f7b85]">
          {t("status.startedAt", {
            value: formatBusinessVipDate(row.startedAt, locale, fallback),
          })}
        </p>
      ) : null}
      <p className="text-xs leading-5 text-[#6f7b85]">
        {t("status.expiresAt", {
          value: formatBusinessVipDate(row.expiresAt, locale, fallback),
        })}
      </p>
      {row.business === "tourism" ? (
        <p className="text-xs leading-5 text-[#8a949c]">
          {t("status.latestPaidAt", {
            value: formatBusinessVipDate(row.latestPaidAt, locale, fallback),
          })}
        </p>
      ) : null}
    </div>
  );
}

export function BusinessVipStatusChip({
  status,
}: {
  status: BusinessVipRow["status"];
}) {
  const t = useTranslations("BusinessVip");

  return (
    <span className={getBusinessVipStatusChipClass(status)}>
      {t(`status.labels.${status}`)}
    </span>
  );
}

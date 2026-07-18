"use client";

import { useTranslations } from "next-intl";

import { useLocale } from "@/components/i18n/locale-provider";
import { formatDateTime } from "@/components/dashboard/dashboard-shared-ui";
import type { ExchangeRateLatestRow } from "@/lib/exchange-rates";

import { formatExchangeRateValue } from "./exchange-rates-utils";

export function LatestRateCard({
  historyCountLabel,
  latestBadge,
  row,
}: {
  historyCountLabel: string;
  latestBadge: string;
  row: ExchangeRateLatestRow;
}) {
  const t = useTranslations("ExchangeRates");
  const { locale } = useLocale();

  return (
    <article className="rounded-[24px] border border-border-subtle bg-surface-inset p-5 shadow-[var(--surface-shadow-interactive)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-label text-[11px] tracking-[0.18em] text-content-muted uppercase">
            {t("latest.card.eyebrow")}
          </p>
          <h4 className="mt-2 text-2xl font-bold tracking-tight text-content-strong">
            {row.pairLabel}
          </h4>
        </div>
        <span className="rounded-full bg-surface-inset px-3 py-1 text-xs font-semibold text-primary">
          {latestBadge}
        </span>
      </div>

      <div className="mt-6 rounded-[20px] bg-white px-5 py-4 shadow-[var(--surface-shadow-interactive)]">
        <p className="text-sm text-content-muted">
          {t("latest.card.currentRate")}
        </p>
        <p className="mt-2 text-3xl font-bold tracking-tight text-content-strong">
          {formatExchangeRateValue(
            row.daily_exchange_rate,
            locale,
            t("summary.noRecord"),
          )}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 text-sm text-content-muted">
        <span>{historyCountLabel}</span>
        <span>{formatDateTime(row.created_at, locale)}</span>
      </div>
    </article>
  );
}

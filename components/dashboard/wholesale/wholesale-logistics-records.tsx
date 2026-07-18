"use client";

import { AlertTriangle, PackageSearch } from "lucide-react";
import { useTranslations } from "next-intl";

import { DashboardTableFrame } from "@/components/dashboard/dashboard-section-panel";
import { useLocale } from "@/components/i18n/locale-provider";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { StatusBadge } from "@/components/ui/status-badge";
import type { WholesaleCustomer, WholesaleProfile } from "@/lib/wholesale";
import type { WholesaleLogisticsPage } from "@/lib/wholesale-logistics-page";
import { cn } from "@/lib/utils";

import {
  formatWholesaleLogisticsDateTime,
  formatWholesaleLogisticsMoney,
  getWholesaleLogisticsCustomerName,
  getWholesaleLogisticsProfileName,
  isWholesaleLogisticsCostMissing,
} from "./wholesale-logistics-display";
import { WholesaleEmptyState } from "./wholesale-ui";

export function WholesaleLogisticsRecords({
  customersById,
  page,
  profilesById,
}: {
  customersById: Map<string, WholesaleCustomer>;
  page: WholesaleLogisticsPage;
  profilesById: Map<string, WholesaleProfile>;
}) {
  const t = useTranslations("WholesaleBusiness.logisticsArchive");
  const { locale } = useLocale();

  if (page.rows.length === 0) {
    return (
      <WholesaleEmptyState
        description={t("empty.description")}
        icon={<PackageSearch className="size-5" />}
        title={t("empty.title")}
      />
    );
  }

  return (
    <ResponsiveDataView
      desktop={
        <DashboardTableFrame>
          <table className="min-w-[1180px] w-full text-left text-sm">
            <thead className="bg-surface-inset text-[11px] tracking-[0.12em] text-content-muted uppercase">
              <tr>
                <th className="px-4 py-3.5">{t("columns.orderTime")}</th>
                <th className="px-4 py-3.5">{t("columns.sales")}</th>
                <th className="px-4 py-3.5">{t("columns.customer")}</th>
                <th className="px-4 py-3.5">{t("columns.store")}</th>
                <th className="px-4 py-3.5">{t("columns.package")}</th>
                <th className="px-4 py-3.5">{t("columns.tracking")}</th>
                <th className="px-4 py-3.5">{t("columns.status")}</th>
                <th className="px-4 py-3.5 text-right">
                  {t("columns.freight")}
                </th>
              </tr>
            </thead>
            <tbody>
              {page.rows.map((row) => {
                const missing = isWholesaleLogisticsCostMissing(
                  row.shipping_cost,
                );
                return (
                  <tr
                    className={cn(
                      "border-t border-border-subtle align-top text-content-muted",
                      missing &&
                        "border-l-4 border-l-status-danger bg-status-danger-soft",
                    )}
                    key={row.id}
                  >
                    <td className="whitespace-nowrap px-4 py-4">
                      {formatWholesaleLogisticsDateTime(
                        row.order_created_at,
                        locale,
                      )}
                    </td>
                    <td className="px-4 py-4 font-medium">
                      {getWholesaleLogisticsProfileName(
                        profilesById,
                        row.sales_user_id,
                        t("fallbacks.unassigned"),
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {getWholesaleLogisticsCustomerName(
                        customersById,
                        row.customer_id,
                        t("fallbacks.noCustomer"),
                      )}
                    </td>
                    <td className="max-w-48 break-words px-4 py-4">
                      {row.store_name || t("fallbacks.noStore")}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 font-semibold">
                      {row.package_number}
                    </td>
                    <td className="max-w-48 break-all px-4 py-4">
                      {row.tracking_number ||
                        row.last_mile_tracking_number ||
                        "—"}
                    </td>
                    <td className="max-w-56 px-4 py-4">
                      <p className="break-words">
                        {row.logistics_status || "—"}
                      </p>
                      {row.logistics_provider ? (
                        <p className="mt-1 text-xs text-content-muted">
                          {row.logistics_provider}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <FreightValue
                        amount={row.shipping_cost}
                        currency={row.shipping_currency}
                        locale={locale}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </DashboardTableFrame>
      }
      mobile={
        <>
          {page.rows.map((row) => {
            const missing = isWholesaleLogisticsCostMissing(row.shipping_cost);
            return (
              <article
                className={cn(
                  "min-w-0 rounded-[22px] border bg-white p-4 shadow-[var(--surface-shadow-interactive)]",
                  missing
                    ? "border-2 border-status-danger/60 bg-status-danger-soft"
                    : "border-border-subtle",
                )}
                key={row.id}
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-all font-semibold text-content-strong">
                      {row.package_number}
                    </p>
                    <p className="mt-1 break-words text-xs text-content-muted">
                      {row.store_name || t("fallbacks.noStore")}
                    </p>
                  </div>
                  <FreightValue
                    amount={row.shipping_cost}
                    currency={row.shipping_currency}
                    locale={locale}
                  />
                </div>

                <dl className="mt-4 grid min-w-0 grid-cols-2 gap-x-3 gap-y-3 text-sm">
                  <MobilePair
                    label={t("columns.orderTime")}
                    value={formatWholesaleLogisticsDateTime(
                      row.order_created_at,
                      locale,
                    )}
                  />
                  <MobilePair
                    label={t("columns.sales")}
                    value={getWholesaleLogisticsProfileName(
                      profilesById,
                      row.sales_user_id,
                      t("fallbacks.unassigned"),
                    )}
                  />
                  <MobilePair
                    label={t("columns.customer")}
                    value={getWholesaleLogisticsCustomerName(
                      customersById,
                      row.customer_id,
                      t("fallbacks.noCustomer"),
                    )}
                  />
                  <MobilePair
                    label={t("columns.tracking")}
                    value={
                      row.tracking_number ||
                      row.last_mile_tracking_number ||
                      "—"
                    }
                  />
                  <MobilePair
                    className="col-span-2"
                    label={t("columns.status")}
                    value={
                      [row.logistics_provider, row.logistics_status]
                        .filter(Boolean)
                        .join(" · ") || "—"
                    }
                  />
                </dl>
              </article>
            );
          })}
        </>
      }
    />
  );
}

function FreightValue({
  amount,
  currency,
  locale,
}: {
  amount: number | null;
  currency: string | null;
  locale: string;
}) {
  const t = useTranslations("WholesaleBusiness.logisticsArchive");
  const missing = isWholesaleLogisticsCostMissing(amount);

  if (missing) {
    return (
      <StatusBadge className="whitespace-nowrap" tone="warning">
        <AlertTriangle className="size-3.5 shrink-0" />
        {t("missingCost")}
      </StatusBadge>
    );
  }

  return (
    <span className="inline-block font-bold whitespace-nowrap text-content-strong">
      {formatWholesaleLogisticsMoney(
        Number(amount),
        currency || "UNKNOWN",
        locale,
      )}
    </span>
  );
}

function MobilePair({
  className,
  label,
  value,
}: {
  className?: string;
  label: string;
  value: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="text-[10px] font-semibold tracking-[0.12em] whitespace-nowrap text-content-subtle uppercase">
        {label}
      </dt>
      <dd className="mt-1 break-words text-content-muted [overflow-wrap:anywhere]">
        {value}
      </dd>
    </div>
  );
}

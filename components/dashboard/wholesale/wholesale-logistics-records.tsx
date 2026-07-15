"use client";

import { AlertTriangle, PackageSearch } from "lucide-react";
import { useTranslations } from "next-intl";

import { DashboardTableFrame } from "@/components/dashboard/dashboard-section-panel";
import { useLocale } from "@/components/i18n/locale-provider";
import { Button } from "@/components/ui/button";
import type {
  WholesaleCustomer,
  WholesaleProfile,
} from "@/lib/wholesale";
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
  loadingMore,
  onLoadMore,
  page,
  profilesById,
}: {
  customersById: Map<string, WholesaleCustomer>;
  loadingMore: boolean;
  onLoadMore: () => void;
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

  const footer = page.nextCursor ? (
    <div className="flex flex-col items-center justify-between gap-3 pt-4 sm:flex-row">
      <p className="text-sm text-[#6f7b85]">
        {t("list.shown", { shown: page.rows.length, total: page.totalCount })}
      </p>
      <Button
        className="min-h-10 w-full whitespace-normal rounded-full sm:w-auto"
        disabled={loadingMore}
        onClick={onLoadMore}
        type="button"
        variant="outline"
      >
        {loadingMore ? t("list.loadingMore") : t("list.loadMore")}
      </Button>
    </div>
  ) : null;

  return (
    <>
      <div className="hidden md:block">
        <DashboardTableFrame footer={footer}>
          <table className="min-w-[1180px] w-full text-left text-sm">
            <thead className="bg-[#f7f5f1] text-[11px] tracking-[0.12em] text-[#75818a] uppercase">
              <tr>
                <th className="px-4 py-3.5">{t("columns.orderTime")}</th>
                <th className="px-4 py-3.5">{t("columns.sales")}</th>
                <th className="px-4 py-3.5">{t("columns.customer")}</th>
                <th className="px-4 py-3.5">{t("columns.store")}</th>
                <th className="px-4 py-3.5">{t("columns.package")}</th>
                <th className="px-4 py-3.5">{t("columns.tracking")}</th>
                <th className="px-4 py-3.5">{t("columns.status")}</th>
                <th className="px-4 py-3.5 text-right">{t("columns.freight")}</th>
              </tr>
            </thead>
            <tbody>
              {page.rows.map((row) => {
                const missing = isWholesaleLogisticsCostMissing(row.shipping_cost);
                return (
                  <tr
                    className={cn(
                      "border-t border-[#ebe7e1] align-top text-[#33434d]",
                      missing && "border-l-4 border-l-[#d94841] bg-[#fff3f2]",
                    )}
                    key={row.id}
                  >
                    <td className="whitespace-nowrap px-4 py-4">
                      {formatWholesaleLogisticsDateTime(row.order_created_at, locale)}
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
                      {row.tracking_number || row.last_mile_tracking_number || "—"}
                    </td>
                    <td className="max-w-56 px-4 py-4">
                      <p className="break-words">{row.logistics_status || "—"}</p>
                      {row.logistics_provider ? (
                        <p className="mt-1 text-xs text-[#77838c]">
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
      </div>

      <div className="grid gap-3 md:hidden">
        {page.rows.map((row) => {
          const missing = isWholesaleLogisticsCostMissing(row.shipping_cost);
          return (
            <article
              className={cn(
                "min-w-0 rounded-[22px] border bg-white p-4 shadow-[0_10px_24px_rgba(96,113,128,0.06)]",
                missing
                  ? "border-2 border-[#d94841] bg-[#fff3f2]"
                  : "border-[#ebe7e1]",
              )}
              key={row.id}
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-all font-semibold text-[#23313a]">
                    {row.package_number}
                  </p>
                  <p className="mt-1 break-words text-xs text-[#77838c]">
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
                  value={formatWholesaleLogisticsDateTime(row.order_created_at, locale)}
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
                  value={row.tracking_number || row.last_mile_tracking_number || "—"}
                />
                <MobilePair
                  className="col-span-2"
                  label={t("columns.status")}
                  value={[row.logistics_provider, row.logistics_status]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                />
              </dl>
            </article>
          );
        })}
        {footer}
      </div>
    </>
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
      <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-[#d94841] px-2.5 py-1 text-xs font-bold whitespace-nowrap text-white">
        <AlertTriangle className="size-3.5 shrink-0" />
        {t("missingCost")}
      </span>
    );
  }

  return (
    <span className="inline-block font-bold whitespace-nowrap text-[#23313a]">
      {formatWholesaleLogisticsMoney(Number(amount), currency || "UNKNOWN", locale)}
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
      <dt className="text-[10px] font-semibold tracking-[0.12em] whitespace-nowrap text-[#88939b] uppercase">
        {label}
      </dt>
      <dd className="mt-1 break-words text-[#33434d] [overflow-wrap:anywhere]">
        {value}
      </dd>
    </div>
  );
}

import { UiMessage } from "@/components/i18n/ui-message";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { useTranslations } from "next-intl";
import type { WholesaleOrderPageSummary } from "@/lib/wholesale-order-page";
import { formatCurrency, formatPercent } from "./wholesale-display";
import { WholesaleStatGrid } from "./wholesale-ui";
export function WholesaleOrderSummary({
  summary,
}: {
  summary: WholesaleOrderPageSummary;
}) {
  const t = useTranslations("WholesaleBusiness.ordersUi");
  const stats = [
    { label: t("summary.orderCount"), value: `${summary.orderCount}` },
    {
      label: t("summary.customerPaymentRmb"),
      value: formatCurrency(summary.customerPaymentRmbAmount),
    },
    {
      label: t("summary.grossProfit"),
      value: formatCurrency(summary.grossProfitAmount),
    },
    {
      label: t("summary.averageMargin"),
      value: formatPercent(summary.averageMargin, t("fallbacks.notGenerated")),
    },
  ];
  return (
    <ResponsiveDataView
      desktop={<WholesaleStatGrid stats={stats} />}
      mobile={
        <details className="rounded-control-large border border-border-subtle bg-surface-panel">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-primary [&::-webkit-details-marker]:hidden">
            <UiMessage id="components_dashboard_wholesale_wholesale_order_summary.text001" />
          </summary>
          <div className="border-t border-border-subtle p-4">
            <WholesaleStatGrid stats={stats} />
          </div>
        </details>
      }
    />
  );
}

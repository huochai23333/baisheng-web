import { UiMessage } from "@/components/i18n/ui-message";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import {
  CircleDollarSign,
  PackageCheck,
  Percent,
  TrendingUp,
} from "lucide-react";
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
    {
      icon: <PackageCheck className="size-4" />,
      label: t("summary.orderCount"),
      tone: "info" as const,
      value: `${summary.orderCount}`,
    },
    {
      icon: <CircleDollarSign className="size-4" />,
      label: t("summary.customerPaymentRmb"),
      tone: "success" as const,
      value: formatCurrency(summary.customerPaymentRmbAmount),
    },
    {
      icon: <TrendingUp className="size-4" />,
      label: t("summary.grossProfit"),
      tone: "success" as const,
      value: formatCurrency(summary.grossProfitAmount),
    },
    {
      icon: <Percent className="size-4" />,
      label: t("summary.averageMargin"),
      tone: "warning" as const,
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

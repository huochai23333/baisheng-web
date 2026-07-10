import type { WholesaleOrderPageSummary } from "@/lib/wholesale-order-page";

import { formatCurrency, formatPercent } from "./wholesale-display";
import { WholesaleStatGrid } from "./wholesale-ui";

export function WholesaleOrderSummary({
  summary,
}: {
  summary: WholesaleOrderPageSummary;
}) {
  const stats = [
    { label: "订单数量", value: `${summary.orderCount}` },
    {
      label: "客户支付人民币",
      value: formatCurrency(summary.customerPaymentRmbAmount),
    },
    { label: "毛利合计", value: formatCurrency(summary.grossProfitAmount) },
    { label: "平均毛利率", value: formatPercent(summary.averageMargin) },
  ];

  return (
    <>
      <div className="hidden md:block">
        <WholesaleStatGrid stats={stats} />
      </div>
      <details className="rounded-[22px] border border-[#e7e2db] bg-white/90 md:hidden">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-[#486782] [&::-webkit-details-marker]:hidden">
          本月概览（点击展开）
        </summary>
        <div className="border-t border-[#ece7df] p-4">
          <WholesaleStatGrid stats={stats} />
        </div>
      </details>
    </>
  );
}

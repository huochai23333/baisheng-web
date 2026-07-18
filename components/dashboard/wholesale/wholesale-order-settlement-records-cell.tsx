import { UiMessage } from "@/components/i18n/ui-message";
import type { WholesaleOrderSettlement } from "@/lib/wholesale";
import { formatCurrency, formatDate, formatRate } from "./wholesale-display";

/** 桌面订单表中的结汇明细独立滚动，避免继续扩大主表格组件。 */
export function WholesaleOrderSettlementRecordsCell({
  currency,
  settlements,
}: {
  currency: string;
  settlements: WholesaleOrderSettlement[];
}) {
  if (settlements.length === 0) {
    return (
      <span className="text-content-muted">
        <UiMessage id="components_dashboard_wholesale_wholesale_orders_table.text030" />
      </span>
    );
  }

  return (
    <div className="grid max-h-24 gap-2 overflow-y-auto pr-1">
      {settlements.map((settlement) => (
        <div
          className="rounded-[10px] bg-surface-inset p-2 text-xs leading-5 text-content-muted"
          key={settlement.id}
        >
          <p className="font-semibold text-content-muted">
            {formatDate(settlement.settled_on)}
          </p>
          <p>
            {formatCurrency(settlement.settlement_amount, currency)}
            <UiMessage id="components_dashboard_wholesale_wholesale_orders_table.text031" />{" "}
            {formatRate(settlement.settlement_exchange_rate)}
          </p>
          <p>{formatCurrency(settlement.settlement_rmb_amount)}</p>
        </div>
      ))}
    </div>
  );
}

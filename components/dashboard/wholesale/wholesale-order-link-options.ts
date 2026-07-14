import type { WholesaleOrderLinkOption } from "@/lib/wholesale";

import { formatCurrency } from "./wholesale-display";

/**
 * 为所有“关联批发订单”下拉生成同一种日常业务文案。
 * 币种必须跟金额一起展示，否则不同币种的相同数字容易被误认成同一金额。
 */
export function formatWholesaleOrderLinkOption(
  order: WholesaleOrderLinkOption,
) {
  return `${order.order_number} · ${formatCurrency(
    order.customer_payment_amount,
    order.customer_payment_currency,
  )}`;
}

/**
 * 先复制再排序，避免 Array.sort 直接改动父组件传入的原数组。
 * ordered_at 相同的时候再按 ID 倒序，确保每次打开弹窗的顺序都完全一致。
 */
export function sortWholesaleOrderLinkOptionsNewestFirst<
  T extends WholesaleOrderLinkOption,
>(orders: readonly T[]) {
  return [...orders].sort((left, right) => {
    const leftTime = getSafeOrderTime(left.ordered_at);
    const rightTime = getSafeOrderTime(right.ordered_at);
    const timeDifference = rightTime - leftTime;

    return timeDifference || right.id.localeCompare(left.id);
  });
}

/** 统一完成“先选客户，再看该客户订单”的过滤和排序。 */
export function getWholesaleOrderLinkOptionsForCustomer<
  T extends WholesaleOrderLinkOption,
>(orders: readonly T[], customerId: string) {
  if (!customerId) return [];

  return sortWholesaleOrderLinkOptionsNewestFirst(
    orders.filter((order) => order.customer_id === customerId),
  );
}

function getSafeOrderTime(value: string) {
  const timestamp = Date.parse(value);

  // 数据库正常会返回有效时间；兜底为 0 可以避免异常数据让排序比较结果变成 NaN。
  return Number.isFinite(timestamp) ? timestamp : 0;
}

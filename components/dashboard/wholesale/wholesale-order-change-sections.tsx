"use client";

import { UiMessage } from "@/components/i18n/ui-message";
import { useTranslations } from "next-intl";
import { History } from "lucide-react";
import { DashboardListSection } from "@/components/dashboard/dashboard-section-panel";
import type {
  WholesaleCustomer,
  WholesaleOrderListItem,
  WholesaleOrderChangeLog,
  WholesaleProfile,
} from "@/lib/wholesale";
import {
  formatDateTime,
  getCustomerName,
  getProfileName,
} from "./wholesale-display";
import {
  WholesaleEmptyState,
  WholesaleTable,
  WholesaleTd,
  WholesaleTh,
} from "./wholesale-ui";

type WholesaleOrderChangeSectionsProps = {
  customersById: Map<string, WholesaleCustomer>;
  logs: WholesaleOrderChangeLog[];
  ordersById: Map<string, WholesaleOrderListItem>;
  profilesById: Map<string, WholesaleProfile>;
};

const EDIT_FIELD_LABELS: Record<string, string> = {
  courier_company: "快递公司",
  customer_id: "客户",
  customer_payment_amount: "客户支付金额",
  customer_payment_currency: "客户支付币种",
  international_shipping_fee: "国际运费",
  notes: "备注",
  order_month: "订单计入月份",
  other_fee: "其他费用",
  payment_platform: "收款平台",
  product_purchase_amount: "产品采购金额",
  referral_commission_fee: "推荐佣金费用",
  sales_user_id: "业务员",
  settlement_exchange_rate: "结汇汇率",
  small_order_count: "小单数量",
};

const EDIT_FIELD_ORDER = Object.keys(EDIT_FIELD_LABELS);

/** 只展示已经实际写入订单的修改，申请和审批流程已从系统移除。 */
export function WholesaleOrderChangeSections({
  customersById,
  logs,
  ordersById,
  profilesById,
}: WholesaleOrderChangeSectionsProps) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_order_change_sections",
  );

  return (
    <DashboardListSection
      description={uiText("attribute005")}
      title={uiText("attribute006")}
    >
      {logs.length === 0 ? (
        <WholesaleEmptyState
          description={uiText("attribute007")}
          icon={<History className="size-5" />}
          title={uiText("attribute008")}
        />
      ) : (
        <WholesaleTable minWidth={920}>
          <thead>
            <tr>
              <WholesaleTh>
                <UiMessage id="components_dashboard_wholesale_wholesale_order_change_sections.text011" />
              </WholesaleTh>
              <WholesaleTh>
                <UiMessage id="components_dashboard_wholesale_wholesale_order_change_sections.text012" />
              </WholesaleTh>
              <WholesaleTh>
                <UiMessage id="components_dashboard_wholesale_wholesale_order_change_sections.text013" />
              </WholesaleTh>
              <WholesaleTh>
                <UiMessage id="components_dashboard_wholesale_wholesale_order_change_sections.text014" />
              </WholesaleTh>
              <WholesaleTh>
                <UiMessage id="components_dashboard_wholesale_wholesale_order_change_sections.text015" />
              </WholesaleTh>
              <WholesaleTh>
                <UiMessage id="components_dashboard_wholesale_wholesale_order_change_sections.text016" />
              </WholesaleTh>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const order = ordersById.get(log.order_id);
              return (
                <tr key={log.id}>
                  <WholesaleTd className="min-w-[160px] whitespace-normal">
                    {order?.order_number ?? "未找到订单"}
                  </WholesaleTd>
                  <WholesaleTd className="min-w-[150px] whitespace-normal">
                    {order
                      ? getCustomerName(customersById, order.customer_id)
                      : "未记录"}
                  </WholesaleTd>
                  <WholesaleTd className="min-w-[150px] whitespace-normal">
                    {getProfileName(profilesById, log.actor_user_id)}
                  </WholesaleTd>
                  <WholesaleTd>{getLogActionLabel(log.action)}</WholesaleTd>
                  <WholesaleTd className="min-w-[240px] whitespace-normal">
                    {formatLogChangeSummary(log)}
                  </WholesaleTd>
                  <WholesaleTd>{formatDateTime(log.created_at)}</WholesaleTd>
                </tr>
              );
            })}
          </tbody>
        </WholesaleTable>
      )}
    </DashboardListSection>
  );
}

function formatLogChangeSummary(log: WholesaleOrderChangeLog) {
  return formatChangedFieldLabels(log.previous_data, log.next_data);
}

function getLogActionLabel(action: WholesaleOrderChangeLog["action"]) {
  switch (action) {
    case "settlement_rate_batch_update":
    case "settlement_rate_update":
      return "结汇记录调整";
    case "direct_update":
      return "直接修改";
  }
}

function formatChangedFieldLabels(
  previousData: Record<string, unknown>,
  nextData: Record<string, unknown>,
) {
  const changedLabels = EDIT_FIELD_ORDER.filter((key) =>
    hasDisplayChange(previousData[key], nextData[key]),
  ).map((key) => EDIT_FIELD_LABELS[key]);

  if (changedLabels.length === 0) {
    return "内容已重新保存";
  }

  return changedLabels.join("、");
}

function hasDisplayChange(left: unknown, right: unknown) {
  // 页面只展示易读摘要；数据库仍保存完整前后快照，方便日后精确核对。
  return normalizeSummaryValue(left) !== normalizeSummaryValue(right);
}

function normalizeSummaryValue(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "number") {
    return String(Math.round(value * 1000000) / 1000000);
  }

  return String(value);
}

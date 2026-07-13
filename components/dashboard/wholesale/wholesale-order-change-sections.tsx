"use client";
import { UiMessage } from "@/components/i18n/ui-message";
import { useTranslations } from "next-intl";
import {
  CheckCircle2,
  History,
  Inbox,
  LoaderCircle,
  XCircle,
} from "lucide-react";
import { DashboardListSection } from "@/components/dashboard/dashboard-section-panel";
import { Button } from "@/components/ui/button";
import type {
  WholesaleCustomer,
  WholesaleOrderListItem,
  WholesaleOrderChangeLog,
  WholesaleOrderEditRequest,
  WholesaleProfile,
} from "@/lib/wholesale";
import {
  formatDateTime,
  getCustomerName,
  getProfileName,
} from "./wholesale-display";
import {
  WholesaleEmptyState,
  WholesaleStatusBadge,
  WholesaleTable,
  WholesaleTd,
  WholesaleTh,
} from "./wholesale-ui";
type WholesaleOrderChangeSectionsProps = {
  canReviewRequests: boolean;
  customersById: Map<string, WholesaleCustomer>;
  logs: WholesaleOrderChangeLog[];
  onApproveRequest: (requestId: string) => Promise<boolean>;
  onRejectRequest: (requestId: string) => Promise<boolean>;
  ordersById: Map<string, WholesaleOrderListItem>;
  pendingKey: string | null;
  profilesById: Map<string, WholesaleProfile>;
  requests: WholesaleOrderEditRequest[];
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
export function WholesaleOrderChangeSections({
  canReviewRequests,
  customersById,
  logs,
  onApproveRequest,
  onRejectRequest,
  ordersById,
  pendingKey,
  profilesById,
  requests,
}: WholesaleOrderChangeSectionsProps) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_order_change_sections",
  );
  const visibleRequests = canReviewRequests
    ? requests
    : requests.filter((request) => request.status !== "approved");
  return (
    <>
      {canReviewRequests || visibleRequests.length > 0 ? (
        <DashboardListSection
          description={uiText("attribute001")}
          title={uiText("attribute002")}
        >
          {visibleRequests.length === 0 ? (
            <WholesaleEmptyState
              description={uiText("attribute003")}
              icon={<Inbox className="size-5" />}
              title={uiText("attribute004")}
            />
          ) : (
            <WholesaleTable minWidth={980}>
              <thead>
                <tr>
                  <WholesaleTh>
                    <UiMessage id="components_dashboard_wholesale_wholesale_order_change_sections.text001" />
                  </WholesaleTh>
                  <WholesaleTh>
                    <UiMessage id="components_dashboard_wholesale_wholesale_order_change_sections.text002" />
                  </WholesaleTh>
                  <WholesaleTh>
                    <UiMessage id="components_dashboard_wholesale_wholesale_order_change_sections.text003" />
                  </WholesaleTh>
                  <WholesaleTh>
                    <UiMessage id="components_dashboard_wholesale_wholesale_order_change_sections.text004" />
                  </WholesaleTh>
                  <WholesaleTh>
                    <UiMessage id="components_dashboard_wholesale_wholesale_order_change_sections.text005" />
                  </WholesaleTh>
                  <WholesaleTh>
                    <UiMessage id="components_dashboard_wholesale_wholesale_order_change_sections.text006" />
                  </WholesaleTh>
                  <WholesaleTh>
                    <UiMessage id="components_dashboard_wholesale_wholesale_order_change_sections.text007" />
                  </WholesaleTh>
                  {canReviewRequests ? (
                    <WholesaleTh>
                      <UiMessage id="components_dashboard_wholesale_wholesale_order_change_sections.text008" />
                    </WholesaleTh>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {visibleRequests.map((request) => {
                  const order = ordersById.get(request.order_id);
                  const isPending = request.status === "pending";
                  return (
                    <tr key={request.id}>
                      <WholesaleTd className="min-w-[160px] whitespace-normal">
                        {order?.order_number ?? "未找到订单"}
                      </WholesaleTd>
                      <WholesaleTd className="min-w-[150px] whitespace-normal">
                        {order
                          ? getCustomerName(customersById, order.customer_id)
                          : "未记录"}
                      </WholesaleTd>
                      <WholesaleTd className="min-w-[150px] whitespace-normal">
                        {getProfileName(
                          profilesById,
                          request.requested_by_user_id,
                        )}
                      </WholesaleTd>
                      <WholesaleTd className="min-w-[220px] whitespace-normal">
                        {formatRequestChangeSummary(request)}
                      </WholesaleTd>
                      <WholesaleTd className="min-w-[220px] whitespace-normal">
                        {request.request_note ?? "未填写"}
                      </WholesaleTd>
                      <WholesaleTd>
                        <WholesaleStatusBadge
                          tone={getRequestStatusTone(request.status)}
                        >
                          {getRequestStatusLabel(request.status)}
                        </WholesaleStatusBadge>
                      </WholesaleTd>
                      <WholesaleTd>
                        {formatDateTime(request.created_at)}
                      </WholesaleTd>
                      {canReviewRequests ? (
                        <WholesaleTd>
                          {isPending ? (
                            <div className="flex min-w-[170px] flex-wrap gap-2">
                              <Button
                                className="h-9 rounded-full bg-[#486782] px-3 text-xs text-white hover:bg-[#3e5f79]"
                                disabled={
                                  pendingKey ===
                                  `order-edit:approve:${request.id}`
                                }
                                onClick={() =>
                                  void onApproveRequest(request.id)
                                }
                                type="button"
                              >
                                {pendingKey ===
                                `order-edit:approve:${request.id}` ? (
                                  <LoaderCircle className="size-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="size-3.5" />
                                )}
                                <UiMessage id="components_dashboard_wholesale_wholesale_order_change_sections.text009" />
                              </Button>
                              <Button
                                className="h-9 rounded-full border border-[#f1d1d1] bg-[#fff2f2] px-3 text-xs text-[#b13d3d] hover:bg-[#fce5e5]"
                                disabled={
                                  pendingKey ===
                                  `order-edit:reject:${request.id}`
                                }
                                onClick={() => void onRejectRequest(request.id)}
                                type="button"
                                variant="outline"
                              >
                                {pendingKey ===
                                `order-edit:reject:${request.id}` ? (
                                  <LoaderCircle className="size-3.5 animate-spin" />
                                ) : (
                                  <XCircle className="size-3.5" />
                                )}
                                <UiMessage id="components_dashboard_wholesale_wholesale_order_change_sections.text010" />
                              </Button>
                            </div>
                          ) : (
                            "已处理"
                          )}
                        </WholesaleTd>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </WholesaleTable>
          )}
        </DashboardListSection>
      ) : null}

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
    </>
  );
}
function formatRequestChangeSummary(request: WholesaleOrderEditRequest) {
  return formatChangedFieldLabels(
    request.current_snapshot,
    request.requested_changes,
  );
}
function formatLogChangeSummary(log: WholesaleOrderChangeLog) {
  return formatChangedFieldLabels(log.previous_data, log.next_data);
}
function getLogActionLabel(action: WholesaleOrderChangeLog["action"]) {
  switch (action) {
    case "approved_update":
      return "管理员通过申请";
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
  // 这里只统一展示摘要，数据库仍保存完整的修改前后快照，方便后续精确核对。
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
function getRequestStatusLabel(status: WholesaleOrderEditRequest["status"]) {
  switch (status) {
    case "approved":
      return "已通过";
    case "rejected":
      return "已退回";
    case "pending":
      return "待处理";
  }
}
function getRequestStatusTone(status: WholesaleOrderEditRequest["status"]) {
  switch (status) {
    case "approved":
      return "success";
    case "rejected":
      return "danger";
    case "pending":
      return "warning";
  }
}

import type { UserStatus } from "./auth-metadata";
import type { AppRole } from "./auth-routing";
import type { CommissionRuleSetting } from "./commission-settings";
import type { ExchangeRateRow } from "./exchange-rates";
import type { WholesaleLogisticsStatus } from "./wholesale-logistics-statuses";
import type {
  WholesaleLogisticsFeePage,
  WholesaleLogisticsStatusPage,
} from "./wholesale-logistics-page";
import type { WholesaleOrderEditSettings } from "./wholesale-order-edit-settings";
import type { WholesaleOrderPage } from "./wholesale-order-page";
import type { WorkspaceWholesaleSectionKey } from "./workspace-config";

export type WholesaleCustomer = {
  id: string;
  registered_user_id: string | null;
  assigned_sales_user_id: string | null;
  created_by_user_id: string | null;
  customer_kind: "registered_account" | "sales_created";
  unique_name: string;
  other_names: string[];
  contact_details: string | null;
  source: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type WholesaleOrder = {
  id: string;
  order_number: string;
  customer_id: string;
  sales_user_id: string | null;
  small_order_count: number;
  product_purchase_amount: number;
  packing_fee: number;
  international_shipping_fee: number;
  other_fee: number;
  referral_commission_fee: number;
  courier_company: string | null;
  settlement_exchange_rate: number | null;
  customer_payment_currency: string;
  customer_payment_amount: number;
  customer_payment_rmb_amount: number | null;
  payment_platform: string | null;
  gross_profit: number | null;
  gross_margin: number | null;
  unit_gross_profit: number | null;
  commission_rate: number;
  notes: string | null;
  order_month: string;
  status: "unsettled" | "partial_settled" | "settled";
  ordered_at: string;
  settled_at: string | null;
  created_by_user_id: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * 关联弹窗只需要辨认订单，不应该顺带获取成本、利润等内部字段。
 * 使用独立类型可以让 TypeScript 在有人误用未查询字段时立即报错。
 */
export type WholesaleOrderLinkOption = Pick<
  WholesaleOrder,
  | "customer_id"
  | "customer_payment_amount"
  | "customer_payment_currency"
  | "id"
  | "order_number"
  | "ordered_at"
>;

export type WholesaleOrderInternalFieldKey =
  | "international_shipping_fee"
  | "order_month"
  | "other_fee"
  | "payment_platform"
  | "product_purchase_amount"
  | "referral_commission_fee";

/**
 * 客户订单列表不会收到内部成本字段，因此列表类型把这六项声明为可选。
 * 内部编辑表单仍继续使用字段完整的 WholesaleOrder，避免把缺失数据误写回数据库。
 */
export type WholesaleOrderListItem = Omit<
  WholesaleOrder,
  WholesaleOrderInternalFieldKey
> &
  Partial<Pick<WholesaleOrder, WholesaleOrderInternalFieldKey>>;

export function hasWholesaleOrderInternalFields(
  order: WholesaleOrderListItem,
): order is WholesaleOrder {
  return (
    order.product_purchase_amount !== undefined &&
    order.international_shipping_fee !== undefined &&
    order.other_fee !== undefined &&
    order.referral_commission_fee !== undefined &&
    order.payment_platform !== undefined &&
    order.order_month !== undefined
  );
}

export type WholesaleOrderSettlement = {
  id: string;
  order_id: string;
  settlement_amount: number;
  settlement_exchange_rate: number;
  settlement_rmb_amount: number;
  source_settlement_release_id: string | null;
  settled_on: string;
  settled_at: string;
  created_by_user_id: string | null;
  created_at: string;
};

export type WholesaleOrderEditRequestStatus =
  | "approved"
  | "pending"
  | "rejected";

export type WholesaleOrderEditRequest = {
  id: string;
  order_id: string;
  requested_by_user_id: string;
  requested_changes: Record<string, unknown>;
  current_snapshot: Record<string, unknown>;
  request_note: string | null;
  status: WholesaleOrderEditRequestStatus;
  reviewer_user_id: string | null;
  review_note: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type WholesaleOrderChangeLog = {
  id: string;
  order_id: string;
  request_id: string | null;
  actor_user_id: string | null;
  action:
    | "approved_update"
    | "direct_update"
    | "settlement_rate_batch_update"
    | "settlement_rate_update";
  previous_data: Record<string, unknown>;
  next_data: Record<string, unknown>;
  note: string | null;
  created_at: string;
};

export type Wholesale1688Order = {
  id: string;
  batch_id: string | null;
  external_order_number: string;
  seller_name: string | null;
  item_summary: string | null;
  quantity: number | null;
  purchase_amount: number | null;
  order_status: string | null;
  purchased_at: string | null;
  recipient_name: string | null;
  raw_payload: Record<string, unknown>;
  assisted_customer_id: string | null;
  assisted_at: string | null;
  customer_id: string | null;
  wholesale_order_id: string | null;
  claimed_by_user_id: string | null;
  claimed_at: string | null;
  imported_by_user_id: string | null;
  created_at: string;
};

export type WholesaleLogisticsOrder = {
  id: string;
  batch_id: string | null;
  customer_id: string | null;
  wholesale_order_id: string | null;
  source_workflow_order_number: string | null;
  international_tracking_number: string;
  destination_tracking_number: string | null;
  freight_forwarder: string | null;
  latest_status: string | null;
  latest_checkpoint_at: string | null;
  logistics_fee: number;
  currency: string;
  created_by_user_id: string | null;
  created_at: string;
  updated_at: string;
};

export type WholesaleCommission = {
  id: string;
  order_id: string;
  beneficiary_user_id: string | null;
  customer_id: string | null;
  order_payment_rmb_amount: number;
  gross_profit_rmb: number;
  commission_rate: number;
  commission_amount_rmb: number;
  status: "pending" | "settled" | "cancelled";
  calculated_at: string;
  settled_at: string | null;
  settled_by_user_id: string | null;
};

export type WholesaleReferral = {
  id: string;
  referrer_customer_id: string;
  referred_customer_id: string;
  created_by_user_id: string | null;
  created_at: string;
};

export type WholesaleProfile = {
  user_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  status: UserStatus | null;
  city: string | null;
  role: AppRole | null;
};

export type WholesalePageData = {
  currentUserId: string | null;
  currentRole: AppRole | null;
  commissionRuleSettings: CommissionRuleSetting[];
  customers: WholesaleCustomer[];
  exchangeRates: ExchangeRateRow[];
  orderChangeLogs: WholesaleOrderChangeLog[];
  orderEditRequests: WholesaleOrderEditRequest[];
  orderEditSettings: WholesaleOrderEditSettings;
  orderPage: WholesaleOrderPage | null;
  orderPageError: string | null;
  orderLinkOptions: WholesaleOrderLinkOption[];
  orders: WholesaleOrder[];
  orderSettlements: WholesaleOrderSettlement[];
  purchaseOrders: Wholesale1688Order[];
  logisticsOrders: WholesaleLogisticsOrder[];
  logisticsStatuses: WholesaleLogisticsStatus[];
  logisticsFeePage: WholesaleLogisticsFeePage | null;
  logisticsStatusPage: WholesaleLogisticsStatusPage | null;
  commissions: WholesaleCommission[];
  referrals: WholesaleReferral[];
  profiles: WholesaleProfile[];
  registeredCandidates: WholesaleProfile[];
  section: WorkspaceWholesaleSectionKey;
};

import type { SupabaseClient } from "@supabase/supabase-js";

export type WholesaleLogisticsStatusKind =
  | "checking"
  | "delivered"
  | "exception"
  | "stopped";

export type WholesaleLogisticsStatus = {
  id: string;
  tracking_number: string;
  customer_name: string;
  customer_id: string | null;
  wholesale_order_id: string | null;
  status_text: string;
  status_kind: WholesaleLogisticsStatusKind;
  is_terminal: boolean;
  last_checked_at: string | null;
  next_check_at: string;
  source_updated_at: string | null;
  last_error: string | null;
  created_by_user_id: string | null;
  created_at: string;
  updated_at: string;
};

export type WholesaleLogisticsStatusQueryResult = {
  data: WholesaleLogisticsStatus[] | null;
  error: { message: string } | null;
};

const WHOLESALE_LOGISTICS_STATUS_LIST_LIMIT = 500;

export function getWholesaleLogisticsStatuses(supabase: SupabaseClient) {
  // 这里仅供提成汇总等关联功能读取；物流管理页已经使用独立的全量筛选分页接口。
  return supabase
    .from("wholesale_logistics_statuses")
    .select("*")
    .order("is_terminal", { ascending: true })
    .order("updated_at", { ascending: false })
    .limit(WHOLESALE_LOGISTICS_STATUS_LIST_LIMIT) as unknown as Promise<
    WholesaleLogisticsStatusQueryResult
  >;
}

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  optionalString,
  requiredString,
} from "./wholesale-action-utils";

export type WholesaleLogisticsRecordType = "fee" | "status";

export async function createWholesaleLogisticsStatus(
  supabase: SupabaseClient,
  formData: FormData,
) {
  const trackingNumber = requiredString(formData.get("tracking_number"));
  const customerName = requiredString(formData.get("customer_name"));

  // 新增时只登记核对所需的最小资料；每日同步任务负责补齐后续物流状态。
  // next_check_at 设置为当前时间，表示这条物流号可以在下一次定时任务中立即核对。
  const { error } = await supabase.from("wholesale_logistics_statuses").insert({
    customer_id: optionalString(formData.get("customer_id")),
    customer_name: customerName,
    next_check_at: new Date().toISOString(),
    status_kind: "checking",
    status_text: "等待查询",
    tracking_number: trackingNumber,
    wholesale_order_id: optionalString(formData.get("wholesale_order_id")),
  });

  if (error) {
    throw error;
  }
}

export async function setWholesaleLogisticsOrderLink(
  supabase: SupabaseClient,
  recordType: WholesaleLogisticsRecordType,
  recordId: string,
  wholesaleOrderId: string | null,
) {
  // 只提交订单 ID：数据库触发器会根据订单自动校正客户，解除时则保留现有客户。
  const query =
    recordType === "status"
      ? supabase
          .from("wholesale_logistics_statuses")
          .update({ wholesale_order_id: wholesaleOrderId })
          .eq("id", recordId)
          .select("id")
          .maybeSingle()
      : supabase
          .from("wholesale_logistics_orders")
          .update({ wholesale_order_id: wholesaleOrderId })
          .eq("id", recordId)
          .select("id")
          .maybeSingle();
  const { data, error } = await query;

  if (error) throw error;
  if (!data) throw new Error("logistics link not permitted");
}

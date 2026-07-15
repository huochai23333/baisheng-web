import type { SupabaseClient } from "@supabase/supabase-js";

export type ChangeWholesaleLogisticsAssignmentInput = {
  assignmentId: string;
  customerId: string | null;
  effectiveFrom: string | null;
  salesUserId: string;
};

/** 初次分配可一次选择多个真实店小秘店铺，并默认覆盖这些店铺的全部历史订单。 */
export async function assignWholesaleLogisticsStores(
  supabase: SupabaseClient,
  input: {
    customerId: string | null;
    salesUserId: string;
    storeNames: string[];
  },
) {
  const { error } = await supabase.rpc("assign_wholesale_logistics_stores", {
    p_customer_id: input.customerId,
    p_sales_user_id: input.salesUserId,
    p_store_names: input.storeNames,
  });

  if (error) throw error;
}

/** 不传日期时更新整个当前区间；传入日期时由数据库拆分前后历史区间。 */
export async function changeWholesaleLogisticsAssignment(
  supabase: SupabaseClient,
  input: ChangeWholesaleLogisticsAssignmentInput,
) {
  const { error } = await supabase.rpc(
    "change_wholesale_logistics_store_assignment",
    {
      p_assignment_id: input.assignmentId,
      p_customer_id: input.customerId,
      p_effective_from: input.effectiveFrom,
      p_sales_user_id: input.salesUserId,
    },
  );

  if (error) throw error;
}

export async function endWholesaleLogisticsAssignment(
  supabase: SupabaseClient,
  assignmentId: string,
  effectiveTo: string,
) {
  const { error } = await supabase.rpc(
    "end_wholesale_logistics_store_assignment",
    {
      p_assignment_id: assignmentId,
      p_effective_to: effectiveTo,
    },
  );

  if (error) throw error;
}

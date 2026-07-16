import { getBrowserSupabaseClient } from "@/lib/supabase";

import type { RunWholesaleAction } from "./use-wholesale-action-runner";

type Imported1688Row = {
  external_order_number: string;
  seller_name?: string | null;
  item_summary?: string | null;
  quantity?: number | null;
  purchase_amount?: number | null;
  order_status?: string | null;
  purchased_at?: string | null;
  recipient_name?: string | null;
  raw_payload: Record<string, unknown>;
};

/** 1688 导入、认领和删除属于同一采购归属业务域。 */
export function createWholesaleClaimsActions(runAction: RunWholesaleAction) {
  const import1688Rows = (fileName: string, rows: Imported1688Row[]) =>
    runAction("1688:import", "1688 采购订单已接收。", async () => {
      if (rows.length === 0) throw new Error("empty import");

      const supabase = getBrowserSupabaseClient();
      if (!supabase) throw new Error("client unavailable");

      const { data: batch, error: batchError } = await supabase
        .from("wholesale_1688_import_batches")
        .insert({ file_name: fileName, row_count: rows.length, source: "csv" })
        .select("id")
        .single();
      if (batchError || !batch) throw batchError ?? new Error("batch failed");

      const { error } = await supabase.from("wholesale_1688_orders").upsert(
        rows.map((row) => ({
          ...row,
          batch_id: batch.id,
        })),
        { ignoreDuplicates: true, onConflict: "external_order_number" },
      );
      if (error) throw error;
    });

  const create1688ClaimGroup = (
    purchaseOrderIds: string[],
    customerId: string,
    wholesaleOrderIds: string[],
  ) =>
    runAction(
      "1688:create-claim-group",
      `已认领 ${purchaseOrderIds.length} 条采购订单。`,
      async () => {
        if (purchaseOrderIds.length === 0 || wholesaleOrderIds.length === 0) {
          throw new Error("empty bulk claim");
        }

        const supabase = getBrowserSupabaseClient();
        if (!supabase) throw new Error("client unavailable");

        // 两侧编号一次性交给数据库，数据库会在同一事务中校验并建立认领组。
        const { error } = await supabase.rpc(
          "create_wholesale_1688_claim_group",
          {
          p_purchase_order_ids: purchaseOrderIds,
          p_customer_id: customerId,
          p_wholesale_order_ids: wholesaleOrderIds,
          },
        );
        if (error) throw error;
      },
    );

  const update1688ClaimGroup = (
    claimGroupId: string,
    purchaseOrderIds: string[],
    customerId: string,
    wholesaleOrderIds: string[],
  ) =>
    runAction("1688:update-claim-group", "认领关系已更新。", async () => {
      const supabase = getBrowserSupabaseClient();
      if (!supabase) throw new Error("client unavailable");

      const { error } = await supabase.rpc(
        "update_wholesale_1688_claim_group",
        {
          p_claim_group_id: claimGroupId,
          p_customer_id: customerId,
          p_purchase_order_ids: purchaseOrderIds,
          p_wholesale_order_ids: wholesaleOrderIds,
        },
      );
      if (error) throw error;
    });

  const cancel1688ClaimGroup = (claimGroupId: string) =>
    runAction("1688:cancel-claim-group", "认领已撤销。", async () => {
      const supabase = getBrowserSupabaseClient();
      if (!supabase) throw new Error("client unavailable");

      const { error } = await supabase.rpc(
        "cancel_wholesale_1688_claim_group",
        { p_claim_group_id: claimGroupId },
      );
      if (error) throw error;
    });

  const delete1688Order = (purchaseOrderId: string) =>
    runAction("1688:delete", "采购订单已移出当前认领列表。", async () => {
      const supabase = getBrowserSupabaseClient();
      if (!supabase) throw new Error("client unavailable");

      const { error } = await supabase.rpc("delete_wholesale_1688_order", {
        p_1688_order_id: purchaseOrderId,
      });
      if (error) throw error;
    });

  return {
    cancel1688ClaimGroup,
    create1688ClaimGroup,
    delete1688Order,
    import1688Rows,
    update1688ClaimGroup,
  };
}

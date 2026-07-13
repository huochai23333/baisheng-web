import { getBrowserSupabaseClient } from "@/lib/supabase";

import { optionalString, requiredString } from "./wholesale-action-utils";
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
  customer_id?: string | null;
  wholesale_order_id?: string | null;
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
          customer_id: null,
          wholesale_order_id: null,
        })),
        { ignoreDuplicates: true, onConflict: "external_order_number" },
      );
      if (error) throw error;
    });

  const claim1688Order = (formData: FormData) =>
    runAction("1688:claim", "采购订单已归属客户。", async () => {
      const supabase = getBrowserSupabaseClient();
      if (!supabase) throw new Error("client unavailable");

      const { error } = await supabase.rpc("claim_wholesale_1688_order", {
        p_1688_order_id: requiredString(formData.get("purchase_order_id")),
        p_customer_id: requiredString(formData.get("customer_id")),
        p_wholesale_order_id: optionalString(
          formData.get("wholesale_order_id"),
        ),
      });
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
    claim1688Order,
    delete1688Order,
    import1688Rows,
  };
}

import { getBrowserSupabaseClient } from "@/lib/supabase";

import { requiredString } from "./wholesale-action-utils";
import { createWholesaleLogisticsStatus } from "./wholesale-logistics-mutations";
import type { RunWholesaleAction } from "./use-wholesale-action-runner";

/** 汇总体量较小的物流、推荐和佣金写操作，避免主 hook 承载具体请求。 */
export function createWholesaleBusinessActions(runAction: RunWholesaleAction) {
  const createLogisticsStatus = (formData: FormData) =>
    runAction("logistics-status:create", "物流号已加入每日核对。", async () => {
      const supabase = getBrowserSupabaseClient();
      if (!supabase) throw new Error("client unavailable");
      await createWholesaleLogisticsStatus(supabase, formData);
    });

  const createReferral = (formData: FormData) =>
    runAction("referral:create", "批发推荐关系已保存。", async () => {
      const supabase = getBrowserSupabaseClient();
      if (!supabase) throw new Error("client unavailable");

      const { error } = await supabase.from("wholesale_referrals").insert({
        referred_customer_id: requiredString(
          formData.get("referred_customer_id"),
        ),
        referrer_customer_id: requiredString(
          formData.get("referrer_customer_id"),
        ),
      });
      if (error) throw error;
    });

  const settleCommission = (commissionId: string) =>
    runAction("commission:settle", "提成已标记为已结算。", async () => {
      const supabase = getBrowserSupabaseClient();
      if (!supabase) throw new Error("client unavailable");

      const { error } = await supabase
        .from("wholesale_commissions")
        .update({ settled_at: new Date().toISOString(), status: "settled" })
        .eq("id", commissionId);
      if (error) throw error;
    });

  return {
    createLogisticsStatus,
    createReferral,
    settleCommission,
  };
}

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  normalizeAdjustmentAction,
  normalizeDateTimeInput,
  normalizeNote,
  normalizeRequiredId,
} from "./business-vip-management.normalizers";
import type {
  BusinessVipAdjustmentInput,
  BusinessVipMembershipInput,
  BusinessVipRequestInput,
  BusinessVipReviewInput,
} from "./business-vip-management.types";
import { withRequestTimeout } from "./request-timeout";

// Tourism and wholesale use separate RPCs because their VIP storage models are separate.
export async function requestBusinessVipRecharge(
  supabase: SupabaseClient,
  input: BusinessVipRequestInput,
) {
  const targetId = normalizeRequiredId(input.targetId);

  if (input.business !== "tourism") {
    throw new Error("business_vip_invalid_input");
  }

  const { error } = await withRequestTimeout(
    supabase.rpc("request_vip_recharge", {
      p_customer_user_id: targetId,
      p_note: normalizeNote(input.note),
      p_vip_scope: "retail",
    }),
  );

  if (error) throw error;
}

export async function reviewBusinessVipRequest(
  supabase: SupabaseClient,
  input: BusinessVipReviewInput,
) {
  const requestId = normalizeRequiredId(input.requestId);
  const note = normalizeNote(input.note);

  if (input.business !== "tourism") {
    throw new Error("business_vip_invalid_input");
  }

  const rpcName =
    input.action === "approve"
      ? "approve_vip_recharge_request"
      : "reject_vip_recharge_request";
  const { error } = await withRequestTimeout(
    supabase.rpc(rpcName, {
      p_request_id: requestId,
      p_review_note: note,
    }),
  );

  if (error) throw error;
}

export async function manageWholesaleVipMembership(
  supabase: SupabaseClient,
  input: BusinessVipMembershipInput,
) {
  const targetId = normalizeRequiredId(input.targetId);

  const { error } = await withRequestTimeout(
    supabase.rpc("manage_wholesale_vip_membership", {
      p_action: input.action,
      p_customer_id: targetId,
      p_note: normalizeNote(input.note),
    }),
  );

  if (error) throw error;
}

export async function adjustBusinessVipMembership(
  supabase: SupabaseClient,
  input: BusinessVipAdjustmentInput,
) {
  const targetId = normalizeRequiredId(input.targetId);
  const action = normalizeAdjustmentAction(input.action);
  const nextExpiresAt = normalizeDateTimeInput(input.nextExpiresAt);

  if (action === "set_expires_at" && !nextExpiresAt) {
    throw new Error("business_vip_adjustment_invalid_input");
  }

  if (input.business === "tourism") {
    const { error } = await withRequestTimeout(
      supabase.rpc("admin_adjust_vip_membership", {
        p_action: action,
        p_customer_user_id: targetId,
        p_next_expires_at: nextExpiresAt,
        p_note: normalizeNote(input.note),
        p_vip_scope: "retail",
      }),
    );

    if (error) throw error;
    return;
  }

  throw new Error("business_vip_invalid_input");
}

import { NextResponse } from "next/server";

import {
  adjustBusinessVipMembership,
  getBusinessVipErrorCode,
  manageWholesaleVipMembership,
  requestBusinessVipRecharge,
  reviewBusinessVipRequest,
  type BusinessVipAdjustmentAction,
  type BusinessVipMembershipAction,
  type BusinessVipReviewAction,
} from "@/lib/business-vip-management";
import { getServerSupabaseClient } from "@/lib/supabase-server";
import type { WorkspaceBusinessKey } from "@/lib/workspace-business-modules";

const STATUS_BY_ERROR_CODE = {
  forbidden: 403,
  invalidInput: 400,
  notFound: 404,
  processed: 409,
  serviceUnavailable: 503,
  unknown: 500,
} as const;

type BusinessVipOperation =
  | "adjust"
  | "manageWholesale"
  | "request"
  | "review";

export async function POST(request: Request) {
  try {
    const payload = normalizeRequestPayload(await request.json());
    const supabase = await getServerSupabaseClient();

    // Keep mutation dispatch in the route thin; business-specific validation
    // and RPC selection live in lib/business-vip-management.ts.
    if (payload.operation === "request") {
      await requestBusinessVipRecharge(supabase, {
        business: payload.business,
        targetId: payload.targetId,
        note: payload.note,
      });
    } else if (payload.operation === "review") {
      await reviewBusinessVipRequest(supabase, {
        action: payload.action,
        business: payload.business,
        note: payload.note,
        requestId: payload.requestId,
      });
    } else if (payload.operation === "adjust") {
      await adjustBusinessVipMembership(supabase, {
        action: payload.action,
        business: payload.business,
        nextExpiresAt: payload.nextExpiresAt,
        note: payload.note,
        targetId: payload.targetId,
      });
    } else {
      await manageWholesaleVipMembership(supabase, {
        action: payload.action,
        note: payload.note,
        targetId: payload.targetId,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const code = getBusinessVipErrorCode(error);

    return NextResponse.json(
      { error: code },
      { status: STATUS_BY_ERROR_CODE[code] },
    );
  }
}

function normalizeRequestPayload(value: unknown) {
  if (!isRecord(value)) {
    throw new Error("business_vip_invalid_input");
  }

  const business = normalizeBusiness(value.business);
  const operation = normalizeOperation(value.operation);
  const note = typeof value.note === "string" ? value.note : null;

  if (operation === "request") {
    return {
      business,
      note,
      operation,
      targetId: normalizeString(value.targetId),
    };
  }

  if (operation === "review") {
    return {
      action: normalizeReviewAction(value.action),
      business,
      note,
      operation,
      requestId: normalizeString(value.requestId),
    };
  }

  if (operation === "manageWholesale") {
    if (business !== "wholesale") {
      throw new Error("business_vip_invalid_input");
    }

    return {
      action: normalizeMembershipAction(value.action),
      business,
      note,
      operation,
      targetId: normalizeString(value.targetId),
    };
  }

  return {
    action: normalizeAdjustmentAction(value.action),
    business,
    nextExpiresAt:
      typeof value.nextExpiresAt === "string" ? value.nextExpiresAt : null,
    note,
    operation,
    targetId: normalizeString(value.targetId),
  };
}

function normalizeBusiness(value: unknown): WorkspaceBusinessKey {
  if (value === "tourism" || value === "wholesale") {
    return value;
  }

  throw new Error("business_vip_invalid_input");
}

function normalizeOperation(value: unknown): BusinessVipOperation {
  if (
    value === "request" ||
    value === "review" ||
    value === "adjust" ||
    value === "manageWholesale"
  ) {
    return value;
  }

  throw new Error("business_vip_invalid_input");
}

function normalizeReviewAction(value: unknown): BusinessVipReviewAction {
  if (value === "approve" || value === "reject") {
    return value;
  }

  throw new Error("business_vip_invalid_input");
}

function normalizeAdjustmentAction(
  value: unknown,
): BusinessVipAdjustmentAction {
  if (value === "set_expires_at" || value === "cancel") {
    return value;
  }

  throw new Error("business_vip_invalid_input");
}

function normalizeMembershipAction(
  value: unknown,
): BusinessVipMembershipAction {
  if (value === "open" || value === "renew") {
    return value;
  }

  throw new Error("business_vip_invalid_input");
}

function normalizeString(value: unknown) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  throw new Error("business_vip_invalid_input");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

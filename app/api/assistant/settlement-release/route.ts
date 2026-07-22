import { NextResponse } from "next/server";

import type {
  AiAssistantSettlementReleaseConfirmResponse,
  AiAssistantSettlementReleaseErrorCode,
} from "@/lib/ai-assistant/assistant-types";
import {
  normalizeSettlementReleaseAction,
  publishConfirmedSettlementRelease,
  SettlementReleaseServiceError,
} from "@/lib/ai-assistant/settlement-release-server";
import { getServerAuthContext } from "@/lib/server-auth";
import {
  readLimitedJsonBody,
  RequestBodyTooLargeError,
} from "@/lib/server-request-body";
import { getServerSupabaseClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

const MAX_CONFIRMATION_BODY_BYTES = 16 * 1024;

const STATUS_BY_ERROR_CODE = {
  customerChanged: 409,
  forbidden: 403,
  invalidInput: 400,
  notSignedIn: 401,
  requestConflict: 409,
  requestTooLarge: 413,
  serviceUnavailable: 503,
} as const satisfies Record<AiAssistantSettlementReleaseErrorCode, number>;

export async function POST(request: Request) {
  const { role, status, userId } = await getServerAuthContext();

  if (!userId || status !== "active") {
    return createErrorResponse("notSignedIn");
  }

  if (role !== "administrator" && role !== "finance") {
    return createErrorResponse("forbidden");
  }

  let action;

  try {
    const payload = await readLimitedJsonBody(
      request,
      MAX_CONFIRMATION_BODY_BYTES,
    );
    action = normalizeSettlementReleaseAction(
      isRecord(payload) ? payload.action : null,
    );
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return createErrorResponse("requestTooLarge");
    }

    return createErrorResponse("invalidInput");
  }

  if (!action) {
    return createErrorResponse("invalidInput");
  }

  try {
    const supabase = await getServerSupabaseClient();
    const releaseId = await publishConfirmedSettlementRelease(
      supabase,
      action,
    );

    return NextResponse.json<AiAssistantSettlementReleaseConfirmResponse>({
      releaseId,
    });
  } catch (error) {
    if (error instanceof SettlementReleaseServiceError) {
      return createErrorResponse(error.code);
    }

    return createErrorResponse("serviceUnavailable");
  }
}

function createErrorResponse(code: AiAssistantSettlementReleaseErrorCode) {
  return NextResponse.json(
    { error: code },
    { status: STATUS_BY_ERROR_CODE[code] },
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

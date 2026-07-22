import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  AiAssistantSettlementReleaseAction,
  AiAssistantSettlementReleaseErrorCode,
} from "./assistant-types";
import {
  isSupportedSettlementReleaseCurrency,
  isValidSettlementReleaseAmount,
  isValidSettlementReleaseDate,
  type ParsedSettlementReleaseCommand,
} from "./settlement-release-command";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_CUSTOMER_NAME_LENGTH = 120;
const MAX_NOTE_LENGTH = 300;

type CustomerMatchRow = {
  customer_id: string;
  unique_name: string;
};

export class SettlementReleaseServiceError extends Error {
  constructor(public code: AiAssistantSettlementReleaseErrorCode) {
    super(code);
  }
}

/**
 * 把已解析的文字指令转换成确认卡数据。
 * 此时只读取客户，不写入结汇；真正发布必须经过另一条确认请求。
 */
export async function buildSettlementReleaseConfirmation(
  supabase: SupabaseClient,
  command: ParsedSettlementReleaseCommand,
): Promise<
  | { action: AiAssistantSettlementReleaseAction; kind: "confirmation" }
  | { kind: "ambiguousCustomer" }
> {
  const matches = await findCustomerMatches(supabase, command.customerName);

  if (matches.length > 1) {
    return { kind: "ambiguousCustomer" };
  }

  const matchedCustomer = matches[0] ?? null;

  return {
    action: {
      amount: command.amount,
      currency: command.currency,
      customerId: matchedCustomer?.customer_id ?? null,
      customerKind: matchedCustomer ? "existing" : "temporary",
      customerName: matchedCustomer?.unique_name ?? command.customerName,
      inputCustomerName: command.customerName,
      note: command.note,
      receivedOn: command.receivedOn,
      requestId: crypto.randomUUID(),
    },
    kind: "confirmation",
  };
}

/**
 * 确认时重新查询客户匹配结果，确保用户看到的“正式客户/临时客户”状态没有在等待期间变化。
 */
export async function publishConfirmedSettlementRelease(
  supabase: SupabaseClient,
  action: AiAssistantSettlementReleaseAction,
) {
  const matches = await findCustomerMatches(supabase, action.inputCustomerName);

  if (action.customerKind === "existing") {
    const matchedCustomer = matches.length === 1 ? matches[0] : null;

    if (
      !matchedCustomer ||
      matchedCustomer.customer_id !== action.customerId ||
      matchedCustomer.unique_name !== action.customerName
    ) {
      throw new SettlementReleaseServiceError("customerChanged");
    }
  } else if (
    matches.length !== 0 ||
    action.customerId !== null ||
    action.customerName !== action.inputCustomerName
  ) {
    throw new SettlementReleaseServiceError("customerChanged");
  }

  const { data, error } = await supabase.rpc(
    "create_wholesale_settlement_release",
    {
      p_customer_id: action.customerId,
      p_customer_name:
        action.customerKind === "temporary" ? action.customerName : null,
      p_note: action.note,
      p_publication_request_id: action.requestId,
      p_received_on: action.receivedOn,
      p_release_amount: action.amount,
      p_release_currency: action.currency,
    },
  );

  if (error) {
    const message = error.message.toLowerCase();

    if (message.includes("wholesale_settlement_release_forbidden")) {
      throw new SettlementReleaseServiceError("forbidden");
    }

    if (message.includes("wholesale_settlement_release_request_conflict")) {
      throw new SettlementReleaseServiceError("requestConflict");
    }

    if (message.includes("wholesale_settlement_release_customer_not_found")) {
      throw new SettlementReleaseServiceError("customerChanged");
    }

    throw new SettlementReleaseServiceError("serviceUnavailable");
  }

  if (typeof data !== "string" || !UUID_PATTERN.test(data)) {
    throw new SettlementReleaseServiceError("serviceUnavailable");
  }

  return data;
}

export function normalizeSettlementReleaseAction(
  value: unknown,
): AiAssistantSettlementReleaseAction | null {
  if (!isRecord(value)) {
    return null;
  }

  const inputCustomerName = normalizeRequiredString(
    value.inputCustomerName,
    MAX_CUSTOMER_NAME_LENGTH,
  );
  const customerName = normalizeRequiredString(
    value.customerName,
    MAX_CUSTOMER_NAME_LENGTH,
  );
  const customerKind =
    value.customerKind === "existing" || value.customerKind === "temporary"
      ? value.customerKind
      : null;
  const customerId =
    value.customerId === null
      ? null
      : typeof value.customerId === "string" && UUID_PATTERN.test(value.customerId)
        ? value.customerId
        : undefined;
  const requestId =
    typeof value.requestId === "string" && UUID_PATTERN.test(value.requestId)
      ? value.requestId
      : null;
  const amount = typeof value.amount === "number" ? value.amount : NaN;
  const currency =
    typeof value.currency === "string" ? value.currency.trim().toUpperCase() : "";
  const receivedOn =
    typeof value.receivedOn === "string" ? value.receivedOn.trim() : "";
  const note = normalizeOptionalString(value.note, MAX_NOTE_LENGTH);

  if (
    !inputCustomerName ||
    !customerName ||
    !customerKind ||
    customerId === undefined ||
    !requestId ||
    !isValidSettlementReleaseAmount(amount) ||
    !isSupportedSettlementReleaseCurrency(currency) ||
    !isValidSettlementReleaseDate(receivedOn) ||
    note === undefined ||
    (customerKind === "existing" && !customerId) ||
    (customerKind === "temporary" && customerId !== null)
  ) {
    return null;
  }

  return {
    amount,
    currency,
    customerId,
    customerKind,
    customerName,
    inputCustomerName,
    note,
    receivedOn,
    requestId,
  };
}

async function findCustomerMatches(
  supabase: SupabaseClient,
  customerName: string,
) {
  const { data, error } = await supabase.rpc(
    "find_wholesale_settlement_customer_matches",
    {
      p_customer_name: customerName,
    },
  );

  if (error || !Array.isArray(data)) {
    throw new SettlementReleaseServiceError("serviceUnavailable");
  }

  return data.filter(isCustomerMatchRow).slice(0, 2);
}

function isCustomerMatchRow(value: unknown): value is CustomerMatchRow {
  return (
    isRecord(value) &&
    typeof value.customer_id === "string" &&
    UUID_PATTERN.test(value.customer_id) &&
    typeof value.unique_name === "string" &&
    value.unique_name.trim().length > 0
  );
}

function normalizeRequiredString(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized && normalized.length <= maxLength ? normalized : null;
}

function normalizeOptionalString(value: unknown, maxLength: number) {
  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();

  if (normalized.length > maxLength) {
    return undefined;
  }

  return normalized || null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

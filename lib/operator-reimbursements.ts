import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getDashboardQueryRange,
  MAX_DASHBOARD_QUERY_ROWS,
} from "./dashboard-pagination";
import { withRequestTimeout } from "./request-timeout";
import {
  getCurrentSessionContext,
  type AppRole,
  type UserStatus,
} from "./user-self-service";

export const operatorReimbursementStatusValues = [
  "unreimbursed",
  "reimbursed",
] as const;

export type OperatorReimbursementStatus =
  (typeof operatorReimbursementStatusValues)[number];

export type OperatorReimbursementPeriod = {
  end: string;
  start: string;
};

export type OperatorReimbursementRow = {
  amount: number;
  content: string;
  created_at: string;
  id: string;
  operator_user_id: string;
  reimbursed_at: string | null;
  reimbursed_by_user_id: string | null;
  reimbursement_period_end: string;
  reimbursement_period_start: string;
  spent_at: string;
  status: OperatorReimbursementStatus;
  updated_at: string;
};

export type OperatorReimbursementFormInput = {
  amount: number;
  content: string;
  spentAt: string;
};

export type OperatorReimbursementsPageData = {
  currentPeriod: OperatorReimbursementPeriod;
  hasPermission: boolean;
  reimbursements: OperatorReimbursementRow[];
};

export type OperatorReimbursementBatchResult = {
  periodEnd: string;
  periodStart: string;
  reimbursedTotal: number;
  updatedCount: number;
};

type OperatorReimbursementReaderContext = {
  role: AppRole | null;
  status: UserStatus | null;
};

type OperatorReimbursementDatabaseRow = Omit<
  OperatorReimbursementRow,
  "amount" | "status"
> & {
  amount: number | string;
  status: string;
};

type OperatorReimbursementBatchDatabaseRow = {
  period_end: string;
  period_start: string;
  reimbursed_total: number | string;
  updated_count: number | string;
};

const OPERATOR_REIMBURSEMENT_SELECT =
  "id,operator_user_id,spent_at,reimbursement_period_start,reimbursement_period_end,content,amount,status,reimbursed_at,reimbursed_by_user_id,created_at,updated_at";

export function canManageOperatorReimbursements(
  role: AppRole | null,
  status: UserStatus | null,
) {
  return role === "operator" && status === "active";
}

export async function getOperatorReimbursementsPageData(
  supabase: SupabaseClient,
  limit = MAX_DASHBOARD_QUERY_ROWS,
  context?: OperatorReimbursementReaderContext,
): Promise<OperatorReimbursementsPageData> {
  const { role, status } =
    context ?? (await getCurrentSessionContext(supabase));
  const currentPeriod = getCurrentOperatorReimbursementPeriod();

  if (!canManageOperatorReimbursements(role, status)) {
    return {
      currentPeriod,
      hasPermission: false,
      reimbursements: [],
    };
  }

  const { from, to } = getDashboardQueryRange(limit);
  const { data, error } = await withRequestTimeout(
    supabase
      .from("operator_reimbursements")
      .select(OPERATOR_REIMBURSEMENT_SELECT)
      .order("reimbursement_period_start", { ascending: false })
      .order("created_at", { ascending: false })
      .range(from, to)
      .returns<OperatorReimbursementDatabaseRow[]>(),
  );

  if (error) {
    throw error;
  }

  return {
    currentPeriod,
    hasPermission: true,
    reimbursements: normalizeOperatorReimbursementRows(data ?? []),
  };
}

export async function createOperatorReimbursement(
  supabase: SupabaseClient,
  input: OperatorReimbursementFormInput,
) {
  const { data, error } = await withRequestTimeout(
    supabase
      .from("operator_reimbursements")
      .insert(toOperatorReimbursementPayload(input))
      .select(OPERATOR_REIMBURSEMENT_SELECT)
      .maybeSingle<OperatorReimbursementDatabaseRow>(),
  );

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Operator reimbursement was not created.");
  }

  return normalizeOperatorReimbursementRow(data);
}

export async function deleteOperatorReimbursement(
  supabase: SupabaseClient,
  reimbursementId: string,
) {
  const { data, error } = await withRequestTimeout(
    supabase
      .from("operator_reimbursements")
      .delete()
      .eq("id", reimbursementId)
      .eq("status", "unreimbursed")
      .select("id")
      .maybeSingle<{ id: string }>(),
  );

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Operator reimbursement was not found.");
  }

  return data;
}

export async function reimburseCurrentOperatorPeriod(supabase: SupabaseClient) {
  const { data, error } = await withRequestTimeout(
    supabase
      .rpc("mark_current_operator_reimbursements_reimbursed")
      .maybeSingle<OperatorReimbursementBatchDatabaseRow>(),
  );

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Operator reimbursement batch was not returned.");
  }

  return {
    periodEnd: data.period_end,
    periodStart: data.period_start,
    reimbursedTotal: Number(data.reimbursed_total),
    updatedCount: Number(data.updated_count),
  } satisfies OperatorReimbursementBatchResult;
}

export function sortOperatorReimbursements(
  rows: readonly OperatorReimbursementRow[],
) {
  return [...rows].sort((left, right) => {
    const leftKey = `${left.reimbursement_period_start}-${left.created_at}`;
    const rightKey = `${right.reimbursement_period_start}-${right.created_at}`;

    return rightKey.localeCompare(leftKey);
  });
}

export function getCurrentOperatorReimbursementPeriod(
  referenceDate = new Date(),
): OperatorReimbursementPeriod {
  const { day, month, year } = getShanghaiDateParts(referenceDate);
  const start =
    day >= 25
      ? createDateValue(year, month, 25)
      : createDateValueFromMonthOffset(year, month, -1, 25);
  const end =
    day >= 25
      ? createDateValueFromMonthOffset(year, month, 1, 24)
      : createDateValue(year, month, 24);

  return { end, start };
}

function normalizeOperatorReimbursementRows(
  rows: readonly OperatorReimbursementDatabaseRow[],
) {
  return rows.map(normalizeOperatorReimbursementRow);
}

function normalizeOperatorReimbursementRow(
  row: OperatorReimbursementDatabaseRow,
): OperatorReimbursementRow {
  return {
    ...row,
    amount: Number(row.amount),
    status: normalizeOperatorReimbursementStatus(row.status),
  };
}

function normalizeOperatorReimbursementStatus(
  value: string,
): OperatorReimbursementStatus {
  return operatorReimbursementStatusValues.includes(
    value as OperatorReimbursementStatus,
  )
    ? (value as OperatorReimbursementStatus)
    : "unreimbursed";
}

function toOperatorReimbursementPayload(
  input: OperatorReimbursementFormInput,
) {
  return {
    amount: input.amount,
    content: input.content.trim(),
    spent_at: input.spentAt,
  };
}

function getShanghaiDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Shanghai",
    year: "numeric",
  }).formatToParts(date);
  const partMap = new Map(parts.map((part) => [part.type, part.value]));

  return {
    day: Number(partMap.get("day")),
    month: Number(partMap.get("month")),
    year: Number(partMap.get("year")),
  };
}

function createDateValue(year: number, month: number, day: number) {
  return [
    String(year).padStart(4, "0"),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}

function createDateValueFromMonthOffset(
  year: number,
  month: number,
  monthOffset: number,
  day: number,
) {
  // JavaScript 的 Date 会自动处理跨年月份，例如 2026 年 1 月往前一个月会变成 2025 年 12 月。
  const adjustedDate = new Date(Date.UTC(year, month - 1 + monthOffset, day));

  return createDateValue(
    adjustedDate.getUTCFullYear(),
    adjustedDate.getUTCMonth() + 1,
    adjustedDate.getUTCDate(),
  );
}

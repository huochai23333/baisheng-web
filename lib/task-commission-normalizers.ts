import type { OrderUserOption } from "./admin-orders";
import type {
  TaskCommissionActor,
  TaskCommissionRecord,
  TaskCommissionRow,
  TaskCommissionSettlementStatus,
} from "./task-commission-types";
import { normalizeOptionalString } from "./value-normalizers";

export function normalizeTaskCommissionRow(
  row: TaskCommissionRecord,
  userById: Map<string, OrderUserOption>,
  taskTypeByCode: Map<string, { code: string; display_name: string | null }>,
  teamById: Map<string, { id: string; team_name: string | null }>,
): TaskCommissionRow {
  return {
    id: row.id,
    taskId: row.task_id,
    reviewSubmissionId: normalizeOptionalString(row.review_submission_id),
    taskTypeCode: row.task_type_code,
    taskTypeName:
      taskTypeByCode.get(row.task_type_code)?.display_name ?? null,
    taskName: row.task_name_snapshot,
    taskScope: row.task_scope,
    teamId: normalizeOptionalString(row.team_id),
    teamName: row.team_id ? teamById.get(row.team_id)?.team_name ?? null : null,
    beneficiary: buildActor(row.beneficiary_user_id, userById),
    approvedBy: buildOptionalActor(row.approved_by_user_id, userById),
    commissionAmountRmb: parseNumericValue(row.commission_amount_rmb) ?? 0,
    settlementStatus: row.settlement_status,
    settlementNote: normalizeOptionalString(row.settlement_note),
    settledAt: normalizeOptionalString(row.settled_at),
    createdAt: normalizeOptionalString(row.created_at),
    updatedAt: normalizeOptionalString(row.updated_at),
    calculationSnapshot: row.calculation_snapshot,
  };
}

export function normalizeTaskCommissionRecord(
  value: unknown,
): TaskCommissionRecord | null {
  if (typeof value !== "object" || value === null) return null;

  const id = "id" in value ? normalizeOptionalString(value.id) : null;
  const taskId = "task_id" in value ? normalizeOptionalString(value.task_id) : null;
  const beneficiaryUserId =
    "beneficiary_user_id" in value
      ? normalizeOptionalString(value.beneficiary_user_id)
      : null;
  const taskTypeCode =
    "task_type_code" in value ? normalizeOptionalString(value.task_type_code) : null;
  const taskName =
    "task_name_snapshot" in value
      ? normalizeOptionalString(value.task_name_snapshot)
      : null;
  const taskScope =
    "task_scope" in value &&
    (value.task_scope === "public" || value.task_scope === "team")
      ? value.task_scope
      : null;
  const settlementStatus =
    "settlement_status" in value &&
    isTaskCommissionSettlementStatus(value.settlement_status)
      ? value.settlement_status
      : null;
  if (
    !id ||
    !taskId ||
    !beneficiaryUserId ||
    !taskTypeCode ||
    !taskName ||
    !taskScope ||
    !settlementStatus
  ) {
    return null;
  }

  return {
    id,
    task_id: taskId,
    review_submission_id:
      "review_submission_id" in value
        ? normalizeOptionalString(value.review_submission_id)
        : null,
    beneficiary_user_id: beneficiaryUserId,
    approved_by_user_id:
      "approved_by_user_id" in value
        ? normalizeOptionalString(value.approved_by_user_id)
        : null,
    task_type_code: taskTypeCode,
    task_name_snapshot: taskName,
    task_scope: taskScope,
    team_id: "team_id" in value ? normalizeOptionalString(value.team_id) : null,
    commission_amount_rmb:
      "commission_amount_rmb" in value &&
      (typeof value.commission_amount_rmb === "number" ||
        typeof value.commission_amount_rmb === "string")
        ? value.commission_amount_rmb
        : null,
    calculation_snapshot:
      "calculation_snapshot" in value ? value.calculation_snapshot : null,
    settlement_status: settlementStatus,
    settled_at:
      "settled_at" in value ? normalizeOptionalString(value.settled_at) : null,
    settlement_note:
      "settlement_note" in value
        ? normalizeOptionalString(value.settlement_note)
        : null,
    created_at:
      "created_at" in value ? normalizeOptionalString(value.created_at) : null,
    updated_at:
      "updated_at" in value ? normalizeOptionalString(value.updated_at) : null,
  };
}

function buildOptionalActor(
  userId: string | null,
  userById: Map<string, OrderUserOption>,
) {
  const normalizedUserId = normalizeOptionalString(userId);
  return normalizedUserId ? buildActor(normalizedUserId, userById) : null;
}

function buildActor(
  userId: string | null,
  userById: Map<string, OrderUserOption>,
): TaskCommissionActor {
  const normalizedUserId = normalizeOptionalString(userId);
  const profile = normalizedUserId ? userById.get(normalizedUserId) : undefined;
  const name = normalizeOptionalString(profile?.name);
  const email = normalizeOptionalString(profile?.email);
  return {
    userId: normalizedUserId,
    label:
      name ??
      email ??
      (normalizedUserId ? `用户 ${normalizedUserId.slice(0, 8)}` : "用户"),
    name,
    email,
    role: profile?.role ?? null,
    status: profile?.status ?? null,
  };
}

function parseNumericValue(value: number | string | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function isTaskCommissionSettlementStatus(
  value: unknown,
): value is TaskCommissionSettlementStatus {
  return (
    value === "pending" ||
    value === "paid" ||
    value === "cancelled" ||
    value === "reversed"
  );
}

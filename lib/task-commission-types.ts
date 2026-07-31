import type { AppRole, UserStatus } from "./user-self-service";

export type TaskCommissionSettlementStatus =
  | "pending"
  | "paid"
  | "cancelled"
  | "reversed";

export type TaskCommissionActor = {
  userId: string | null;
  label: string;
  name: string | null;
  email: string | null;
  role: AppRole | null;
  status: UserStatus | null;
};

export type TaskCommissionRow = {
  id: string;
  taskId: string;
  reviewSubmissionId: string | null;
  taskTypeCode: string;
  taskTypeName: string | null;
  taskName: string;
  taskScope: "public" | "team";
  teamId: string | null;
  teamName: string | null;
  beneficiary: TaskCommissionActor;
  approvedBy: TaskCommissionActor | null;
  commissionAmountRmb: number;
  settlementStatus: TaskCommissionSettlementStatus;
  settlementNote: string | null;
  settledAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  calculationSnapshot: unknown;
};

export type TaskCommissionRecord = {
  id: string;
  task_id: string;
  review_submission_id: string | null;
  beneficiary_user_id: string;
  approved_by_user_id: string | null;
  task_type_code: string;
  task_name_snapshot: string;
  task_scope: "public" | "team";
  team_id: string | null;
  commission_amount_rmb: number | string | null;
  calculation_snapshot: unknown;
  settlement_status: TaskCommissionSettlementStatus;
  settled_at: string | null;
  settlement_note: string | null;
  created_at: string | null;
  updated_at: string | null;
};

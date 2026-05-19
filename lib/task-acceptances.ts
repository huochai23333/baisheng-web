import type { SupabaseClient } from "@supabase/supabase-js";

import {
  normalizeNullableString,
  normalizeTaskStatus,
} from "./admin-task-normalizers";
import type { TaskStatus } from "./admin-tasks-types";
import { withRequestTimeout } from "./request-timeout";

export const TASK_ACCEPTANCE_SELECT =
  "id,task_id,accepted_by_user_id,status,accepted_at,submitted_at,reviewed_at,reviewed_by_user_id,review_reject_reason,completed_at,current_submission_id,created_at,updated_at";

export type TaskAcceptanceRecord = {
  id: string | null;
  task_id: string | null;
  accepted_by_user_id: string | null;
  status: string | null;
  accepted_at: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by_user_id: string | null;
  review_reject_reason: string | null;
  completed_at: string | null;
  current_submission_id: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type TaskAcceptanceRow = {
  id: string;
  task_id: string;
  accepted_by_user_id: string;
  status: Exclude<TaskStatus, "to_be_accepted">;
  accepted_at: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by_user_id: string | null;
  review_reject_reason: string | null;
  completed_at: string | null;
  current_submission_id: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export async function getTaskAcceptancesByTaskIds(
  supabase: SupabaseClient,
  taskIds: string[],
): Promise<TaskAcceptanceRow[]> {
  const normalizedTaskIds = normalizeIdList(taskIds);

  if (normalizedTaskIds.length === 0) {
    return [];
  }

  const { data, error } = await withRequestTimeout(
    supabase
      .from("task_acceptances")
      .select(TASK_ACCEPTANCE_SELECT)
      .in("task_id", normalizedTaskIds)
      .order("accepted_at", { ascending: true })
      .returns<TaskAcceptanceRecord[]>(),
  );

  if (error) {
    throw error;
  }

  return normalizeTaskAcceptanceRecords(data ?? []);
}

export async function getTaskAcceptancesByViewer(
  supabase: SupabaseClient,
  viewerId: string | null,
): Promise<TaskAcceptanceRow[]> {
  const normalizedViewerId = normalizeNullableString(viewerId);

  if (!normalizedViewerId) {
    return [];
  }

  const { data, error } = await withRequestTimeout(
    supabase
      .from("task_acceptances")
      .select(TASK_ACCEPTANCE_SELECT)
      .eq("accepted_by_user_id", normalizedViewerId)
      .order("accepted_at", { ascending: false })
      .returns<TaskAcceptanceRecord[]>(),
  );

  if (error) {
    throw error;
  }

  return normalizeTaskAcceptanceRecords(data ?? []);
}

export function normalizeTaskAcceptanceRecord(
  value: TaskAcceptanceRecord,
): TaskAcceptanceRow | null {
  const id = normalizeNullableString(value.id);
  const taskId = normalizeNullableString(value.task_id);
  const acceptedByUserId = normalizeNullableString(value.accepted_by_user_id);
  const status = normalizeTaskStatus(value.status);

  if (!id || !taskId || !acceptedByUserId || !status || status === "to_be_accepted") {
    return null;
  }

  return {
    id,
    task_id: taskId,
    accepted_by_user_id: acceptedByUserId,
    status,
    accepted_at: normalizeNullableString(value.accepted_at),
    submitted_at: normalizeNullableString(value.submitted_at),
    reviewed_at: normalizeNullableString(value.reviewed_at),
    reviewed_by_user_id: normalizeNullableString(value.reviewed_by_user_id),
    review_reject_reason: normalizeNullableString(value.review_reject_reason),
    completed_at: normalizeNullableString(value.completed_at),
    current_submission_id: normalizeNullableString(value.current_submission_id),
    created_at: normalizeNullableString(value.created_at),
    updated_at: normalizeNullableString(value.updated_at),
  };
}

function normalizeTaskAcceptanceRecords(
  values: TaskAcceptanceRecord[],
): TaskAcceptanceRow[] {
  return values
    .map((item) => normalizeTaskAcceptanceRecord(item))
    .filter((item): item is TaskAcceptanceRow => item !== null);
}

function normalizeIdList(ids: string[]) {
  return Array.from(
    new Set(ids.map((id) => normalizeNullableString(id)).filter(Boolean)),
  ) as string[];
}

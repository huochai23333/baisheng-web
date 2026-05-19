import type { SupabaseClient } from "@supabase/supabase-js";

import {
  normalizeNullableString,
  normalizeTaskProfile,
} from "./admin-task-normalizers";
import type {
  TaskAcceptanceAssigneeSummary,
  TaskProfileSummary,
  UserProfileRecord,
} from "./admin-tasks-types";
import { withRequestTimeout } from "./request-timeout";
import { getTaskAcceptancesByTaskIds, type TaskAcceptanceRow } from "./task-acceptances";

type NormalizedTaskAcceptanceAssignee = {
  accepted_task_id: string;
  root_task_id: string;
  user_id: string;
  task_status: TaskAcceptanceAssigneeSummary["task_status"];
  accepted_at: string | null;
  submitted_at: string | null;
  completed_at: string | null;
};

export async function getTaskAcceptanceAssigneesByRootTaskId(
  supabase: SupabaseClient,
  taskIds: string[],
): Promise<Map<string, TaskAcceptanceAssigneeSummary[]>> {
  const rootTaskIds = Array.from(
    new Set(taskIds.map((taskId) => normalizeNullableString(taskId)).filter(Boolean)),
  ) as string[];

  if (rootTaskIds.length === 0) {
    return new Map<string, TaskAcceptanceAssigneeSummary[]>();
  }

  const normalizedAssignees = (await getTaskAcceptancesByTaskIds(supabase, rootTaskIds))
    .map((item) => normalizeTaskAcceptanceAssignee(item))
    .filter((item): item is NormalizedTaskAcceptanceAssignee => item !== null);

  if (normalizedAssignees.length === 0) {
    return new Map<string, TaskAcceptanceAssigneeSummary[]>();
  }

  const profileByUserId = new Map(
    (await getTaskAssigneeProfilesByUserIds(
      supabase,
      Array.from(new Set(normalizedAssignees.map((assignee) => assignee.user_id))),
    )).map((profile) => [profile.user_id, profile]),
  );
  const assigneesByRootTaskId = new Map<string, TaskAcceptanceAssigneeSummary[]>();

  normalizedAssignees.forEach((assignee) => {
    const profile = profileByUserId.get(assignee.user_id);
    const bucket = assigneesByRootTaskId.get(assignee.root_task_id);
    const summary: TaskAcceptanceAssigneeSummary = {
      ...assignee,
      name: profile?.name ?? null,
      email: profile?.email ?? null,
    };

    if (bucket) {
      bucket.push(summary);
      return;
    }

    assigneesByRootTaskId.set(assignee.root_task_id, [summary]);
  });

  assigneesByRootTaskId.forEach((assignees) => {
    assignees.sort((first, second) =>
      (first.accepted_at ?? "").localeCompare(second.accepted_at ?? ""),
    );
  });

  return assigneesByRootTaskId;
}

function normalizeTaskAcceptanceAssignee(
  value: TaskAcceptanceRow,
): NormalizedTaskAcceptanceAssignee | null {
  const acceptedTaskId = normalizeNullableString(value.id);
  const rootTaskId = normalizeNullableString(value.task_id);
  const userId = normalizeNullableString(value.accepted_by_user_id);
  const taskStatus = value.status;

  if (!acceptedTaskId || !rootTaskId || !userId || !taskStatus) {
    return null;
  }

  return {
    accepted_task_id: acceptedTaskId,
    root_task_id: rootTaskId,
    user_id: userId,
    task_status: taskStatus,
    accepted_at: normalizeNullableString(value.accepted_at),
    submitted_at: normalizeNullableString(value.submitted_at),
    completed_at: normalizeNullableString(value.completed_at),
  };
}

async function getTaskAssigneeProfilesByUserIds(
  supabase: SupabaseClient,
  userIds: string[],
): Promise<TaskProfileSummary[]> {
  if (userIds.length === 0) {
    return [];
  }

  const { data, error } = await withRequestTimeout(
    supabase
      .from("user_profiles")
      .select("user_id,name,email,status")
      .in("user_id", userIds)
      .returns<UserProfileRecord[]>(),
  );

  if (error) {
    throw error;
  }

  return (data ?? [])
    .map((item) => normalizeTaskProfile(item))
    .filter((item): item is TaskProfileSummary => item !== null);
}

import type { SupabaseClient } from "@supabase/supabase-js";

import { normalizeTaskProfile } from "./admin-task-normalizers";
import { getTaskTypesByCodes } from "./admin-task-type-management";
import type {
  TaskProfileSummary,
  UserProfileRecord,
} from "./admin-tasks-types";
import {
  getDashboardQueryRange,
  MAX_DASHBOARD_QUERY_ROWS,
} from "./dashboard-pagination";
import { withRequestTimeout } from "./request-timeout";
import {
  getTaskReviewSubmissionAssets,
} from "./task-review-assets";
import {
  getCurrentSessionContext,
  type AppRole,
  type UserStatus,
} from "./user-self-service";
import { normalizeOptionalString } from "./value-normalizers";
import {
  getAdminTaskMediaLibraryItemTime,
  normalizeApprovedTaskReviewSubmissionRecord,
  normalizeTaskMediaLibraryTaskRecord,
  toAdminTaskMediaLibraryItem,
} from "./admin-task-media-library-normalizers";
import type {
  AdminTaskMediaLibraryData,
  AdminTaskMediaLibraryItem,
  ApprovedTaskReviewSubmission,
  ApprovedTaskReviewSubmissionRecord,
  TaskMediaLibraryTask,
  TaskMediaLibraryTaskRecord,
} from "./admin-task-media-library-types";

export {
  downloadAdminTaskMediaLibraryItemBlob,
  getAdminTaskMediaLibraryItemSignedUrl,
} from "./admin-task-media-library-downloads";
export { getAdminTaskMediaLibraryKind } from "./admin-task-media-library-normalizers";
export type {
  AdminTaskMediaLibraryData,
  AdminTaskMediaLibraryItem,
  AdminTaskMediaLibraryKind,
} from "./admin-task-media-library-types";

const APPROVED_TASK_REVIEW_SUBMISSION_SELECT =
  "id,acceptance_id,task_id,submitted_by_user_id,round_index,submission_note,status,reviewer_user_id,submitted_at,reviewed_at,created_at";

const TASK_MEDIA_LIBRARY_TASK_SELECT =
  "id,task_name,task_type_code,commission_amount_rmb,scope,team_id,created_at";


export function canViewAdminTaskMediaLibrary(
  role: AppRole | null,
  status: UserStatus | null,
) {
  return role === "administrator" && (status === null || status === "active");
}

export async function getAdminTaskMediaLibraryData(
  supabase: SupabaseClient,
): Promise<AdminTaskMediaLibraryData> {
  const { role, status, user } = await getCurrentSessionContext(supabase);

  if (!user || !canViewAdminTaskMediaLibrary(role, status)) {
    return {
      canView: false,
      items: [],
    };
  }

  return {
    canView: true,
    items: await getAdminTaskMediaLibraryItems(supabase),
  };
}

export async function getAdminTaskMediaLibraryItems(
  supabase: SupabaseClient,
  limit = MAX_DASHBOARD_QUERY_ROWS,
): Promise<AdminTaskMediaLibraryItem[]> {
  const { from, to } = getDashboardQueryRange(limit);
  const { data, error } = await withRequestTimeout(
    supabase
      .from("task_review_submissions")
      .select(APPROVED_TASK_REVIEW_SUBMISSION_SELECT)
      .eq("status", "approved")
      .order("reviewed_at", { ascending: false })
      .range(from, to)
      .returns<ApprovedTaskReviewSubmissionRecord[]>(),
  );

  if (error) {
    throw error;
  }

  const submissions = (data ?? [])
    .map((item) => normalizeApprovedTaskReviewSubmissionRecord(item))
    .filter((item): item is ApprovedTaskReviewSubmission => item !== null);

  if (submissions.length === 0) {
    return [];
  }

  const submissionIds = submissions.map((submission) => submission.id);
  const taskIds = Array.from(new Set(submissions.map((submission) => submission.task_id)));
  const userIds = Array.from(
    new Set(
      submissions.flatMap((submission) => [
        submission.submitted_by_user_id,
        submission.reviewer_user_id,
      ]),
    ),
  ).filter((userId): userId is string => Boolean(userId));

  const [assets, tasks, profiles] = await Promise.all([
    getTaskReviewSubmissionAssets(supabase, submissionIds),
    getTaskMediaLibraryTasksByIds(supabase, taskIds),
    getTaskMediaLibraryProfilesByUserIds(supabase, userIds),
  ]);

  if (assets.length === 0) {
    return [];
  }

  const taskTypeCodes = Array.from(new Set(tasks.map((task) => task.task_type_code)));
  const taskTypes = await getTaskTypesByCodes(supabase, taskTypeCodes);
  const submissionById = new Map(submissions.map((submission) => [submission.id, submission]));
  const taskById = new Map(tasks.map((task) => [task.id, task]));
  const taskTypeByCode = new Map(taskTypes.map((taskType) => [taskType.code, taskType]));
  const profileByUserId = new Map(profiles.map((profile) => [profile.user_id, profile]));

  return assets
    .map((asset) =>
      toAdminTaskMediaLibraryItem({
        asset,
        profileByUserId,
        submissionById,
        taskById,
        taskTypeByCode,
      }),
    )
    .filter((item): item is AdminTaskMediaLibraryItem => item !== null)
    .sort(
      (left, right) =>
        getAdminTaskMediaLibraryItemTime(right) -
        getAdminTaskMediaLibraryItemTime(left),
    );
}

async function getTaskMediaLibraryTasksByIds(
  supabase: SupabaseClient,
  taskIds: string[],
) {
  const normalizedTaskIds = Array.from(
    new Set(taskIds.map((id) => normalizeOptionalString(id)).filter(Boolean)),
  ) as string[];

  if (normalizedTaskIds.length === 0) {
    return [];
  }

  const { data, error } = await withRequestTimeout(
    supabase
      .from("task_main")
      .select(TASK_MEDIA_LIBRARY_TASK_SELECT)
      .in("id", normalizedTaskIds)
      .returns<TaskMediaLibraryTaskRecord[]>(),
  );

  if (error) {
    throw error;
  }

  return (data ?? [])
    .map((item) => normalizeTaskMediaLibraryTaskRecord(item))
    .filter((item): item is TaskMediaLibraryTask => item !== null);
}

async function getTaskMediaLibraryProfilesByUserIds(
  supabase: SupabaseClient,
  userIds: string[],
) {
  const normalizedUserIds = Array.from(
    new Set(userIds.map((id) => normalizeOptionalString(id)).filter(Boolean)),
  ) as string[];

  if (normalizedUserIds.length === 0) {
    return [];
  }

  const { data, error } = await withRequestTimeout(
    supabase
      .from("user_profiles")
      .select("user_id,name,email,status")
      .in("user_id", normalizedUserIds)
      .returns<UserProfileRecord[]>(),
  );

  if (error) {
    throw error;
  }

  return (data ?? [])
    .map((item) => normalizeTaskProfile(item))
    .filter((item): item is TaskProfileSummary => item !== null);
}

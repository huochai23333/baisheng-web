import { normalizeTaskScope } from "./admin-task-normalizers";
import type {
  TaskProfileSummary,
  TaskTypeOption,
} from "./admin-tasks-types";
import type {
  AdminTaskMediaLibraryItem,
  AdminTaskMediaLibraryKind,
  ApprovedTaskReviewSubmission,
  ApprovedTaskReviewSubmissionRecord,
  TaskMediaLibraryTask,
  TaskMediaLibraryTaskRecord,
} from "./admin-task-media-library-types";
import type { TaskReviewSubmissionAsset } from "./task-review-assets";
import {
  normalizeNumericValue,
  normalizeOptionalInteger,
  normalizeOptionalString,
} from "./value-normalizers";

export function toAdminTaskMediaLibraryItem(options: {
  asset: TaskReviewSubmissionAsset;
  profileByUserId: Map<string, TaskProfileSummary>;
  submissionById: Map<string, ApprovedTaskReviewSubmission>;
  taskById: Map<string, TaskMediaLibraryTask>;
  taskTypeByCode: Map<string, TaskTypeOption>;
}): AdminTaskMediaLibraryItem | null {
  const { asset, profileByUserId, submissionById, taskById, taskTypeByCode } =
    options;
  const submission = submissionById.get(asset.submission_id);
  if (!submission) return null;
  const task = taskById.get(submission.task_id);
  if (!task) return null;

  const submitter = profileByUserId.get(submission.submitted_by_user_id) ?? null;
  const reviewer = submission.reviewer_user_id
    ? profileByUserId.get(submission.reviewer_user_id) ?? null
    : null;

  return {
    id: asset.id,
    submission_id: submission.id,
    acceptance_id: submission.acceptance_id,
    task_id: task.id,
    task_name: task.task_name,
    task_type_code: task.task_type_code,
    task_type_name:
      taskTypeByCode.get(task.task_type_code)?.displayName ?? task.task_type_code,
    commission_amount_rmb: task.commission_amount_rmb,
    scope: task.scope,
    submitted_by_user_id: submission.submitted_by_user_id,
    submitted_by_name: submitter?.name ?? null,
    submitted_by_email: submitter?.email ?? null,
    reviewer_user_id: submission.reviewer_user_id,
    reviewer_name: reviewer?.name ?? null,
    reviewer_email: reviewer?.email ?? null,
    submission_round: submission.round_index,
    submission_note: submission.submission_note,
    submitted_at: submission.submitted_at,
    reviewed_at: submission.reviewed_at,
    task_attachment_storage_path: asset.task_attachment_storage_path,
    file_size_bytes: asset.file_size_bytes,
    original_name: asset.original_name,
    bucket_name: asset.bucket_name,
    mime_type: asset.mime_type,
    uploaded_by_user_id: asset.uploaded_by_user_id,
    created_at: asset.created_at,
    kind: getAdminTaskMediaLibraryKind(asset.mime_type, asset.original_name),
  };
}

export function normalizeApprovedTaskReviewSubmissionRecord(
  value: ApprovedTaskReviewSubmissionRecord,
): ApprovedTaskReviewSubmission | null {
  const id = normalizeOptionalString(value.id);
  const acceptanceId = normalizeOptionalString(value.acceptance_id);
  const taskId = normalizeOptionalString(value.task_id);
  const submittedByUserId = normalizeOptionalString(value.submitted_by_user_id);
  const roundIndex = normalizeOptionalInteger(value.round_index);
  if (
    !id ||
    !acceptanceId ||
    !taskId ||
    !submittedByUserId ||
    roundIndex === null ||
    value.status !== "approved"
  ) {
    return null;
  }
  return {
    id,
    acceptance_id: acceptanceId,
    task_id: taskId,
    submitted_by_user_id: submittedByUserId,
    round_index: roundIndex,
    submission_note: normalizeOptionalString(value.submission_note),
    reviewer_user_id: normalizeOptionalString(value.reviewer_user_id),
    submitted_at: normalizeOptionalString(value.submitted_at),
    reviewed_at: normalizeOptionalString(value.reviewed_at),
    created_at: normalizeOptionalString(value.created_at),
  };
}

export function normalizeTaskMediaLibraryTaskRecord(
  value: TaskMediaLibraryTaskRecord,
): TaskMediaLibraryTask | null {
  const id = normalizeOptionalString(value.id);
  const taskName = normalizeOptionalString(value.task_name);
  const taskTypeCode = normalizeOptionalString(value.task_type_code);
  if (!id || !taskName || !taskTypeCode) return null;
  return {
    id,
    task_name: taskName,
    task_type_code: taskTypeCode,
    commission_amount_rmb: normalizeNumericValue(value.commission_amount_rmb) ?? 0,
    scope: normalizeTaskScope(value.scope),
  };
}

export function getAdminTaskMediaLibraryKind(
  mimeType: string | null,
  fileName?: string | null,
): AdminTaskMediaLibraryKind {
  const normalizedMimeType = (mimeType ?? "").trim().toLowerCase();
  const normalizedName = (fileName ?? "").trim().toLowerCase();
  if (normalizedMimeType.startsWith("image/")) return "image";
  if (normalizedMimeType.startsWith("video/")) return "video";
  if (
    normalizedMimeType === "application/pdf" ||
    normalizedName.endsWith(".pdf")
  ) {
    return "pdf";
  }
  return "file";
}

export function getAdminTaskMediaLibraryItemTime(
  item: AdminTaskMediaLibraryItem,
) {
  const rawTime = item.reviewed_at ?? item.created_at ?? item.submitted_at;
  const timestamp = rawTime ? Date.parse(rawTime) : 0;
  return Number.isFinite(timestamp) ? timestamp : 0;
}

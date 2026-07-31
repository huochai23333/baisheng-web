import type { TaskScope } from "./admin-tasks-types";

export type AdminTaskMediaLibraryKind = "image" | "video" | "pdf" | "file";

export type AdminTaskMediaLibraryItem = {
  id: string;
  submission_id: string;
  acceptance_id: string;
  task_id: string;
  task_name: string;
  task_type_code: string;
  task_type_name: string | null;
  commission_amount_rmb: number;
  scope: TaskScope | null;
  submitted_by_user_id: string;
  submitted_by_name: string | null;
  submitted_by_email: string | null;
  reviewer_user_id: string | null;
  reviewer_name: string | null;
  reviewer_email: string | null;
  submission_round: number;
  submission_note: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  task_attachment_storage_path: string;
  file_size_bytes: number;
  original_name: string;
  bucket_name: string;
  mime_type: string;
  uploaded_by_user_id: string;
  created_at: string | null;
  kind: AdminTaskMediaLibraryKind;
};

export type AdminTaskMediaLibraryData = {
  canView: boolean;
  items: AdminTaskMediaLibraryItem[];
};

export type ApprovedTaskReviewSubmissionRecord = {
  id: string | null;
  acceptance_id: string | null;
  task_id: string | null;
  submitted_by_user_id: string | null;
  round_index: number | string | null;
  submission_note: string | null;
  status: string | null;
  reviewer_user_id: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string | null;
};

export type ApprovedTaskReviewSubmission = {
  id: string;
  acceptance_id: string;
  task_id: string;
  submitted_by_user_id: string;
  round_index: number;
  submission_note: string | null;
  reviewer_user_id: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string | null;
};

export type TaskMediaLibraryTaskRecord = {
  id: string | null;
  task_name: string | null;
  task_type_code: string | null;
  commission_amount_rmb: number | string | null;
  scope: string | null;
  team_id: string | null;
  created_at: string | null;
};

export type TaskMediaLibraryTask = {
  id: string;
  task_name: string;
  task_type_code: string;
  commission_amount_rmb: number;
  scope: TaskScope | null;
};

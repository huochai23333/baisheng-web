import type { SupabaseClient } from "@supabase/supabase-js";

import type { AdminTaskMediaLibraryItem } from "./admin-task-media-library-types";
import {
  downloadTaskReviewSubmissionAssetBlob,
  getTaskReviewSubmissionAssetSignedUrl,
} from "./task-review-assets";

type DownloadableItem = Pick<
  AdminTaskMediaLibraryItem,
  "bucket_name" | "task_attachment_storage_path"
>;

export function getAdminTaskMediaLibraryItemSignedUrl(
  supabase: SupabaseClient,
  item: DownloadableItem,
  expiresIn = 60 * 10,
) {
  return getTaskReviewSubmissionAssetSignedUrl(supabase, item, expiresIn);
}

export function downloadAdminTaskMediaLibraryItemBlob(
  supabase: SupabaseClient,
  item: DownloadableItem,
) {
  return downloadTaskReviewSubmissionAssetBlob(supabase, item);
}

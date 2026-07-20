"use client";

import { AdminTaskFilePreviewDialog } from "./admin-task-file-preview-dialog";
import { AdminTaskReviewSection } from "./admin-task-review-section";
import type { useAdminTaskReviewBoard } from "./use-admin-task-review-board";

type ReviewBoardViewModel = ReturnType<typeof useAdminTaskReviewBoard>;

/** 审核看板只组装审核列表和文件预览，审核状态仍由既有 view-model 维护。 */
export function AdminTaskReviewBoard({
  viewModel,
}: {
  viewModel: ReviewBoardViewModel;
}) {
  return (
    <>
      <AdminTaskReviewSection
        assetBusyKey={viewModel.assetBusyKey}
        busyRows={viewModel.busyRows}
        canView={viewModel.canView}
        isRefreshing={viewModel.isRefreshing}
        onOpenAsset={viewModel.handleOpenAsset}
        onRefresh={viewModel.handleRefresh}
        onReviewAction={viewModel.handleTaskReview}
        rows={viewModel.rows}
      />
      <AdminTaskFilePreviewDialog
        downloadBusy={viewModel.previewDownloadBusy}
        file={viewModel.previewAsset}
        onDownload={(file) => void viewModel.handlePreviewDownload(file)}
        onOpenChange={viewModel.closePreview}
      />
    </>
  );
}

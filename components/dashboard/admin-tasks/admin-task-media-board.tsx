"use client";

import { AdminTaskFilePreviewDialog } from "./admin-task-file-preview-dialog";
import { AdminTaskMediaLibrarySection } from "./admin-task-media-library-section";
import type { useAdminTaskMediaLibrary } from "./use-admin-task-media-library";

type MediaBoardViewModel = ReturnType<typeof useAdminTaskMediaLibrary>;

/** 媒体库看板只负责筛选列表与预览弹窗的组装。 */
export function AdminTaskMediaBoard({
  viewModel,
}: {
  viewModel: MediaBoardViewModel;
}) {
  return (
    <>
      <AdminTaskMediaLibrarySection
        busyItemId={viewModel.busyItemId}
        canView={viewModel.canView}
        filteredItems={viewModel.filteredItems}
        isRefreshing={viewModel.isRefreshing}
        items={viewModel.items}
        kindFilter={viewModel.kindFilter}
        onDownload={(item) => void viewModel.handleDownload(item)}
        onKindFilterChange={viewModel.setKindFilter}
        onPreview={(item) => void viewModel.handlePreview(item)}
        onRefresh={viewModel.handleRefresh}
        onSearchTextChange={viewModel.setSearchText}
        searchText={viewModel.searchText}
      />
      <AdminTaskFilePreviewDialog
        downloadBusy={viewModel.previewDownloadBusy}
        file={viewModel.previewItem}
        onDownload={(file) => void viewModel.handlePreviewDownload(file)}
        onOpenChange={viewModel.closePreview}
      />
    </>
  );
}

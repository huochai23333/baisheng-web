"use client";

import { ClipboardList, History } from "lucide-react";
import { useTranslations } from "next-intl";

import type {
  SalesmanTaskFocusFilter,
  SalesmanTasksPageData,
  SalesmanTasksSearchParams,
} from "@/lib/salesman-tasks";
import { Button } from "@/components/ui/button";
import { DashboardPaginationFooter } from "@/components/dashboard/dashboard-collection-section";
import { DashboardSectionHeader } from "@/components/dashboard/dashboard-section-header";
import {
  DashboardAccessState,
  DashboardPageShell,
} from "@/components/dashboard/dashboard-page-shell";
import {
  DashboardFilterPanel,
  DashboardListSection,
} from "@/components/dashboard/dashboard-section-panel";
import { EmptyState } from "@/components/dashboard/dashboard-shared-ui";

import { SalesmanTaskSubmitDialog } from "./salesman-task-submit-dialog";
import {
  FilterField,
  SalesmanTaskCard,
  SearchField,
} from "./salesman-tasks-ui";
import { useSalesmanTasksPage } from "./use-salesman-tasks-page";

export function SalesmanTasksClient({
  initialData,
  initialView,
}: {
  initialData: SalesmanTasksPageData;
  initialView: SalesmanTasksSearchParams;
}) {
  const t = useTranslations("Tasks.salesman");
  const viewModel = useSalesmanTasksPage({ initialData, initialView });

  return (
    <DashboardPageShell
      feedback={viewModel.pageFeedback}
      header={
        <DashboardSectionHeader
          actions={
            <Button
              variant="outline"
              size="default"
              disabled={!viewModel.canView}
              onClick={() =>
                viewModel.updateFilter(
                  "focus",
                  viewModel.filters.focus === "completed" ? "all" : "completed",
                )
              }
              type="button"
            >
              <History className="size-4" />
              {viewModel.filters.focus === "completed"
                ? t("header.allTasks")
                : t("header.history")}
            </Button>
          }
          badge={t("header.badge")}
          badgeClassName="bg-surface-inset"
          description={t("header.description")}
          title={t("header.title")}
        />
      }
    >
      {!viewModel.canView ? (
        <DashboardAccessState
          description={t("states.noPermissionDescription")}
          kind="permission"
          title={t("states.noPermissionTitle")}
        />
      ) : (
        <>
          <DashboardFilterPanel
            gridClassName="grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.6fr)]"
            variant="standalone"
          >
            <SearchField
              label={t("filters.searchLabel")}
              onChange={(value) => viewModel.updateFilter("searchText", value)}
              placeholder={t("filters.searchPlaceholder")}
              value={viewModel.filters.searchText}
            />

            <FilterField
              label={t("filters.focusLabel")}
              onChange={(value) =>
                viewModel.updateFilter(
                  "focus",
                  value as SalesmanTaskFocusFilter,
                )
              }
              options={[
                { label: t("filters.focusAll"), value: "all" },
                {
                  label: t("filters.focusAvailable"),
                  value: "available",
                },
                {
                  label: t("filters.focusInProgress"),
                  value: "in_progress",
                },
                { label: t("filters.focusReviewing"), value: "reviewing" },
                { label: t("filters.focusRejected"), value: "rejected" },
                { label: t("filters.focusCompleted"), value: "completed" },
              ]}
              value={viewModel.filters.focus}
            />
          </DashboardFilterPanel>

          <DashboardListSection
            bodyClassName="space-y-4"
            description={t("list.description", {
              count: viewModel.filteredTasks.length,
            })}
            title={t("list.title")}
          >
            {viewModel.filteredTasks.length === 0 ? (
              <EmptyState
                description={t("states.emptyDescription")}
                icon={<ClipboardList className="size-6" />}
                title={t("states.emptyTitle")}
              />
            ) : (
              <div className="grid grid-cols-1 gap-5 2xl:grid-cols-2">
                {viewModel.tasksPagination.items.map((task) => (
                  <SalesmanTaskCard
                    attachmentBusyKey={viewModel.attachmentBusyKey}
                    busy={
                      viewModel.busyTaskId === task.id || viewModel.isRefreshing
                    }
                    key={task.id}
                    onAccept={() => void viewModel.handleAcceptTask(task.id)}
                    onOpenAttachment={(attachment) =>
                      void viewModel.handleOpenAttachment(task.id, attachment)
                    }
                    onSubmitReview={() => viewModel.openSubmitDialog(task)}
                    task={task}
                    viewerId={viewModel.viewerId}
                  />
                ))}
              </div>
            )}

            <DashboardPaginationFooter
              endIndex={viewModel.tasksPagination.endIndex}
              hasNextPage={viewModel.tasksPagination.hasNextPage}
              hasPreviousPage={viewModel.tasksPagination.hasPreviousPage}
              onNextPage={viewModel.goToNextPage}
              onPreviousPage={viewModel.goToPreviousPage}
              page={viewModel.tasksPagination.page}
              pageCount={viewModel.tasksPagination.pageCount}
              startIndex={viewModel.tasksPagination.startIndex}
              totalItems={viewModel.tasksPagination.totalItems}
            />
          </DashboardListSection>
        </>
      )}

      <SalesmanTaskSubmitDialog
        feedback={viewModel.submitDialogFeedback}
        files={viewModel.submitDialogFiles}
        note={viewModel.submitDialogNote}
        onFilesChange={(files) =>
          viewModel.setSubmitDialogFiles((current) => [...current, ...files])
        }
        onNoteChange={viewModel.setSubmitDialogNote}
        onOpenChange={viewModel.handleSubmitDialogOpenChange}
        onRemoveFile={(index) =>
          viewModel.setSubmitDialogFiles((current) =>
            current.filter((_, fileIndex) => fileIndex !== index),
          )
        }
        onSubmit={() => void viewModel.handleSubmitReview()}
        open={viewModel.submitDialogOpen}
        pending={viewModel.submitDialogPending}
        task={viewModel.submitDialogTask}
      />
    </DashboardPageShell>
  );
}

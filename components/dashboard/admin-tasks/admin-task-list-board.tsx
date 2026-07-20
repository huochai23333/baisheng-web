"use client";

import type { AdminTaskTargetRoleFilter } from "@/lib/admin-tasks";

import { AssignmentDialog } from "./admin-tasks-dialogs";
import { CreateTaskDialog, EditTaskDialog } from "./admin-task-form-dialog";
import { TaskTypeManagementDialog } from "./admin-task-type-management-dialog";
import {
  AdminTasksFiltersSection,
  AdminTasksHeroSection,
  AdminTasksListSection,
  AdminTasksNoPermissionState,
} from "./admin-tasks-sections";
import type { useAdminTasksViewModel } from "./use-admin-tasks-view-model";

type TasksBoardViewModel = ReturnType<typeof useAdminTasksViewModel>;

/**
 * 任务看板集中组装列表和四个任务弹窗。
 * 根 Client 始终创建 view-model，因此切换审核或媒体库后，筛选和表单草稿仍保持原状态。
 */
export function AdminTaskListBoard({
  viewModel,
}: {
  viewModel: TasksBoardViewModel;
}) {
  return (
    <>
      <AdminTasksHeroSection
        canView={viewModel.canView}
        isRefreshing={viewModel.isRefreshing}
        onCreate={viewModel.openCreateDialog}
        onManageTaskTypes={viewModel.openTaskTypeDialog}
        onRefresh={viewModel.handleRefresh}
        onToggleCompletedHistory={() =>
          viewModel.updateFilter(
            "status",
            viewModel.filters.status === "completed" ? "all" : "completed",
          )
        }
        showCompletedHistory={viewModel.filters.status === "completed"}
      />

      {!viewModel.canView ? (
        <AdminTasksNoPermissionState />
      ) : (
        <>
          <AdminTasksFiltersSection
            filters={viewModel.filters}
            onSearchTextChange={(value) =>
              viewModel.updateFilter("searchText", value)
            }
            onTargetRoleChange={(value) =>
              viewModel.updateFilter(
                "targetRole",
                value as AdminTaskTargetRoleFilter,
              )
            }
            targetRoleOptions={viewModel.targetRoleOptions}
          />
          <AdminTasksListSection
            assignmentPendingTaskId={viewModel.assignmentPendingTaskId}
            deletePendingTaskId={viewModel.deletePendingTaskId}
            filteredCount={viewModel.filteredTasks.length}
            onDeleteTask={(task) => void viewModel.handleDeleteTask(task)}
            onEditTask={viewModel.openEditDialog}
            onNextPage={viewModel.goToNextPage}
            onPreviousPage={viewModel.goToPreviousPage}
            onReassignTask={viewModel.openAssignmentDialog}
            tasksPagination={viewModel.tasksPagination}
          />
        </>
      )}

      <CreateTaskDialog
        feedback={viewModel.createDialogFeedback}
        formState={viewModel.createFormState}
        onAcceptanceLimitChange={(value) =>
          viewModel.updateCreateField("acceptanceLimit", value)
        }
        onAcceptanceUnlimitedChange={(value) =>
          viewModel.updateCreateField("acceptanceUnlimited", value)
        }
        onCommissionAmountChange={(value) =>
          viewModel.updateCreateField("commissionAmount", value)
        }
        onFilesChange={viewModel.handleCreateFilesChange}
        onOpenChange={viewModel.handleCreateDialogOpenChange}
        onRemoveFile={viewModel.removeCreateFile}
        onReviewRequiresAttachmentChange={(value) =>
          viewModel.updateCreateField("reviewRequiresAttachment", value)
        }
        onSubmit={() => void viewModel.handleCreateTask()}
        onTargetRoleToggle={viewModel.handleCreateTargetRoleToggle}
        onTaskIntroChange={(value) =>
          viewModel.updateCreateField("taskIntro", value)
        }
        onTaskNameChange={(value) =>
          viewModel.updateCreateField("taskName", value)
        }
        onTaskTypeChange={viewModel.handleCreateTaskTypeChange}
        open={viewModel.createDialogOpen}
        pending={viewModel.createPending}
        targetRoleOptions={viewModel.targetRoleOptions}
        taskTypeOptions={viewModel.taskTypeOptions}
      />

      <EditTaskDialog
        feedback={viewModel.editDialogFeedback}
        formState={viewModel.editFormState}
        onAcceptanceLimitChange={(value) =>
          viewModel.updateEditField("acceptanceLimit", value)
        }
        onAcceptanceUnlimitedChange={(value) =>
          viewModel.updateEditField("acceptanceUnlimited", value)
        }
        onCommissionAmountChange={(value) =>
          viewModel.updateEditField("commissionAmount", value)
        }
        onOpenChange={viewModel.handleEditDialogOpenChange}
        onReviewRequiresAttachmentChange={(value) =>
          viewModel.updateEditField("reviewRequiresAttachment", value)
        }
        onSubmit={() => void viewModel.handleEditTask()}
        onTargetRoleToggle={viewModel.handleEditTargetRoleToggle}
        onTaskIntroChange={(value) =>
          viewModel.updateEditField("taskIntro", value)
        }
        onTaskNameChange={(value) =>
          viewModel.updateEditField("taskName", value)
        }
        onTaskTypeChange={viewModel.handleEditTaskTypeChange}
        open={viewModel.editDialogOpen}
        pending={viewModel.editPending}
        selectedTask={viewModel.editingTask}
        targetRoleOptions={viewModel.targetRoleOptions}
        taskTypeOptions={viewModel.taskTypeOptions}
      />

      <AssignmentDialog
        feedback={viewModel.assignmentDialogFeedback}
        formState={viewModel.assignmentFormState}
        onOpenChange={viewModel.handleAssignmentDialogOpenChange}
        onSubmit={() => void viewModel.handleSaveAssignment()}
        onTargetRoleToggle={viewModel.handleAssignmentTargetRoleToggle}
        open={viewModel.assignmentDialogOpen}
        pending={viewModel.assignmentPending}
        selectedTask={viewModel.selectedTask}
        targetRoleOptions={viewModel.targetRoleOptions}
      />

      <TaskTypeManagementDialog
        editingTaskType={viewModel.editingTaskType}
        feedback={viewModel.taskTypeDialogFeedback}
        formPending={viewModel.taskTypeFormPending}
        formState={viewModel.taskTypeFormState}
        onDeactivate={(taskType) =>
          void viewModel.handleDeactivateTaskType(taskType)
        }
        onFieldChange={viewModel.updateTaskTypeFormField}
        onOpenChange={viewModel.handleTaskTypeDialogOpenChange}
        onStartCreate={viewModel.startCreateTaskType}
        onStartEdit={viewModel.startEditTaskType}
        onSubmit={() => void viewModel.handleSubmitTaskType()}
        open={viewModel.taskTypeDialogOpen}
        pendingCode={viewModel.taskTypePendingCode}
        taskTypeOptions={viewModel.taskTypeOptions}
      />
    </>
  );
}

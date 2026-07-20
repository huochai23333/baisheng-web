"use client";

import * as FormControls from "@/components/ui/form-controls";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { LoaderCircle, Shuffle } from "lucide-react";

import {
  type AdminTaskRow,
  type AdminTasksPageData,
  type TaskTargetRole,
} from "@/lib/admin-tasks";

import { Button } from "@/components/ui/button";
import { FeedbackNotice } from "@/components/dashboard/dashboard-shared-ui";
import {
  getTaskTargetRoleLabel,
  getTaskTargetRolesLabel,
} from "@/components/dashboard/tasks/tasks-display";

import { canReassignTask, type AssignmentFormState } from "./admin-tasks-utils";
import { TaskStatusPill } from "./admin-tasks-ui";
import { type PageFeedback } from "./admin-tasks-view-model-shared";

const DashboardDialog = dynamic(
  () =>
    import("@/components/dashboard/dashboard-dialog").then(
      (mod) => mod.DashboardDialog,
    ),
  { ssr: false },
);

type TargetRoleOptions = AdminTasksPageData["targetRoleOptions"];

export function AssignmentDialog({
  feedback,
  formState,
  onOpenChange,
  onTargetRoleToggle,
  onSubmit,
  open,
  pending,
  selectedTask,
  targetRoleOptions,
}: {
  feedback: PageFeedback;
  formState: AssignmentFormState;
  onOpenChange: (open: boolean) => void;
  onTargetRoleToggle: (role: TaskTargetRole) => void;
  onSubmit: () => void;
  open: boolean;
  pending: boolean;
  selectedTask: AdminTaskRow | null;
  targetRoleOptions: TargetRoleOptions;
}) {
  const t = useTranslations("Tasks.admin");
  const sharedT = useTranslations("Tasks.shared");
  const canChangeAssignment = selectedTask
    ? canReassignTask(selectedTask)
    : false;

  return open ? (
    <DashboardDialog
      actions={
        <>
          <Button
            variant="outline"
            size="default"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            {t("assignmentDialog.cancel")}
          </Button>
          <Button
            variant="primary"
            size="default"
            disabled={pending || !selectedTask || !canChangeAssignment}
            onClick={onSubmit}
            type="button"
          >
            {pending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Shuffle className="size-4" />
            )}
            {t("assignmentDialog.submit")}
          </Button>
        </>
      }
      description={t("assignmentDialog.description")}
      onOpenChange={onOpenChange}
      open
      title={
        selectedTask
          ? t("assignmentDialog.titleWithName", {
              taskName: selectedTask.task_name,
            })
          : t("assignmentDialog.title")
      }
    >
      <div className="space-y-6">
        {feedback ? (
          <FeedbackNotice tone={feedback.tone}>
            {feedback.message}
          </FeedbackNotice>
        ) : null}

        {selectedTask ? (
          <>
            <div className="rounded-surface-panel border border-border-subtle bg-surface-inset p-5">
              <div className="flex flex-wrap items-center gap-2">
                <TaskStatusPill status={selectedTask.status} />
              </div>
              <p className="mt-4 text-lg font-semibold tracking-tight text-content-strong">
                {selectedTask.task_name}
              </p>
              <p className="mt-2 text-sm leading-7 text-content-muted">
                {t("assignmentDialog.currentTargetRoles", {
                  targetRoles: getTaskTargetRolesLabel(
                    selectedTask.target_roles,
                    sharedT,
                  ),
                })}
              </p>
            </div>

            {!canChangeAssignment ? (
              <FeedbackNotice tone="info">
                {t("assignmentDialog.viewOnlyNotice")}
              </FeedbackNotice>
            ) : (
              <div>
                <p className="mb-2 block text-sm font-semibold text-content-strong">
                  {t("assignmentDialog.targetRolesLabel")}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {targetRoleOptions.map((option) => {
                    const checked = formState.targetRoles.includes(option.role);

                    return (
                      <FormControls.ChoiceField
                        checked={checked}
                        disabled={pending}
                        key={option.role}
                        label={getTaskTargetRoleLabel(option.role, sharedT)}
                        onChange={() => onTargetRoleToggle(option.role)}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </DashboardDialog>
  ) : null;
}

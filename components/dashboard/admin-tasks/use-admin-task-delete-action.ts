"use client";

import { useCallback, useState } from "react";

import { useTranslations } from "next-intl";

import {
  deleteAdminTask,
  type AdminTaskRow,
} from "@/lib/admin-tasks";
import { type getBrowserSupabaseClient } from "@/lib/supabase";

import { toAdminTaskErrorMessage } from "@/components/dashboard/tasks/tasks-display";

import { type PageFeedbackValue } from "./admin-tasks-view-model-shared";
import { useDashboardConfirm } from "../dashboard-confirm-provider";

export function useAdminTaskDeleteAction({
  onPageFeedback,
  refreshTaskBoard,
  supabase,
}: {
  onPageFeedback: (feedback: PageFeedbackValue) => void;
  refreshTaskBoard: () => void;
  supabase: ReturnType<typeof getBrowserSupabaseClient>;
}) {
  const confirm = useDashboardConfirm();
  const confirmT = useTranslations("DashboardFramework.confirm");
  const t = useTranslations("Tasks.admin");
  const sharedT = useTranslations("Tasks.shared");
  const [deletePendingTaskId, setDeletePendingTaskId] = useState<string | null>(null);

  const handleDeleteTask = useCallback(
    async (task: AdminTaskRow) => {
      if (!supabase || deletePendingTaskId) {
        return;
      }

      const confirmMessage =
        task.status === "to_be_accepted" && task.accepted_count === 0
          ? t("confirmDelete", { taskName: task.task_name })
          : t("confirmDeleteWithHistory", { taskName: task.task_name });
      if (!(await confirm({
        description: confirmMessage,
        title: confirmT("title"),
        tone: "danger",
      }))) {
        return;
      }

      setDeletePendingTaskId(task.id);

      try {
        const result = await deleteAdminTask(supabase, task);
        onPageFeedback({
          tone: result.storageCleanupFailed ? "info" : "success",
          message: result.storageCleanupFailed
            ? t("feedback.deletedWithAttachmentCleanupWarning")
            : t("feedback.deleted"),
        });
        refreshTaskBoard();
      } catch (error) {
        onPageFeedback({
          tone: "error",
          message: toAdminTaskErrorMessage(error, sharedT),
        });
      } finally {
        setDeletePendingTaskId(null);
      }
    },
    [confirm, confirmT, deletePendingTaskId, onPageFeedback, refreshTaskBoard, sharedT, supabase, t],
  );

  return {
    deletePendingTaskId,
    handleDeleteTask,
  };
}

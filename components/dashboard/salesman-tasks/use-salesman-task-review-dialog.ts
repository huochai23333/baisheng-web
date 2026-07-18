"use client";

import { useCallback, useState, type Dispatch, type SetStateAction } from "react";
import { useTranslations } from "next-intl";

import type { SalesmanTaskRow } from "@/lib/salesman-tasks";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import {
  cancelTaskReviewSubmissionDraft,
  createTaskReviewSubmissionDraft,
  removeStoredTaskReviewSubmissionAssets,
  submitTaskReview,
  uploadTaskReviewSubmissionAssets,
  validateTaskReviewSubmissionFiles,
} from "@/lib/task-reviews";
import { type FeedbackTone } from "@/components/dashboard/dashboard-shared-ui";
import { toSalesmanTaskErrorMessage } from "@/components/dashboard/tasks/tasks-display";

type PageFeedback = { tone: FeedbackTone; message: string } | null;

// 提审弹窗完整管理草稿、文件上传、提交和失败回滚，任务页只需要负责打开弹窗。
export function useSalesmanTaskReviewDialog({
  refreshTaskBoard,
  setPageFeedback,
  viewerId,
}: {
  refreshTaskBoard: () => void;
  setPageFeedback: Dispatch<SetStateAction<PageFeedback>>;
  viewerId: string | null;
}) {
  const supabase = getBrowserSupabaseClient();
  const t = useTranslations("Tasks.salesman");
  const sharedT = useTranslations("Tasks.shared");
  const [open, setOpen] = useState(false);
  const [task, setTask] = useState<SalesmanTaskRow | null>(null);
  const [note, setNote] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [feedback, setFeedback] = useState<PageFeedback>(null);
  const [pending, setPending] = useState(false);

  const reset = useCallback(() => {
    setOpen(false);
    setTask(null);
    setNote("");
    setFiles([]);
    setFeedback(null);
    setPending(false);
  }, []);

  const openForTask = useCallback((nextTask: SalesmanTaskRow) => {
    setTask(nextTask);
    setOpen(true);
    setNote("");
    setFiles([]);
    setFeedback(null);
  }, []);

  const onOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        setOpen(true);
        return;
      }
      reset();
    },
    [reset],
  );

  const submit = useCallback(async () => {
    if (!supabase || !task || !viewerId || pending) return;

    try {
      validateTaskReviewSubmissionFiles(files, {
        requireFiles: task.review_requires_attachment,
      });
      if (!task.review_requires_attachment && !note.trim()) {
        throw new Error("task review submission note is required");
      }
    } catch (error) {
      setFeedback({ tone: "error", message: toSalesmanTaskErrorMessage(error, sharedT) });
      return;
    }

    setPending(true);
    setFeedback(null);
    setPageFeedback(null);
    let draftId: string | null = null;
    let uploadedAssets: Array<{
      bucket_name: string;
      task_attachment_storage_path: string;
    }> = [];

    try {
      const draft = await createTaskReviewSubmissionDraft(supabase, {
        acceptanceId: task.id,
        submissionNote: note,
      });
      draftId = draft.id;
      uploadedAssets = await uploadTaskReviewSubmissionAssets(supabase, {
        submissionId: draft.id,
        uploadedByUserId: viewerId,
        files,
        requireFiles: task.review_requires_attachment,
      });
      await submitTaskReview(supabase, {
        acceptanceId: task.id,
        submissionId: draft.id,
      });

      const wasRejected = task.status === "rejected";
      reset();
      setPageFeedback({
        tone: "success",
        message: wasRejected ? t("feedback.reviewResubmitted") : t("feedback.reviewSubmitted"),
      });
      refreshTaskBoard();
    } catch (error) {
      if (uploadedAssets.length > 0) {
        try {
          await removeStoredTaskReviewSubmissionAssets(supabase, uploadedAssets);
        } catch {
          // 文件回滚是尽力执行；原始提交错误仍需优先反馈给用户。
        }
      }
      if (draftId) {
        try {
          await cancelTaskReviewSubmissionDraft(supabase, draftId);
        } catch {
          // 草稿回滚失败不覆盖原始错误，后续数据库清理可以继续处理该草稿。
        }
      }
      setFeedback({ tone: "error", message: toSalesmanTaskErrorMessage(error, sharedT) });
    } finally {
      setPending(false);
    }
  }, [files, note, pending, refreshTaskBoard, reset, setPageFeedback, sharedT, supabase, t, task, viewerId]);

  return { feedback, files, note, onOpenChange, open, openForTask, pending, setFiles, setNote, submit, task };
}

"use client";

import { Paperclip } from "lucide-react";
import { useTranslations } from "next-intl";

import { DashboardFilePicker } from "@/components/dashboard/dashboard-framework-primitives";
import { formatFileSize } from "@/components/dashboard/dashboard-shared-ui";
import { InteractiveButton } from "@/components/ui/button";
import {
  ADMIN_TASK_ATTACHMENT_MAX_FILES,
  ADMIN_TASK_ATTACHMENT_MAX_TOTAL_SIZE_BYTES,
  type AdminTaskRow,
} from "@/lib/admin-tasks";
import {
  IMAGE_UPLOAD_MAX_SIZE_BYTES,
  OTHER_UPLOAD_MAX_SIZE_BYTES,
  VIDEO_UPLOAD_MAX_SIZE_BYTES,
} from "@/lib/upload-file-size-limits";

import { FormField } from "./admin-tasks-ui";

/** 创建任务时的本地附件选择区；文件真正上传仍由外层 view-model 处理。 */
export function CreateTaskAttachmentsField({
  files,
  onFilesChange,
  onRemoveFile,
}: {
  files: File[];
  onFilesChange: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
}) {
  const t = useTranslations("Tasks.admin");

  return (
    <FormField label={t("createDialog.attachmentsLabel")}>
      <div className="rounded-[24px] border border-dashed border-border-subtle bg-surface-inset p-5">
        <DashboardFilePicker
          label={t("createDialog.attachmentsCta")}
          multiple
          onFiles={onFilesChange}
        />
        <p className="mt-3 text-xs leading-6 text-content-muted">
          {t("createDialog.attachmentsHint", {
            maxFiles: ADMIN_TASK_ATTACHMENT_MAX_FILES,
            imageMaxPerFile: formatFileSize(IMAGE_UPLOAD_MAX_SIZE_BYTES),
            videoMaxPerFile: formatFileSize(VIDEO_UPLOAD_MAX_SIZE_BYTES),
            otherMaxPerFile: formatFileSize(OTHER_UPLOAD_MAX_SIZE_BYTES),
            maxTotal: formatFileSize(
              ADMIN_TASK_ATTACHMENT_MAX_TOTAL_SIZE_BYTES,
            ),
          })}
        </p>

        {files.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {files.map((file, index) => (
              <InteractiveButton
                className="inline-flex items-center gap-2 rounded-full bg-status-info-soft px-3 py-2 text-xs font-medium text-primary transition hover:bg-surface-inset"
                key={`${file.name}-${file.size}-${index}`}
                onClick={() => onRemoveFile(index)}
                type="button"
              >
                <Paperclip className="size-3.5" />
                {file.name}
                <span className="text-content-muted">
                  {formatFileSize(file.size)}
                </span>
              </InteractiveButton>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm leading-7 text-content-muted">
            {t("createDialog.noAttachments")}
          </p>
        )}
      </div>
    </FormField>
  );
}

/** 编辑任务只展示已经上传的附件，避免用户误以为可以在这里替换历史文件。 */
export function EditTaskAttachmentsField({ task }: { task: AdminTaskRow }) {
  const t = useTranslations("Tasks.admin");

  return (
    <FormField label={t("createDialog.attachmentsLabel")}>
      <div className="rounded-[24px] border border-border-subtle bg-surface-inset p-5">
        {task.attachments.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {task.attachments.map((attachment) => (
              <span
                className="inline-flex items-center gap-2 rounded-full bg-status-info-soft px-3 py-2 text-xs font-medium text-primary"
                key={attachment.id}
              >
                <Paperclip className="size-3.5" />
                {attachment.original_name}
                <span className="text-content-muted">
                  {formatFileSize(attachment.file_size_bytes)}
                </span>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-7 text-content-muted">
            {t("editDialog.noAttachments")}
          </p>
        )}
        <p className="mt-4 text-sm leading-7 text-content-muted">
          {t("editDialog.attachmentsLocked")}
        </p>
      </div>
    </FormField>
  );
}

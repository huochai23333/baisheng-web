"use client";

import * as FormControls from "@/components/ui/form-controls";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import {
  Ban,
  CheckCircle2,
  LoaderCircle,
  PencilLine,
  Plus,
} from "lucide-react";

import { type TaskTypeOption } from "@/lib/admin-tasks";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/i18n/locale-provider";
import { FeedbackNotice } from "@/components/dashboard/dashboard-shared-ui";
import { formatTaskCommissionMoney } from "@/components/dashboard/tasks/tasks-display";

import { FormField } from "./admin-tasks-ui";
import {
  type PageFeedback,
  taskInputClassName,
  taskTextareaClassName,
} from "./admin-tasks-view-model-shared";
import { type TaskTypeFormState } from "./use-admin-task-type-management-dialog";

const DashboardDialog = dynamic(
  () =>
    import("@/components/dashboard/dashboard-dialog").then(
      (mod) => mod.DashboardDialog,
    ),
  { ssr: false },
);

export function TaskTypeManagementDialog({
  editingTaskType,
  feedback,
  formPending,
  formState,
  onDeactivate,
  onFieldChange,
  onOpenChange,
  onStartCreate,
  onStartEdit,
  onSubmit,
  open,
  pendingCode,
  taskTypeOptions,
}: {
  editingTaskType: TaskTypeOption | null;
  feedback: PageFeedback;
  formPending: boolean;
  formState: TaskTypeFormState;
  onDeactivate: (taskType: TaskTypeOption) => void;
  onFieldChange: <Key extends keyof TaskTypeFormState>(
    key: Key,
    value: TaskTypeFormState[Key],
  ) => void;
  onOpenChange: (open: boolean) => void;
  onStartCreate: () => void;
  onStartEdit: (taskType: TaskTypeOption) => void;
  onSubmit: () => void;
  open: boolean;
  pendingCode: string | null;
  taskTypeOptions: TaskTypeOption[];
}) {
  const t = useTranslations("Tasks.admin");
  const { locale } = useLocale();

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
            {t("taskTypes.dialog.close")}
          </Button>
          <Button
            variant="primary"
            size="default"
            disabled={formPending || pendingCode !== null}
            onClick={onSubmit}
            type="button"
          >
            {formPending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : editingTaskType ? (
              <PencilLine className="size-4" />
            ) : (
              <Plus className="size-4" />
            )}
            {editingTaskType
              ? t("taskTypes.form.save")
              : t("taskTypes.form.create")}
          </Button>
        </>
      }
      description={t("taskTypes.dialog.description")}
      onOpenChange={onOpenChange}
      open
      title={t("taskTypes.dialog.title")}
    >
      <div className="space-y-6">
        {feedback ? (
          <FeedbackNotice tone={feedback.tone}>
            {feedback.message}
          </FeedbackNotice>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-content-strong">
                {t("taskTypes.list.title")}
              </h3>
              <Button
                variant="outline"
                size="compact"
                onClick={onStartCreate}
                type="button"
              >
                <Plus className="size-3.5" />
                {t("taskTypes.list.new")}
              </Button>
            </div>

            {taskTypeOptions.length === 0 ? (
              <div className="rounded-surface-inset border border-dashed border-border bg-surface-inset p-5 text-sm leading-7 text-content-muted">
                {t("taskTypes.list.empty")}
              </div>
            ) : (
              <div className="space-y-3">
                {taskTypeOptions.map((taskType) => (
                  <div
                    className={[
                      "rounded-surface-inset border p-4 transition",
                      editingTaskType?.code === taskType.code
                        ? "border-primary bg-surface-inset"
                        : "border-border-subtle bg-surface-interactive",
                    ].join(" ")}
                    key={taskType.code}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-content-strong">
                            {taskType.displayName}
                          </p>
                          <span
                            className={[
                              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                              taskType.isActive
                                ? "bg-surface-inset text-content-muted"
                                : "bg-surface-inset text-content-muted",
                            ].join(" ")}
                          >
                            {taskType.isActive ? (
                              <CheckCircle2 className="size-3.5" />
                            ) : (
                              <Ban className="size-3.5" />
                            )}
                            {taskType.isActive
                              ? t("taskTypes.list.active")
                              : t("taskTypes.list.inactive")}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-7 text-content-muted">
                          {taskType.description?.trim() ||
                            t("taskTypes.list.noDescription")}
                        </p>
                        <p className="mt-2 text-xs font-semibold text-primary">
                          {t("taskTypes.list.defaultCommission", {
                            amount: formatTaskCommissionMoney(
                              taskType.defaultCommissionAmountRmb,
                              locale,
                            ),
                          })}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-col gap-2">
                        <Button
                          variant="outline"
                          size="compact"
                          disabled={formPending || pendingCode !== null}
                          onClick={() => onStartEdit(taskType)}
                          type="button"
                        >
                          <PencilLine className="size-3.5" />
                          {t("taskTypes.list.edit")}
                        </Button>
                        <Button
                          variant="danger"
                          size="compact"
                          className="disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={
                            formPending ||
                            pendingCode !== null ||
                            !taskType.isActive
                          }
                          onClick={() => onDeactivate(taskType)}
                          type="button"
                        >
                          {pendingCode === taskType.code ? (
                            <LoaderCircle className="size-3.5 animate-spin" />
                          ) : (
                            <Ban className="size-3.5" />
                          )}
                          {t("taskTypes.list.deactivate")}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-control-large border border-border-subtle bg-surface-inset p-5">
            <h3 className="text-sm font-semibold text-content-strong">
              {editingTaskType
                ? t("taskTypes.form.editTitle")
                : t("taskTypes.form.createTitle")}
            </h3>
            <div className="mt-5 space-y-5">
              <FormField label={t("taskTypes.form.nameLabel")}>
                <FormControls.Input
                  className={taskInputClassName}
                  disabled={formPending}
                  onChange={(event) =>
                    onFieldChange("displayName", event.target.value)
                  }
                  placeholder={t("taskTypes.form.namePlaceholder")}
                  type="text"
                  value={formState.displayName}
                />
              </FormField>

              <FormField label={t("taskTypes.form.commissionLabel")}>
                <FormControls.Input
                  className={taskInputClassName}
                  disabled={formPending}
                  inputMode="decimal"
                  min="0"
                  onChange={(event) =>
                    onFieldChange("defaultCommissionAmount", event.target.value)
                  }
                  placeholder={t("taskTypes.form.commissionPlaceholder")}
                  step="0.01"
                  type="number"
                  value={formState.defaultCommissionAmount}
                />
              </FormField>

              <FormField label={t("taskTypes.form.descriptionLabel")}>
                <FormControls.Textarea
                  className={taskTextareaClassName}
                  disabled={formPending}
                  onChange={(event) =>
                    onFieldChange("description", event.target.value)
                  }
                  placeholder={t("taskTypes.form.descriptionPlaceholder")}
                  value={formState.description}
                />
              </FormField>
            </div>
          </section>
        </div>
      </div>
    </DashboardDialog>
  ) : null;
}

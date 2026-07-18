"use client";

import * as FormControls from "@/components/ui/form-controls";
import { Select } from "@/components/ui/select";

import { useTranslations } from "next-intl";

import {
  type AdminTaskRow,
  type AdminTasksPageData,
  type TaskTargetRole,
  type TaskTypeOption,
} from "@/lib/admin-tasks";
import {
  getTaskTargetRoleLabel,
  getTaskTargetRolesLabel,
} from "@/components/dashboard/tasks/tasks-display";

import { type CreateTaskFormState } from "./admin-tasks-utils";
import { FormField, TaskStatusPill } from "./admin-tasks-ui";
import {
  taskInputClassName,
  taskTextareaClassName,
} from "./admin-tasks-view-model-shared";

type TargetRoleOptions = AdminTasksPageData["targetRoleOptions"];

export function TaskEditSummaryCard({ task }: { task: AdminTaskRow }) {
  const t = useTranslations("Tasks.admin");
  const sharedT = useTranslations("Tasks.shared");

  return (
    <div className="rounded-[24px] border border-border-subtle bg-surface-inset p-5">
      <div className="flex flex-wrap items-center gap-2">
        <TaskStatusPill status={task.status} />
      </div>
      <p className="mt-4 text-lg font-semibold tracking-tight text-content-strong">
        {task.task_name}
      </p>
      <p className="mt-2 text-sm leading-7 text-content-muted">
        {t("editDialog.currentTargetRoles", {
          targetRoles: getTaskTargetRolesLabel(task.target_roles, sharedT),
        })}
      </p>
    </div>
  );
}

export function TaskFormFields({
  canChangeAssignment,
  formState,
  onAcceptanceLimitChange,
  onAcceptanceUnlimitedChange,
  onCommissionAmountChange,
  onReviewRequiresAttachmentChange,
  onTargetRoleToggle,
  onTaskIntroChange,
  onTaskNameChange,
  onTaskTypeChange,
  pending,
  taskTypeOptions,
  targetRoleOptions,
}: {
  canChangeAssignment: boolean;
  formState: CreateTaskFormState;
  onAcceptanceLimitChange: (value: string) => void;
  onAcceptanceUnlimitedChange: (value: boolean) => void;
  onCommissionAmountChange: (value: string) => void;
  onReviewRequiresAttachmentChange: (value: boolean) => void;
  onTargetRoleToggle: (role: TaskTargetRole) => void;
  onTaskIntroChange: (value: string) => void;
  onTaskNameChange: (value: string) => void;
  onTaskTypeChange: (taskTypeCode: string) => void;
  pending: boolean;
  taskTypeOptions: TaskTypeOption[];
  targetRoleOptions: TargetRoleOptions;
}) {
  const t = useTranslations("Tasks.admin");
  const selectableTaskTypes = taskTypeOptions.filter(
    (taskType) => taskType.isActive || taskType.code === formState.taskTypeCode,
  );

  return (
    <>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <FormField label={t("createDialog.taskNameLabel")}>
          <FormControls.Input
            className={taskInputClassName}
            disabled={pending}
            onChange={(event) => onTaskNameChange(event.target.value)}
            placeholder={t("createDialog.taskNamePlaceholder")}
            type="text"
            value={formState.taskName}
          />
        </FormField>

        <TargetRoleCheckboxGrid
          disabled={pending || !canChangeAssignment}
          onToggle={onTargetRoleToggle}
          selectedRoles={formState.targetRoles}
          targetRoleOptions={targetRoleOptions}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <FormField label={t("createDialog.taskTypeLabel")}>
          <Select
            disabled={pending}
            onValueChange={onTaskTypeChange}
            options={[
              { label: t("createDialog.taskTypePlaceholder"), value: "" },
              ...selectableTaskTypes.map((taskType) => ({
                label: taskType.displayName,
                value: taskType.code,
              })),
            ]}
            value={formState.taskTypeCode}
          />
        </FormField>

        <FormField label={t("createDialog.commissionAmountLabel")}>
          <FormControls.Input
            className={taskInputClassName}
            disabled={pending}
            inputMode="decimal"
            min="0"
            onChange={(event) => onCommissionAmountChange(event.target.value)}
            placeholder={t("createDialog.commissionAmountPlaceholder")}
            step="0.01"
            type="number"
            value={formState.commissionAmount}
          />
        </FormField>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <FormField label={t("createDialog.acceptanceLimitLabel")}>
          <FormControls.Input
            className={taskInputClassName}
            disabled={pending || formState.acceptanceUnlimited}
            inputMode="numeric"
            min="1"
            onChange={(event) => onAcceptanceLimitChange(event.target.value)}
            placeholder={t("createDialog.acceptanceLimitPlaceholder")}
            step="1"
            type="number"
            value={formState.acceptanceLimit}
          />
        </FormField>

        <fieldset>
          <legend className="mb-2 block text-sm font-semibold text-content-strong">
            {t("createDialog.acceptanceModeLabel")}
          </legend>
          <label
            className={[
              "flex min-h-11 items-center gap-3 rounded-[16px] border px-3 py-2 text-sm font-medium transition",
              formState.acceptanceUnlimited
                ? "border-primary bg-surface-inset text-content-strong"
                : "border-border-subtle bg-white text-content-muted",
              pending
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer hover:bg-surface-inset",
            ].join(" ")}
          >
            <FormControls.Checkbox
              checked={formState.acceptanceUnlimited}
              className="size-4 accent-primary"
              disabled={pending}
              onChange={(event) =>
                onAcceptanceUnlimitedChange(event.target.checked)
              }
            />
            {t("createDialog.acceptanceUnlimitedLabel")}
          </label>
          <p className="mt-2 text-xs leading-6 text-content-muted">
            {t("createDialog.acceptanceHint")}
          </p>
        </fieldset>

        <fieldset>
          <legend className="mb-2 block text-sm font-semibold text-content-strong">
            {t("createDialog.reviewRequirementLabel")}
          </legend>
          <label
            className={[
              "flex min-h-11 items-center gap-3 rounded-[16px] border px-3 py-2 text-sm font-medium transition",
              formState.reviewRequiresAttachment
                ? "border-primary bg-surface-inset text-content-strong"
                : "border-border-subtle bg-white text-content-muted",
              pending
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer hover:bg-surface-inset",
            ].join(" ")}
          >
            <FormControls.Checkbox
              checked={formState.reviewRequiresAttachment}
              className="size-4 accent-primary"
              disabled={pending}
              onChange={(event) =>
                onReviewRequiresAttachmentChange(event.target.checked)
              }
            />
            {t("createDialog.reviewRequiresAttachmentLabel")}
          </label>
          <p className="mt-2 text-xs leading-6 text-content-muted">
            {formState.reviewRequiresAttachment
              ? t("createDialog.reviewRequiresAttachmentHint")
              : t("createDialog.reviewNoteOnlyHint")}
          </p>
        </fieldset>
      </div>

      {formState.taskTypeCode ? (
        <p className="text-sm leading-7 text-content-muted">
          {taskTypeOptions.find(
            (taskType) => taskType.code === formState.taskTypeCode,
          )?.description ?? t("createDialog.taskTypeHint")}
        </p>
      ) : null}

      <FormField label={t("createDialog.taskIntroLabel")}>
        <FormControls.Textarea
          className={taskTextareaClassName}
          disabled={pending}
          onChange={(event) => onTaskIntroChange(event.target.value)}
          placeholder={t("createDialog.taskIntroPlaceholder")}
          value={formState.taskIntro}
        />
      </FormField>
    </>
  );
}

function TargetRoleCheckboxGrid({
  disabled,
  onToggle,
  selectedRoles,
  targetRoleOptions,
}: {
  disabled: boolean;
  onToggle: (role: TaskTargetRole) => void;
  selectedRoles: TaskTargetRole[];
  targetRoleOptions: TargetRoleOptions;
}) {
  const t = useTranslations("Tasks.admin");
  const sharedT = useTranslations("Tasks.shared");

  return (
    <fieldset>
      <legend className="mb-2 block text-sm font-semibold text-content-strong">
        {t("createDialog.targetRolesLabel")}
      </legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {targetRoleOptions.map((option) => {
          const checked = selectedRoles.includes(option.role);

          return (
            <label
              className={[
                "flex min-h-11 items-center gap-3 rounded-[16px] border px-3 py-2 text-sm font-medium transition",
                checked
                  ? "border-primary bg-surface-inset text-content-strong"
                  : "border-border-subtle bg-white text-content-muted",
                disabled
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer hover:bg-surface-inset",
              ].join(" ")}
              key={option.role}
            >
              <FormControls.Checkbox
                checked={checked}
                className="size-4 accent-primary"
                disabled={disabled}
                onChange={() => onToggle(option.role)}
              />
              {getTaskTargetRoleLabel(option.role, sharedT)}
            </label>
          );
        })}
      </div>
      <p className="mt-2 text-xs leading-6 text-content-muted">
        {t("createDialog.targetRolesHint")}
      </p>
    </fieldset>
  );
}

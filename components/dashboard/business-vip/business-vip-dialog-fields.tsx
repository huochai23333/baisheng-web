"use client";

import * as FormControls from "@/components/ui/form-controls";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

// 多个 VIP 弹窗共用同一套备注输入和操作按钮，避免各弹窗出现不同的交互细节。
export function BusinessVipNoteField({
  disabled,
  label,
  onChange,
  placeholder,
  value,
}: {
  disabled: boolean;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <FormControls.Field label={label}>
      <FormControls.Textarea
        className="min-h-28"
        disabled={disabled}
        maxLength={500}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </FormControls.Field>
  );
}

export function BusinessVipDialogActions({
  cancelLabel,
  className,
  cancelDisabled,
  icon,
  onCancel,
  submitDisabled,
  submitLabel,
}: {
  cancelLabel: string;
  className?: string;
  cancelDisabled: boolean;
  icon: ReactNode;
  onCancel: () => void;
  submitDisabled: boolean;
  submitLabel: string;
}) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <Button
        size="default"
        disabled={cancelDisabled}
        onClick={onCancel}
        type="button"
        variant="outline"
      >
        {cancelLabel}
      </Button>
      <Button
        className={className}
        disabled={submitDisabled}
        size="default"
        type="submit"
        variant="primary"
      >
        {icon}
        {submitLabel}
      </Button>
    </div>
  );
}

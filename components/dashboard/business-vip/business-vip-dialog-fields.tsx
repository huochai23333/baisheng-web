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
    <label className="block">
      <span className="mb-2 block text-[11px] font-semibold tracking-[0.16em] text-content-subtle uppercase">
        {label}
      </span>
      <FormControls.Textarea
        className="min-h-28 w-full resize-y rounded-[18px] border border-border bg-white px-4 py-3 text-sm leading-6 text-content-strong outline-none placeholder:text-content-subtle focus:border-ring focus:ring-4 focus:ring-ring/30"
        disabled={disabled}
        maxLength={500}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
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

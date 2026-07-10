"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
      <span className="mb-2 block text-[11px] font-semibold tracking-[0.16em] text-[#88939b] uppercase">
        {label}
      </span>
      <textarea
        className="min-h-28 w-full resize-y rounded-[18px] border border-[#dfe5ea] bg-white px-4 py-3 text-sm leading-6 text-[#23313a] outline-none placeholder:text-[#8a949c] focus:border-[#bfd2e1] focus:ring-4 focus:ring-[#bfd2e1]/30"
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
        className="h-11 rounded-full border border-[#d9e0e5] bg-white px-5 text-[#486782] hover:bg-[#f3f6f8]"
        disabled={cancelDisabled}
        onClick={onCancel}
        type="button"
        variant="outline"
      >
        {cancelLabel}
      </Button>
      <Button
        className={cn(
          "h-11 rounded-full bg-[#486782] px-5 text-white hover:bg-[#3e5f79]",
          className,
        )}
        disabled={submitDisabled}
        type="submit"
      >
        {icon}
        {submitLabel}
      </Button>
    </div>
  );
}

"use client";

import {
  useId,
  type ChangeEvent,
  type Ref,
  type ReactNode,
} from "react";

import { FileUp, LoaderCircle, PencilLine, Save, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

import { Button } from "../ui/button";

export type DashboardStatusTone =
  | "danger"
  | "info"
  | "neutral"
  | "success"
  | "warning";

export function DashboardStatusBadge({
  children,
  className,
  tone = "neutral",
}: {
  children: ReactNode;
  className?: string;
  tone?: DashboardStatusTone;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full border px-3 py-1 text-xs font-semibold",
        tone === "neutral" && "border-[#dfe5ea] bg-[#f5f7f8] text-[#66737e]",
        tone === "info" && "border-[#cadbe5] bg-[#eef5f8] text-[#486782]",
        tone === "success" && "border-[#cce2d3] bg-[#e8f4ec] text-[#4c7259]",
        tone === "warning" && "border-[#ead9a9] bg-[#fff5db] text-[#8a620d]",
        tone === "danger" && "border-[#eccaca] bg-[#fbe6e6] text-[#a33f3f]",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** 规则表和设置卡共用的编辑、保存、取消按钮。 */
export function DashboardInlineEditActions({
  cancelLabel,
  editLabel,
  editing,
  onCancel,
  onEdit,
  onSave,
  pending,
  saveLabel,
  saving = pending,
}: {
  cancelLabel: string;
  editLabel: string;
  editing: boolean;
  onCancel: () => void;
  onEdit: () => void;
  onSave: () => void;
  pending: boolean;
  saveLabel: string;
  saving?: boolean;
}) {
  return editing ? (
    <div className="flex flex-wrap gap-2">
      <Button disabled={pending} onClick={onCancel} type="button" variant="outline">
        <X className="size-4" />
        {cancelLabel}
      </Button>
      <Button disabled={pending} onClick={onSave} type="button">
        {saving ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <Save className="size-4" />
        )}
        {saveLabel}
      </Button>
    </div>
  ) : (
    <Button disabled={pending} onClick={onEdit} type="button" variant="outline">
      <PencilLine className="size-4" />
      {editLabel}
    </Button>
  );
}

export function DashboardFilePicker({
  accept,
  disabled,
  files,
  label,
  multiple = false,
  onFiles,
  inputRef,
  triggerHidden = false,
}: {
  accept?: string;
  disabled?: boolean;
  files?: readonly File[];
  label?: ReactNode;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  inputRef?: Ref<HTMLInputElement>;
  triggerHidden?: boolean;
}) {
  const id = useId();
  const t = useTranslations("DashboardFramework.files");
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onFiles(Array.from(event.currentTarget.files ?? []));
    // 清空原生值后，用户可以再次选择同一个文件并触发 change。
    event.currentTarget.value = "";
  };

  return (
    <div className={cn("grid min-w-0 gap-3", triggerHidden && "hidden")}>
      <input
        accept={accept}
        className="sr-only"
        disabled={disabled}
        id={id}
        multiple={multiple}
        onChange={handleChange}
        ref={inputRef}
        type="file"
      />
      {!triggerHidden ? <label
        aria-disabled={disabled}
        className={cn(
          "inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-[#dfe5ea] bg-white px-4 text-sm font-medium text-[#486782] transition hover:bg-[#f2f4f6] sm:w-fit",
          disabled && "pointer-events-none opacity-60",
        )}
        htmlFor={id}
      >
        <FileUp className="size-4" />
        {label ?? t("select")}
      </label> : null}
      {files?.length ? (
        <ul className="grid gap-1.5 text-sm text-[#66737e]">
          {files.map((file, index) => (
            <li className="break-all" key={`${file.name}:${file.size}:${index}`}>
              {file.name}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

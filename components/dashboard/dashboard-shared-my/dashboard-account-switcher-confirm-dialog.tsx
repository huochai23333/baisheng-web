"use client";

import { AlertTriangle } from "lucide-react";

import { DashboardDialog } from "@/components/dashboard/dashboard-dialog";
import { Button } from "@/components/ui/button";

import type { DashboardMyCopy } from "./dashboard-shared-my-copy";

export type AccountSwitcherConfirmAction = "clear" | "remove";

type DashboardAccountSwitcherConfirmDialogProps = {
  action: AccountSwitcherConfirmAction | null;
  copy: DashboardMyCopy;
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
};

export function DashboardAccountSwitcherConfirmDialog({
  action,
  copy,
  onCancel,
  onConfirm,
  open,
}: DashboardAccountSwitcherConfirmDialogProps) {
  const title =
    action === "clear"
      ? copy.accountSwitcherClearConfirm
      : copy.accountSwitcherRemoveConfirm;
  const description =
    action === "clear"
      ? copy.accountSwitcherClearConfirmDescription
      : copy.accountSwitcherRemoveConfirmDescription;
  const confirmLabel =
    action === "clear" ? copy.accountSwitcherClear : copy.accountSwitcherRemove;

  return (
    <DashboardDialog
      actions={
        <>
          <Button
            className="h-10 rounded-full border-[#d4d8dc] bg-white px-4 text-[#486782] hover:bg-[#f2f4f6]"
            onClick={onCancel}
            variant="outline"
          >
            {copy.accountSwitcherCancel}
          </Button>
          <Button
            className="h-10 rounded-full bg-[#486782] px-4 text-white hover:bg-[#3e5f79]"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </>
      }
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onCancel();
        }
      }}
      open={open}
      title={title}
    >
      <div className="flex items-start gap-3 rounded-[20px] border border-[#ead7c6] bg-[#fff8f1] p-4 text-sm leading-6 text-[#74563f]">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[#9b6a41]" />
        <p>{description}</p>
      </div>
    </DashboardDialog>
  );
}

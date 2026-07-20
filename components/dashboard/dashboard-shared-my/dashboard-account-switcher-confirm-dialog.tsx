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
          <Button size="compact" onClick={onCancel} variant="outline">
            {copy.accountSwitcherCancel}
          </Button>
          <Button variant="primary" size="compact" onClick={onConfirm}>
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
      <div className="flex items-start gap-3 rounded-surface-inset border border-border-subtle bg-surface-inset p-4 text-sm leading-6 text-content-muted">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-content-muted" />
        <p>{description}</p>
      </div>
    </DashboardDialog>
  );
}

"use client";

import * as FormControls from "@/components/ui/form-controls";

import { LoaderCircle, Save, StickyNote } from "lucide-react";
import { useTranslations } from "next-intl";

import { DashboardDialog } from "@/components/dashboard/dashboard-dialog";
import { Button } from "@/components/ui/button";
import { PERSON_PRIVATE_NOTE_MAX_LENGTH } from "@/lib/person-private-note-constants";

export function PersonPrivateNoteDialog({
  canSave,
  draftNote,
  onClose,
  onDraftNoteChange,
  onSave,
  open,
  saving,
  targetName,
}: {
  canSave: boolean;
  draftNote: string;
  onClose: () => void;
  onDraftNoteChange: (value: string) => void;
  onSave: () => void;
  open: boolean;
  saving: boolean;
  targetName: string;
}) {
  const t = useTranslations("PersonPrivateNotes");

  return (
    <DashboardDialog
      actions={
        <>
          <Button
            variant="outline"
            size="compact"
            disabled={saving}
            onClick={onClose}
            type="button"
          >
            {t("actions.cancel")}
          </Button>
          <Button
            variant="primary"
            size="compact"
            disabled={!canSave}
            onClick={onSave}
            type="button"
          >
            {saving ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {saving ? t("actions.saving") : t("actions.save")}
          </Button>
        </>
      }
      description={t("dialog.description")}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
      open={open}
      title={t("dialog.title", {
        name: targetName || t("fallback.unnamed"),
      })}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-surface-inset border border-border-subtle bg-surface-interactive p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-status-info-soft text-primary">
            <StickyNote className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="break-words text-sm font-semibold text-content-strong [overflow-wrap:anywhere]">
              {targetName || t("fallback.unnamed")}
            </p>
            <p className="mt-1 break-words text-xs leading-6 text-content-muted [overflow-wrap:anywhere]">
              {t("dialog.visibility")}
            </p>
          </div>
        </div>

        <FormControls.Field label={t("dialog.note")}>
          <FormControls.Textarea
            className="min-h-40"
            disabled={saving}
            maxLength={PERSON_PRIVATE_NOTE_MAX_LENGTH}
            onChange={(event) => onDraftNoteChange(event.target.value)}
            placeholder={t("dialog.placeholder")}
            value={draftNote}
          />
        </FormControls.Field>

        <p className="text-right text-xs text-content-muted">
          {t("dialog.counter", {
            count: draftNote.length,
            max: PERSON_PRIVATE_NOTE_MAX_LENGTH,
          })}
        </p>
      </div>
    </DashboardDialog>
  );
}

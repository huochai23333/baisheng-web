"use client";

import * as FormControls from "@/components/ui/form-controls";
import { Select } from "@/components/ui/select";

import {
  FormDialog,
  DashboardFormField,
  DashboardFormTextarea,
} from "@/components/dashboard/dashboard-form-dialog";
import type {
  AnnouncementAudience,
  AnnouncementRow,
} from "@/lib/announcements";

import type { FeedbackTone } from "../dashboard-shared-ui";
import {
  announcementAudienceValues,
  type AnnouncementFormState,
} from "./announcements-display";

type AnnouncementFormDialogProps = {
  copy: {
    audienceLabel: string;
    audienceOptions: Record<AnnouncementAudience, string>;
    cancel: string;
    contentLabel: string;
    contentPlaceholder: string;
    createDescription: string;
    createSubmit: string;
    createTitle: string;
    editDescription: string;
    editSubmit: string;
    editTitle: string;
    titleLabel: string;
    titlePlaceholder: string;
  };
  editingAnnouncement: AnnouncementRow | null;
  feedback: { tone: FeedbackTone; message: string } | null;
  formState: AnnouncementFormState;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  onUpdateField: <Key extends keyof AnnouncementFormState>(
    field: Key,
    value: AnnouncementFormState[Key],
  ) => void;
  open: boolean;
  pending: boolean;
};

export function AnnouncementFormDialog({
  copy,
  editingAnnouncement,
  feedback,
  formState,
  onOpenChange,
  onSubmit,
  onUpdateField,
  open,
  pending,
}: AnnouncementFormDialogProps) {
  const createMode = !editingAnnouncement;

  return (
    <FormDialog
      cancelLabel={copy.cancel}
      description={createMode ? copy.createDescription : copy.editDescription}
      feedback={feedback}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      open={open}
      pending={pending}
      submitLabel={createMode ? copy.createSubmit : copy.editSubmit}
      title={createMode ? copy.createTitle : copy.editTitle}
    >
      <DashboardFormField label={copy.titleLabel} required>
        <FormControls.Input
          onChange={(event) => onUpdateField("title", event.target.value)}
          placeholder={copy.titlePlaceholder}
          type="text"
          value={formState.title}
        />
      </DashboardFormField>

      <DashboardFormField label={copy.audienceLabel} required>
        <Select
          onValueChange={(value) => onUpdateField("audience", value)}
          options={announcementAudienceValues.map((audience) => ({
            label: copy.audienceOptions[audience],
            value: audience,
          }))}
          value={formState.audience}
        />
      </DashboardFormField>

      <DashboardFormField label={copy.contentLabel} required>
        <DashboardFormTextarea
          className="min-h-[180px]"
          onChange={(event) => onUpdateField("content", event.target.value)}
          placeholder={copy.contentPlaceholder}
          value={formState.content}
        />
      </DashboardFormField>
    </FormDialog>
  );
}

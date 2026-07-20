"use client";

import * as FormControls from "@/components/ui/form-controls";
import { Select } from "@/components/ui/select";

import { useTranslations } from "next-intl";
import {
  Building2,
  CirclePlus,
  LoaderCircle,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  UsersRound,
} from "lucide-react";

import type { TeamManagerCandidate } from "@/lib/team-management";
import type { AppRole } from "@/lib/user-self-service";

import { Button } from "@/components/ui/button";
import { DashboardSectionHeader } from "@/components/dashboard/dashboard-section-header";
import {
  DashboardListSection,
  DashboardSectionPanel,
} from "@/components/dashboard/dashboard-section-panel";
import { EmptyState } from "@/components/dashboard/dashboard-shared-ui";

import {
  getManagerCandidateLabel,
  getTeamManagementDescription,
} from "./team-management-display";

export function TeamManagementHeroSection({
  canManageSelectedTeam,
  busyKey,
  onRefresh,
  viewerRole,
}: {
  canManageSelectedTeam: boolean;
  busyKey: string | null;
  onRefresh: () => void;
  viewerRole: AppRole | null;
}) {
  const t = useTranslations("TeamManagement");

  return (
    <DashboardSectionHeader
      actions={
        <>
          <Button
            size="default"
            disabled={busyKey !== null}
            onClick={onRefresh}
            variant="outline"
          >
            {busyKey === "refresh" ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            {t("header.refresh")}
          </Button>
          {canManageSelectedTeam ? (
            <div className="inline-flex items-center rounded-full bg-surface-inset px-4 py-2 text-sm text-status-success">
              {t("header.manageableHint")}
            </div>
          ) : null}
        </>
      }
      badge={t("header.badge")}
      badgeClassName="bg-surface-inset"
      description={getTeamManagementDescription(viewerRole, t)}
      title={t("header.title")}
    />
  );
}

export function AdminCreateTeamSection({
  busyKey,
  createManagerCandidates,
  createManagerUserIdDraft,
  createTeamNameDraft,
  onCreate,
  onCreateManagerUserIdChange,
  onCreateTeamNameChange,
}: {
  busyKey: string | null;
  createManagerCandidates: TeamManagerCandidate[];
  createManagerUserIdDraft: string;
  createTeamNameDraft: string;
  onCreate: () => void;
  onCreateManagerUserIdChange: (value: string) => void;
  onCreateTeamNameChange: (value: string) => void;
}) {
  const t = useTranslations("TeamManagement");

  return (
    <DashboardListSection
      description={t("adminCreate.description")}
      title={t("adminCreate.title")}
    >
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr_auto]">
        <FormControls.Field label={t("adminCreate.teamNameLabel")} required>
          <FormControls.Input
            onChange={(event) => onCreateTeamNameChange(event.target.value)}
            placeholder={t("adminCreate.teamNamePlaceholder")}
            value={createTeamNameDraft}
          />
        </FormControls.Field>

        <FormControls.Field label={t("adminCreate.managerLabel")}>
          <Select
            onValueChange={onCreateManagerUserIdChange}
            options={[
              { label: t("shared.managerOptionNone"), value: "" },
              ...createManagerCandidates.map((candidate) => ({
                disabled: !candidate.assignable,
                label: getManagerCandidateLabel(candidate, t),
                value: candidate.user_id,
              })),
            ]}
            value={createManagerUserIdDraft}
          />
        </FormControls.Field>

        <div className="flex items-end">
          <Button
            variant="primary"
            size="default"
            className="w-full xl:w-auto"
            disabled={!createTeamNameDraft.trim() || busyKey !== null}
            onClick={onCreate}
          >
            {busyKey === "create-team" ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <CirclePlus className="size-4" />
            )}
            {t("adminCreate.button")}
          </Button>
        </div>
      </div>
    </DashboardListSection>
  );
}

export function NoPermissionSection() {
  const t = useTranslations("TeamManagement");

  return (
    <DashboardListSection>
      <EmptyState
        description={t("states.noPermissionDescription")}
        icon={<ShieldAlert className="size-6" />}
        title={t("states.noPermissionTitle")}
      />
    </DashboardListSection>
  );
}

export function ManagerSetupSection({
  busyKey,
  onSave,
  onTeamNameChange,
  teamNameDraft,
}: {
  busyKey: string | null;
  onSave: () => void;
  onTeamNameChange: (value: string) => void;
  teamNameDraft: string;
}) {
  const t = useTranslations("TeamManagement");

  return (
    <section className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
      <DashboardSectionPanel>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-status-info-soft text-primary">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-content-strong">
              {t("managerSetup.title")}
            </h3>
            <p className="mt-2 text-sm leading-7 text-content-muted">
              {t("managerSetup.description")}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-surface-panel border border-border-subtle bg-surface-inset p-5 shadow-surface-interactive">
          <FormControls.Field label={t("managerSetup.teamNameLabel")} required>
            <FormControls.Input
              onChange={(event) => onTeamNameChange(event.target.value)}
              placeholder={t("managerSetup.teamNamePlaceholder")}
              value={teamNameDraft}
            />
          </FormControls.Field>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="default"
              disabled={!teamNameDraft.trim() || busyKey !== null}
              onClick={onSave}
            >
              {busyKey === "save-team" ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Building2 className="size-4" />
              )}
              {t("managerSetup.button")}
            </Button>
          </div>
        </div>
      </DashboardSectionPanel>

      <DashboardListSection>
        <EmptyState
          description={t("managerSetup.emptyDescription")}
          icon={<UsersRound className="size-6" />}
          title={t("managerSetup.emptyTitle")}
        />
      </DashboardListSection>
    </section>
  );
}

export function NoTeamDataSection() {
  const t = useTranslations("TeamManagement");

  return (
    <DashboardListSection>
      <EmptyState
        description={t("states.noTeamDataDescription")}
        icon={<Building2 className="size-6" />}
        title={t("states.noTeamDataTitle")}
      />
    </DashboardListSection>
  );
}

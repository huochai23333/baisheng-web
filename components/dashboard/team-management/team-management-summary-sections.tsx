"use client";

import { InteractiveButton as DesignButton } from "@/components/ui/button";

import * as FormControls from "@/components/ui/form-controls";
import { Select } from "@/components/ui/select";

import { useTranslations } from "next-intl";
import { Building2, LoaderCircle, Trash2 } from "lucide-react";

import { useLocale } from "@/components/i18n/locale-provider";
import type {
  TeamDetail,
  TeamManagerCandidate,
  TeamMember,
  TeamOverview,
} from "@/lib/team-management";
import type { AppRole } from "@/lib/user-self-service";

import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/components/dashboard/dashboard-shared-ui";
import {
  DashboardListSection,
  DashboardSectionPanel,
} from "@/components/dashboard/dashboard-section-panel";

import { DataPill, InsightCard, MiniMetric } from "./team-management-ui";
import {
  getManagerCandidateLabel,
  getTeamDisplayName,
  getTeamManagerLabel,
} from "./team-management-display";
import { teamManagementDetailInputClassName } from "./team-management-section-styles";

export function TeamOverviewSection({
  detailMembers,
  onSelectTeam,
  overviews,
  selectedTeamId,
  viewerRole,
}: {
  detailMembers: TeamMember[];
  onSelectTeam: (teamId: string) => void;
  overviews: TeamOverview[];
  selectedTeamId: string | null;
  viewerRole: AppRole | null;
}) {
  const t = useTranslations("TeamManagement");

  return (
    <DashboardListSection
      description={t("overview.description")}
      title={t("overview.title")}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {overviews.map((team) => (
          <DesignButton
            key={team.team_id}
            className={[
              "rounded-surface-panel border p-5 text-left shadow-surface-interactive transition-all",
              selectedTeamId === team.team_id
                ? "border-border-subtle bg-surface-inset"
                : "border-border-subtle bg-surface-interactive hover:-translate-y-0.5 hover:shadow-surface-interactive",
            ].join(" ")}
            onClick={() => onSelectTeam(team.team_id)}
            type="button"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xl font-semibold tracking-tight text-content-strong">
                  {getTeamDisplayName(team.team_name, t)}
                </p>
                <p className="mt-2 text-sm leading-7 text-content-muted">
                  {t("overview.managerPrefix", {
                    managerLabel: getTeamManagerLabel(
                      team.manager_name,
                      team.manager_email,
                      t,
                    ),
                  })}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {team.can_manage ? (
                  <DataPill accent="blue">
                    {t("shared.pills.manageable")}
                  </DataPill>
                ) : null}
                {selectedTeamId === team.team_id ? (
                  <DataPill accent="green">
                    {t("shared.pills.currentView")}
                  </DataPill>
                ) : null}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MiniMetric
                label={t("overview.metrics.members")}
                value={team.member_count}
              />
              <MiniMetric
                label={t("overview.metrics.activeMembers")}
                value={team.active_member_count}
              />
              <MiniMetric
                label={t("overview.metrics.clients")}
                value={team.client_count}
              />
              <MiniMetric
                label={t("overview.metrics.vipClients")}
                value={team.vip_client_count}
              />
            </div>

            {viewerRole === "administrator" &&
            selectedTeamId === team.team_id &&
            detailMembers.length > 0 ? (
              <div className="mt-4 rounded-record-card bg-surface-inset px-4 py-4">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-content-subtle uppercase">
                  {t("overview.memberPreview")}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {detailMembers.slice(0, 8).map((member) => (
                    <DataPill accent="blue" key={member.user_id}>
                      {member.name ?? member.email ?? member.user_id}
                    </DataPill>
                  ))}
                  {detailMembers.length > 8 ? (
                    <DataPill accent="gold">
                      {t("overview.moreMembers", {
                        count: detailMembers.length - 8,
                      })}
                    </DataPill>
                  ) : null}
                </div>
              </div>
            ) : null}
          </DesignButton>
        ))}
      </div>
    </DashboardListSection>
  );
}

export function TeamDetailSummarySection({
  busyKey,
  canManageSelectedTeam,
  detailTeam,
  managerCandidates,
  managerUserIdDraft,
  onDeleteTeam,
  onManagerUserIdChange,
  onSaveTeam,
  onTeamNameChange,
  teamNameDraft,
  viewerRole,
}: {
  busyKey: string | null;
  canManageSelectedTeam: boolean;
  detailTeam: NonNullable<TeamDetail["team"]>;
  managerCandidates: TeamManagerCandidate[];
  managerUserIdDraft: string;
  onDeleteTeam: () => void;
  onManagerUserIdChange: (value: string) => void;
  onSaveTeam: () => void;
  onTeamNameChange: (value: string) => void;
  teamNameDraft: string;
  viewerRole: AppRole | null;
}) {
  const { locale } = useLocale();
  const t = useTranslations("TeamManagement");

  return (
    <DashboardSectionPanel>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-3xl font-bold tracking-tight text-content-strong">
                {getTeamDisplayName(detailTeam.team_name, t)}
              </h3>
              {detailTeam.can_manage ? (
                <DataPill accent="blue">
                  {t("shared.pills.manageable")}
                </DataPill>
              ) : null}
              {viewerRole === "administrator" ? (
                <DataPill accent="gold">{t("shared.pills.adminView")}</DataPill>
              ) : null}
            </div>
            <p className="mt-3 text-sm leading-7 text-content-muted">
              {t("detail.managerSummary", {
                joinedAt: formatDateTime(
                  detailTeam.last_member_joined_at,
                  locale,
                ),
                managerLabel: getTeamManagerLabel(
                  detailTeam.manager_name,
                  detailTeam.manager_email,
                  t,
                ),
              })}
            </p>
          </div>

          {canManageSelectedTeam ? (
            <div className="w-full max-w-[360px] rounded-surface-panel border border-border-subtle bg-surface-inset p-4 shadow-surface-interactive">
              <p className="font-label text-[11px] font-semibold tracking-[0.18em] text-content-muted uppercase">
                {t("detail.editTitle")}
              </p>
              <FormControls.Input
                className={teamManagementDetailInputClassName}
                onChange={(event) => onTeamNameChange(event.target.value)}
                placeholder={t("detail.teamNamePlaceholder")}
                value={teamNameDraft}
              />
              {viewerRole === "administrator" ? (
                <Select
                  className="mt-3"
                  onValueChange={onManagerUserIdChange}
                  options={[
                    { label: t("shared.managerOptionNone"), value: "" },
                    ...managerCandidates.map((candidate) => ({
                      disabled: !candidate.assignable,
                      label: getManagerCandidateLabel(candidate, t),
                      value: candidate.user_id,
                    })),
                  ]}
                  value={managerUserIdDraft}
                />
              ) : null}
              <Button
                variant="primary"
                size="compact"
                className="mt-3 w-full"
                disabled={!teamNameDraft.trim() || busyKey !== null}
                onClick={onSaveTeam}
              >
                {busyKey === "save-team" ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Building2 className="size-4" />
                )}
                {t("detail.saveButton")}
              </Button>
              {viewerRole === "administrator" ? (
                <Button
                  size="compact"
                  className="mt-3 w-full"
                  disabled={busyKey !== null}
                  onClick={onDeleteTeam}
                  variant="danger"
                >
                  {busyKey === "delete-team" ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                  {t("detail.deleteButton")}
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </DashboardSectionPanel>
  );
}

export function TeamInsightsSection({
  clientCount,
  detailTeam,
}: {
  clientCount: number;
  detailTeam: NonNullable<TeamDetail["team"]>;
}) {
  const t = useTranslations("TeamManagement");

  return (
    <DashboardListSection
      description={t("insights.description")}
      title={t("insights.title")}
    >
      <div className="space-y-4">
        <InsightCard
          description={
            detailTeam.active_member_count === 0
              ? t("insights.activeEmptyDescription")
              : t("insights.activeReadyDescription")
          }
          title={t("insights.activeTitle", {
            count: detailTeam.active_member_count,
          })}
        />
        <InsightCard
          description={
            detailTeam.vip_client_count === 0
              ? t("insights.vipEmptyDescription")
              : t("insights.vipReadyDescription")
          }
          title={t("insights.vipTitle", { count: detailTeam.vip_client_count })}
        />
        <InsightCard
          description={t("insights.relationsDescription", {
            count: clientCount,
          })}
          title={t("insights.relationsTitle", { count: clientCount })}
        />
      </div>
    </DashboardListSection>
  );
}

"use client";

import { ResponsiveDataView } from "@/components/ui/responsive-data-view";

import { Select } from "@/components/ui/select";
import { UiMessage } from "@/components/i18n/ui-message";
import {
  Clock3,
  Filter,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserCog,
  UsersRound,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  DashboardFilterField,
  DashboardListSection,
  DashboardSearchInput,
  DashboardTableFrame,
} from "@/components/dashboard/dashboard-section-panel";
import { DashboardResourceFilterSection } from "@/components/dashboard/dashboard-resource-filter-section";
import { DashboardSectionHeader } from "@/components/dashboard/dashboard-section-header";
import { EmptyState } from "@/components/dashboard/dashboard-shared-ui";
import type {
  AdminPeopleChangeLogRow,
  AdminPersonRow,
} from "@/lib/admin-people";
import type { Locale } from "@/lib/locale";
import {
  formatPeopleDate,
  getRoleLabel,
  getStatusLabel,
} from "./admin-people-display";
import { PeopleTable } from "./admin-people-table";
import type { useAdminPeopleViewModel } from "./use-admin-people-view-model";
type AdminPeopleViewModel = ReturnType<typeof useAdminPeopleViewModel>;
export function AdminPeopleHeaderSection({
  summary,
}: {
  summary: AdminPeopleViewModel["summary"];
}) {
  const t = useTranslations("AdminPeople");
  return (
    <DashboardSectionHeader
      badge={t("header.badge")}
      badgeIcon={<UserCog className="size-4" />}
      description={t("header.description")}
      metrics={[
        {
          accent: "blue",
          icon: <UsersRound className="size-5" />,
          label: t("summary.total"),
          value: summary.totalCount,
        },
        {
          accent: "green",
          icon: <UserCheck className="size-5" />,
          label: t("summary.active"),
          value: summary.activeCount,
        },
        {
          accent: "blue",
          icon: <ShieldCheck className="size-5" />,
          label: t("summary.administrators"),
          value: summary.administratorCount,
        },
        {
          accent: "gold",
          icon: <ShieldAlert className="size-5" />,
          label: t("summary.suspended"),
          value: summary.suspendedCount,
        },
      ]}
      metricsClassName="grid-cols-2 md:grid-cols-4"
      metricsPlacement="below"
      title={t("header.title")}
    />
  );
}
export function AdminPeopleNoPermissionSection() {
  const t = useTranslations("AdminPeople");
  return (
    <DashboardListSection
      description={t("states.noPermissionDescription")}
      eyebrow={t("header.badge")}
      title={t("states.noPermissionTitle")}
    >
      <EmptyState
        description={t("states.noPermissionDescription")}
        icon={<ShieldAlert className="size-5" />}
        title={t("states.noPermissionTitle")}
      />
    </DashboardListSection>
  );
}
export function AdminPeopleDirectorySection({
  currentViewerId,
  filteredPeople,
  onAdjustPerson,
  onEditPersonNote,
  onReset,
  onRoleFilterChange,
  onSearchTextChange,
  onStatusFilterChange,
  roleFilter,
  roleLabels,
  roleOptions,
  searchText,
  statusFilter,
  statusLabels,
  statusOptions,
}: {
  currentViewerId: string | null;
  filteredPeople: AdminPersonRow[];
  onAdjustPerson: (person: AdminPersonRow) => void;
  onEditPersonNote: (person: AdminPersonRow) => void;
  onReset: () => void;
  onRoleFilterChange: (value: string) => void;
  onSearchTextChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  roleFilter: string;
  roleLabels: AdminPeopleViewModel["roleLabels"];
  roleOptions: AdminPeopleViewModel["roleOptions"];
  searchText: string;
  statusFilter: string;
  statusLabels: AdminPeopleViewModel["statusLabels"];
  statusOptions: AdminPeopleViewModel["statusOptions"];
}) {
  const t = useTranslations("AdminPeople");
  return (
    <DashboardListSection
      description={t("directory.description")}
      eyebrow={t("directory.eyebrow")}
      title={t("directory.title")}
    >
      <DashboardResourceFilterSection
        gridClassName="sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]"
        onReset={onReset}
        resetDisabled={
          !searchText && roleFilter === "all" && statusFilter === "all"
        }
      >
        <DashboardFilterField label={t("filters.search")}>
          <DashboardSearchInput
            onChange={onSearchTextChange}
            placeholder={t("filters.searchPlaceholder")}
            value={searchText}
          />
        </DashboardFilterField>

        <DashboardFilterField label={t("filters.role")}>
          <Select
            onValueChange={onRoleFilterChange}
            options={[
              { label: t("filters.allRoles"), value: "all" },
              ...roleOptions.map((role) => ({
                label: roleLabels[role],
                value: role,
              })),
            ]}
            value={roleFilter}
          />
        </DashboardFilterField>

        <DashboardFilterField label={t("filters.status")}>
          <Select
            onValueChange={onStatusFilterChange}
            options={[
              { label: t("filters.allStatuses"), value: "all" },
              ...statusOptions.map((status) => ({
                label: statusLabels[status],
                value: status,
              })),
            ]}
            value={statusFilter}
          />
        </DashboardFilterField>
      </DashboardResourceFilterSection>

      <div className="mt-5">
        {filteredPeople.length === 0 ? (
          <EmptyState
            description={t("directory.emptyDescription")}
            icon={<Filter className="size-5" />}
            title={t("directory.emptyTitle")}
          />
        ) : (
          <PeopleTable
            currentViewerId={currentViewerId}
            onAdjustPerson={onAdjustPerson}
            onEditPersonNote={onEditPersonNote}
            people={filteredPeople}
            roleLabels={roleLabels}
            statusLabels={statusLabels}
          />
        )}
      </div>
    </DashboardListSection>
  );
}
export function AdminPeopleRecentChangesSection({
  changes,
  locale,
  roleLabels,
  statusLabels,
}: {
  changes: AdminPeopleChangeLogRow[];
  locale: Locale;
  roleLabels: AdminPeopleViewModel["roleLabels"];
  statusLabels: AdminPeopleViewModel["statusLabels"];
}) {
  const t = useTranslations("AdminPeople");
  const fallback = t("fallback.notProvided");
  return (
    <DashboardListSection
      description={t("logs.description")}
      eyebrow={t("logs.eyebrow")}
      title={t("logs.title")}
    >
      {changes.length === 0 ? (
        <EmptyState
          description={t("logs.emptyDescription")}
          icon={<Clock3 className="size-5" />}
          title={t("logs.emptyTitle")}
        />
      ) : (
        <>
          <ResponsiveDataView
            desktop={
              <>
                <DashboardTableFrame>
                  <table className="min-w-[900px] w-full text-left text-sm">
                    <thead className="bg-surface-inset text-xs font-semibold text-content-muted">
                      <tr>
                        <th className="px-4 py-3">
                          {t("logs.columns.target")}
                        </th>
                        <th className="px-4 py-3">
                          {t("logs.columns.change")}
                        </th>
                        <th className="px-4 py-3">{t("logs.columns.actor")}</th>
                        <th className="px-4 py-3">{t("logs.columns.note")}</th>
                        <th className="px-4 py-3">{t("logs.columns.time")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {changes.map((change) => (
                        <tr key={change.id} className="align-top">
                          <td className="px-4 py-4">
                            <p className="font-semibold text-content-strong">
                              {change.target_name ??
                                change.target_email ??
                                fallback}
                            </p>
                            <p className="mt-1 text-xs text-content-muted">
                              {change.target_email ?? fallback}
                            </p>
                          </td>
                          <td className="px-4 py-4 text-content-muted">
                            <ChangeSummary
                              change={change}
                              fallback={fallback}
                              roleLabels={roleLabels}
                              statusLabels={statusLabels}
                            />
                          </td>
                          <td className="px-4 py-4 text-content-muted">
                            {change.actor_name ??
                              change.actor_email ??
                              fallback}
                          </td>
                          <td className="max-w-[260px] px-4 py-4 text-content-muted">
                            {change.note ?? t("logs.noNote")}
                          </td>
                          <td className="px-4 py-4 text-content-muted">
                            {formatPeopleDate(
                              change.created_at,
                              locale,
                              fallback,
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </DashboardTableFrame>
              </>
            }
            mobile={
              <>
                {changes.map((change) => (
                  <article
                    className="rounded-[18px] border border-border-subtle bg-white p-4 shadow-[var(--surface-shadow-interactive)]"
                    key={change.id}
                  >
                    <p className="font-semibold text-content-strong">
                      {change.target_name ?? change.target_email ?? fallback}
                    </p>
                    <p className="mt-1 break-all text-xs text-content-muted">
                      {change.target_email ?? fallback}
                    </p>
                    <div className="mt-3 text-sm leading-6 text-content-muted">
                      <ChangeSummary
                        change={change}
                        fallback={fallback}
                        roleLabels={roleLabels}
                        statusLabels={statusLabels}
                      />
                    </div>
                    <p className="mt-3 text-sm text-content-muted">
                      <UiMessage id="components_dashboard_admin_people_admin_people_sections.text001" />
                      {change.actor_name ?? change.actor_email ?? fallback}
                    </p>
                    <p className="mt-1 break-words text-sm text-content-muted">
                      <UiMessage id="components_dashboard_admin_people_admin_people_sections.text002" />
                      {change.note ?? t("logs.noNote")}
                    </p>
                    <p className="mt-1 text-xs text-content-muted">
                      {formatPeopleDate(change.created_at, locale, fallback)}
                    </p>
                  </article>
                ))}
              </>
            }
          />
        </>
      )}
    </DashboardListSection>
  );
}
function ChangeSummary({
  change,
  fallback,
  roleLabels,
  statusLabels,
}: {
  change: AdminPeopleChangeLogRow;
  fallback: string;
  roleLabels: AdminPeopleViewModel["roleLabels"];
  statusLabels: AdminPeopleViewModel["statusLabels"];
}) {
  const t = useTranslations("AdminPeople");
  return (
    <>
      <p>
        {getRoleLabel(change.previous_role, roleLabels, fallback)}
        {" -> "}
        {getRoleLabel(change.next_role, roleLabels, fallback)}
      </p>
      <p className="mt-1">
        {getStatusLabel(change.previous_status, statusLabels, fallback)}
        {" -> "}
        {getStatusLabel(change.next_status, statusLabels, fallback)}
      </p>
      {change.previous_city !== change.next_city ? (
        <p className="mt-1">
          {t("logs.cityChange", {
            from: change.previous_city ?? fallback,
            to: change.next_city ?? fallback,
          })}
        </p>
      ) : null}
    </>
  );
}

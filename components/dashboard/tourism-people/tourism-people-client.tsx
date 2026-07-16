"use client";

import { Search, UserCheck, UsersRound } from "lucide-react";
import { useTranslations } from "next-intl";

import { DashboardDialog } from "@/components/dashboard/dashboard-dialog";
import {
  DashboardFilterField,
  dashboardFilterInputClassName,
} from "@/components/dashboard/dashboard-section-panel";
import { DashboardResourceFilterSection } from "@/components/dashboard/dashboard-resource-filter-section";
import { DashboardCollectionSection } from "@/components/dashboard/dashboard-collection-section";
import {
  DashboardAccessState,
  DashboardPageShell,
} from "@/components/dashboard/dashboard-page-shell";
import { DashboardSectionHeader } from "@/components/dashboard/dashboard-section-header";
import { useLocale } from "@/components/i18n/locale-provider";
import type { AdminPeoplePageData } from "@/lib/admin-people";
import { cn } from "@/lib/utils";

import { getTourismPersonName } from "./tourism-people-display";
import { TourismPersonDetails } from "./tourism-person-details";
import { TourismPeopleTable } from "./tourism-people-table";
import { useTourismPeopleViewModel } from "./use-tourism-people-view-model";

export function TourismPeopleClient({
  initialData,
}: {
  initialData: AdminPeoplePageData;
}) {
  const t = useTranslations("TourismPeople.people");
  const { locale } = useLocale();
  const viewModel = useTourismPeopleViewModel(initialData);

  if (!initialData.hasPermission) {
    return (
      <DashboardPageShell>
        <DashboardAccessState
          description={t("noPermissionDescription")}
          kind="permission"
          title={t("emptyPermissionTitle")}
        />
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell
      header={
        <DashboardSectionHeader
          badge={t("badge")}
          badgeIcon={<UsersRound className="size-4" />}
          description={t("headerDescription")}
          metrics={[
            {
              accent: "blue",
              icon: <UsersRound className="size-5" />,
              label: t("metricTotal"),
              value: viewModel.promoters.length,
            },
            {
              accent: "blue",
              icon: <UserCheck className="size-5" />,
              label: t("metricActive"),
              value: viewModel.activeCount,
            },
          ]}
          metricsClassName="grid-cols-1 sm:grid-cols-2"
          metricsPlacement="below"
          title={t("headerTitle")}
        />
      }
    >
      <DashboardResourceFilterSection
        gridClassName="sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]"
        onReset={viewModel.resetFilters}
        resetDisabled={!viewModel.hasFilters}
        resetLabel={t("resetFilters")}
      >
          <DashboardFilterField label={t("searchLabel")}>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8a949c]" />
              <input
                className={cn(dashboardFilterInputClassName, "pl-10")}
                onChange={(event) =>
                  viewModel.setSearchText(event.target.value)
                }
                placeholder={t("searchPlaceholder")}
                type="search"
                value={viewModel.searchText}
              />
            </div>
          </DashboardFilterField>
          <DashboardFilterField label={t("statusLabel")}>
            <select
              className={dashboardFilterInputClassName}
              onChange={(event) =>
                viewModel.setStatusFilter(event.target.value)
              }
              value={viewModel.statusFilter}
            >
              <option value="all">{t("allStatuses")}</option>
              <option value="active">{t("statuses.active")}</option>
              <option value="inactive">{t("statuses.inactive")}</option>
              <option value="suspended">{t("statuses.suspended")}</option>
            </select>
          </DashboardFilterField>
      </DashboardResourceFilterSection>

      <DashboardCollectionSection
        count={t("listDescription", {
          total: viewModel.promoters.length,
          visible: viewModel.filteredPeople.length,
        })}
        title={t("listTitle")}
      >
          <TourismPeopleTable
            locale={locale}
            onSelect={viewModel.openDetails}
            people={viewModel.filteredPeople}
            tab="promoters"
          />
      </DashboardCollectionSection>

      <DashboardDialog
        onOpenChange={(open) => {
          if (!open) viewModel.closeDetails();
        }}
        open={Boolean(viewModel.selectedPerson)}
        title={
          viewModel.selectedPerson
            ? getTourismPersonName(
                viewModel.selectedPerson,
                t("fallbacks.unnamed"),
              )
            : t("detailsTitle")
        }
      >
        {viewModel.selectedPerson ? (
          <TourismPersonDetails
            locale={locale}
            person={viewModel.selectedPerson}
          />
        ) : null}
      </DashboardDialog>
    </DashboardPageShell>
  );
}

"use client";

import { Select } from "@/components/ui/select";

import { UserCheck, UsersRound } from "lucide-react";
import { useTranslations } from "next-intl";

import { DashboardDialog } from "@/components/dashboard/dashboard-dialog";
import {
  DashboardFilterField,
  DashboardSearchInput,
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
        activeFilterCount={[
          Boolean(viewModel.searchText),
          viewModel.statusFilter !== "all",
        ].filter(Boolean).length}
        onReset={viewModel.resetFilters}
        primary={
          <DashboardFilterField label={t("searchLabel")}>
            <DashboardSearchInput
              onChange={viewModel.setSearchText}
              placeholder={t("searchPlaceholder")}
              value={viewModel.searchText}
            />
          </DashboardFilterField>
        }
        resetDisabled={!viewModel.hasFilters}
        resetLabel={t("resetFilters")}
      >
        <DashboardFilterField label={t("statusLabel")}>
          <Select
            onValueChange={viewModel.setStatusFilter}
            options={[
              { label: t("allStatuses"), value: "all" },
              { label: t("statuses.active"), value: "active" },
              { label: t("statuses.inactive"), value: "inactive" },
              { label: t("statuses.suspended"), value: "suspended" },
            ]}
            value={viewModel.statusFilter}
          />
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

"use client";

import { Select } from "@/components/ui/select";

import { Plus, UserCheck, UsersRound } from "lucide-react";
import { useTranslations } from "next-intl";

import { ClientBusinessAddDialog } from "@/components/dashboard/client-business-add-dialog";
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
import { Button } from "@/components/ui/button";
import type { AdminPeoplePageData } from "@/lib/admin-people";
import type { ClientBusinessCandidate } from "@/lib/client-business-access";

import { getTourismPersonName } from "./tourism-people-display";
import { TourismPersonDetails } from "./tourism-person-details";
import { TourismPeopleTable } from "./tourism-people-table";
import { useTourismCustomersState } from "./use-tourism-customers-state";

export function TourismCustomersClient({
  businessCandidates,
  initialData,
}: {
  businessCandidates: ClientBusinessCandidate[];
  initialData: AdminPeoplePageData;
}) {
  const { locale } = useLocale();
  const t = useTranslations("TourismPeople.customers");
  const tableT = useTranslations("TourismPeople.table");
  const state = useTourismCustomersState(initialData, businessCandidates);

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
      feedback={state.feedback}
      header={
        <DashboardSectionHeader
          actions={
            <Button
              variant="primary"
              size="default"
              onClick={() => state.setAddDialogOpen(true)}
              type="button"
            >
              <Plus className="size-4" />
              {t("addCustomer")}
            </Button>
          }
          badge={t("badge")}
          badgeIcon={<UsersRound className="size-4" />}
          description={t("headerDescription")}
          metrics={[
            {
              accent: "blue",
              icon: <UsersRound className="size-5" />,
              label: t("metricTotal"),
              value: state.tourismCustomers.length,
            },
            {
              accent: "green",
              icon: <UserCheck className="size-5" />,
              label: t("metricActive"),
              value: state.activeCount,
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
          Boolean(state.searchText),
          state.statusFilter !== "all",
        ].filter(Boolean).length}
        onReset={state.resetFilters}
        primary={
          <DashboardFilterField label={t("searchLabel")}>
            <DashboardSearchInput
              onChange={state.setSearchText}
              placeholder={t("searchPlaceholder")}
              value={state.searchText}
            />
          </DashboardFilterField>
        }
        resetDisabled={!state.hasFilters}
        resetLabel={t("resetFilters")}
      >
        <DashboardFilterField label={t("statusLabel")}>
          <Select
            onValueChange={state.setStatusFilter}
            options={[
              { label: t("allStatuses"), value: "all" },
              { label: t("statuses.active"), value: "active" },
              { label: t("statuses.inactive"), value: "inactive" },
              { label: t("statuses.suspended"), value: "suspended" },
            ]}
            value={state.statusFilter}
          />
        </DashboardFilterField>
      </DashboardResourceFilterSection>

      <DashboardCollectionSection
        count={t("listDescription", {
          total: state.tourismCustomers.length,
          visible: state.filteredCustomers.length,
        })}
        title={t("listTitle")}
      >
        <TourismPeopleTable
          locale={locale}
          onSelect={state.setSelectedCustomer}
          people={state.filteredCustomers}
          tab="customers"
        />
      </DashboardCollectionSection>

      <DashboardDialog
        onOpenChange={(open) => {
          if (!open) state.setSelectedCustomer(null);
        }}
        open={Boolean(state.selectedCustomer)}
        title={
          state.selectedCustomer
            ? getTourismPersonName(
                state.selectedCustomer,
                tableT("fallbacks.unnamed"),
              )
            : t("detailsTitle")
        }
      >
        {state.selectedCustomer ? (
          <TourismPersonDetails
            locale={locale}
            person={state.selectedCustomer}
          />
        ) : null}
      </DashboardDialog>

      <ClientBusinessAddDialog
        business="tourism"
        candidates={state.addCandidates}
        error={state.feedback?.tone === "error" ? state.feedback.message : null}
        onAdd={state.addCustomer}
        onOpenChange={state.setAddDialogOpen}
        open={state.addDialogOpen}
        pendingUserId={state.pendingUserId}
      />
    </DashboardPageShell>
  );
}

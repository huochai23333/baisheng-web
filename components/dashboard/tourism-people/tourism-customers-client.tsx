"use client";

import { Plus, RefreshCcw, Search, UserCheck, UsersRound } from "lucide-react";
import { useTranslations } from "next-intl";

import { ClientBusinessAddDialog } from "@/components/dashboard/client-business-add-dialog";
import { DashboardDialog } from "@/components/dashboard/dashboard-dialog";
import {
  DashboardFilterField,
  DashboardFilterPanel,
  DashboardListSection,
  dashboardFilterInputClassName,
} from "@/components/dashboard/dashboard-section-panel";
import { DashboardSectionHeader } from "@/components/dashboard/dashboard-section-header";
import {
  EmptyState,
  PageBanner,
} from "@/components/dashboard/dashboard-shared-ui";
import { useLocale } from "@/components/i18n/locale-provider";
import { Button } from "@/components/ui/button";
import type { AdminPeoplePageData } from "@/lib/admin-people";
import type { ClientBusinessCandidate } from "@/lib/client-business-access";
import { cn } from "@/lib/utils";

import { getTourismPersonName } from "./tourism-people-display";
import { TourismPersonDetails } from "./tourism-people-client";
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
      <section className="mx-auto flex w-full max-w-[1320px] flex-col gap-8">
        <DashboardListSection
          description={t("noPermissionDescription")}
          title={t("noPermissionTitle")}
        >
          <EmptyState
            description={t("noPermissionDescription")}
            icon={<UsersRound className="size-5" />}
            title={t("emptyPermissionTitle")}
          />
        </DashboardListSection>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-[1320px] flex-col gap-8">
      {state.feedback ? (
        <PageBanner tone={state.feedback.tone}>
          {state.feedback.message}
        </PageBanner>
      ) : null}

      <DashboardSectionHeader
        actions={
          <Button
            className="h-11 rounded-full bg-[#486782] px-5 text-white hover:bg-[#3e5f79]"
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

      <DashboardListSection
        actions={
          <Button
            className="rounded-full border border-[#d8dde2] bg-white text-[#486782] hover:bg-[#eef3f6]"
            disabled={!state.hasFilters}
            onClick={state.resetFilters}
            type="button"
            variant="outline"
          >
            <RefreshCcw className="size-4" />
            {t("resetFilters")}
          </Button>
        }
        description={t("listDescription", {
          total: state.tourismCustomers.length,
          visible: state.filteredCustomers.length,
        })}
        title={t("listTitle")}
      >
        <DashboardFilterPanel gridClassName="sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <DashboardFilterField label={t("searchLabel")}>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8a949c]" />
              <input
                className={cn(dashboardFilterInputClassName, "pl-10")}
                onChange={(event) => state.setSearchText(event.target.value)}
                placeholder={t("searchPlaceholder")}
                type="search"
                value={state.searchText}
              />
            </div>
          </DashboardFilterField>
          <DashboardFilterField label={t("statusLabel")}>
            <select
              className={dashboardFilterInputClassName}
              onChange={(event) => state.setStatusFilter(event.target.value)}
              value={state.statusFilter}
            >
              <option value="all">{t("allStatuses")}</option>
              <option value="active">{t("statuses.active")}</option>
              <option value="inactive">{t("statuses.inactive")}</option>
              <option value="suspended">{t("statuses.suspended")}</option>
            </select>
          </DashboardFilterField>
        </DashboardFilterPanel>

        <div className="mt-5">
          <TourismPeopleTable
            locale={locale}
            onSelect={state.setSelectedCustomer}
            people={state.filteredCustomers}
            tab="customers"
          />
        </div>
      </DashboardListSection>

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
    </section>
  );
}

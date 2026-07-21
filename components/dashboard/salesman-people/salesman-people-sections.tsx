"use client";

import {
  Filter,
  StickyNote,
  UserCheck,
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
import {
  DashboardSectionHeader,
  type DashboardSectionHeaderMetric,
} from "@/components/dashboard/dashboard-section-header";
import { EmptyState } from "@/components/dashboard/dashboard-shared-ui";
import { Button } from "@/components/ui/button";
import type { SalesmanCustomerRow } from "@/lib/salesman-people";
import type { Locale } from "@/lib/locale";

import {
  formatSalesmanPeopleDate,
  getSalesmanCustomerContact,
  getSalesmanCustomerName,
  getSalesmanCustomerTypeLabel,
} from "./salesman-people-display";
import type { useSalesmanPeopleViewModel } from "./use-salesman-people-view-model";

type SalesmanPeopleViewModel = ReturnType<typeof useSalesmanPeopleViewModel>;

export function SalesmanPeopleHeaderSection({
  summary,
}: {
  businessBoards: SalesmanPeopleViewModel["businessBoards"];
  summary: SalesmanPeopleViewModel["summary"];
}) {
  const t = useTranslations("SalesmanPeople");
  const metrics = [
    {
      accent: "blue",
      icon: <UsersRound className="size-5" />,
      key: "total",
      label: t("summary.total"),
      value: summary.totalCount,
    },
    {
      accent: "green",
      icon: <UserCheck className="size-5" />,
      key: "retail",
      label: t("summary.retail"),
      value: summary.retailCount,
    },
    {
      accent: "blue",
      icon: <Filter className="size-5" />,
      key: "unmarked",
      label: t("summary.unmarked"),
      value: summary.unmarkedCount,
    },
  ] satisfies DashboardSectionHeaderMetric[];

  return (
    <DashboardSectionHeader
      badge={t("header.badge")}
      badgeIcon={<UsersRound className="size-4" />}
      description={t("header.descriptionRetailOnly")}
      metrics={metrics}
      metricsClassName="grid-cols-2 md:grid-cols-3"
      metricsPlacement="below"
      title={t("header.title")}
    />
  );
}

export function SalesmanPeopleNoPermissionSection() {
  const t = useTranslations("SalesmanPeople");

  return (
    <DashboardListSection
      description={t("states.noPermissionDescription")}
      eyebrow={t("header.badge")}
      title={t("states.noPermissionTitle")}
    >
      <EmptyState
        description={t("states.noPermissionDescription")}
        icon={<UsersRound className="size-5" />}
        title={t("states.noPermissionTitle")}
      />
    </DashboardListSection>
  );
}

export function SalesmanPeopleDirectorySection({
  customerTypeLabels,
  filteredCustomers,
  locale,
  onAdjustCustomerType,
  onEditCustomerNote,
  onReset,
  onSearchTextChange,
  searchText,
}: {
  customerTypeLabels: SalesmanPeopleViewModel["customerTypeLabels"];
  filteredCustomers: SalesmanCustomerRow[];
  locale: Locale;
  onAdjustCustomerType: (customer: SalesmanCustomerRow) => void;
  onEditCustomerNote: (customer: SalesmanCustomerRow) => void;
  onReset: () => void;
  onSearchTextChange: (value: string) => void;
  searchText: string;
}) {
  const t = useTranslations("SalesmanPeople");

  return (
    <DashboardListSection
      description={t("directory.description")}
      eyebrow={t("directory.eyebrow")}
      title={t("directory.title")}
    >
      <DashboardResourceFilterSection
        activeFilterCount={searchText ? 1 : 0}
        onReset={onReset}
        primary={
          <DashboardFilterField label={t("filters.search")}>
            <DashboardSearchInput
              onChange={onSearchTextChange}
              placeholder={t("filters.searchPlaceholder")}
              value={searchText}
            />
          </DashboardFilterField>
        }
        resetDisabled={!searchText}
      />

      <div className="mt-5">
        {filteredCustomers.length === 0 ? (
          <EmptyState
            description={t("directory.emptyDescription")}
            icon={<Filter className="size-5" />}
            title={t("directory.emptyTitle")}
          />
        ) : (
          <DashboardTableFrame>
            <table className="min-w-[960px] table-fixed w-full text-left text-sm">
              <colgroup>
                <col className="w-[24%]" />
                <col className="w-[24%]" />
                <col className="w-[12%]" />
                <col className="w-[15%]" />
                <col className="w-[12%]" />
                <col className="w-[13%]" />
              </colgroup>
              <thead className="bg-surface-inset text-xs font-semibold text-content-muted">
                <tr>
                  <th className="px-3 py-3">
                    {t("directory.columns.customer")}
                  </th>
                  <th className="px-3 py-3">
                    {t("directory.columns.privateNote")}
                  </th>
                  <th className="px-3 py-3">{t("directory.columns.city")}</th>
                  <th className="px-3 py-3">
                    {t("directory.columns.currentType")}
                  </th>
                  <th className="px-3 py-3">
                    {t("directory.columns.markedAt")}
                  </th>
                  <th className="px-3 py-3">
                    {t("directory.columns.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.user_id} className="align-top">
                    <td className="px-3 py-4">
                      <p className="font-semibold text-content-strong">
                        {getSalesmanCustomerName(
                          customer,
                          t("fallback.unnamedCustomer"),
                        )}
                      </p>
                      <p className="mt-1 break-all text-xs text-content-muted">
                        {getSalesmanCustomerContact(
                          customer,
                          t("fallback.notProvided"),
                        )}
                      </p>
                    </td>
                    <td className="px-3 py-4 text-content-muted">
                      <p className="break-words leading-6 [overflow-wrap:anywhere]">
                        {customer.private_note ?? t("fallback.noPrivateNote")}
                      </p>
                    </td>
                    <td className="px-3 py-4 text-content-muted">
                      {customer.city ?? t("fallback.notProvided")}
                    </td>
                    <td className="px-3 py-4">
                      <p className="font-semibold text-content-strong">
                        {getSalesmanCustomerTypeLabel(
                          customer.customer_type,
                          customerTypeLabels,
                          t("fallback.unmarked"),
                        )}
                      </p>
                    </td>
                    <td className="px-3 py-4 text-content-muted">
                      {formatSalesmanPeopleDate(
                        customer.marked_at,
                        locale,
                        t("fallback.notProvided"),
                      )}
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex flex-col items-start gap-2">
                        <Button
                          variant="outline"
                          size="compact"
                          onClick={() => onEditCustomerNote(customer)}
                        >
                          <StickyNote className="size-4" />
                          {t("actions.note")}
                        </Button>
                        <Button
                          variant="primary"
                          size="compact"
                          onClick={() => onAdjustCustomerType(customer)}
                        >
                          {t("actions.adjust")}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DashboardTableFrame>
        )}
      </div>
    </DashboardListSection>
  );
}

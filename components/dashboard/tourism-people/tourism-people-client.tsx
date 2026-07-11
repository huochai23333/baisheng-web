"use client";

import { RefreshCcw, Search, UserCheck, UsersRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { DashboardDialog } from "@/components/dashboard/dashboard-dialog";
import {
  DashboardFilterField,
  DashboardFilterPanel,
  DashboardListSection,
  dashboardFilterInputClassName,
} from "@/components/dashboard/dashboard-section-panel";
import { DashboardSectionHeader } from "@/components/dashboard/dashboard-section-header";
import { EmptyState } from "@/components/dashboard/dashboard-shared-ui";
import { useLocale } from "@/components/i18n/locale-provider";
import { Button } from "@/components/ui/button";
import type { AdminPeoplePageData, AdminPersonRow } from "@/lib/admin-people";
import type { Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";
import { normalizeSearchText } from "@/lib/value-normalizers";

import {
  formatTourismPeopleDate,
  getTourismPersonContact,
  getTourismPersonName,
  isTourismPromoter,
} from "./tourism-people-display";
import { TourismPeopleTable } from "./tourism-people-table";

const ALL = "all";

export function TourismPeopleClient({
  initialData,
}: {
  initialData: AdminPeoplePageData;
}) {
  const t = useTranslations("TourismPeople.people");
  const { locale } = useLocale();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [selectedPerson, setSelectedPerson] = useState<AdminPersonRow | null>(
    null,
  );

  // 业务内人员管理只保留真实业务人员，客户目录由客户管理板块承接。
  const promoters = useMemo(
    () => initialData.people.filter(isTourismPromoter),
    [initialData.people],
  );
  const filteredPeople = useMemo(() => {
    const searchValue = normalizeSearchText(searchText);

    return promoters.filter((person) => {
      if (statusFilter !== ALL && person.status !== statusFilter) return false;
      if (!searchValue) return true;

      return [
        person.name ?? "",
        person.email ?? "",
        person.phone ?? "",
        person.city ?? "",
        person.referral_code ?? "",
        person.referrer_name ?? "",
        person.referrer_email ?? "",
        person.team_name ?? "",
      ].some((value) => normalizeSearchText(value).includes(searchValue));
    });
  }, [promoters, searchText, statusFilter]);
  const hasFilters = Boolean(searchText || statusFilter !== ALL);
  const activeCount = promoters.filter(
    (person) => person.status === "active",
  ).length;

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
      <DashboardSectionHeader
        badge={t("badge")}
        badgeIcon={<UsersRound className="size-4" />}
        description={t("headerDescription")}
        metrics={[
          {
            accent: "blue",
            icon: <UsersRound className="size-5" />,
            label: t("metricTotal"),
            value: promoters.length,
          },
          {
            accent: "blue",
            icon: <UserCheck className="size-5" />,
            label: t("metricActive"),
            value: activeCount,
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
            disabled={!hasFilters}
            onClick={() => {
              setSearchText("");
              setStatusFilter(ALL);
            }}
            type="button"
            variant="outline"
          >
            <RefreshCcw className="size-4" />
            {t("resetFilters")}
          </Button>
        }
        description={t("listDescription", {
          total: promoters.length,
          visible: filteredPeople.length,
        })}
        title={t("listTitle")}
      >
        <DashboardFilterPanel gridClassName="sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <DashboardFilterField label={t("searchLabel")}>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8a949c]" />
              <input
                className={cn(dashboardFilterInputClassName, "pl-10")}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder={t("searchPlaceholder")}
                type="search"
                value={searchText}
              />
            </div>
          </DashboardFilterField>
          <DashboardFilterField label={t("statusLabel")}>
            <select
              className={dashboardFilterInputClassName}
              onChange={(event) => setStatusFilter(event.target.value)}
              value={statusFilter}
            >
              <option value={ALL}>{t("allStatuses")}</option>
              <option value="active">{t("statuses.active")}</option>
              <option value="inactive">{t("statuses.inactive")}</option>
              <option value="suspended">{t("statuses.suspended")}</option>
            </select>
          </DashboardFilterField>
        </DashboardFilterPanel>

        <div className="mt-5">
          <TourismPeopleTable
            locale={locale}
            onSelect={setSelectedPerson}
            people={filteredPeople}
            tab="promoters"
          />
        </div>
      </DashboardListSection>

      <DashboardDialog
        onOpenChange={(open) => {
          if (!open) setSelectedPerson(null);
        }}
        open={Boolean(selectedPerson)}
        title={
          selectedPerson
            ? getTourismPersonName(selectedPerson, t("fallbacks.unnamed"))
            : t("detailsTitle")
        }
      >
        {selectedPerson ? (
          <TourismPersonDetails locale={locale} person={selectedPerson} />
        ) : null}
      </DashboardDialog>
    </section>
  );
}

export function TourismPersonDetails({
  locale,
  person,
}: {
  locale: Locale;
  person: AdminPersonRow;
}) {
  const t = useTranslations("TourismPeople.people");
  const pendingFallback = t("fallbacks.pending");
  const rows = [
    {
      label: t("details.contact"),
      value: getTourismPersonContact(person, t("fallbacks.noContact")),
    },
    {
      label: t("details.status"),
      value: t(`statuses.${person.status}`),
    },
    { label: t("details.city"), value: person.city ?? pendingFallback },
    {
      label: t("details.referralCode"),
      value: person.referral_code ?? pendingFallback,
    },
    {
      label: t("details.referrer"),
      value:
        person.referrer_name ??
        person.referrer_email ??
        t("fallbacks.noReferrer"),
    },
    {
      label: t("details.team"),
      value: person.team_name ?? t("fallbacks.noTeam"),
    },
    {
      label: t("details.directReferrals"),
      value: t("details.directReferralsValue", {
        count: person.direct_referral_count,
      }),
    },
    {
      label: t("details.createdAt"),
      value: formatTourismPeopleDate(
        person.created_at,
        locale,
        pendingFallback,
      ),
    },
    {
      label: t("details.latestChange"),
      value: formatTourismPeopleDate(
        person.latest_change_at,
        locale,
        pendingFallback,
      ),
    },
  ];

  return (
    <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((row) => (
        <div
          className="min-w-0 rounded-[18px] border border-[#e4e9ed] bg-white px-4 py-3"
          key={row.label}
        >
          <p className="text-[11px] font-semibold tracking-[0.16em] text-[#88939b] uppercase">
            {row.label}
          </p>
          <p className="mt-1 break-words text-sm leading-6 text-[#53616d] [overflow-wrap:anywhere]">
            {row.value}
          </p>
        </div>
      ))}
    </div>
  );
}

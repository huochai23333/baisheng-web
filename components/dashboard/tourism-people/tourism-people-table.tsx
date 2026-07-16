"use client";

import { UsersRound } from "lucide-react";
import { useTranslations } from "next-intl";

import { DashboardTableFrame } from "@/components/dashboard/dashboard-section-panel";
import {
  DashboardStatusBadge,
} from "@/components/dashboard/dashboard-framework-primitives";
import { DashboardResponsiveCollection } from "@/components/dashboard/dashboard-collection-section";
import { EmptyState } from "@/components/dashboard/dashboard-shared-ui";
import type { AdminPersonRow } from "@/lib/admin-people";
import type { Locale } from "@/lib/locale";

import {
  formatTourismPeopleDate,
  getTourismPersonContact,
  getTourismPersonName,
  type TourismPeopleTab,
} from "./tourism-people-display";

type TourismPeopleTableProps = {
  locale: Locale;
  onSelect: (person: AdminPersonRow) => void;
  people: AdminPersonRow[];
  tab: TourismPeopleTab;
};

export function TourismPeopleTable({
  locale,
  onSelect,
  people,
  tab,
}: TourismPeopleTableProps) {
  const t = useTranslations("TourismPeople.table");
  const subjectLabel = t(`subjects.${tab}`);
  const unnamedFallback = t("fallbacks.unnamed");
  const contactFallback = t("fallbacks.noContact");
  const pendingFallback = t("fallbacks.pending");
  const noReferrerFallback = t("fallbacks.noReferrer");

  if (people.length === 0) {
    return (
      <EmptyState
        description={t("emptyDescription", { subject: subjectLabel })}
        icon={<UsersRound className="size-5" />}
        title={t("emptyTitle", { subject: subjectLabel })}
      />
    );
  }

  return (
    <DashboardResponsiveCollection
      desktop={
        <DashboardTableFrame>
          <table className="w-full min-w-[860px] table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[28%]" />
              <col className="w-[18%]" />
              <col className="w-[22%]" />
              <col className="w-[16%]" />
              <col className="w-[16%]" />
            </colgroup>
            <thead className="bg-[#f6f4f0] text-xs font-semibold text-[#66727d]">
              <tr>
                <th className="px-3 py-3">{subjectLabel}</th>
                <th className="px-3 py-3">{t("columns.status")}</th>
                <th className="px-3 py-3">{t("columns.referral")}</th>
                <th className="px-3 py-3">{t("columns.city")}</th>
                <th className="px-3 py-3">{t("columns.createdAt")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eee9e1]">
              {people.map((person) => (
                <tr
                  className="cursor-pointer align-top transition-colors hover:bg-[#fcfbf8]"
                  key={person.user_id}
                  onClick={() => onSelect(person)}
                >
                  <td className="px-3 py-4">
                    <p className="break-words font-semibold text-[#23313a] [overflow-wrap:anywhere]">
                      {getTourismPersonName(person, unnamedFallback)}
                    </p>
                    <p className="mt-1 break-all text-xs text-[#7b858d]">
                      {getTourismPersonContact(person, contactFallback)}
                    </p>
                    <RoleChip>{t(`roles.${tab}`)}</RoleChip>
                  </td>
                  <td className="px-3 py-4">
                    <DashboardStatusBadge tone={getPersonStatusTone(person.status)}>
                      {t(`statuses.${person.status}`)}
                    </DashboardStatusBadge>
                  </td>
                  <td className="px-3 py-4 text-[#53616d]">
                    <p>
                      {t("referralCode", {
                        value: person.referral_code ?? pendingFallback,
                      })}
                    </p>
                    <p className="mt-1 text-xs text-[#7b858d]">
                      {t("referrer", {
                        value:
                          person.referrer_name ??
                          person.referrer_email ??
                          noReferrerFallback,
                      })}
                    </p>
                    <p className="mt-1 text-xs text-[#7b858d]">
                      {t("directReferrals", {
                        count: person.direct_referral_count,
                      })}
                    </p>
                  </td>
                  <td className="px-3 py-4 text-[#53616d]">
                    {person.city ?? pendingFallback}
                  </td>
                  <td className="px-3 py-4 text-[#53616d]">
                    {formatTourismPeopleDate(
                      person.created_at,
                      locale,
                      pendingFallback,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DashboardTableFrame>
      }
      mobile={
        <>
        {people.map((person) => (
          <button
            className="rounded-[18px] border border-[#ebe7e1] bg-white p-4 text-left shadow-[0_10px_24px_rgba(96,113,128,0.05)]"
            key={person.user_id}
            onClick={() => onSelect(person)}
            type="button"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="break-words font-semibold text-[#23313a]">
                  {getTourismPersonName(person, unnamedFallback)}
                </p>
                <p className="mt-1 break-all text-sm text-[#6f7b85]">
                  {getTourismPersonContact(person, contactFallback)}
                </p>
              </div>
              <DashboardStatusBadge tone={getPersonStatusTone(person.status)}>
                {t(`statuses.${person.status}`)}
              </DashboardStatusBadge>
            </div>
            <p className="mt-3 text-sm text-[#6f7b85]">
              {t("referralCode", {
                value: person.referral_code ?? pendingFallback,
              })}
            </p>
            <p className="mt-1 text-sm text-[#6f7b85]">
              {t("referrer", {
                value:
                  person.referrer_name ??
                  person.referrer_email ??
                  noReferrerFallback,
              })}
            </p>
          </button>
        ))}
        </>
      }
    />
  );
}

function RoleChip({ children }: { children: string }) {
  return (
    <DashboardStatusBadge className="mt-2" tone="info">
      {children}
    </DashboardStatusBadge>
  );
}

function getPersonStatusTone(status: AdminPersonRow["status"]) {
  // 人员页面仅映射状态语义，视觉细节统一由 DashboardStatusBadge 管理。
  if (status === "active") return "success" as const;
  if (status === "inactive") return "warning" as const;
  return "danger" as const;
}

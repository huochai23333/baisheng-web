"use client";

import { Settings2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { PageBanner } from "@/components/dashboard/dashboard-shared-ui";
import { Button } from "@/components/ui/button";
import type { AppRole } from "@/lib/auth-routing";
import type {
  WholesaleCustomer,
  WholesaleProfile,
} from "@/lib/wholesale";
import type {
  WholesaleLogisticsFilters,
  WholesaleLogisticsPage,
  WholesaleLogisticsStoreAssignment,
  WholesaleLogisticsStoreOption,
} from "@/lib/wholesale-logistics-page";

import { WholesaleLogisticsAssignmentDialog } from "./wholesale-logistics-assignment-dialog";
import { WholesaleLogisticsFiltersPanel } from "./wholesale-logistics-filters";
import { WholesaleLogisticsRecords } from "./wholesale-logistics-records";
import { WholesaleLogisticsSummary } from "./wholesale-logistics-summary";
import { WholesalePageShell } from "./wholesale-ui";
import { useWholesaleLogisticsPage } from "./use-wholesale-logistics-page";

type WholesaleLogisticsSectionProps = {
  currentRole: AppRole | null;
  customers: WholesaleCustomer[];
  initialAssignments: WholesaleLogisticsStoreAssignment[];
  initialFilters: WholesaleLogisticsFilters;
  initialPage: WholesaleLogisticsPage;
  initialStoreOptions: WholesaleLogisticsStoreOption[];
  profiles: WholesaleProfile[];
};

/**
 * 页面协调组件只负责组装标题、汇总、筛选、记录列表和设置弹窗。
 * 查询、同步、mutation、表单状态及桌面/移动渲染均由同层模块分别承担。
 */
export function WholesaleLogisticsSection({
  currentRole,
  customers,
  initialAssignments,
  initialFilters,
  initialPage,
  initialStoreOptions,
  profiles,
}: WholesaleLogisticsSectionProps) {
  const t = useTranslations("WholesaleBusiness.logisticsArchive");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const logistics = useWholesaleLogisticsPage({
    initialAssignments,
    initialFilters,
    initialPage,
    initialStoreOptions,
  });
  const canManage = currentRole === "administrator" || currentRole === "salesman";
  const profilesById = useMemo(
    () => new Map(profiles.map((profile) => [profile.user_id, profile])),
    [profiles],
  );
  const customersById = useMemo(
    () => new Map(customers.map((customer) => [customer.id, customer])),
    [customers],
  );

  return (
    <WholesalePageShell
      actions={
        canManage ? (
          <Button
            className="min-h-10 whitespace-normal rounded-full bg-[#486782] px-4 py-2 text-white hover:bg-[#3e5f79]"
            onClick={() => setSettingsOpen(true)}
            type="button"
          >
            <Settings2 className="size-4 shrink-0" />
            {t("actions.settings")}
          </Button>
        ) : null
      }
      description={t("description")}
      eyebrow={t("eyebrow")}
      title={t("title")}
    >
      {logistics.feedback?.scope === "page" ? (
        <PageBanner tone={logistics.feedback.tone}>
          <div className="flex min-w-0 items-start justify-between gap-3">
            <span className="min-w-0 break-words">{logistics.feedback.message}</span>
            <button
              className="shrink-0 text-xs font-semibold underline underline-offset-2"
              onClick={logistics.dismissFeedback}
              type="button"
            >
              {t("actions.dismiss")}
            </button>
          </div>
        </PageBanner>
      ) : null}

      {logistics.updatingSource ? (
        <p className="rounded-[18px] border border-[#dce6ec] bg-[#f3f8fa] px-4 py-3 text-sm text-[#526b7d]">
          {t("updating")}
        </p>
      ) : null}

      <WholesaleLogisticsSummary page={logistics.page} />

      <WholesaleLogisticsFiltersPanel
        filters={logistics.filters}
        onChange={logistics.setFilters}
        onClear={logistics.clearFilters}
        profiles={profiles}
        storeOptions={logistics.storeOptions}
      />

      <section className="space-y-3">
        <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h3 className="text-xl font-bold tracking-tight text-[#23313a]">
              {t("list.title")}
            </h3>
            <p className="mt-1 break-words text-sm text-[#6f7b85]">
              {t("list.shown", {
                shown: logistics.page.rows.length,
                total: logistics.page.totalCount,
              })}
            </p>
          </div>
          {logistics.loading ? (
            <span className="text-sm text-[#6f7b85]">{t("list.loading")}</span>
          ) : null}
        </div>

        {logistics.loadError ? (
          <PageBanner tone="error">{logistics.loadError}</PageBanner>
        ) : null}

        <WholesaleLogisticsRecords
          customersById={customersById}
          loadingMore={logistics.loadingMore}
          onLoadMore={() => void logistics.loadMore()}
          page={logistics.page}
          profilesById={profilesById}
        />
      </section>

      {canManage ? (
        <WholesaleLogisticsAssignmentDialog
          assignments={logistics.assignments}
          customers={customers}
          feedback={
            logistics.feedback?.scope === "assignment"
              ? logistics.feedback
              : null
          }
          onAssign={logistics.assignStores}
          onChange={logistics.changeAssignment}
          onDismissFeedback={logistics.dismissFeedback}
          onEnd={logistics.endAssignment}
          onOpenChange={setSettingsOpen}
          open={settingsOpen}
          pendingKey={logistics.pendingKey}
          profiles={profiles}
          storeOptions={logistics.storeOptions}
        />
      ) : null}
    </WholesalePageShell>
  );
}

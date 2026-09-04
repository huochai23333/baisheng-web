"use client";

import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, RefreshCw, UsersRound } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { DashboardPageShell, DashboardAccessState } from "@/components/dashboard/dashboard-page-shell";
import { DashboardSectionHeader } from "@/components/dashboard/dashboard-section-header";
import { DashboardSegmentedTabs } from "@/components/dashboard/dashboard-segmented-tabs";
import { DashboardListSection, DashboardSearchInput } from "@/components/dashboard/dashboard-section-panel";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { SalesLeadBoard, SalesLeadPageData } from "@/lib/sales-leads-types";

import { SalesLeadActionDialog } from "./sales-lead-action-dialog";
import { SalesLeadDetailDialog } from "./sales-lead-detail-dialog";
import { SalesLeadList } from "./sales-lead-list";
import { SalesLeadRules } from "./sales-lead-rules";
import { useSalesLeadsPage } from "./use-sales-leads-page";
import { formatLeadDate } from "./sales-leads-display";

export function SalesLeadsClient({ initialData }: { initialData: SalesLeadPageData }) {
  const t = useTranslations("SalesLeads");
  const locale = useLocale();
  const view = useSalesLeadsPage(initialData);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const boardOptions = useMemo(() => {
    const options: Array<{ key: SalesLeadBoard; label: string; badge: number }> = [
      { key: "hall", label: t("boards.hall"), badge: view.data.boardCounts.hall },
      { key: "mine", label: t("boards.mine"), badge: view.data.boardCounts.mine },
      { key: "used", label: t("boards.used"), badge: view.data.boardCounts.used },
    ];
    if (view.data.canManage) options.push({ key: "all_claimed", label: t("boards.allClaimed"), badge: view.data.boardCounts.allClaimed });
    return options;
  }, [t, view.data.boardCounts, view.data.canManage]);

  if (!initialData.hasPermission) {
    return <DashboardPageShell><DashboardAccessState description={t("states.noPermissionDescription")} kind="permission" title={t("states.noPermissionTitle")} /></DashboardPageShell>;
  }

  return (
    <DashboardPageShell header={<DashboardSectionHeader
      actions={view.data.canManage ? <Button disabled={view.pending === "sync"} onClick={() => void view.syncNow()} variant="outline" wrap><RefreshCw className="size-4" />{t("actions.syncNow")}</Button> : undefined}
      badge={t("header.badge")}
      badgeIcon={<BriefcaseBusiness className="size-3.5" />}
      description={t("header.description")}
      presentation="overview"
      title={t("header.title")}
    />}>
      <SalesLeadRules />
      <DashboardSegmentedTabs onChange={view.setBoard} options={boardOptions} pendingValue={view.pending === "refresh" ? view.board : null} value={view.board} />
      {view.data.canManage ? <div className="flex min-w-0 flex-wrap items-center gap-x-5 gap-y-2 rounded-record-card border border-border-subtle bg-surface-inset px-4 py-3 text-sm text-content-muted">
        <span>{t("sync.lastSuccess")}: {formatLeadDate(view.data.syncState?.last_successful_at ?? null, locale)}</span>
        <span>{t("sync.recentRuns")}: {view.data.recentImportRuns.length}</span>
        {view.data.syncState?.last_error ? <span className="min-w-0 break-words text-status-danger [overflow-wrap:anywhere]">{t("sync.failed")}</span> : null}
      </div> : null}
      <DashboardListSection
        actions={<div className="grid w-full gap-2 sm:grid-cols-[minmax(0,1fr)_220px]">
          <DashboardSearchInput ariaLabel={t("filters.searchLabel")} onChange={view.setSearch} placeholder={t("filters.searchPlaceholder")} value={view.search} />
          {view.data.canManage && view.board === "all_claimed" ? <Select aria-label={t("filters.assignee")} onValueChange={(value) => view.setAssigneeUserId(value || null)} options={[{ value: "", label: t("filters.allSalespeople") }, ...view.data.salespeople.map((person) => ({ value: person.user_id, label: person.name }))]} value={view.assigneeUserId ?? ""} /> : null}
        </div>}
        ariaLabel={t("list.title")}
      >
        {view.error && !view.action ? <p className="mb-4 rounded-record-card border border-status-danger-border bg-status-danger-soft px-4 py-3 text-sm text-status-danger">{t(`errors.${view.error}`)}</p> : null}
        {view.data.items.length ? <SalesLeadList canManage={view.data.canManage} items={view.data.items} now={now} onClaim={(id) => void view.claim(id)} onOpen={(lead) => void view.openDetail(lead)} pending={view.pending} /> : <div className="flex min-h-48 flex-col items-center justify-center text-center"><UsersRound className="size-8 text-content-subtle" /><p className="mt-3 font-semibold text-content-strong">{t("states.emptyTitle")}</p><p className="mt-1 text-sm text-content-muted">{t("states.emptyDescription")}</p></div>}
        {view.data.totalCount > view.data.limit ? <div className="mt-5 flex flex-wrap justify-end gap-2"><Button disabled={view.data.offset === 0} onClick={() => void view.refresh(view.board, Math.max(0, view.data.offset - view.data.limit))} variant="outline">{t("pagination.previous")}</Button><Button disabled={view.data.offset + view.data.limit >= view.data.totalCount} onClick={() => void view.refresh(view.board, view.data.offset + view.data.limit)} variant="outline">{t("pagination.next")}</Button></div> : null}
      </DashboardListSection>

      <SalesLeadDetailDialog canManage={view.data.canManage} detail={view.action ? null : view.detail} onAction={view.setAction} onOpenChange={(open) => { if (!open) view.setDetail(null); }} />
      <SalesLeadActionDialog action={view.action} errorCode={view.error} leadId={view.detail?.lead.id ?? null} onClose={() => view.setAction(null)} onSubmit={view.submitAction} pending={Boolean(view.detail && view.pending === view.detail.lead.id)} salespeople={view.data.salespeople} />
    </DashboardPageShell>
  );
}

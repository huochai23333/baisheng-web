"use client";

import { useTranslations } from "next-intl";

import { DashboardDialog } from "@/components/dashboard/dashboard-dialog";
import { Button } from "@/components/ui/button";
import type { SalesLeadDetail } from "@/lib/sales-leads-types";

import { SalesLeadPublicInfo } from "./sales-lead-public-info";
import { SalesLeadProgressSection } from "./sales-lead-progress-section";
import { SalesLeadHistorySection } from "./sales-lead-history-section";
import type { LeadAction } from "./use-sales-leads-page";

export function SalesLeadDetailDialog({
  canManage,
  detail,
  onAction,
  onOpenChange,
}: {
  canManage: boolean;
  detail: SalesLeadDetail | null;
  onAction: (action: LeadAction) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("SalesLeads");
  if (!detail) return null;
  const { lead } = detail;

  return (
    <DashboardDialog
      actions={lead.status === "claimed" || canManage ? <>
        {lead.status === "claimed" ? <Button onClick={() => onAction("contact")} wrap>{t("actions.addContact")}</Button> : null}
        {lead.status === "claimed" ? <Button onClick={() => onAction("return")} variant="outline" wrap>{t("actions.return")}</Button> : null}
        {lead.status === "claimed" ? <Button onClick={() => onAction("use")} variant="outline" wrap>{t("actions.markUsed")}</Button> : null}
        {canManage && lead.status !== "used" ? <Button onClick={() => onAction("assign")} variant="outline" wrap>{t("actions.assign")}</Button> : null}
        {canManage && lead.status === "used" ? <Button onClick={() => onAction("reopen")} variant="outline" wrap>{t("actions.reopen")}</Button> : null}
      </> : undefined}
      description={t("detail.description")}
      onOpenChange={onOpenChange}
      open
      title={lead.name}
    >
      <div className="space-y-6">
        <SalesLeadPublicInfo lead={lead} />
        <SalesLeadProgressSection detail={detail} />
        <SalesLeadHistorySection detail={detail} />
      </div>
    </DashboardDialog>
  );
}

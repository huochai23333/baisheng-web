"use client";

import { useLocale, useTranslations } from "next-intl";

import { DashboardDialog } from "@/components/dashboard/dashboard-dialog";
import { Button } from "@/components/ui/button";
import { MetaGrid, MetaItem, RecordCard } from "@/components/ui/data-display";
import type { SalesLeadDetail } from "@/lib/sales-leads-types";

import { formatLeadDate } from "./sales-leads-display";
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
  const locale = useLocale();
  if (!detail) return null;
  const { lead } = detail;

  return (
    <DashboardDialog
      actions={<>
        {lead.status === "claimed" ? <Button onClick={() => onAction("contact")} wrap>{t("actions.addContact")}</Button> : null}
        {lead.status === "claimed" ? <Button onClick={() => onAction("return")} variant="outline" wrap>{t("actions.return")}</Button> : null}
        {lead.status === "claimed" ? <Button onClick={() => onAction("use")} variant="outline" wrap>{t("actions.markUsed")}</Button> : null}
        {canManage && lead.status !== "used" ? <Button onClick={() => onAction("assign")} variant="outline" wrap>{t("actions.assign")}</Button> : null}
        {canManage && lead.status === "used" ? <Button onClick={() => onAction("reopen")} variant="outline" wrap>{t("actions.reopen")}</Button> : null}
      </>}
      description={t("detail.description")}
      onOpenChange={onOpenChange}
      open
      title={lead.name}
    >
      <div className="space-y-6">
        <MetaGrid className="md:grid-cols-2">
          <MetaItem label={t("fields.email")}>{lead.email ?? "—"}</MetaItem>
          <MetaItem label={t("fields.phone")}>{lead.phone ?? "—"}</MetaItem>
          <MetaItem label={t("fields.whatsapp")}>{lead.whatsapp ?? "—"}</MetaItem>
          <MetaItem label={t("fields.website")}><span className="break-all">{lead.website_url ?? "—"}</span></MetaItem>
          <MetaItem label={t("fields.publicContact")}><span className="whitespace-pre-wrap">{lead.public_contact ?? "—"}</span></MetaItem>
          <MetaItem label={t("fields.recommendedApproach")}><span className="whitespace-pre-wrap">{lead.recommended_approach ?? "—"}</span></MetaItem>
        </MetaGrid>

        <section>
          <h4 className="text-lg font-bold text-content-strong">{t("detail.contactHistory")}</h4>
          <div className="mt-3 space-y-3">
            {detail.contacts.length ? detail.contacts.map((contact) => (
              <RecordCard key={contact.id} surface="inset">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-semibold text-content-strong">{t(`channels.${contact.contact_channel}`)} · {t(`outcomes.${contact.contact_outcome}`)}</p>
                  <time className="text-xs text-content-muted">{formatLeadDate(contact.contacted_at, locale)}</time>
                </div>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-content-muted [overflow-wrap:anywhere]">{contact.note}</p>
                <p className="mt-2 text-xs text-content-muted">{t("detail.recordedBy", { name: contact.author_name })}</p>
              </RecordCard>
            )) : <p className="text-sm text-content-muted">{t("detail.noContacts")}</p>}
          </div>
        </section>

        <section>
          <h4 className="text-lg font-bold text-content-strong">{t("detail.assignmentHistory")}</h4>
          <div className="mt-3 space-y-3">
            {detail.assignments.length ? detail.assignments.map((assignment) => (
              <RecordCard key={assignment.id} surface="inset">
                <p className="font-semibold text-content-strong">{assignment.assignee_name}</p>
                <p className="mt-1 text-sm text-content-muted">{formatLeadDate(assignment.claimed_at, locale)} — {formatLeadDate(assignment.ended_at, locale)}</p>
                {assignment.ended_reason ? <p className="mt-2 text-sm text-content-muted">{t(`endReasons.${assignment.ended_reason}`)}{assignment.end_note ? ` · ${assignment.end_note}` : ""}</p> : null}
                {assignment.reopened_at ? <p className="mt-2 text-sm text-content-muted">{t("endReasons.reopened")} · {formatLeadDate(assignment.reopened_at, locale)}{assignment.reopen_note ? ` · ${assignment.reopen_note}` : ""}</p> : null}
              </RecordCard>
            )) : <p className="text-sm text-content-muted">{t("detail.noAssignments")}</p>}
          </div>
        </section>
      </div>
    </DashboardDialog>
  );
}

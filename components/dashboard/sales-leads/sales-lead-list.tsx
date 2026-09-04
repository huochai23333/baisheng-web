"use client";

import { Clock3, ExternalLink, Mail, MapPin, Phone, UserRound } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { MetaGrid, MetaItem, RecordCard } from "@/components/ui/data-display";
import { StatusBadge } from "@/components/ui/status-badge";
import type { SalesLead } from "@/lib/sales-leads-types";

import { formatLeadCountdown, formatLeadDate, toExternalHref } from "./sales-leads-display";

export function SalesLeadList({
  canManage,
  items,
  now,
  onClaim,
  onOpen,
  pending,
}: {
  canManage: boolean;
  items: SalesLead[];
  now: number;
  onClaim: (leadId: string) => void;
  onOpen: (lead: SalesLead) => void;
  pending: string | null;
}) {
  const t = useTranslations("SalesLeads");
  const locale = useLocale();

  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-2" data-testid="sales-lead-list">
      {items.map((lead) => (
        <RecordCard className="min-w-0" key={lead.id}>
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <StatusBadge tone={lead.priority === "A" ? "danger" : lead.priority === "B" ? "warning" : "neutral"}>
                  {t("priority", { priority: lead.priority })}
                </StatusBadge>
                <StatusBadge tone={lead.status === "used" ? "success" : lead.status === "claimed" ? "info" : "neutral"}>
                  {t(`status.${lead.status}`)}
                </StatusBadge>
              </div>
              <h3 className="mt-3 break-words text-lg font-bold text-content-strong [overflow-wrap:anywhere]">
                {lead.name}
              </h3>
              <p className="mt-1 break-words text-sm text-content-muted [overflow-wrap:anywhere]">
                {lead.category}
              </p>
            </div>
            <div className="flex w-full shrink-0 flex-wrap gap-2 sm:w-auto sm:max-w-[52%] sm:justify-end">
              {lead.status === "hall" && !canManage ? (
                <Button data-testid={`claim-lead-${lead.id}`} disabled={pending === lead.id} onClick={() => onClaim(lead.id)} size="compact" wrap>
                  {t("actions.claim")}
                </Button>
              ) : null}
              <Button disabled={pending === lead.id} onClick={() => onOpen(lead)} size="compact" variant="outline" wrap>
                {t("actions.details")}
              </Button>
            </div>
          </div>

          <MetaGrid className="mt-5 md:grid-cols-2">
            <MetaItem label={t("fields.country")}><MapPin className="size-4 shrink-0" />{lead.country}</MetaItem>
            <MetaItem label={t("fields.email")}>
              <Mail className="size-4 shrink-0" />
              {lead.email ? <a className="break-all text-primary hover:underline" href={`mailto:${lead.email}`}>{lead.email}</a> : "—"}
            </MetaItem>
            <MetaItem label={t("fields.phone")}>
              <Phone className="size-4 shrink-0" />
              {lead.phone ? <a className="break-all text-primary hover:underline" href={`tel:${lead.phone}`}>{lead.phone}</a> : "—"}
            </MetaItem>
            <MetaItem label={t("fields.website")}>
              {lead.website_url ? <a className="inline-flex min-w-0 items-center gap-1 break-all text-primary hover:underline" href={toExternalHref(lead.website_url)} rel="noreferrer" target="_blank"><span className="min-w-0 break-all">{lead.website_url}</span><ExternalLink className="size-3.5 shrink-0" /></a> : "—"}
            </MetaItem>
            {lead.status === "claimed" ? (
              <MetaItem label={t("fields.timeRemaining")}><Clock3 className="size-4 shrink-0" />{formatLeadCountdown(lead, now, {
                expired: t("countdown.expired"),
                daysHours: (days, hours) => t("countdown.daysHours", { days, hours }),
                hoursMinutes: (hours, minutes) => t("countdown.hoursMinutes", { hours, minutes }),
              })}</MetaItem>
            ) : null}
            {lead.assignee_name ? <MetaItem label={t("fields.assignee")}><UserRound className="size-4 shrink-0" />{lead.assignee_name}</MetaItem> : null}
            {lead.next_follow_up_at ? <MetaItem label={t("fields.nextFollowUp")}>{formatLeadDate(lead.next_follow_up_at, locale)}</MetaItem> : null}
            <MetaItem label={t("fields.sourceDate")}>{lead.latest_source_date}</MetaItem>
          </MetaGrid>
        </RecordCard>
      ))}
    </div>
  );
}

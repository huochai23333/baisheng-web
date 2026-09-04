import { useTranslations } from "next-intl";

import { MetaGrid, MetaItem } from "@/components/ui/data-display";
import type { SalesLead } from "@/lib/sales-leads-types";

import { SalesLeadContactInfo } from "./sales-lead-contact-info";
import { SalesLeadValue } from "./sales-lead-value";

export function SalesLeadPublicInfo({ lead }: { lead: SalesLead }) {
  const t = useTranslations("SalesLeads");
  // 短资料用两列；建议、话术、来源说明单独占整行，让长段落在手机上也能连续阅读。
  return <>
    <section aria-labelledby="lead-basic-heading">
      <h4 className="mb-3 text-lg font-bold text-content-strong" id="lead-basic-heading">{t("detail.basicInfo")}</h4>
      <MetaGrid className="grid-cols-1 md:grid-cols-2 xl:grid-cols-2">
        <MetaItem label={t("fields.sourceId")}><SalesLeadValue value={lead.primary_source_lead_id} /></MetaItem>
        <MetaItem label={t("fields.sourceDate")}>{lead.latest_source_date}</MetaItem>
        <MetaItem label={t("fields.category")}><SalesLeadValue value={lead.category} /></MetaItem>
        <MetaItem label={t("fields.country")}><SalesLeadValue value={lead.country} /></MetaItem>
        <MetaItem label={t("fields.regionTimezone")}><SalesLeadValue value={lead.region_timezone} /></MetaItem>
        <MetaItem label={t("fields.priority")}>{t("priority", { priority: lead.priority })}</MetaItem>
        <MetaItem label={t("fields.contactToday")}>{t(lead.contact_today ? "detail.recommendedToday" : "detail.normalSchedule")}</MetaItem>
      </MetaGrid>
    </section>
    <section aria-labelledby="lead-contacts-heading">
      <h4 className="mb-3 text-lg font-bold text-content-strong" id="lead-contacts-heading">{t("detail.publicContacts")}</h4>
      <SalesLeadContactInfo lead={lead} />
    </section>
    <section aria-labelledby="lead-advice-heading">
      <h4 className="mb-3 text-lg font-bold text-content-strong" id="lead-advice-heading">{t("detail.cooperation")}</h4>
      <MetaGrid className="grid-cols-1 md:grid-cols-1 xl:grid-cols-1">
        <MetaItem label={t("fields.targetCustomer")}><SalesLeadValue value={lead.target_customer} /></MetaItem>
        <MetaItem label={t("fields.publicPricing")}><SalesLeadValue value={lead.public_pricing} /></MetaItem>
        <MetaItem label={t("fields.recommendedApproach")}><SalesLeadValue value={lead.recommended_approach} /></MetaItem>
        <MetaItem label={t("fields.talkingPoints")}><SalesLeadValue value={lead.contact_talking_points} /></MetaItem>
      </MetaGrid>
    </section>
    <section aria-labelledby="lead-source-heading">
      <h4 className="mb-3 text-lg font-bold text-content-strong" id="lead-source-heading">{t("detail.sourceInfo")}</h4>
      <MetaGrid className="grid-cols-1 md:grid-cols-1 xl:grid-cols-1">
        <MetaItem label={t("fields.sourceUrl")}><SalesLeadValue kind="web" value={lead.source_url} /></MetaItem>
        <MetaItem label={t("fields.sourceNotes")}><SalesLeadValue value={lead.source_notes} /></MetaItem>
      </MetaGrid>
    </section>
  </>;
}

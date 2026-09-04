import { useTranslations } from "next-intl";

import { MetaGrid, MetaItem } from "@/components/ui/data-display";
import type { SalesLead } from "@/lib/sales-leads-types";

import { SalesLeadValue } from "./sales-lead-value";

// 大厅与详情共用同一份联系字段，避免只在其中一个入口补充资料。
export function SalesLeadContactInfo({ lead }: { lead: SalesLead }) {
  const t = useTranslations("SalesLeads");
  return <MetaGrid className="grid-cols-1 md:grid-cols-2 xl:grid-cols-2">
    <MetaItem label={t("fields.email")}><SalesLeadValue kind="email" value={lead.email} /></MetaItem>
    <MetaItem label={t("fields.phone")}><SalesLeadValue kind="phone" value={lead.phone} /></MetaItem>
    <MetaItem label={t("fields.whatsapp")}><SalesLeadValue kind="whatsapp" value={lead.whatsapp} /></MetaItem>
    <MetaItem label={t("fields.website")}><SalesLeadValue kind="web" value={lead.website_url} /></MetaItem>
    <MetaItem label={t("fields.publicContact")}><SalesLeadValue kind="web" value={lead.public_contact} /></MetaItem>
    <MetaItem label={t("fields.community")}><SalesLeadValue kind="web" value={lead.community_url} /></MetaItem>
  </MetaGrid>;
}

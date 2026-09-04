import { useTranslations } from "next-intl";

// 规则放在看板切换之前，所有线索分类共用；手机单列、桌面三列，保证完整文字可读。
export function SalesLeadRules() {
  const t = useTranslations("SalesLeads.rules");
  return <section aria-labelledby="sales-lead-rules-heading" className="min-w-0 rounded-record-card border border-border-subtle bg-surface-inset p-4 sm:p-5" data-testid="sales-lead-rules">
    <h2 className="font-bold text-content-strong" id="sales-lead-rules-heading">{t("title")}</h2>
    <dl className="mt-3 grid min-w-0 gap-4 text-sm leading-6 md:grid-cols-3">
      {(["firstContact", "followUp", "claimPeriod"] as const).map((rule) => <div className="min-w-0 break-words [overflow-wrap:anywhere]" key={rule}>
        <dt className="font-semibold text-content-strong">{t(`${rule}.title`)}</dt>
        <dd className="mt-1 text-content-muted">{t(`${rule}.description`)}</dd>
      </div>)}
    </dl>
    <p className="mt-3 break-words text-sm leading-6 text-content-muted [overflow-wrap:anywhere]">{t("shared")}</p>
  </section>;
}

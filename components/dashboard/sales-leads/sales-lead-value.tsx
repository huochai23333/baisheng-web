import { useTranslations } from "next-intl";

import { toExternalHref } from "./sales-leads-display";

type ContactKind = "email" | "phone" | "whatsapp" | "web";

function contactHref(value: string, kind?: ContactKind) {
  if (kind === "email" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return `mailto:${value}`;
  // 电话保留原来的可读格式，仅在链接中去除空格、括号和短横线。
  const phone = value.replace(/[\s()-]/g, "");
  if (/^\+?\d{7,15}$/.test(phone)) {
    if (kind === "phone") return `tel:${phone}`;
    if (kind === "whatsapp") return `https://wa.me/${phone.replace(/^\+/, "")}`;
  }
  return kind ? toExternalHref(value) : null;
}

export function SalesLeadValue({ value, kind }: { value: string | null | undefined; kind?: ContactKind }) {
  const t = useTranslations("SalesLeads");
  const text = value?.trim();
  if (!text) return <span>{t("detail.notProvided")}</span>;
  const href = contactHref(text, kind);
  const link = (label: string, url: string, key?: number) => (
    <a className="text-primary underline-offset-4 hover:underline focus-visible:outline-2" href={url} key={key}
      rel={url.startsWith("http") ? "noreferrer" : undefined} target={url.startsWith("http") ? "_blank" : undefined}>{label}</a>
  );

  // 联系入口也可能是“说明 + 多个网址”。保留全部文字，按安全协议识别其中的网页。
  return <span className="block min-w-0 whitespace-pre-wrap break-words leading-6 [overflow-wrap:anywhere]">
    {href ? link(text, href) : text.split(/(https?:\/\/[^\s<>，。；（）]+)/gi).map((part, index) => {
      const url = /^https?:\/\//i.test(part) ? toExternalHref(part) : null;
      return url ? link(part, url, index) : part;
    })}
  </span>;
}

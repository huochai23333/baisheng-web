import type { SalesLead } from "@/lib/sales-leads-types";

export function formatLeadDate(value: string | null, locale: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatLeadCountdown(
  lead: SalesLead,
  now: number,
  labels: { expired: string; daysHours: (days: number, hours: number) => string; hoursMinutes: (hours: number, minutes: number) => string },
) {
  if (!lead.expires_at) return "—";
  const remaining = new Date(lead.expires_at).getTime() - now;
  if (remaining <= 0) return labels.expired;
  const minutes = Math.ceil(remaining / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  return days > 0
    ? labels.daysHours(days, hours % 24)
    : labels.hoursMinutes(hours, minutes % 60);
}

export function toExternalHref(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

export function getLeadPrimaryContact(lead: SalesLead) {
  return lead.email ?? lead.phone ?? lead.whatsapp ?? lead.public_contact ?? "—";
}

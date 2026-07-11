"use client";

import type { AdminPersonRow } from "@/lib/admin-people";
import type { Locale } from "@/lib/locale";

export type TourismPeopleTab = "customers" | "promoters";

export function isTourismCustomer(person: AdminPersonRow) {
  return (
    person.role === "client" &&
    person.workspace_business_access.includes("tourism")
  );
}

export function isTourismPromoter(person: AdminPersonRow) {
  return person.role === "promoter";
}

export function getTourismPersonName(person: AdminPersonRow, fallback: string) {
  return person.name?.trim() || person.email?.trim() || fallback;
}

export function getTourismPersonContact(
  person: AdminPersonRow,
  fallback: string,
) {
  return [person.email, person.phone].filter(Boolean).join(" / ") || fallback;
}

export function formatTourismPeopleDate(
  value: string | null,
  locale: Locale,
  fallback: string,
) {
  if (!value) return fallback;

  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return fallback;
  }
}

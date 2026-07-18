"use client";

import type { ReactNode } from "react";

import { BadgeCheck, LoaderCircle, UserRound, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import type { PendingProfileChangeReviewRow } from "@/lib/profile-change-requests";

import { EmptyState, normalizeOptionalString } from "../dashboard-shared-ui";
import type { BusyAction } from "./types";

type ProfileChangeReviewListProps = {
  busyRows: Record<string, BusyAction>;
  onAction: (
    row: PendingProfileChangeReviewRow,
    action: BusyAction,
  ) => Promise<void>;
  rows: PendingProfileChangeReviewRow[];
};

export function ProfileChangeReviewList({
  busyRows,
  onAction,
  rows,
}: ProfileChangeReviewListProps) {
  const t = useTranslations("ReviewsUI");

  if (rows.length === 0) {
    return (
      <EmptyState
        description={t("profile.emptyDescription")}
        icon={<UserRound className="size-6" />}
        title={t("profile.emptyTitle")}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-border-subtle bg-white shadow-[var(--surface-shadow-interactive)]">
      <div className="hidden grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_220px] gap-5 border-b border-border-subtle bg-surface-inset px-6 py-4 lg:grid">
        <ReviewHeaderCell>{t("profile.columns.name")}</ReviewHeaderCell>
        <ReviewHeaderCell>{t("profile.columns.email")}</ReviewHeaderCell>
        <ReviewHeaderCell>{t("profile.columns.current")}</ReviewHeaderCell>
        <ReviewHeaderCell>{t("profile.columns.requested")}</ReviewHeaderCell>
        <ReviewHeaderCell className="text-right">
          {t("profile.columns.actions")}
        </ReviewHeaderCell>
      </div>

      <div className="divide-y divide-border-subtle">
        {rows.map((row) => {
          const rowKey = `profile:${row.request_id}`;
          const busyAction = busyRows[rowKey];
          const displayName = getDisplayName(
            row.current_name,
            row.email,
            t("fallback.unnamedUser"),
          );
          const displayEmail =
            normalizeOptionalString(row.email) ?? t("fallback.notProvided");

          return (
            <article
              className="grid gap-4 px-4 py-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_220px] lg:items-center lg:px-6"
              key={row.request_id}
            >
              <ReviewValueCell
                label={t("profile.columns.name")}
                value={displayName}
              />
              <ReviewValueCell
                label={t("profile.columns.email")}
                value={displayEmail}
              />
              <ReviewValueCell
                label={t("profile.columns.current")}
                value={formatProfileValue(
                  row.previous_name,
                  row.previous_city,
                  t,
                )}
              />
              <ReviewValueCell
                label={t("profile.columns.requested")}
                value={formatProfileValue(
                  row.requested_name,
                  row.requested_city,
                  t,
                )}
              />

              <div className="lg:justify-self-end">
                <ReviewActionGroup
                  busyAction={busyAction}
                  onApprove={() => void onAction(row, "approve")}
                  onReject={() => void onAction(row, "reject")}
                />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function ReviewHeaderCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "font-label text-[11px] font-semibold tracking-[0.18em] text-content-muted uppercase",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

function ReviewValueCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 font-label text-[11px] font-semibold tracking-[0.18em] text-content-muted uppercase lg:hidden">
        {label}
      </p>
      <p
        className="break-words text-sm font-medium leading-6 text-content-strong lg:text-[15px]"
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

function ReviewActionGroup({
  busyAction,
  onApprove,
  onReject,
}: {
  busyAction?: BusyAction;
  onApprove: () => void;
  onReject: () => void;
}) {
  const t = useTranslations("ReviewsUI");

  return (
    <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
      <Button
        variant="success"
        size="compact"
        disabled={Boolean(busyAction)}
        onClick={onApprove}
      >
        {busyAction === "approve" ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <BadgeCheck className="size-4" />
        )}
        {t("actions.approve")}
      </Button>
      <Button
        size="compact"
        disabled={Boolean(busyAction)}
        onClick={onReject}
        variant="danger"
      >
        {busyAction === "reject" ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <XCircle className="size-4" />
        )}
        {t("actions.reject")}
      </Button>
    </div>
  );
}

function formatProfileValue(
  name: string | null,
  city: string | null,
  t: ReturnType<typeof useTranslations>,
) {
  return t("profile.valuePair", {
    city: normalizeOptionalString(city) ?? t("fallback.notProvided"),
    name: normalizeOptionalString(name) ?? t("fallback.unnamedUser"),
  });
}

function getDisplayName(
  name: string | null,
  email: string | null,
  fallbackLabel: string,
) {
  const normalizedName = normalizeOptionalString(name);

  if (normalizedName) {
    return normalizedName;
  }

  const normalizedEmail = normalizeOptionalString(email);

  if (normalizedEmail) {
    const [prefix] = normalizedEmail.split("@");
    const normalizedPrefix = normalizeOptionalString(prefix);

    if (normalizedPrefix) {
      return normalizedPrefix;
    }
  }

  return fallbackLabel;
}

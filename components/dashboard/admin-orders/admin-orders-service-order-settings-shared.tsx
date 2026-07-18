"use client";

import type { ReactNode } from "react";

import { useTranslations } from "next-intl";

import { DashboardInlineEditActions } from "@/components/dashboard/dashboard-framework-primitives";

export type ServiceOrderSettingsEditingTarget =
  { kind: "discount"; id: string } | { kind: "price"; id: string } | null;

export type ServiceOrderPriceDraft = {
  amountUsd: string;
  costAmountRmb: string;
};

export function ServiceOrderSettingsSectionTitle({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div className="min-w-0">
      <h4 className="text-lg font-bold tracking-tight text-content-strong sm:text-xl">
        {title}
      </h4>
      <p className="mt-1.5 text-sm leading-6 text-content-muted sm:leading-7">
        {description}
      </p>
    </div>
  );
}

export function ServiceOrderActionButtons({
  isEditing,
  isSaving,
  pendingAction,
  onCancel,
  onEdit,
  onSave,
}: {
  isEditing: boolean;
  isSaving: boolean;
  pendingAction: string | null;
  onCancel: () => void;
  onEdit: () => void;
  onSave: () => void;
}) {
  const t = useTranslations("Orders");

  return (
    <DashboardInlineEditActions
      cancelLabel={t("settings.serviceOrders.cancel")}
      editLabel={t("settings.serviceOrders.edit")}
      editing={isEditing}
      onCancel={onCancel}
      onEdit={onEdit}
      onSave={onSave}
      pending={pendingAction !== null}
      saveLabel={t("settings.serviceOrders.save")}
      saving={isSaving}
    />
  );
}

export function ServiceOrderMobileField({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div>
      <p className="mb-1.5 font-label text-[10px] font-semibold tracking-[0.14em] text-content-muted uppercase">
        {label}
      </p>
      {children}
    </div>
  );
}

export function ServiceOrderHeaderCell({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-4 text-left font-label text-[11px] font-semibold tracking-[0.18em] text-content-muted uppercase sm:px-5 ${className}`}
    >
      {children}
    </th>
  );
}

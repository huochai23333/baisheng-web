"use client";

import type { ReactNode } from "react";

import { LoaderCircle, PencilLine, Save, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

export type ServiceOrderSettingsEditingTarget =
  | { kind: "discount"; id: string }
  | { kind: "price"; id: string }
  | null;

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
      <h4 className="text-lg font-bold tracking-tight text-[#23313a] sm:text-xl">
        {title}
      </h4>
      <p className="mt-1.5 text-sm leading-6 text-[#6f7b85] sm:leading-7">
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
    <div className="flex flex-wrap gap-2 md:justify-end">
      {isEditing ? (
        <>
          <Button disabled={pendingAction !== null} onClick={onSave} type="button" variant="outline">
            {isSaving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
            {t("settings.serviceOrders.save")}
          </Button>
          <Button disabled={pendingAction !== null} onClick={onCancel} type="button" variant="outline">
            <X className="size-4" />
            {t("settings.serviceOrders.cancel")}
          </Button>
        </>
      ) : (
        <Button disabled={pendingAction !== null} onClick={onEdit} type="button" variant="outline">
          <PencilLine className="size-4" />
          {t("settings.serviceOrders.edit")}
        </Button>
      )}
    </div>
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
      <p className="mb-1.5 font-label text-[10px] font-semibold tracking-[0.14em] text-[#7d8890] uppercase">
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
      className={`px-4 py-4 text-left font-label text-[11px] font-semibold tracking-[0.18em] text-[#7d8890] uppercase sm:px-5 ${className}`}
    >
      {children}
    </th>
  );
}

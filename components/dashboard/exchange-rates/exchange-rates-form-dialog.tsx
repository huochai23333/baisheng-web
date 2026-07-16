"use client";

import { useTranslations } from "next-intl";

import {
  DashboardFormDialog,
  DashboardFormField,
  dashboardFormInputClassName,
} from "@/components/dashboard/dashboard-form-dialog";
import type { NoticeTone } from "@/components/dashboard/dashboard-shared-ui";

import type { ExchangeRateFormState } from "./exchange-rates-utils";

type ExchangeRateFormDialogProps = {
  feedback?: { tone: NoticeTone; message: string } | null;
  formState: ExchangeRateFormState;
  mode: "create" | "edit";
  open: boolean;
  pending: boolean;
  onFieldChange: <Key extends keyof ExchangeRateFormState>(
    key: Key,
    value: ExchangeRateFormState[Key],
  ) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
};

export function ExchangeRateFormDialog({
  feedback,
  formState,
  mode,
  open,
  pending,
  onFieldChange,
  onOpenChange,
  onSubmit,
}: ExchangeRateFormDialogProps) {
  const t = useTranslations("ExchangeRates");

  return (
    <DashboardFormDialog
      cancelLabel={t("dialogs.cancel")}
      description={
        mode === "create"
          ? t("dialogs.create.description")
          : t("dialogs.edit.description")
      }
      feedback={feedback}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      open={open}
      pending={pending}
      submitLabel={
        mode === "create" ? t("dialogs.create.submit") : t("dialogs.edit.submit")
      }
      title={mode === "create" ? t("dialogs.create.title") : t("dialogs.edit.title")}
    >
        <div className="grid gap-5 md:grid-cols-2">
          <DashboardFormField label={t("dialogs.fields.originalCurrency")}>
            <input
              className={dashboardFormInputClassName}
              disabled={pending}
              onChange={(event) => onFieldChange("originalCurrency", event.target.value)}
              placeholder={t("dialogs.placeholders.originalCurrency")}
              type="text"
              value={formState.originalCurrency}
            />
          </DashboardFormField>

          <DashboardFormField label={t("dialogs.fields.targetCurrency")}>
            <input
              className={dashboardFormInputClassName}
              disabled={pending}
              onChange={(event) => onFieldChange("targetCurrency", event.target.value)}
              placeholder={t("dialogs.placeholders.targetCurrency")}
              type="text"
              value={formState.targetCurrency}
            />
          </DashboardFormField>

          <DashboardFormField label={t("dialogs.fields.dailyExchangeRate")}>
            <input
              className={dashboardFormInputClassName}
              disabled={pending}
              min="0"
              onChange={(event) =>
                onFieldChange("dailyExchangeRate", event.target.value)
              }
              placeholder={t("dialogs.placeholders.dailyExchangeRate")}
              step="0.000001"
              type="number"
              value={formState.dailyExchangeRate}
            />
          </DashboardFormField>

          <div className="rounded-[22px] border border-[#ebe7e1] bg-[#f8f6f3] px-4 py-4 text-sm leading-7 text-[#65717b]">
            {t("dialogs.currencyHint")}
          </div>
        </div>
    </DashboardFormDialog>
  );
}

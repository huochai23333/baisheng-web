"use client";

import * as FormControls from "@/components/ui/form-controls";

import { useMemo, useState } from "react";

import { useTranslations } from "next-intl";

import { DashboardDialog } from "@/components/dashboard/dashboard-dialog";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Select } from "@/components/ui/select";
import type {
  CustomerInventoryCreditApplication,
  CustomerInventoryExtensionRequest,
  CustomerInventoryOrder,
} from "@/lib/customer-inventory-types";
import { getCustomerInventoryInterest } from "@/lib/customer-inventory-types";

import {
  formatInventoryDate,
  formatInventoryMoney,
  inventoryTierOrder,
} from "./customer-inventory-display";
import {
  createInitialCreditDecisions,
  CustomerInventoryCreditReviewCard,
} from "./customer-inventory-credit-review-card";
import type { RunInventoryAction } from "./use-customer-inventory-actions";
import {
  callRpc,
  numberValue,
  optionalValue,
  requiredValue,
} from "./customer-inventory-dialog-utils";

export type InventoryCreditDialogState =
  | { kind: "apply"; order: CustomerInventoryOrder }
  | {
      kind: "review";
      order: CustomerInventoryOrder;
      credits: CustomerInventoryCreditApplication[];
    }
  | { kind: "extend"; credit: CustomerInventoryCreditApplication }
  | {
      kind: "reviewExtension";
      extension: CustomerInventoryExtensionRequest;
      credit: CustomerInventoryCreditApplication;
    }
  | { kind: "repay"; credit: CustomerInventoryCreditApplication }
  | null;

export type CreditDecision = {
  applicationId: string;
  approvedAmountUsd: string;
  decision: "approve" | "reject";
  reviewNote: string;
};

export function CustomerInventoryCreditDialogs({
  currentBusinessDate,
  dialog,
  onClose,
  pendingKey,
  runAction,
  usdToCurrencyRates,
}: {
  currentBusinessDate: string;
  dialog: InventoryCreditDialogState;
  onClose: () => void;
  pendingKey: string | null;
  runAction: RunInventoryAction;
  usdToCurrencyRates: Record<string, number | null>;
}) {
  const t = useTranslations("CustomerInventory");
  const reviewCredits = dialog?.kind === "review" ? dialog.credits : [];
  const [decisions, setDecisions] = useState<CreditDecision[]>(() =>
    createInitialCreditDecisions(reviewCredits),
  );

  const actualPayment = useMemo(() => {
    if (dialog?.kind !== "review") return 0;
    const approvedUsd = decisions.reduce((sum, decision) => {
      if (decision.decision !== "approve") return sum;
      const credit = dialog.credits.find(
        (item) => item.id === decision.applicationId,
      );
      const amount =
        credit?.tier === "fixed_200_usd"
          ? 200
          : Number(decision.approvedAmountUsd || 0);
      return sum + amount;
    }, 0);

    const rate = usdToCurrencyRates[dialog.order.currency];

    // 审核当天的美元换算率与数据库使用同一函数，页面据此给出准确的剩余实付建议。
    return rate === null || rate === undefined
      ? 0
      : Math.max(
          Math.round(
            (dialog.order.purchase_amount - approvedUsd * rate) * 100,
          ) / 100,
          0,
        );
  }, [decisions, dialog, usdToCurrencyRates]);
  const reviewRateMissing =
    dialog?.kind === "review" &&
    decisions.some((decision) => decision.decision === "approve") &&
    usdToCurrencyRates[dialog.order.currency] == null;

  if (!dialog) return null;

  const activeDialog = dialog as NonNullable<InventoryCreditDialogState>;
  const formId = `inventory-credit-${dialog.kind}-form`;
  const subjectId =
    dialog.kind === "apply" || dialog.kind === "review"
      ? dialog.order.id
      : dialog.credit.id;
  const actionKey = `${dialog.kind}:${subjectId}`;

  async function handleSubmit(formData: FormData) {
    const currentDialog = activeDialog;
    const success = await runAction(
      actionKey,
      t(`feedback.${currentDialog.kind}Success`),
      async (supabase) => {
        if (currentDialog.kind === "apply") {
          const tiers = inventoryTierOrder.filter(
            (tier) => formData.get(`tier:${tier}`) === "on",
          );
          await callRpc(
            supabase.rpc("submit_customer_inventory_credit_applications", {
              p_application_note: optionalValue(formData, "notes"),
              p_order_id: currentDialog.order.id,
              p_tiers: tiers,
            }),
          );
          return;
        }

        if (currentDialog.kind === "review") {
          await callRpc(
            supabase.rpc("review_customer_inventory_credit_batch", {
              p_actual_payment_amount: numberValue(formData, "actualPayment"),
              p_decisions: decisions.map((decision) => ({
                application_id: decision.applicationId,
                approved_amount_usd:
                  decision.decision === "approve"
                    ? Number(decision.approvedAmountUsd || 0)
                    : null,
                decision: decision.decision,
                review_note: decision.reviewNote || null,
              })),
              p_expected_revision: currentDialog.order.revision,
              p_order_id: currentDialog.order.id,
              p_review_note: optionalValue(formData, "notes"),
            }),
          );
          return;
        }

        if (currentDialog.kind === "extend") {
          await callRpc(
            supabase.rpc("submit_customer_inventory_credit_extension", {
              p_credit_application_id: currentDialog.credit.id,
              p_extension_months: numberValue(formData, "months"),
              p_request_note: optionalValue(formData, "notes"),
            }),
          );
          return;
        }

        if (currentDialog.kind === "reviewExtension") {
          await callRpc(
            supabase.rpc("review_customer_inventory_credit_extension", {
              p_decision: requiredValue(formData, "decision"),
              p_extension_request_id: currentDialog.extension.id,
              p_review_note: optionalValue(formData, "notes"),
            }),
          );
          return;
        }

        await callRpc(
          supabase.rpc("record_customer_inventory_credit_repayment", {
            p_credit_application_id: currentDialog.credit.id,
            p_note: optionalValue(formData, "notes"),
            p_paid_on: requiredValue(formData, "paidOn"),
          }),
        );
      },
    );

    if (success) onClose();
  }

  return (
    <DashboardDialog
      actions={
        <>
          <Button onClick={onClose} type="button" variant="secondary">
            {t("common.cancel")}
          </Button>
          <Button
            disabled={pendingKey === actionKey || reviewRateMissing}
            form={formId}
            type="submit"
          >
            {pendingKey === actionKey
              ? t("common.saving")
              : t(`creditDialogs.${dialog.kind}Submit`)}
          </Button>
        </>
      }
      description={t(`creditDialogs.${dialog.kind}Description`)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      open
      title={t(`creditDialogs.${dialog.kind}Title`)}
    >
      <form
        className="grid min-w-0 gap-5"
        id={formId}
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit(new FormData(event.currentTarget));
        }}
      >
        {dialog.kind === "apply" ? (
          <>
            <p className="text-sm leading-7 text-content-muted">
              {t("creditDialogs.applyOrder", {
                amount: formatInventoryMoney(
                  dialog.order.purchase_amount,
                  dialog.order.currency,
                ),
                number: dialog.order.order_number,
              })}
            </p>
            {inventoryTierOrder.map((tier) => (
              <FormControls.ChoiceField
                description={t(`tierDescriptions.${tier}`)}
                key={tier}
                label={t(`tiers.${tier}`)}
                name={`tier:${tier}`}
              />
            ))}
          </>
        ) : null}

        {dialog.kind === "review" ? (
          <>
            <p className="text-sm leading-7 text-content-muted">
              {t("creditDialogs.reviewBalance", {
                amount: formatInventoryMoney(
                  dialog.order.purchase_amount,
                  dialog.order.currency,
                ),
              })}
            </p>
            <p className="text-sm leading-7 text-content-muted">
              {usdToCurrencyRates[dialog.order.currency] == null
                ? t("creditDialogs.rateMissing")
                : t("creditDialogs.ratePreview", {
                    currency: dialog.order.currency,
                    rate: Number(usdToCurrencyRates[dialog.order.currency]),
                  })}
            </p>
            {dialog.credits.map((credit) => {
              const decision = decisions.find(
                (item) => item.applicationId === credit.id,
              );
              if (!decision) return null;

              return (
                <CustomerInventoryCreditReviewCard
                  credit={credit}
                  decision={decision}
                  key={credit.id}
                  onChange={(nextDecision) =>
                    setDecisions((current) =>
                      current.map((item) =>
                        item.applicationId === credit.id ? nextDecision : item,
                      ),
                    )
                  }
                />
              );
            })}
            <FormControls.Field
              hint={t("creditDialogs.actualPaymentHint")}
              label={t("fields.actualPayment")}
              required
            >
              <FormControls.Input
                defaultValue={actualPayment}
                key={actualPayment}
                min="0"
                name="actualPayment"
                required
                step="0.01"
                type="number"
              />
            </FormControls.Field>
          </>
        ) : null}

        {dialog.kind === "extend" ? (
          <>
            <p className="text-sm leading-7 text-content-muted">
              {t("creditDialogs.extendDue", {
                date: formatInventoryDate(dialog.credit.due_on),
              })}
            </p>
            <FormControls.Field label={t("fields.extensionMonths")} required>
              <Select
                name="months"
                options={[1, 2, 3].map((month) => ({
                  label: t("creditDialogs.months", { count: month }),
                  value: String(month),
                }))}
                required
              />
            </FormControls.Field>
          </>
        ) : null}

        {dialog.kind === "reviewExtension" ? (
          <>
            <p className="text-sm leading-7 text-content-muted">
              {t("creditDialogs.extensionRequestSummary", {
                count: dialog.extension.extension_months,
                date: formatInventoryDate(dialog.credit.due_on),
              })}
            </p>
            <FormControls.Field label={t("fields.reviewDecision")} required>
              <Select
                name="decision"
                options={[
                  { label: t("decisions.approve"), value: "approve" },
                  { label: t("decisions.reject"), value: "reject" },
                ]}
                required
              />
            </FormControls.Field>
          </>
        ) : null}

        {dialog.kind === "repay" ? (
          <>
            <div className="rounded-record-card border border-border-subtle bg-surface-inset p-4 text-sm">
              <p className="font-semibold text-content-strong">
                {t("creditDialogs.repayPrincipal", {
                  amount: formatInventoryMoney(
                    dialog.credit.approved_amount_usd,
                    "USD",
                  ),
                })}
              </p>
              <p className="mt-2 text-content-muted">
                {t("creditDialogs.repayInterest", {
                  amount: formatInventoryMoney(
                    getCustomerInventoryInterest(
                      dialog.credit,
                      currentBusinessDate,
                    ),
                    "USD",
                  ),
                })}
              </p>
            </div>
            <FormControls.Field label={t("fields.repaidOn")} required>
              <DatePicker
                defaultValue={currentBusinessDate}
                max={currentBusinessDate}
                min={dialog.credit.used_on ?? undefined}
                name="paidOn"
                required
              />
            </FormControls.Field>
          </>
        ) : null}

        <FormControls.Field label={t("fields.notes")}>
          <FormControls.Textarea className="min-h-28 py-3" name="notes" />
        </FormControls.Field>
      </form>
    </DashboardDialog>
  );
}

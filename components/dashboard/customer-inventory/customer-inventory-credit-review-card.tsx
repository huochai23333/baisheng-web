"use client";

import * as FormControls from "@/components/ui/form-controls";

import { useTranslations } from "next-intl";

import { Select } from "@/components/ui/select";
import type { CustomerInventoryCreditApplication } from "@/lib/customer-inventory-types";

import type { CreditDecision } from "./customer-inventory-credit-dialog-types";

export function createInitialCreditDecisions(
  credits: CustomerInventoryCreditApplication[],
): CreditDecision[] {
  return credits.map((credit) => ({
    applicationId: credit.id,
    approvedAmountUsd: credit.tier === "fixed_200_usd" ? "200" : "",
    decision: "reject",
    reviewNote: "",
  }));
}

/**
 * 每个待审档位独立负责“批准或拒绝”和金额输入。
 * 父弹窗只负责收集最终决定并一次提交，避免把列表渲染和事务编排混在一起。
 */
export function CustomerInventoryCreditReviewCard({
  credit,
  decision,
  onChange,
}: {
  credit: CustomerInventoryCreditApplication;
  decision: CreditDecision;
  onChange: (decision: CreditDecision) => void;
}) {
  const t = useTranslations("CustomerInventory");

  return (
    <div className="grid min-w-0 gap-4 rounded-record-card border border-border-subtle bg-surface-inset p-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <p className="font-semibold text-content-strong">
          {t(`tiers.${credit.tier}`)}
        </p>
        <p className="mt-1 text-xs leading-5 text-content-muted">
          {credit.application_note || t("common.noNotes")}
        </p>
      </div>
      <FormControls.Field label={t("fields.reviewDecision")}>
        <Select
          onValueChange={(value) =>
            onChange({
              ...decision,
              decision: value as "approve" | "reject",
            })
          }
          options={[
            { label: t("decisions.approve"), value: "approve" },
            { label: t("decisions.reject"), value: "reject" },
          ]}
          value={decision.decision}
        />
      </FormControls.Field>
      {decision.decision === "approve" ? (
        <FormControls.Field
          hint={
            credit.tier === "fixed_200_usd"
              ? t("creditDialogs.fixedAmountHint")
              : t("creditDialogs.manualAmountHint")
          }
          label={t("fields.approvedAmountUsd")}
        >
          <FormControls.Input
            disabled={credit.tier === "fixed_200_usd"}
            min="0.01"
            onChange={(event) =>
              onChange({
                ...decision,
                approvedAmountUsd: event.target.value,
              })
            }
            step="0.01"
            type="number"
            value={decision.approvedAmountUsd}
          />
        </FormControls.Field>
      ) : null}
    </div>
  );
}

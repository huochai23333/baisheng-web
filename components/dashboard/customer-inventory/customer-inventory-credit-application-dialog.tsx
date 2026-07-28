"use client";

import * as FormControls from "@/components/ui/form-controls";

import { useTranslations } from "next-intl";

import { DashboardDialog } from "@/components/dashboard/dashboard-dialog";
import { Button } from "@/components/ui/button";
import type {
  CustomerInventoryCreditApplication,
  CustomerInventoryOrder,
} from "@/lib/customer-inventory-types";

import {
  formatInventoryMoney,
  inventoryTierOrder,
} from "./customer-inventory-display";
import { callRpc, optionalValue } from "./customer-inventory-dialog-utils";
import type { RunInventoryAction } from "./use-customer-inventory-actions";

export function CustomerInventoryCreditApplicationDialog({
  credits,
  onClose,
  order,
  pendingKey,
  runAction,
}: {
  credits: CustomerInventoryCreditApplication[];
  onClose: () => void;
  order: CustomerInventoryOrder;
  pendingKey: string | null;
  runAction: RunInventoryAction;
}) {
  const t = useTranslations("CustomerInventory");
  const actionKey = `apply:${order.id}`;
  const formId = `inventory-credit-apply-${order.id}`;
  const customerCredits = credits.filter(
    (credit) => credit.customer_id === order.customer_id,
  );
  const fixedQualified = customerCredits.some(
    (credit) =>
      credit.tier === "fixed_200_usd" &&
      ["active", "repaid"].includes(credit.status),
  );
  const fixedCurrentlyOpen = customerCredits.some(
    (credit) =>
      credit.tier === "fixed_200_usd" &&
      ["pending", "active"].includes(credit.status),
  );
  const openTiers = new Set(
    customerCredits
      .filter((credit) => ["pending", "active"].includes(credit.status))
      .map((credit) => credit.tier),
  );
  const availableTiers = inventoryTierOrder.filter(
    (tier) => !(tier === "fixed_200_usd" && fixedQualified) &&
      !openTiers.has(tier),
  );

  async function handleSubmit(formData: FormData) {
    const tiers = availableTiers.filter(
      (tier) => formData.get(`tier:${tier}`) === "on",
    );
    const success = await runAction(
      actionKey,
      t("feedback.applySuccess"),
      async (supabase) => {
        await callRpc(
          supabase.rpc("submit_customer_inventory_credit_applications", {
            p_application_note: optionalValue(formData, "notes"),
            p_order_id: order.id,
            p_tiers: tiers,
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
            disabled={
              pendingKey === actionKey || availableTiers.length === 0
            }
            form={formId}
            type="submit"
          >
            {pendingKey === actionKey
              ? t("common.saving")
              : t("creditDialogs.applySubmit")}
          </Button>
        </>
      }
      description={t("creditDialogs.applyDescription")}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      open
      title={t("creditDialogs.applyTitle")}
    >
      <form
        className="grid min-w-0 gap-5"
        id={formId}
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit(new FormData(event.currentTarget));
        }}
      >
        <p className="text-sm leading-7 text-content-muted">
          {t("creditDialogs.applyOrder", {
            amount: formatInventoryMoney(
              order.purchase_amount,
              order.currency,
            ),
            number: order.order_number,
          })}
        </p>

        {fixedQualified ? (
          <div className="rounded-record-card border border-status-success-border bg-status-success-soft px-4 py-3 text-sm leading-6 text-status-success">
            {t(
              fixedCurrentlyOpen
                ? "creditDialogs.fixedInUse"
                : "creditDialogs.fixedQualification",
            )}
          </div>
        ) : null}

        {inventoryTierOrder.map((tier) => {
          if (tier === "fixed_200_usd" && fixedQualified) return null;
          const unavailable = openTiers.has(tier);
          return (
            <FormControls.ChoiceField
              description={
                unavailable
                  ? `${t(`tierDescriptions.${tier}`)} ${t("creditDialogs.tierAlreadyOpen")}`
                  : t(`tierDescriptions.${tier}`)
              }
              disabled={unavailable}
              key={tier}
              label={t(`tiers.${tier}`)}
              name={`tier:${tier}`}
            />
          );
        })}

        <FormControls.Field label={t("fields.notes")}>
          <FormControls.Textarea className="min-h-28 py-3" name="notes" />
        </FormControls.Field>
      </form>
    </DashboardDialog>
  );
}

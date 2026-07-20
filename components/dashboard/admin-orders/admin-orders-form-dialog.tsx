"use client";

import * as FormControls from "@/components/ui/form-controls";
import { Select } from "@/components/ui/select";
import { Surface } from "@/components/ui/surface";

import { useMemo } from "react";

import { LoaderCircle, PencilLine } from "lucide-react";
import { useTranslations } from "next-intl";

import { FeedbackNotice } from "../dashboard-shared-ui";
import { DashboardDialog } from "../dashboard-dialog";
import { Button } from "../../ui/button";
import {
  createOrdersUiCopy,
  getOrderTypeMetaFromCategory,
  getOrderUserOptionLabel,
} from "./admin-orders-utils";
import type { OrderFormDialogProps } from "./admin-orders-form-dialog-types";
import { getOrderStatusOptions } from "./admin-orders-status-options";
import {
  fieldInputClassName,
  OrderFormSection,
  OrderField,
} from "./admin-orders-dialog-ui";
import { OrderServiceFeePreview } from "./admin-orders-service-fee-preview";
import { OrderSupplementaryFormSections } from "./admin-orders-supplementary-form-sections";

export function OrderFormDialog({
  mode,
  title,
  description,
  submitLabel,
  showCostField,
  feedback,
  currencyOptions,
  open,
  pending,
  formState,
  serviceFeePreview,
  orderDiscountOptions,
  orderTypeOptions,
  orderEntryUserOptions,
  orderingUserOptions,
  orderUserOptions,
  purchaseOrderTypeOptions,
  serviceOrderPriceOptions,
  serviceOrderTypeOptions,
  supplementaryLoading = false,
  lockCurrencyField = false,
  lockExchangeRateFields = false,
  lockOrderEntryUser = false,
  onOpenChange,
  onFieldChange,
  onSubmit,
}: OrderFormDialogProps) {
  const effectiveOrderEntryUserOptions =
    orderEntryUserOptions ?? orderUserOptions;
  const effectiveOrderingUserOptions = orderingUserOptions ?? orderUserOptions;
  const t = useTranslations("OrdersUI");
  const orderUiCopy = useMemo(() => createOrdersUiCopy(t), [t]);
  const orderStatusOptions = getOrderStatusOptions(t);
  const selectedOrderCategory = useMemo(() => {
    return (
      orderTypeOptions.find((option) => option.id === formState.orderType)
        ?.category ?? null
    );
  }, [formState.orderType, orderTypeOptions]);
  const isFormBusy = pending || supplementaryLoading;
  const showCostInput =
    showCostField && selectedOrderCategory !== "vip_recharge";
  const isAmountLocked =
    selectedOrderCategory === "service" ||
    selectedOrderCategory === "vip_recharge";
  const showServiceFeePreview = Boolean(
    serviceFeePreview &&
    selectedOrderCategory !== "vip_recharge" &&
    selectedOrderCategory !== "service",
  );

  return (
    <DashboardDialog
      actions={
        <>
          <Button
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            size="default"
            disabled={isFormBusy}
            onClick={onSubmit}
            type="button"
          >
            {isFormBusy ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <PencilLine className="size-4" />
            )}
            {submitLabel}
          </Button>
        </>
      }
      description={description}
      onOpenChange={onOpenChange}
      open={open}
      title={title}
    >
      <div className="space-y-5">
        {feedback ? (
          <FeedbackNotice tone={feedback.tone}>
            {feedback.message}
          </FeedbackNotice>
        ) : null}

        <OrderFormSection
          description={t("formSections.basic.description")}
          title={t("formSections.basic.title")}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <OrderField label={t("fields.orderStatus")} required>
              <Select
                disabled={isFormBusy}
                onValueChange={(value) => onFieldChange("orderStatus", value)}
                options={orderStatusOptions}
                value={formState.orderStatus}
              />
            </OrderField>

            <OrderField label={t("fields.orderType")} required>
              <Select
                disabled={isFormBusy}
                onValueChange={(value) => onFieldChange("orderType", value)}
                options={[
                  { label: t("select.orderType"), value: "" },
                  ...orderTypeOptions.map((option) => ({
                    label: getOrderTypeMetaFromCategory(
                      option.category,
                      orderUiCopy,
                    ).label,
                    value: option.id,
                  })),
                ]}
                value={formState.orderType}
              />
            </OrderField>

            <OrderField label={t("fields.originalCurrency")} required>
              {lockCurrencyField ? (
                <FormControls.Input
                  className={fieldInputClassName}
                  disabled
                  readOnly
                  type="text"
                  value={formState.originalCurrency}
                />
              ) : (
                <Select
                  disabled={isFormBusy}
                  onValueChange={(value) =>
                    onFieldChange("originalCurrency", value)
                  }
                  options={[
                    { label: t("select.originalCurrency"), value: "" },
                    ...currencyOptions.map((option) => ({
                      label: option.currency,
                      value: option.currency,
                    })),
                  ]}
                  value={formState.originalCurrency}
                />
              )}
              {lockCurrencyField ? (
                <p className="mt-2 text-xs text-content-muted">
                  {t("hints.lockedCurrencyAndRates")}
                </p>
              ) : null}
            </OrderField>

            <OrderField label={t("fields.amount")} required>
              <FormControls.Input
                className={fieldInputClassName}
                disabled={isFormBusy || isAmountLocked}
                min="0"
                onChange={(event) =>
                  onFieldChange("amount", event.target.value)
                }
                placeholder={t("placeholders.amount")}
                readOnly={isAmountLocked}
                step="0.01"
                type="number"
                value={formState.amount}
              />
              {selectedOrderCategory === "service" ? (
                <p className="mt-2 text-xs text-content-muted">
                  {t("hints.serviceAmountLocked")}
                </p>
              ) : null}
            </OrderField>

            <OrderField label={t("fields.rmbAmount")} required>
              <FormControls.Input
                className={fieldInputClassName}
                disabled
                min="0"
                placeholder={t("placeholders.rmbAmount")}
                readOnly
                step="0.01"
                type="number"
                value={formState.rmbAmount}
              />
              <p className="mt-2 text-xs text-content-muted">
                {t("hints.autoRmbAmount")}
              </p>
            </OrderField>

            {showCostInput ? (
              <OrderField label={t("fields.costAmount")}>
                <FormControls.Input
                  className={fieldInputClassName}
                  disabled={isFormBusy}
                  min="0"
                  onChange={(event) =>
                    onFieldChange("costAmount", event.target.value)
                  }
                  placeholder={t("placeholders.costAmount")}
                  step="0.01"
                  type="number"
                  value={formState.costAmount}
                />
              </OrderField>
            ) : null}

            <OrderField label={t("fields.dailyExchangeRate")} required>
              <FormControls.Input
                className={fieldInputClassName}
                disabled={isFormBusy || lockExchangeRateFields}
                min="0"
                onChange={(event) =>
                  onFieldChange("dailyExchangeRate", event.target.value)
                }
                placeholder={t("placeholders.dailyExchangeRate")}
                readOnly={lockExchangeRateFields}
                step="0.0001"
                type="number"
                value={formState.dailyExchangeRate}
              />
              {lockExchangeRateFields ? (
                <p className="mt-2 text-xs text-content-muted">
                  {t(
                    mode === "create"
                      ? "hints.autoDailyExchangeRate"
                      : "hints.lockedCurrencyAndRates",
                  )}
                </p>
              ) : null}
            </OrderField>

            <OrderField label={t("fields.transactionRate")} required>
              <FormControls.Input
                className={fieldInputClassName}
                disabled={isFormBusy || lockExchangeRateFields}
                min="0"
                placeholder={t("placeholders.transactionRate")}
                readOnly
                step="0.000001"
                type="number"
                value={formState.transactionRate}
              />
              <p className="mt-2 text-xs text-content-muted">
                {t("hints.transactionRate")}
              </p>
            </OrderField>

            <OrderField label={t("fields.orderEntryUser")} required>
              <Select
                disabled={isFormBusy || mode === "edit" || lockOrderEntryUser}
                onValueChange={(value) =>
                  onFieldChange("orderEntryUser", value)
                }
                options={[
                  { label: t("select.orderEntryUser"), value: "" },
                  ...effectiveOrderEntryUserOptions.map((option) => ({
                    label: getOrderUserOptionLabel(option),
                    value: option.user_id,
                  })),
                ]}
                value={formState.orderEntryUser}
              />
              {lockOrderEntryUser ? (
                <p className="mt-2 text-xs text-content-muted">
                  {t("hints.lockedOrderEntryUser")}
                </p>
              ) : null}
            </OrderField>

            <OrderField label={t("fields.orderingUser")} required>
              <Select
                disabled={isFormBusy}
                onValueChange={(value) => onFieldChange("orderingUser", value)}
                options={[
                  { label: t("select.orderingUser"), value: "" },
                  ...effectiveOrderingUserOptions.map((option) => ({
                    label: getOrderUserOptionLabel(option),
                    value: option.user_id,
                  })),
                ]}
                value={formState.orderingUser}
              />
            </OrderField>
          </div>
        </OrderFormSection>

        {showServiceFeePreview && serviceFeePreview ? (
          <OrderServiceFeePreview
            preview={serviceFeePreview}
            rmbAmount={formState.rmbAmount}
          />
        ) : null}

        <Surface
          as="div"
          className="text-sm leading-7 text-content-muted"
          padding="regular"
          variant="interactive"
        >
          {t("hints.autoTimestamps")}
        </Surface>

        <OrderSupplementaryFormSections
          formState={formState}
          isFormBusy={isFormBusy}
          mode={mode}
          orderDiscountOptions={orderDiscountOptions}
          purchaseOrderTypeOptions={purchaseOrderTypeOptions}
          selectedOrderCategory={selectedOrderCategory}
          serviceOrderPriceOptions={serviceOrderPriceOptions}
          serviceOrderTypeOptions={serviceOrderTypeOptions}
          supplementaryLoading={supplementaryLoading}
          onFieldChange={onFieldChange}
        />
      </div>
    </DashboardDialog>
  );
}

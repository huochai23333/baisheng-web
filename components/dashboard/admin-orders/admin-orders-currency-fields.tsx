"use client";

import { useTranslations } from "next-intl";

import {
  type OrderCurrencyOption,
  type OrderFormState,
} from "./admin-orders-utils";
import {
  fieldInputClassName,
  OrderField,
} from "./admin-orders-dialog-ui";

export function OrderCurrencyRateFields({
  currencyOptions,
  formState,
  isFormBusy,
  lockCurrencyField,
  lockExchangeRateFields,
  mode,
  onFieldChange,
}: {
  currencyOptions: OrderCurrencyOption[];
  formState: OrderFormState;
  isFormBusy: boolean;
  lockCurrencyField: boolean;
  lockExchangeRateFields: boolean;
  mode: "create" | "edit";
  onFieldChange: <Key extends keyof OrderFormState>(
    key: Key,
    value: OrderFormState[Key],
  ) => void;
}) {
  const t = useTranslations("OrdersUI");

  return (
    <>
      <OrderField label={t("fields.originalCurrency")} required>
        {lockCurrencyField ? (
          <input
            className={fieldInputClassName}
            disabled
            readOnly
            type="text"
            value={formState.originalCurrency}
          />
        ) : (
          <select
            className={fieldInputClassName}
            disabled={isFormBusy}
            onChange={(event) => onFieldChange("originalCurrency", event.target.value)}
            value={formState.originalCurrency}
          >
            <option value="">{t("select.originalCurrency")}</option>
            {currencyOptions.map((option) => (
              <option key={option.currency} value={option.currency}>
                {option.currency}
              </option>
            ))}
          </select>
        )}
        {lockCurrencyField ? (
          <p className="mt-2 text-xs text-[#7b8790]">
            {t("hints.lockedCurrencyAndRates")}
          </p>
        ) : null}
      </OrderField>

      <OrderField label={t("fields.dailyExchangeRate")} required>
        <input
          className={fieldInputClassName}
          disabled={isFormBusy || lockExchangeRateFields}
          min="0"
          onChange={(event) => onFieldChange("dailyExchangeRate", event.target.value)}
          placeholder={t("placeholders.dailyExchangeRate")}
          readOnly={lockExchangeRateFields}
          step="0.0001"
          type="number"
          value={formState.dailyExchangeRate}
        />
        {lockExchangeRateFields ? (
          <p className="mt-2 text-xs text-[#7b8790]">
            {t(
              mode === "create"
                ? "hints.autoDailyExchangeRate"
                : "hints.lockedCurrencyAndRates",
            )}
          </p>
        ) : null}
      </OrderField>

      <OrderField label={t("fields.transactionRate")} required>
        <input
          className={fieldInputClassName}
          disabled={isFormBusy || lockExchangeRateFields}
          min="0"
          placeholder={t("placeholders.transactionRate")}
          readOnly
          step="0.000001"
          type="number"
          value={formState.transactionRate}
        />
        <p className="mt-2 text-xs text-[#7b8790]">{t("hints.transactionRate")}</p>
      </OrderField>
    </>
  );
}

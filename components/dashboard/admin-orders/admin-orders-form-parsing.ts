import { type AdminOrderDetailValue } from "@/lib/admin-orders";

import { type OrdersUiCopy } from "./admin-orders-copy";

export function stringifyOrderDetailsForTextarea(value: AdminOrderDetailValue) {
  if (value === null) {
    return "";
  }

  if (typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0) {
    return "";
  }

  if (Array.isArray(value) && value.length === 0) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value, null, 2);
}

export function parseFlexibleOrderDetails(
  value: string,
  label: string,
  copy: OrdersUiCopy,
): AdminOrderDetailValue | string {
  const normalized = value.trim();

  if (!normalized) {
    return {};
  }

  try {
    return JSON.parse(normalized) as AdminOrderDetailValue;
  } catch {
    const lines = normalized
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const detailEntries = lines.map((line) => {
      const chineseSeparatorIndex = line.indexOf("：");
      const separatorIndex =
        chineseSeparatorIndex >= 0 ? chineseSeparatorIndex : line.indexOf(":");

      if (separatorIndex <= 0) {
        return null;
      }

      const key = line.slice(0, separatorIndex).trim();
      const rawValue = line.slice(separatorIndex + 1).trim();

      if (!key || !rawValue) {
        return null;
      }

      return [key, rawValue] as const;
    });

    if (detailEntries.some((entry) => entry === null)) {
      return copy.validation.invalidDetails(label);
    }

    return Object.fromEntries(detailEntries as Array<readonly [string, string]>);
  }
}

export function parseRequiredNumber(
  value: string,
  label: string,
  copy: OrdersUiCopy,
) {
  const normalized = value.trim();

  if (!normalized) {
    return copy.validation.inputPrompt(label);
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    return copy.validation.invalidFormat(label);
  }

  return parsed;
}

export function parseOptionalNumber(
  value: string,
  label: string,
  copy: OrdersUiCopy,
) {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    return copy.validation.invalidFormat(label);
  }

  if (parsed < 0) {
    return copy.validation.minZero(label);
  }

  return parsed;
}

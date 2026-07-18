"use client";

import { useMemo, useState } from "react";

import { useTranslations } from "next-intl";

import type {
  OrderDiscountTypeOption,
  ServiceOrderPriceOption,
  ServiceOrderTypeOption,
} from "@/lib/admin-orders";
import {
  updateOrderDiscountType,
  updateServiceOrderPriceOption,
} from "@/lib/service-order-settings";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import { useLocale } from "@/components/i18n/locale-provider";

import { DashboardListSection } from "../dashboard-section-panel";
import { FeedbackNotice, type FeedbackTone } from "../dashboard-shared-ui";
import { createOrdersUiCopy } from "./admin-orders-utils";
import {
  formatRatioForInput,
  parseServiceFeeInput,
} from "./admin-orders-service-fee-settings-utils";
import { ServiceOrderPricesTable } from "./admin-orders-service-order-settings-tables";
import {
  type ServiceOrderPriceDraft,
  ServiceOrderSettingsSectionTitle,
  type ServiceOrderSettingsEditingTarget,
} from "./admin-orders-service-order-settings-shared";
import { ServiceOrderDiscountsTable } from "./admin-orders-service-order-discounts-table";

type PageFeedback = { tone: FeedbackTone; message: string } | null;

export function AdminOrdersServiceOrderSettings({
  initialDiscounts,
  initialPrices,
  serviceOrderTypes,
  onDiscountsChange,
  onPricesChange,
}: {
  initialDiscounts: OrderDiscountTypeOption[];
  initialPrices: ServiceOrderPriceOption[];
  serviceOrderTypes: ServiceOrderTypeOption[];
  onDiscountsChange?: (rows: OrderDiscountTypeOption[]) => void;
  onPricesChange?: (rows: ServiceOrderPriceOption[]) => void;
}) {
  const supabase = getBrowserSupabaseClient();
  const { locale } = useLocale();
  const t = useTranslations("Orders");
  const ordersUiT = useTranslations("OrdersUI");
  const orderUiCopy = useMemo(() => createOrdersUiCopy(ordersUiT), [ordersUiT]);
  const serviceTypeById = useMemo(
    () =>
      new Map(
        serviceOrderTypes.map((item) => [item.id, item.business_subcategory]),
      ),
    [serviceOrderTypes],
  );
  const [prices, setPrices] = useState<ServiceOrderPriceOption[]>(() =>
    sortServicePrices(initialPrices),
  );
  const [discounts, setDiscounts] = useState<OrderDiscountTypeOption[]>(() =>
    sortOrderDiscounts(initialDiscounts),
  );
  const [editingTarget, setEditingTarget] =
    useState<ServiceOrderSettingsEditingTarget>(null);
  const [editValue, setEditValue] = useState("");
  const [priceDraft, setPriceDraft] = useState<ServiceOrderPriceDraft>({
    amountUsd: "",
    costAmountRmb: "",
  });
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<PageFeedback>(null);
  const regularDiscountId = useMemo(() => {
    const exactRegularDiscount = discounts.find(
      (row) => Number(row.discount_ratio) === 1,
    );

    return (exactRegularDiscount ?? discounts[0] ?? null)?.id ?? null;
  }, [discounts]);

  async function handleSavePrice(row: ServiceOrderPriceOption) {
    if (!supabase || pendingAction !== null) {
      return;
    }

    const parsedAmountUsd = parsePositiveAmount(priceDraft.amountUsd);
    const parsedCostAmountRmb = parseNonNegativeAmount(
      priceDraft.costAmountRmb,
    );

    if (parsedAmountUsd === null) {
      setFeedback({
        tone: "error",
        message: t("settings.serviceOrders.validation.price"),
      });
      return;
    }

    if (parsedCostAmountRmb === null) {
      setFeedback({
        tone: "error",
        message: t("settings.serviceOrders.validation.cost"),
      });
      return;
    }

    setPendingAction(`price:${row.id}`);
    setFeedback(null);

    try {
      const updated = await updateServiceOrderPriceOption(supabase, row.id, {
        amountUsd: parsedAmountUsd,
        costAmountRmb: parsedCostAmountRmb,
      });
      const nextRows = sortServicePrices(
        prices.map((item) => (item.id === updated.id ? updated : item)),
      );
      setPrices(nextRows);
      onPricesChange?.(nextRows);
      clearEditing();
      setFeedback({
        tone: "success",
        message: t("settings.serviceOrders.updateSuccess"),
      });
    } catch {
      setFeedback({
        tone: "error",
        message: t("settings.serviceOrders.errors.unknown"),
      });
    } finally {
      setPendingAction(null);
    }
  }

  async function handleSaveDiscount(row: OrderDiscountTypeOption) {
    if (!supabase || pendingAction !== null) {
      return;
    }

    const parsed = parseServiceFeeInput(editValue);

    if (!parsed.ok) {
      setFeedback({
        tone: "error",
        message: t("settings.serviceOrders.validation.discount"),
      });
      return;
    }

    setPendingAction(`discount:${row.id}`);
    setFeedback(null);

    try {
      const updated = await updateOrderDiscountType(
        supabase,
        row.id,
        parsed.value,
      );
      const nextRows = sortOrderDiscounts(
        discounts.map((item) => (item.id === updated.id ? updated : item)),
      );
      setDiscounts(nextRows);
      onDiscountsChange?.(nextRows);
      clearEditing();
      setFeedback({
        tone: "success",
        message: t("settings.serviceOrders.updateSuccess"),
      });
    } catch {
      setFeedback({
        tone: "error",
        message: t("settings.serviceOrders.errors.unknown"),
      });
    } finally {
      setPendingAction(null);
    }
  }

  function startPriceEditing(row: ServiceOrderPriceOption) {
    setEditingTarget({ kind: "price", id: row.id });
    setPriceDraft({
      amountUsd: formatAmountForInput(row.amount_usd),
      costAmountRmb: formatAmountForInput(row.cost_amount_rmb),
    });
    setFeedback(null);
  }

  function startDiscountEditing(row: OrderDiscountTypeOption) {
    setEditingTarget({ kind: "discount", id: row.id });
    setEditValue(formatRatioForInput(row.discount_ratio));
    setFeedback(null);
  }

  function clearEditing() {
    setEditingTarget(null);
    setEditValue("");
    setPriceDraft({ amountUsd: "", costAmountRmb: "" });
  }

  return (
    <DashboardListSection bodyClassName="flex flex-col gap-5">
      {feedback ? (
        <FeedbackNotice tone={feedback.tone}>{feedback.message}</FeedbackNotice>
      ) : null}

      <section className="flex flex-col gap-3">
        <ServiceOrderSettingsSectionTitle
          description={t("settings.serviceOrders.prices.description")}
          title={t("settings.serviceOrders.prices.title")}
        />
        <ServiceOrderPricesTable
          editingTarget={editingTarget}
          locale={locale}
          orderUiCopy={orderUiCopy}
          pendingAction={pendingAction}
          priceDraft={priceDraft}
          prices={prices}
          serviceTypeById={serviceTypeById}
          onCancel={clearEditing}
          onEdit={startPriceEditing}
          onPriceDraftChange={setPriceDraft}
          onSave={(row) => void handleSavePrice(row)}
        />
      </section>

      <section className="flex flex-col gap-3">
        <ServiceOrderSettingsSectionTitle
          description={t("settings.serviceOrders.discounts.description")}
          title={t("settings.serviceOrders.discounts.title")}
        />
        <ServiceOrderDiscountsTable
          discounts={discounts}
          editValue={editValue}
          editingTarget={editingTarget}
          locale={locale}
          pendingAction={pendingAction}
          regularDiscountId={regularDiscountId}
          onCancel={clearEditing}
          onDiscountDraftChange={setEditValue}
          onEdit={startDiscountEditing}
          onSave={(row) => void handleSaveDiscount(row)}
        />
      </section>
    </DashboardListSection>
  );
}

function sortServicePrices(rows: ServiceOrderPriceOption[]) {
  return [...rows].sort((left, right) => left.sort_order - right.sort_order);
}

function sortOrderDiscounts(rows: OrderDiscountTypeOption[]) {
  return [...rows].sort((left, right) => {
    const leftRatio = Number(left.discount_ratio);
    const rightRatio = Number(right.discount_ratio);
    return rightRatio - leftRatio;
  });
}

function parsePositiveAmount(value: string) {
  const parsed = Number(value.trim());

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.round(parsed * 100) / 100;
}

function parseNonNegativeAmount(value: string) {
  const parsed = Number(value.trim());

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return Math.round(parsed * 100) / 100;
}

function formatAmountForInput(value: number | string) {
  const parsed = Number(String(value).trim());

  if (!Number.isFinite(parsed)) {
    return "";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    useGrouping: false,
  }).format(parsed);
}

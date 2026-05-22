"use client";

import { LoaderCircle, PencilLine, Save, X } from "lucide-react";
import { useTranslations } from "next-intl";

import type {
  OrderDiscountTypeOption,
  ServiceOrderPriceOption,
} from "@/lib/admin-orders";
import type { Locale } from "@/lib/locale";
import { Button } from "@/components/ui/button";
import {
  DashboardTableFrame,
  dashboardFilterInputClassName,
} from "@/components/dashboard/dashboard-section-panel";

import type { OrdersUiCopy } from "./admin-orders-copy";
import {
  formatDiscountRatioValue,
  formatMoneyValue,
  formatServiceOrderSubtype,
} from "./admin-orders-utils";

export type ServiceOrderSettingsEditingTarget =
  | { kind: "discount"; id: string }
  | { kind: "price"; id: string }
  | null;

export type ServiceOrderPriceDraft = {
  amountUsd: string;
  costAmountRmb: string;
};

export function ServiceOrderPricesTable({
  editingTarget,
  locale,
  onCancel,
  onEdit,
  onPriceDraftChange,
  onSave,
  orderUiCopy,
  pendingAction,
  priceDraft,
  prices,
  serviceTypeById,
}: {
  editingTarget: ServiceOrderSettingsEditingTarget;
  locale: Locale;
  onCancel: () => void;
  onEdit: (row: ServiceOrderPriceOption) => void;
  onPriceDraftChange: (draft: ServiceOrderPriceDraft) => void;
  onSave: (row: ServiceOrderPriceOption) => void;
  orderUiCopy: OrdersUiCopy;
  pendingAction: string | null;
  priceDraft: ServiceOrderPriceDraft;
  prices: ServiceOrderPriceOption[];
  serviceTypeById: Map<string, string>;
}) {
  const t = useTranslations("Orders");

  return (
    <DashboardTableFrame>
      <table className="w-full min-w-[920px] table-fixed border-collapse">
        <thead className="bg-[#f7f5f2]">
          <tr className="border-b border-[#efebe5]">
            <HeaderCell className="w-[24%]">{t("settings.serviceOrders.table.service")}</HeaderCell>
            <HeaderCell className="w-[20%]">{t("settings.serviceOrders.table.option")}</HeaderCell>
            <HeaderCell className="w-[18%]">{t("settings.serviceOrders.table.price")}</HeaderCell>
            <HeaderCell className="w-[18%]">{t("settings.serviceOrders.table.cost")}</HeaderCell>
            <HeaderCell className="w-[20%] text-right">{t("settings.serviceOrders.table.actions")}</HeaderCell>
          </tr>
        </thead>
        <tbody>
          {prices.map((row) => {
            const isEditing =
              editingTarget?.kind === "price" && editingTarget.id === row.id;
            const isSaving = pendingAction === `price:${row.id}`;

            return (
              <tr className="border-b border-[#efebe5] last:border-b-0" key={row.id}>
                <td className="px-5 py-4 text-sm font-semibold leading-6 text-[#23313a]">
                  {formatServiceOrderSubtype(
                    serviceTypeById.get(row.service_order_type_id) ?? null,
                    orderUiCopy,
                  )}
                </td>
                <td className="px-5 py-4 text-sm leading-6 text-[#60707d]">
                  {row.display_name}
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-[#23313a]">
                  {isEditing ? (
                    <input
                      className={dashboardFilterInputClassName}
                      inputMode="decimal"
                      onChange={(event) =>
                        onPriceDraftChange({
                          ...priceDraft,
                          amountUsd: event.target.value,
                        })
                      }
                      value={priceDraft.amountUsd}
                    />
                  ) : (
                    `$${formatMoneyValue(row.amount_usd, locale)}`
                  )}
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-[#23313a]">
                  {isEditing ? (
                    <input
                      className={dashboardFilterInputClassName}
                      inputMode="decimal"
                      onChange={(event) =>
                        onPriceDraftChange({
                          ...priceDraft,
                          costAmountRmb: event.target.value,
                        })
                      }
                      value={priceDraft.costAmountRmb}
                    />
                  ) : (
                    `¥${formatMoneyValue(row.cost_amount_rmb, locale)}`
                  )}
                </td>
                <ActionsCell
                  isEditing={isEditing}
                  isSaving={isSaving}
                  pendingAction={pendingAction}
                  onCancel={onCancel}
                  onEdit={() => onEdit(row)}
                  onSave={() => onSave(row)}
                />
              </tr>
            );
          })}
        </tbody>
      </table>
    </DashboardTableFrame>
  );
}

export function ServiceOrderDiscountsTable({
  discounts,
  editValue,
  editingTarget,
  locale,
  onCancel,
  onDiscountDraftChange,
  onEdit,
  onSave,
  pendingAction,
  regularDiscountId,
}: {
  discounts: OrderDiscountTypeOption[];
  editValue: string;
  editingTarget: ServiceOrderSettingsEditingTarget;
  locale: Locale;
  onCancel: () => void;
  onDiscountDraftChange: (value: string) => void;
  onEdit: (row: OrderDiscountTypeOption) => void;
  onSave: (row: OrderDiscountTypeOption) => void;
  pendingAction: string | null;
  regularDiscountId: string | null;
}) {
  const t = useTranslations("Orders");

  return (
    <DashboardTableFrame>
      <table className="w-full min-w-[350px] table-fixed border-collapse sm:min-w-[560px]">
        <thead className="bg-[#f7f5f2]">
          <tr className="border-b border-[#efebe5]">
            <HeaderCell className="w-[44%]">
              {t("settings.serviceOrders.table.customerType")}
            </HeaderCell>
            <HeaderCell className="w-[20%]">
              {t("settings.serviceOrders.table.discount")}
            </HeaderCell>
            <HeaderCell className="w-[36%] text-right">
              {t("settings.serviceOrders.table.actions")}
            </HeaderCell>
          </tr>
        </thead>
        <tbody>
          {discounts.map((row) => {
            const isEditing =
              editingTarget?.kind === "discount" && editingTarget.id === row.id;
            const isSaving = pendingAction === `discount:${row.id}`;
            const userTypeLabel =
              row.id === regularDiscountId
                ? t("settings.serviceOrders.table.regularUser")
                : t("settings.serviceOrders.table.retailServiceVipUser");

            return (
              <tr className="border-b border-[#efebe5] last:border-b-0" key={row.id}>
                <td className="px-4 py-4 text-sm font-semibold leading-6 text-[#23313a] sm:px-5">
                  {userTypeLabel}
                </td>
                <td className="px-4 py-4 text-sm font-semibold text-[#23313a] sm:px-5">
                  {isEditing ? (
                    <input
                      className={dashboardFilterInputClassName}
                      inputMode="decimal"
                      onChange={(event) => onDiscountDraftChange(event.target.value)}
                      value={editValue}
                    />
                  ) : (
                    formatDiscountRatioValue(row.discount_ratio, locale)
                  )}
                </td>
                <ActionsCell
                  isEditing={isEditing}
                  isSaving={isSaving}
                  pendingAction={pendingAction}
                  onCancel={onCancel}
                  onEdit={() => onEdit(row)}
                  onSave={() => onSave(row)}
                />
              </tr>
            );
          })}
        </tbody>
      </table>
    </DashboardTableFrame>
  );
}

export function ServiceOrderSettingsSectionTitle({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div className="min-w-0">
      <h3 className="text-xl font-bold tracking-tight text-[#23313a] sm:text-2xl">
        {title}
      </h3>
      <p className="mt-1.5 text-sm leading-6 text-[#6f7b85] sm:leading-7">
        {description}
      </p>
    </div>
  );
}

function ActionsCell({
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
    <td className="px-4 py-4 align-top sm:px-5">
      <div className="flex flex-wrap justify-end gap-2">
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
    </td>
  );
}

function HeaderCell({
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

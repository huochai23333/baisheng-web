"use client";

import { useTranslations } from "next-intl";

import type { OrderDiscountTypeOption } from "@/lib/admin-orders";
import type { Locale } from "@/lib/locale";
import {
  DashboardTableFrame,
  dashboardFilterInputClassName,
} from "@/components/dashboard/dashboard-section-panel";

import { formatDiscountRatioValue } from "./admin-orders-utils";
import {
  ServiceOrderActionButtons,
  ServiceOrderHeaderCell as HeaderCell,
  ServiceOrderMobileField as MobileField,
  type ServiceOrderSettingsEditingTarget,
} from "./admin-orders-service-order-settings-shared";

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
    <>
      {/* 移动端用卡片展示折扣，避免操作按钮被表格压到右侧。 */}
      <div className="grid gap-3 md:hidden">
        {discounts.map((row) => {
          const isEditing =
            editingTarget?.kind === "discount" && editingTarget.id === row.id;
          const isSaving = pendingAction === `discount:${row.id}`;
          const userTypeLabel =
            row.id === regularDiscountId
              ? t("settings.serviceOrders.table.regularUser")
              : t("settings.serviceOrders.table.retailServiceVipUser");

          return (
            <article
              className="rounded-[18px] border border-[#ebe7e1] bg-white p-4 shadow-[0_10px_24px_rgba(96,113,128,0.04)]"
              key={row.id}
            >
              <h5 className="break-words text-sm font-semibold leading-6 text-[#23313a]">
                {userTypeLabel}
              </h5>
              <div className="mt-3 grid gap-3">
                <MobileField label={t("settings.serviceOrders.table.discount")}>
                  {isEditing ? (
                    <input
                      className={dashboardFilterInputClassName}
                      inputMode="decimal"
                      onChange={(event) => onDiscountDraftChange(event.target.value)}
                      value={editValue}
                    />
                  ) : (
                    <p className="text-sm font-semibold text-[#23313a]">
                      {formatDiscountRatioValue(row.discount_ratio, locale)}
                    </p>
                  )}
                </MobileField>
                <ServiceOrderActionButtons
                  isEditing={isEditing}
                  isSaving={isSaving}
                  pendingAction={pendingAction}
                  onCancel={onCancel}
                  onEdit={() => onEdit(row)}
                  onSave={() => onSave(row)}
                />
              </div>
            </article>
          );
        })}
      </div>

      <div className="hidden md:block">
        <DashboardTableFrame>
          <table className="w-full min-w-[560px] table-fixed border-collapse">
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
                    <td className="px-4 py-4 align-top sm:px-5">
                      <ServiceOrderActionButtons
                        isEditing={isEditing}
                        isSaving={isSaving}
                        pendingAction={pendingAction}
                        onCancel={onCancel}
                        onEdit={() => onEdit(row)}
                        onSave={() => onSave(row)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </DashboardTableFrame>
      </div>
    </>
  );
}

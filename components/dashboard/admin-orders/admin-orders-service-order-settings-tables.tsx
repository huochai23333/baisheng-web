"use client";

import { useTranslations } from "next-intl";

import type { ServiceOrderPriceOption } from "@/lib/admin-orders";
import type { Locale } from "@/lib/locale";
import {
  DashboardTableFrame,
  dashboardFilterInputClassName,
} from "@/components/dashboard/dashboard-section-panel";

import type { OrdersUiCopy } from "./admin-orders-copy";
import {
  formatMoneyValue,
  formatServiceOrderSubtype,
} from "./admin-orders-utils";
import {
  ServiceOrderActionButtons,
  ServiceOrderHeaderCell as HeaderCell,
  ServiceOrderMobileField as MobileField,
  type ServiceOrderPriceDraft,
  type ServiceOrderSettingsEditingTarget,
} from "./admin-orders-service-order-settings-shared";

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
    <>
      {/* 移动端用卡片展示服务价格，避免价格、成本和操作列被截断。 */}
      <div className="grid gap-3 md:hidden">
        {prices.map((row) => {
          const isEditing =
            editingTarget?.kind === "price" && editingTarget.id === row.id;
          const isSaving = pendingAction === `price:${row.id}`;
          const serviceLabel = formatServiceOrderSubtype(
            serviceTypeById.get(row.service_order_type_id) ?? null,
            orderUiCopy,
          );

          return (
            <article
              className="rounded-[18px] border border-[#ebe7e1] bg-white p-4 shadow-[0_10px_24px_rgba(96,113,128,0.04)]"
              key={row.id}
            >
              <h5 className="break-words text-sm font-semibold leading-6 text-[#23313a]">
                {serviceLabel}
              </h5>
              <div className="mt-3 grid gap-3">
                <MobileField label={t("settings.serviceOrders.table.option")}>
                  <p className="break-words text-sm leading-6 text-[#60707d]">
                    {row.display_name}
                  </p>
                </MobileField>
                <MobileField label={t("settings.serviceOrders.table.price")}>
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
                    <p className="text-sm font-semibold text-[#23313a]">
                      ${formatMoneyValue(row.amount_usd, locale)}
                    </p>
                  )}
                </MobileField>
                <MobileField label={t("settings.serviceOrders.table.cost")}>
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
                    <p className="text-sm font-semibold text-[#23313a]">
                      ¥{formatMoneyValue(row.cost_amount_rmb, locale)}
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
          <table className="w-full min-w-[920px] table-fixed border-collapse">
            <thead className="bg-[#f7f5f2]">
              <tr className="border-b border-[#efebe5]">
                <HeaderCell className="w-[24%]">
                  {t("settings.serviceOrders.table.service")}
                </HeaderCell>
                <HeaderCell className="w-[20%]">
                  {t("settings.serviceOrders.table.option")}
                </HeaderCell>
                <HeaderCell className="w-[18%]">
                  {t("settings.serviceOrders.table.price")}
                </HeaderCell>
                <HeaderCell className="w-[18%]">
                  {t("settings.serviceOrders.table.cost")}
                </HeaderCell>
                <HeaderCell className="w-[20%] text-right">
                  {t("settings.serviceOrders.table.actions")}
                </HeaderCell>
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

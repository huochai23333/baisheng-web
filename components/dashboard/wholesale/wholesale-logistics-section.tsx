"use client";
import { UiMessage } from "@/components/i18n/ui-message";
import { useLocale, useTranslations } from "next-intl";
import { PackageCheck } from "lucide-react";
import type {
  WholesaleCustomer,
  WholesaleLogisticsOrder,
  WholesaleOrder,
} from "@/lib/wholesale";
import type { WholesaleLogisticsStatus } from "@/lib/wholesale-logistics-statuses";
import {
  formatCurrency,
  formatDateTime,
  getCustomerName,
} from "./wholesale-display";
import {
  WholesaleEmptyState,
  WholesaleField,
  WholesalePageShell,
  WholesalePanel,
  WholesaleSelect,
  WholesaleStatusBadge,
  WholesaleSubmitButton,
  WholesaleTable,
  WholesaleTd,
  WholesaleTh,
  wholesaleStickyFirstTdClassName,
  wholesaleStickyFirstThClassName,
} from "./wholesale-ui";
type WholesaleLogisticsSectionProps = {
  canEdit: boolean;
  customers: WholesaleCustomer[];
  customersById: Map<string, WholesaleCustomer>;
  logisticsOrders: WholesaleLogisticsOrder[];
  logisticsStatuses: WholesaleLogisticsStatus[];
  onCreateLogisticsStatus: (formData: FormData) => Promise<boolean>;
  orders: WholesaleOrder[];
  pendingKey: string | null;
};
export function WholesaleLogisticsSection({
  canEdit,
  customers,
  customersById,
  logisticsOrders,
  logisticsStatuses,
  onCreateLogisticsStatus,
  orders,
  pendingKey,
}: WholesaleLogisticsSectionProps) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_logistics_section",
  );
  const t = useTranslations("WholesaleBusiness.logisticsUi");
  const locale = useLocale();
  const ordersById = new Map(orders.map((order) => [order.id, order]));
  return (
    <WholesalePageShell
      description={uiText("attribute001")}
      eyebrow={uiText("attribute002")}
      title={uiText("attribute003")}
    >
      {canEdit ? (
        <WholesalePanel
          description={uiText("attribute004")}
          title={uiText("attribute005")}
        >
          <form
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
            onSubmit={async (event) => {
              event.preventDefault();
              const form = event.currentTarget;
              const succeeded = await onCreateLogisticsStatus(
                new FormData(form),
              );
              // 只有数据库确认成功后才清空物流号和客户信息。
              if (succeeded) form.reset();
            }}
          >
            <WholesaleField
              label={uiText("attribute006")}
              name="tracking_number"
              placeholder={uiText("attribute007")}
              required
            />
            <WholesaleField
              label={uiText("attribute008")}
              name="customer_name"
              placeholder={uiText("attribute009")}
              required
            />
            <WholesaleSelect label={uiText("attribute010")} name="customer_id">
              <option value="">
                <UiMessage id="components_dashboard_wholesale_wholesale_logistics_section.text001" />
              </option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.unique_name}
                </option>
              ))}
            </WholesaleSelect>
            <WholesaleSelect
              label={uiText("attribute011")}
              name="wholesale_order_id"
            >
              <option value="">
                <UiMessage id="components_dashboard_wholesale_wholesale_logistics_section.text002" />
              </option>
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.order_number}
                </option>
              ))}
            </WholesaleSelect>
            <div className="flex justify-end md:col-span-2 xl:col-span-4">
              <WholesaleSubmitButton
                pending={pendingKey === "logistics-status:create"}
              >
                <UiMessage id="components_dashboard_wholesale_wholesale_logistics_section.text003" />
              </WholesaleSubmitButton>
            </div>
          </form>
        </WholesalePanel>
      ) : null}

      <WholesalePanel
        description={uiText("attribute012")}
        title={uiText("attribute013")}
      >
        {logisticsStatuses.length === 0 ? (
          <WholesaleEmptyState
            description={uiText("attribute014")}
            icon={<PackageCheck className="size-5" />}
            title={uiText("attribute015")}
          />
        ) : (
          <WholesaleTable minWidth={1180}>
            <thead>
              <tr>
                <WholesaleTh className={wholesaleStickyFirstThClassName}>
                  <UiMessage id="components_dashboard_wholesale_wholesale_logistics_section.text004" />
                </WholesaleTh>
                <WholesaleTh>
                  <UiMessage id="components_dashboard_wholesale_wholesale_logistics_section.text005" />
                </WholesaleTh>
                <WholesaleTh>
                  <UiMessage id="components_dashboard_wholesale_wholesale_logistics_section.text006" />
                </WholesaleTh>
                <WholesaleTh>
                  <UiMessage id="components_dashboard_wholesale_wholesale_logistics_section.text007" />
                </WholesaleTh>
                <WholesaleTh>
                  <UiMessage id="components_dashboard_wholesale_wholesale_logistics_section.text008" />
                </WholesaleTh>
                <WholesaleTh>
                  <UiMessage id="components_dashboard_wholesale_wholesale_logistics_section.text009" />
                </WholesaleTh>
                <WholesaleTh>
                  <UiMessage id="components_dashboard_wholesale_wholesale_logistics_section.text010" />
                </WholesaleTh>
              </tr>
            </thead>
            <tbody>
              {logisticsStatuses.map((row) => (
                <tr className="group" key={row.id}>
                  <WholesaleTd className={wholesaleStickyFirstTdClassName}>
                    <div className="font-semibold [overflow-wrap:anywhere]">
                      {row.tracking_number}
                    </div>
                    {row.last_error ? (
                      <div className="mt-2 text-xs leading-5 text-[#a46a1f]">
                        <UiMessage id="components_dashboard_wholesale_wholesale_logistics_section.text011" />
                      </div>
                    ) : null}
                  </WholesaleTd>
                  <WholesaleTd className="min-w-[160px] whitespace-normal">
                    {row.customer_id
                      ? getCustomerName(customersById, row.customer_id)
                      : row.customer_name}
                  </WholesaleTd>
                  <WholesaleTd>
                    {row.wholesale_order_id
                      ? (ordersById.get(row.wholesale_order_id)?.order_number ??
                        t("notLinked"))
                      : t("notLinked")}
                  </WholesaleTd>
                  <WholesaleTd className="min-w-[240px] whitespace-normal">
                    {row.status_text}
                  </WholesaleTd>
                  <WholesaleTd>
                    <WholesaleStatusBadge tone={getLogisticsStatusTone(row)}>
                      {t(`statuses.${row.status_kind}`)}
                    </WholesaleStatusBadge>
                  </WholesaleTd>
                  <WholesaleTd>
                    {formatDateTime(
                      row.last_checked_at,
                      t("notRecorded"),
                      locale,
                    )}
                  </WholesaleTd>
                  <WholesaleTd>
                    {row.is_terminal
                      ? t("stoppedChecking")
                      : formatDateTime(
                          row.next_check_at,
                          t("notRecorded"),
                          locale,
                        )}
                  </WholesaleTd>
                </tr>
              ))}
            </tbody>
          </WholesaleTable>
        )}
      </WholesalePanel>

      {logisticsOrders.length > 0 ? (
        <WholesalePanel
          description={uiText("attribute016")}
          title={uiText("attribute017")}
        >
          <WholesaleTable minWidth={1180}>
            <thead>
              <tr>
                <WholesaleTh className={wholesaleStickyFirstThClassName}>
                  <UiMessage id="components_dashboard_wholesale_wholesale_logistics_section.text012" />
                </WholesaleTh>
                <WholesaleTh>
                  <UiMessage id="components_dashboard_wholesale_wholesale_logistics_section.text013" />
                </WholesaleTh>
                <WholesaleTh>
                  <UiMessage id="components_dashboard_wholesale_wholesale_logistics_section.text014" />
                </WholesaleTh>
                <WholesaleTh>
                  <UiMessage id="components_dashboard_wholesale_wholesale_logistics_section.text015" />
                </WholesaleTh>
                <WholesaleTh>
                  <UiMessage id="components_dashboard_wholesale_wholesale_logistics_section.text016" />
                </WholesaleTh>
                <WholesaleTh>
                  <UiMessage id="components_dashboard_wholesale_wholesale_logistics_section.text017" />
                </WholesaleTh>
                <WholesaleTh>
                  <UiMessage id="components_dashboard_wholesale_wholesale_logistics_section.text018" />
                </WholesaleTh>
                <WholesaleTh>
                  <UiMessage id="components_dashboard_wholesale_wholesale_logistics_section.text019" />
                </WholesaleTh>
              </tr>
            </thead>
            <tbody>
              {logisticsOrders.map((row) => (
                <tr className="group" key={row.id}>
                  <WholesaleTd className={wholesaleStickyFirstTdClassName}>
                    <div className="font-semibold [overflow-wrap:anywhere]">
                      {row.international_tracking_number}
                    </div>
                    <div className="mt-2 text-xs leading-5 text-[#71808d]">
                      <UiMessage id="components_dashboard_wholesale_wholesale_logistics_section.text020" />
                      {row.destination_tracking_number ?? t("notRecorded")}
                    </div>
                  </WholesaleTd>
                  <WholesaleTd>
                    {getCustomerName(customersById, row.customer_id)}
                  </WholesaleTd>
                  <WholesaleTd>
                    {row.source_workflow_order_number ?? t("notRecorded")}
                  </WholesaleTd>
                  <WholesaleTd>
                    {row.wholesale_order_id
                      ? (ordersById.get(row.wholesale_order_id)?.order_number ??
                        t("notLinked"))
                      : t("notLinked")}
                  </WholesaleTd>
                  <WholesaleTd>
                    {row.freight_forwarder ?? t("notRecorded")}
                  </WholesaleTd>
                  <WholesaleTd>
                    {row.latest_status ?? t("notRecorded")}
                  </WholesaleTd>
                  <WholesaleTd>
                    {formatCurrency(row.logistics_fee, row.currency)}
                  </WholesaleTd>
                  <WholesaleTd>
                    {formatDateTime(
                      row.latest_checkpoint_at ?? row.updated_at,
                      t("notRecorded"),
                      locale,
                    )}
                  </WholesaleTd>
                </tr>
              ))}
            </tbody>
          </WholesaleTable>
        </WholesalePanel>
      ) : null}
    </WholesalePageShell>
  );
}
function getLogisticsStatusTone(row: WholesaleLogisticsStatus) {
  if (row.status_kind === "delivered") {
    return "success";
  }
  if (row.status_kind === "exception" || row.status_kind === "stopped") {
    return "danger";
  }
  return "warning";
}

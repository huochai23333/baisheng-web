"use client";
import { UiMessage } from "@/components/i18n/ui-message";
import { useTranslations } from "next-intl";
import { Link2, PencilLine, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WholesaleCustomer, WholesaleProfile } from "@/lib/wholesale";
import { WholesaleCustomerOtherNames } from "./wholesale-customer-other-names";
import { WholesaleDetailGrid } from "./wholesale-detail-grid";
import {
  formatDate,
  getProfileName,
  WHOLESALE_STATUS_LABELS,
} from "./wholesale-display";
import {
  WholesaleEmptyState,
  WholesaleSelect,
  WholesaleStatusBadge,
  WholesaleSubmitButton,
} from "./wholesale-ui";
type WholesaleCustomerDetailsProps = {
  canEdit: boolean;
  canLinkAccount: boolean;
  customer: WholesaleCustomer;
  linkedRegisteredUserIds: Set<string>;
  onAddOtherName: (formData: FormData) => Promise<boolean>;
  onDeleteCustomer: () => void;
  onEditCustomer: () => void;
  onLinkRegisteredUser: (formData: FormData) => Promise<boolean>;
  pendingKey: string | null;
  profilesById: Map<string, WholesaleProfile>;
  registeredAccounts: WholesaleProfile[];
};
export function WholesaleCustomerDetails({
  canEdit,
  canLinkAccount,
  customer,
  linkedRegisteredUserIds,
  onAddOtherName,
  onDeleteCustomer,
  onEditCustomer,
  onLinkRegisteredUser,
  pendingKey,
  profilesById,
  registeredAccounts,
}: WholesaleCustomerDetailsProps) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_customer_details",
  );
  const linkedProfile = customer.registered_user_id
    ? profilesById.get(customer.registered_user_id)
    : null;
  const availableRegisteredAccounts = registeredAccounts.filter(
    (profile) => !linkedRegisteredUserIds.has(profile.user_id),
  );
  const rows = [
    { label: "客户唯一名称", value: customer.unique_name },
    { label: "联系方式", value: customer.contact_details ?? "未记录" },
    { label: "客户来源", value: customer.source ?? "未记录" },
    {
      label: "关联业务员",
      value: getProfileName(profilesById, customer.assigned_sales_user_id),
    },
    {
      label: "客户类型",
      value: (
        <WholesaleStatusBadge>
          {WHOLESALE_STATUS_LABELS[customer.customer_kind]}
        </WholesaleStatusBadge>
      ),
    },
    {
      label: "关联注册账号",
      value: linkedProfile
        ? getRegisteredAccountLabel(linkedProfile)
        : "未关联",
    },
    { label: "登记时间", value: formatDate(customer.created_at) },
    { label: "备注", value: customer.notes ?? "未记录" },
  ];
  return (
    <div className="space-y-5">
      {canEdit ? (
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            className="h-9 rounded-full border border-[#d8e2e8] bg-white px-3 text-xs text-[#486782] hover:bg-[#eef3f6]"
            onClick={onEditCustomer}
            type="button"
            variant="outline"
          >
            <PencilLine className="size-3.5" />
            <UiMessage id="components_dashboard_wholesale_wholesale_customer_details.text001" />
          </Button>
          <Button
            className="h-9 rounded-full border border-[#f0caca] bg-white px-3 text-xs text-[#a33b3b] hover:bg-[#fff1f1]"
            onClick={onDeleteCustomer}
            type="button"
            variant="outline"
          >
            <Trash2 className="size-3.5" />
            <UiMessage id="components_dashboard_wholesale_wholesale_customer_details.text002" />
          </Button>
        </div>
      ) : null}
      <WholesaleDetailGrid rows={rows} />
      <WholesaleCustomerOtherNames
        canEdit={canEdit}
        customer={customer}
        onAddOtherName={onAddOtherName}
        pending={pendingKey === `customer:add-other-name:${customer.id}`}
      />
      {customer.registered_user_id ? (
        <p className="rounded-[18px] border border-[#dfe8df] bg-[#f5fbf5] px-4 py-3 text-sm leading-6 text-[#42614b]">
          <UiMessage id="components_dashboard_wholesale_wholesale_customer_details.text003" />
        </p>
      ) : canLinkAccount ? (
        <div className="rounded-[18px] border border-[#ebe7e1] bg-white p-4">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#263640]">
            <Link2 className="size-4 text-[#486782]" />
            <UiMessage id="components_dashboard_wholesale_wholesale_customer_details.text004" />
          </div>
          {availableRegisteredAccounts.length > 0 ? (
            <form
              className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]"
              onSubmit={async (event) => {
                event.preventDefault();
                // 关联失败时不改变当前选择，错误信息由页面统一反馈区展示。
                await onLinkRegisteredUser(new FormData(event.currentTarget));
              }}
            >
              <input name="customer_id" type="hidden" value={customer.id} />
              <WholesaleSelect
                label={uiText("attribute001")}
                name="registered_user_id"
                required
              >
                <option value="">
                  <UiMessage id="components_dashboard_wholesale_wholesale_customer_details.text005" />
                </option>
                {availableRegisteredAccounts.map((profile) => (
                  <option key={profile.user_id} value={profile.user_id}>
                    {getRegisteredAccountLabel(profile)}
                  </option>
                ))}
              </WholesaleSelect>
              <div className="flex items-end justify-end">
                <WholesaleSubmitButton
                  pending={
                    pendingKey === `customer:link-account:${customer.id}`
                  }
                >
                  <UiMessage id="components_dashboard_wholesale_wholesale_customer_details.text006" />
                </WholesaleSubmitButton>
              </div>
              <p className="text-sm leading-6 text-[#6f7b85] sm:col-span-2">
                <UiMessage id="components_dashboard_wholesale_wholesale_customer_details.text007" />
              </p>
            </form>
          ) : (
            <WholesaleEmptyState
              description={uiText("attribute002")}
              icon={<Link2 className="size-5" />}
              title={uiText("attribute003")}
            />
          )}
        </div>
      ) : null}
    </div>
  );
}
function getRegisteredAccountLabel(profile: WholesaleProfile) {
  const displayName = profile.name?.trim() || "未填写姓名";
  const contact = [profile.email, profile.phone].filter(Boolean).join(" / ");
  return contact ? `${displayName}（${contact}）` : displayName;
}

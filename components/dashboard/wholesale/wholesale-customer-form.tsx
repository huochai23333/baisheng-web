"use client";

import * as FormControls from "@/components/ui/form-controls";
import { UiMessage } from "@/components/i18n/ui-message";
import { useTranslations } from "next-intl";
import type { FormEvent } from "react";
import { DashboardFilterField } from "@/components/dashboard/dashboard-section-panel";
import { Select } from "@/components/ui/select";
import type { WholesaleCustomer, WholesaleProfile } from "@/lib/wholesale";
import { getProfileName } from "./wholesale-display";
import {
  WholesaleField,
  WholesaleSubmitButton,
  WholesaleTextarea,
} from "./wholesale-ui";
type WholesaleCustomerFormProps = {
  canAssignSalesUser: boolean;
  currentUserId: string | null;
  customer?: WholesaleCustomer;
  mode: "create" | "edit";
  onSaved: () => void;
  onSubmit: (formData: FormData) => boolean | Promise<boolean>;
  pending: boolean;
  profilesById: Map<string, WholesaleProfile>;
  salesAccounts: WholesaleProfile[];
};
export function WholesaleCustomerForm({
  canAssignSalesUser,
  currentUserId,
  customer,
  mode,
  onSaved,
  onSubmit,
  pending,
  profilesById,
  salesAccounts,
}: WholesaleCustomerFormProps) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_customer_form",
  );
  const fixedSalesUserId =
    mode === "create"
      ? currentUserId
      : (customer?.assigned_sales_user_id ?? null);
  const fixedSalesUserName = fixedSalesUserId
    ? getProfileName(profilesById, fixedSalesUserId)
    : "暂不分配";
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const saved = await onSubmit(new FormData(form));
    if (!saved) {
      return;
    }
    if (mode === "create") {
      form.reset();
    }
    onSaved();
  };
  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
      {customer ? (
        <FormControls.Input
          name="customer_id"
          type="hidden"
          value={customer.id}
        />
      ) : null}
      <WholesaleField
        defaultValue={customer?.unique_name}
        label={uiText("attribute001")}
        name="unique_name"
        required
      />
      {canAssignSalesUser ? (
        <DashboardFilterField label={uiText("attribute002")}>
          <Select
            aria-label={uiText("attribute002")}
            defaultValue={customer?.assigned_sales_user_id ?? ""}
            name="assigned_sales_user_id"
            options={[
              {
                label: (
                  <UiMessage id="components_dashboard_wholesale_wholesale_customer_form.text001" />
                ),
                value: "",
              },
              ...salesAccounts.map((profile) => ({
                label: profile.name || profile.email,
                value: profile.user_id,
              })),
            ]}
          />
        </DashboardFilterField>
      ) : (
        <div className="min-w-0 rounded-[18px] border border-border-subtle bg-white px-4 py-3">
          <FormControls.Input
            name="assigned_sales_user_id"
            type="hidden"
            value={fixedSalesUserId ?? ""}
          />
          <p className="text-xs font-semibold text-content-muted">
            <UiMessage id="components_dashboard_wholesale_wholesale_customer_form.text002" />
          </p>
          <p className="mt-2 break-words text-sm font-medium text-content-strong">
            {fixedSalesUserName}
          </p>
        </div>
      )}
      <div className="md:col-span-2">
        <WholesaleTextarea
          defaultValue={customer?.other_names.join("\n")}
          label={uiText("attribute003")}
          name="other_names"
          placeholder={uiText("attribute004")}
        />
      </div>
      <WholesaleField
        defaultValue={customer?.contact_details ?? undefined}
        label={uiText("attribute005")}
        name="contact_details"
      />
      <WholesaleField
        defaultValue={customer?.source ?? undefined}
        label={uiText("attribute006")}
        name="source"
      />
      <div className="md:col-span-2">
        <WholesaleTextarea
          defaultValue={customer?.notes ?? undefined}
          label={uiText("attribute007")}
          name="notes"
        />
      </div>
      <div className="flex justify-end md:col-span-2">
        <WholesaleSubmitButton pending={pending}>
          {mode === "create" ? "保存客户" : "保存修改"}
        </WholesaleSubmitButton>
      </div>
    </form>
  );
}

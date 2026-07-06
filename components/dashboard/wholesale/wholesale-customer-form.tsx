"use client";

import type { FormEvent } from "react";

import type { WholesaleCustomer, WholesaleProfile } from "@/lib/wholesale";

import { getProfileName } from "./wholesale-display";
import {
  WholesaleField,
  WholesaleSelect,
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
  const fixedSalesUserId =
    mode === "create" ? currentUserId : customer?.assigned_sales_user_id ?? null;
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
    <form
      className="grid gap-4 md:grid-cols-2"
      onSubmit={handleSubmit}
    >
      {customer ? <input name="customer_id" type="hidden" value={customer.id} /> : null}
      <WholesaleField
        defaultValue={customer?.unique_name}
        label="客户唯一标识名称"
        name="unique_name"
        required
      />
      {canAssignSalesUser ? (
        <WholesaleSelect
          defaultValue={customer?.assigned_sales_user_id ?? ""}
          label="关联业务员"
          name="assigned_sales_user_id"
        >
          <option value="">暂不分配</option>
          {salesAccounts.map((profile) => (
            <option key={profile.user_id} value={profile.user_id}>
              {profile.name || profile.email}
            </option>
          ))}
        </WholesaleSelect>
      ) : (
        <div className="min-w-0 rounded-[18px] border border-[#ebe7e1] bg-white px-4 py-3">
          <input
            name="assigned_sales_user_id"
            type="hidden"
            value={fixedSalesUserId ?? ""}
          />
          <p className="text-xs font-semibold text-[#7b8790]">关联业务员</p>
          <p className="mt-2 break-words text-sm font-medium text-[#2b3942]">
            {fixedSalesUserName}
          </p>
        </div>
      )}
      <div className="md:col-span-2">
        <WholesaleTextarea
          defaultValue={customer?.other_names.join("\n")}
          label="客户其他名称"
          name="other_names"
          placeholder="可一次填写多个，用逗号或换行分开"
        />
      </div>
      <WholesaleField
        defaultValue={customer?.contact_details ?? undefined}
        label="联系方式"
        name="contact_details"
      />
      <WholesaleField
        defaultValue={customer?.source ?? undefined}
        label="客户来源"
        name="source"
      />
      <div className="md:col-span-2">
        <WholesaleTextarea
          defaultValue={customer?.notes ?? undefined}
          label="备注"
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

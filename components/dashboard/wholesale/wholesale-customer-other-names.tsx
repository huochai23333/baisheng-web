"use client";

import { useState } from "react";

import { Plus, X } from "lucide-react";

import {
  DashboardFilterField,
  dashboardFilterInputClassName,
} from "@/components/dashboard/dashboard-section-panel";
import { Button } from "@/components/ui/button";
import type { WholesaleCustomer } from "@/lib/wholesale";

import { WholesaleSubmitButton } from "./wholesale-ui";

type WholesaleCustomerOtherNamesProps = {
  canEdit: boolean;
  customer: WholesaleCustomer;
  onAddOtherName: (formData: FormData) => void | Promise<void>;
  pending: boolean;
};

export function WholesaleCustomerOtherNames({
  canEdit,
  customer,
  onAddOtherName,
  pending,
}: WholesaleCustomerOtherNamesProps) {
  const [isAdding, setIsAdding] = useState(false);

  return (
    <section className="rounded-[18px] border border-[#ebe7e1] bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-[#263640]">其他名称</h4>
          <p className="mt-1 text-xs leading-5 text-[#6f7b85]">
            可记录客户常用昵称、店铺名或对账名称。
          </p>
        </div>
        {canEdit ? (
          <Button
            className="h-9 rounded-full border border-[#d8e2e8] bg-white px-3 text-xs text-[#486782] hover:bg-[#eef3f6]"
            onClick={() => setIsAdding((current) => !current)}
            type="button"
            variant="outline"
          >
            {isAdding ? <X className="size-3.5" /> : <Plus className="size-3.5" />}
            {isAdding ? "收起" : "新增名称"}
          </Button>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {customer.other_names.length > 0 ? (
          customer.other_names.map((name) => (
            <span
              className="rounded-full bg-[#f0efec] px-3 py-1 text-xs leading-5 text-[#53616b]"
              key={name}
            >
              {name}
            </span>
          ))
        ) : (
          <p className="text-sm leading-6 text-[#7a8791]">暂未记录其他名称。</p>
        )}
      </div>

      {isAdding ? (
        <form
          className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"
          onSubmit={async (event) => {
            event.preventDefault();
            const form = event.currentTarget;

            await onAddOtherName(new FormData(form));
            form.reset();
            setIsAdding(false);
          }}
        >
          <input name="customer_id" type="hidden" value={customer.id} />
          <DashboardFilterField label="新增其他名称">
            <input
              className={dashboardFilterInputClassName}
              name="other_names"
              placeholder="可一次填写多个，用逗号或换行分开"
              required
            />
          </DashboardFilterField>
          <div className="flex items-end justify-end">
            <WholesaleSubmitButton pending={pending}>保存名称</WholesaleSubmitButton>
          </div>
        </form>
      ) : null}
    </section>
  );
}

"use client";

import { Store } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { useDashboardConfirm } from "@/components/dashboard/dashboard-confirm-provider";
import type { WholesaleCustomer, WholesaleProfile } from "@/lib/wholesale";
import type { WholesaleLogisticsStoreAssignment } from "@/lib/wholesale-logistics-page";

import {
  formatWholesaleLogisticsDateTime,
  getWholesaleLogisticsCustomerName,
  getWholesaleLogisticsProfileName,
} from "./wholesale-logistics-display";

/**
 * 店铺归属历史单独负责展示时间区间和行级操作。
 * 这样设置弹窗只维护表单状态，初学者可以分别理解“编辑表单”和“历史列表”。
 */
export function WholesaleLogisticsAssignmentHistory({
  assignments,
  customers,
  onEdit,
  onEnd,
  pendingKey,
  profiles,
}: {
  assignments: WholesaleLogisticsStoreAssignment[];
  customers: WholesaleCustomer[];
  onEdit: (assignment: WholesaleLogisticsStoreAssignment) => void;
  onEnd: (assignmentId: string, effectiveTo: string) => Promise<boolean>;
  pendingKey: string | null;
  profiles: WholesaleProfile[];
}) {
  const confirm = useDashboardConfirm();
  const confirmT = useTranslations("DashboardFramework.confirm");
  const locale = useLocale();
  const t = useTranslations("WholesaleBusiness.logisticsArchive");
  const profilesById = useMemo(
    () => new Map(profiles.map((profile) => [profile.user_id, profile])),
    [profiles],
  );
  const customersById = useMemo(
    () => new Map(customers.map((customer) => [customer.id, customer])),
    [customers],
  );

  const endAssignment = async (assignment: WholesaleLogisticsStoreAssignment) => {
    // 结束会改变此后的订单归属，因此提交前让业务人员再次确认店铺名称。
    if (!(await confirm({
      description: t("assignments.confirmEnd", { store: assignment.store_name }),
      title: confirmT("title"),
      tone: "warning",
    }))) {
      return;
    }
    await onEnd(assignment.id, new Date().toISOString());
  };

  return (
    <section>
      <div className="flex min-w-0 items-center gap-2">
        <Store className="size-5 shrink-0 text-[#486782]" />
        <h4 className="font-semibold text-[#23313a]">
          {t("assignments.history")}
        </h4>
      </div>
      <div className="mt-3 grid gap-3">
        {assignments.length === 0 ? (
          <p className="rounded-[18px] border border-dashed border-[#d9dfe3] p-4 text-sm text-[#77838c]">
            {t("assignments.noHistory")}
          </p>
        ) : (
          assignments.map((assignment) => (
            <article
              className="min-w-0 rounded-[18px] border border-[#e5e1da] bg-white p-4"
              key={assignment.id}
            >
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="break-words font-semibold text-[#23313a]">
                    {assignment.store_name}
                  </p>
                  <p className="mt-1 break-words text-sm text-[#596771]">
                    {getWholesaleLogisticsProfileName(
                      profilesById,
                      assignment.sales_user_id,
                      t("fallbacks.unassigned"),
                    )}
                    {" · "}
                    {getWholesaleLogisticsCustomerName(
                      customersById,
                      assignment.customer_id,
                      t("fallbacks.noCustomer"),
                    )}
                  </p>
                  <p className="mt-1 break-words text-xs leading-5 text-[#7b868e]">
                    {t("assignments.range", {
                      from: assignment.effective_from
                        ? formatWholesaleLogisticsDateTime(assignment.effective_from, locale)
                        : t("assignments.allHistory"),
                      to: assignment.effective_to
                        ? formatWholesaleLogisticsDateTime(assignment.effective_to, locale)
                        : t("assignments.current"),
                    })}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button
                    className="min-h-9 whitespace-normal rounded-full"
                    disabled={Boolean(pendingKey)}
                    onClick={() => onEdit(assignment)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    {t("assignments.adjust")}
                  </Button>
                  {!assignment.effective_to ? (
                    <Button
                      className="min-h-9 whitespace-normal rounded-full text-[#a33d38]"
                      disabled={Boolean(pendingKey)}
                      onClick={() => void endAssignment(assignment)}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      {pendingKey === `end:${assignment.id}`
                        ? t("assignments.ending")
                        : t("assignments.end")}
                    </Button>
                  ) : null}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

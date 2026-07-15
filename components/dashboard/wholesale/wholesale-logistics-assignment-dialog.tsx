"use client";

import { Search, UserRoundCog } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { DashboardDialog } from "@/components/dashboard/dashboard-dialog";
import { PageBanner } from "@/components/dashboard/dashboard-shared-ui";
import {
  DashboardFilterField,
  dashboardFilterInputClassName,
} from "@/components/dashboard/dashboard-section-panel";
import { Button } from "@/components/ui/button";
import type {
  WholesaleCustomer,
  WholesaleProfile,
} from "@/lib/wholesale";
import type {
  WholesaleLogisticsStoreAssignment,
  WholesaleLogisticsStoreOption,
} from "@/lib/wholesale-logistics-page";
import { cn } from "@/lib/utils";

import {
  getActiveSalesProfiles,
} from "./wholesale-logistics-display";
import { WholesaleLogisticsAssignmentHistory } from "./wholesale-logistics-assignment-history";

type AssignmentSaveInput = {
  assignmentId: string;
  customerId: string | null;
  effectiveFrom: string | null;
  salesUserId: string;
};

export function WholesaleLogisticsAssignmentDialog({
  assignments,
  customers,
  feedback,
  onAssign,
  onChange,
  onDismissFeedback,
  onEnd,
  onOpenChange,
  open,
  pendingKey,
  profiles,
  storeOptions,
}: {
  assignments: WholesaleLogisticsStoreAssignment[];
  customers: WholesaleCustomer[];
  feedback: { message: string; tone: "error" | "success" } | null;
  onAssign: (
    storeNames: string[],
    salesUserId: string,
    customerId: string | null,
  ) => Promise<boolean>;
  onChange: (input: AssignmentSaveInput) => Promise<boolean>;
  onDismissFeedback: () => void;
  onEnd: (assignmentId: string, effectiveTo: string) => Promise<boolean>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  pendingKey: string | null;
  profiles: WholesaleProfile[];
  storeOptions: WholesaleLogisticsStoreOption[];
}) {
  const t = useTranslations("WholesaleBusiness.logisticsArchive");
  const [editing, setEditing] = useState<WholesaleLogisticsStoreAssignment | null>(null);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [storeSearch, setStoreSearch] = useState("");
  const [salesUserId, setSalesUserId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [splitFromDate, setSplitFromDate] = useState("");
  const [splitInterval, setSplitInterval] = useState(false);
  const [openedAt, setOpenedAt] = useState(0);
  const salesProfiles = getActiveSalesProfiles(profiles);

  useEffect(() => {
    if (!open) return;
    setEditing(null);
    setSelectedStores([]);
    setStoreSearch("");
    setSalesUserId("");
    setCustomerId("");
    setSplitFromDate("");
    setSplitInterval(false);
    // 弹窗打开时固定一个参考时间，渲染期间不再调用当前时间，保证列表判断稳定。
    setOpenedAt(Date.now());
  }, [open]);

  const currentlyAssignedStores = useMemo(() => {
    return new Set(
      assignments
        .filter((assignment) => {
          const from = assignment.effective_from
            ? new Date(assignment.effective_from).getTime()
            : Number.NEGATIVE_INFINITY;
          const to = assignment.effective_to
            ? new Date(assignment.effective_to).getTime()
            : Number.POSITIVE_INFINITY;
          return from <= openedAt && openedAt < to;
        })
        .map((assignment) => normalizeStoreName(assignment.store_name)),
    );
  }, [assignments, openedAt]);
  const selectableStores = storeOptions.filter((option) => {
    const normalized = normalizeStoreName(option.store_name);
    return (
      !currentlyAssignedStores.has(normalized) &&
      normalized.includes(normalizeStoreName(storeSearch))
    );
  });

  const startEditing = (assignment: WholesaleLogisticsStoreAssignment) => {
    setEditing(assignment);
    setSalesUserId(assignment.sales_user_id);
    setCustomerId(assignment.customer_id ?? "");
    setSplitFromDate("");
    setSplitInterval(false);
  };

  const save = async () => {
    if (!salesUserId) return;

    if (!editing) {
      if (selectedStores.length === 0) return;
      const succeeded = await onAssign(
        selectedStores,
        salesUserId,
        customerId || null,
      );
      if (succeeded) {
        setSelectedStores([]);
        setSalesUserId("");
        setCustomerId("");
      }
      return;
    }

    const effectiveFrom = splitInterval && splitFromDate
      ? new Date(`${splitFromDate}T00:00:00+08:00`).toISOString()
      : null;
    const succeeded = await onChange({
      assignmentId: editing.id,
      customerId: customerId || null,
      effectiveFrom,
      salesUserId,
    });
    if (succeeded) setEditing(null);
  };

  const saving = pendingKey === "assign" || pendingKey?.startsWith("change:");

  return (
    <DashboardDialog
      actions={
        <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
          {editing ? (
            <Button
              className="min-h-10 whitespace-normal rounded-full"
              disabled={saving}
              onClick={() => setEditing(null)}
              type="button"
              variant="outline"
            >
              {t("assignments.back")}
            </Button>
          ) : null}
          <Button
            className="min-h-10 whitespace-normal rounded-full bg-[#486782] text-white hover:bg-[#3e5f79]"
            disabled={
              saving ||
              !salesUserId ||
              (!editing && selectedStores.length === 0) ||
              (Boolean(editing) && splitInterval && !splitFromDate)
            }
            onClick={() => void save()}
            type="button"
          >
            {saving ? t("assignments.saving") : t("assignments.save")}
          </Button>
        </div>
      }
      description={t("assignments.description")}
      onOpenChange={onOpenChange}
      open={open}
      title={t("assignments.title")}
    >
      <div className="space-y-6">
        {feedback ? (
          <div role={feedback.tone === "error" ? "alert" : "status"}>
            <PageBanner tone={feedback.tone}>
              <div className="flex min-w-0 items-start justify-between gap-3">
                <span className="min-w-0 break-words">{feedback.message}</span>
                <button
                  className="shrink-0 text-xs font-semibold underline underline-offset-2"
                  onClick={onDismissFeedback}
                  type="button"
                >
                  {t("actions.dismiss")}
                </button>
              </div>
            </PageBanner>
          </div>
        ) : null}

        <section className="rounded-[22px] border border-[#e5e1da] bg-white p-4 sm:p-5">
          <div className="flex min-w-0 items-center gap-2">
            <UserRoundCog className="size-5 shrink-0 text-[#486782]" />
            <h4 className="break-words font-semibold text-[#23313a]">
              {editing
                ? t("assignments.adjustStore", { store: editing.store_name })
                : t("assignments.newAssignment")}
            </h4>
          </div>

          {!editing ? (
            <div className="mt-4 space-y-3">
              <DashboardFilterField label={t("assignments.chooseStores")}>
                <label className="relative block">
                  <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#8a949c]" />
                  <input
                    className={`${dashboardFilterInputClassName} pl-10`}
                    onChange={(event) => setStoreSearch(event.target.value)}
                    placeholder={t("assignments.searchStores")}
                    type="search"
                    value={storeSearch}
                  />
                </label>
              </DashboardFilterField>
              <div className="max-h-52 overflow-y-auto rounded-[18px] border border-[#e3e7ea] bg-[#fbfaf8] p-2">
                {selectableStores.length === 0 ? (
                  <p className="p-3 text-sm leading-6 text-[#77838c]">
                    {t("assignments.noStores")}
                  </p>
                ) : (
                  selectableStores.map((option) => {
                    const checked = selectedStores.includes(option.store_name);
                    return (
                      <label
                        className={cn(
                          "flex min-w-0 cursor-pointer items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm",
                          checked ? "bg-[#eaf1f5] text-[#314b60]" : "hover:bg-white",
                        )}
                        key={option.store_name}
                      >
                        <input
                          checked={checked}
                          className="size-4 shrink-0 accent-[#486782]"
                          onChange={() =>
                            setSelectedStores((current) =>
                              checked
                                ? current.filter((name) => name !== option.store_name)
                                : [...current, option.store_name],
                            )
                          }
                          type="checkbox"
                        />
                        <span className="min-w-0 flex-1 break-words">
                          {option.store_name}
                        </span>
                        <span className="shrink-0 text-xs text-[#77838c]">
                          {t("assignments.orderCount", { count: option.order_count })}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          ) : null}

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <DashboardFilterField label={t("assignments.sales")}>
              <select
                className={dashboardFilterInputClassName}
                onInput={(event) => setSalesUserId(event.currentTarget.value)}
                value={salesUserId}
              >
                <option value="">{t("assignments.chooseSales")}</option>
                {salesProfiles.map((profile) => (
                  <option key={profile.user_id} value={profile.user_id}>
                    {profile.name || profile.email || t("fallbacks.unnamedSales")}
                  </option>
                ))}
              </select>
            </DashboardFilterField>
            <DashboardFilterField label={t("assignments.customer")}>
              <select
                className={dashboardFilterInputClassName}
                onInput={(event) => setCustomerId(event.currentTarget.value)}
                value={customerId}
              >
                <option value="">{t("assignments.noCustomer")}</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.unique_name}
                  </option>
                ))}
              </select>
            </DashboardFilterField>
          </div>

          {editing ? (
            <div className="mt-4 rounded-[18px] border border-[#e3e7ea] bg-[#fbfaf8] p-3 sm:p-4">
              <label className="flex min-w-0 items-start gap-3 text-sm text-[#33434d]">
                <input
                  checked={!splitInterval}
                  className="mt-0.5 size-4 shrink-0 accent-[#486782]"
                  onChange={() => setSplitInterval(false)}
                  type="radio"
                />
                <span className="min-w-0 break-words">
                  {t("assignments.wholeInterval")}
                </span>
              </label>
              <label className="mt-3 flex min-w-0 items-start gap-3 text-sm text-[#33434d]">
                <input
                  checked={splitInterval}
                  className="mt-0.5 size-4 shrink-0 accent-[#486782]"
                  onChange={() => setSplitInterval(true)}
                  type="radio"
                />
                <span className="min-w-0 flex-1 break-words">
                  {t("assignments.fromDate")}
                  {splitInterval ? (
                    <input
                      className={`${dashboardFilterInputClassName} mt-2`}
                      onChange={(event) => setSplitFromDate(event.target.value)}
                      type="date"
                      value={splitFromDate}
                    />
                  ) : null}
                </span>
              </label>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-[#6f7b85]">
              {t("assignments.historyDefault")}
            </p>
          )}
        </section>

        {!editing ? (
          <WholesaleLogisticsAssignmentHistory
            assignments={assignments}
            customers={customers}
            onEdit={startEditing}
            onEnd={onEnd}
            pendingKey={pendingKey}
            profiles={profiles}
          />
        ) : null}
      </div>
    </DashboardDialog>
  );
}

function normalizeStoreName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

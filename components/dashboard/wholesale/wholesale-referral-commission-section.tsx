"use client";

import { ResponsiveDataView } from "@/components/ui/responsive-data-view";

import * as FormControls from "@/components/ui/form-controls";
import { UiMessage } from "@/components/i18n/ui-message";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Calculator, RefreshCcw } from "lucide-react";
import {
  DashboardFilterField,
  DashboardListSection,
  DashboardTableFrame,
  dashboardFilterInputClassName,
} from "@/components/dashboard/dashboard-section-panel";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { normalizeSearchText } from "@/lib/value-normalizers";
import type { WholesaleCustomer } from "@/lib/wholesale";
import {
  formatCurrency,
  formatNumber,
  getCustomerName,
} from "./wholesale-display";
import {
  WholesaleEmptyState,
  WholesalePageShell,
  WholesaleStatGrid,
  WholesaleTd,
  WholesaleTh,
} from "./wholesale-ui";
import type { WholesaleReferralCommissionRow } from "./wholesale-referral-commission";
const ALL = "all";
export function WholesaleReferralCommissionSection({
  customersById,
  referralRows,
}: {
  customersById: Map<string, WholesaleCustomer>;
  referralRows: WholesaleReferralCommissionRow[];
}) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_referral_commission_section",
  );
  const [search, setSearch] = useState("");
  const [customerFilter, setCustomerFilter] = useState(ALL);
  const filteredRows = useMemo(() => {
    const searchValue = normalizeSearchText(search);
    return referralRows.filter((row) => {
      if (
        customerFilter !== ALL &&
        row.referrerCustomerId !== customerFilter &&
        row.referredCustomerId !== customerFilter
      ) {
        return false;
      }
      if (!searchValue) return true;
      return [
        getCustomerName(customersById, row.referrerCustomerId),
        getCustomerName(customersById, row.referredCustomerId),
        row.orderNumbers.join(" "),
        row.monthKey,
      ].some((value) => normalizeSearchText(value).includes(searchValue));
    });
  }, [customerFilter, customersById, referralRows, search]);
  const totalReferralCommission = referralRows.reduce(
    (sum, row) => sum + row.amount,
    0,
  );
  const chargedWaybillCount = referralRows.reduce(
    (sum, row) => sum + row.waybillCount,
    0,
  );
  const hasActiveFilters = search || customerFilter !== ALL;
  return (
    <WholesalePageShell
      description={uiText("attribute001")}
      eyebrow={uiText("attribute002")}
      title={uiText("attribute003")}
    >
      <WholesaleStatGrid
        stats={[
          { label: "佣金合计", value: formatCurrency(totalReferralCommission) },
          { label: "月度记录", value: `${referralRows.length}` },
          { label: "当前显示", value: `${filteredRows.length}` },
          { label: "计佣运单", value: `${chargedWaybillCount}` },
        ]}
      />
      <DashboardListSection
        actions={
          <Button
            size="default"
            disabled={!hasActiveFilters}
            onClick={() => {
              setSearch("");
              setCustomerFilter(ALL);
            }}
            type="button"
            variant="outline"
          >
            <RefreshCcw className="size-4" />
            <UiMessage id="components_dashboard_wholesale_wholesale_referral_commission_section.text001" />
          </Button>
        }
        description={`共 ${referralRows.length} 条月度佣金记录，当前显示 ${filteredRows.length} 条。`}
        title={uiText("attribute004")}
      >
        <div className="mb-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_260px]">
          <DashboardFilterField label={uiText("attribute005")}>
            <FormControls.Input
              className={dashboardFilterInputClassName}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={uiText("attribute006")}
              type="search"
              value={search}
            />
          </DashboardFilterField>
          <DashboardFilterField label={uiText("attribute007")}>
            <Select
              aria-label={uiText("attribute007")}
              onValueChange={setCustomerFilter}
              options={[
                {
                  label: (
                    <UiMessage id="components_dashboard_wholesale_wholesale_referral_commission_section.text002" />
                  ),
                  value: ALL,
                },
                ...[...customersById.values()].map((customer) => ({
                  label: customer.unique_name,
                  value: customer.id,
                })),
              ]}
              value={customerFilter}
            />
          </DashboardFilterField>
        </div>
        {filteredRows.length === 0 ? (
          <WholesaleEmptyState
            description={uiText("attribute008")}
            icon={<Calculator className="size-5" />}
            title={uiText("attribute009")}
          />
        ) : (
          <>
            <ResponsiveDataView
              desktop={
                <>
                  <DashboardTableFrame>
                    <table className="w-full table-fixed border-collapse text-left text-sm">
                      <colgroup>
                        <col className="w-[20%]" />
                        <col className="w-[20%]" />
                        <col className="w-[12%]" />
                        <col className="w-[28%]" />
                        <col className="w-[20%]" />
                      </colgroup>
                      <thead>
                        <tr>
                          <WholesaleTh className="whitespace-normal">
                            <UiMessage id="components_dashboard_wholesale_wholesale_referral_commission_section.text003" />
                          </WholesaleTh>
                          <WholesaleTh className="whitespace-normal">
                            <UiMessage id="components_dashboard_wholesale_wholesale_referral_commission_section.text004" />
                          </WholesaleTh>
                          <WholesaleTh className="whitespace-normal">
                            <UiMessage id="components_dashboard_wholesale_wholesale_referral_commission_section.text005" />
                          </WholesaleTh>
                          <WholesaleTh className="whitespace-normal">
                            <UiMessage id="components_dashboard_wholesale_wholesale_referral_commission_section.text006" />
                          </WholesaleTh>
                          <WholesaleTh className="whitespace-normal">
                            <UiMessage id="components_dashboard_wholesale_wholesale_referral_commission_section.text007" />
                          </WholesaleTh>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRows.map((row) => (
                          <tr
                            key={`${row.referrerCustomerId}-${row.referredCustomerId}-${row.monthKey}`}
                          >
                            <WholesaleTd className="whitespace-normal">
                              {getCustomerName(
                                customersById,
                                row.referrerCustomerId,
                              )}
                            </WholesaleTd>
                            <WholesaleTd className="whitespace-normal">
                              {getCustomerName(
                                customersById,
                                row.referredCustomerId,
                              )}
                            </WholesaleTd>
                            <WholesaleTd className="whitespace-normal">
                              {row.monthKey}
                            </WholesaleTd>
                            <WholesaleTd className="whitespace-normal">
                              <ReferralCommissionBreakdown row={row} />
                            </WholesaleTd>
                            <WholesaleTd className="whitespace-normal">
                              {formatCurrency(row.amount)}
                            </WholesaleTd>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </DashboardTableFrame>
                </>
              }
              mobile={
                <>
                  {filteredRows.map((row) => (
                    <div
                      className="rounded-sm border border-border-subtle bg-surface-interactive p-4"
                      key={`${row.referrerCustomerId}-${row.referredCustomerId}-${row.monthKey}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="break-words font-semibold text-content-strong">
                            {getCustomerName(
                              customersById,
                              row.referrerCustomerId,
                            )}
                          </p>
                          <p className="mt-1 break-words text-sm text-content-muted">
                            <UiMessage id="components_dashboard_wholesale_wholesale_referral_commission_section.text008" />
                            {getCustomerName(
                              customersById,
                              row.referredCustomerId,
                            )}
                          </p>
                          <p className="mt-1 text-xs text-content-muted">
                            {row.monthKey}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold text-primary">
                          {formatCurrency(row.amount)}
                        </p>
                      </div>
                      <div className="mt-3">
                        <ReferralCommissionBreakdown row={row} />
                      </div>
                    </div>
                  ))}
                </>
              }
            />
          </>
        )}
      </DashboardListSection>
    </WholesalePageShell>
  );
}
function ReferralCommissionBreakdown({
  row,
}: {
  row: WholesaleReferralCommissionRow;
}) {
  return (
    <div className="grid gap-1 text-xs leading-5 text-content-muted">
      <p>
        <UiMessage id="components_dashboard_wholesale_wholesale_referral_commission_section.text009" />
        {formatCurrency(row.monthlyOrderAmountRmb)}
        <UiMessage id="components_dashboard_wholesale_wholesale_referral_commission_section.text010" />{" "}
        {formatCurrency(row.amountCommissionRmb)}
      </p>
      <p>
        <UiMessage id="components_dashboard_wholesale_wholesale_referral_commission_section.text011" />
        {formatNumber(row.waybillCount)}
        <UiMessage id="components_dashboard_wholesale_wholesale_referral_commission_section.text012" />{" "}
        {formatCurrency(row.waybillBonusUsd, "USD")}
        {row.waybillBonusUsd > 0
          ? ` / ${formatCurrency(row.waybillBonusRmb)}`
          : ""}
      </p>
      <p className="break-words [overflow-wrap:anywhere]">
        <UiMessage id="components_dashboard_wholesale_wholesale_referral_commission_section.text013" />
        {row.orderNumbers.length > 0 ? row.orderNumbers.join("、") : "暂无"}
      </p>
    </div>
  );
}

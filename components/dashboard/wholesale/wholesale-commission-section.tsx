"use client";

import { useMemo, useState } from "react";

import { Calculator, RefreshCcw } from "lucide-react";

import {
  DashboardFilterField,
  DashboardListSection,
  dashboardFilterInputClassName,
} from "@/components/dashboard/dashboard-section-panel";
import { useLocale } from "@/components/i18n/locale-provider";
import { Button } from "@/components/ui/button";
import type { CommissionRuleSetting } from "@/lib/commission-settings";
import type { ExchangeRateRow } from "@/lib/exchange-rates";
import { normalizeSearchText } from "@/lib/value-normalizers";
import type {
  WholesaleCommission,
  WholesaleCustomer,
  WholesaleLogisticsOrder,
  WholesaleOrder,
  WholesaleProfile,
  WholesaleReferral,
} from "@/lib/wholesale";
import type { WholesaleLogisticsStatus } from "@/lib/wholesale-logistics-statuses";

import {
  formatCurrency,
  getCustomerName,
  getProfileName,
} from "./wholesale-display";
import {
  WholesaleEmptyState,
  WholesalePageShell,
  WholesaleStatGrid,
} from "./wholesale-ui";
import {
  buildReferralCommissionRows,
} from "./wholesale-referral-commission";
import { formatWholesaleOrderCommissionDescription } from "./wholesale-commission-settings";
import { WholesaleReferralCommissionSection } from "./wholesale-referral-commission-section";
import { WholesaleCommissionRecords } from "./wholesale-commission-records";

type WholesaleCommissionSectionProps = {
  canAdmin: boolean;
  commissionRuleSettings: CommissionRuleSetting[];
  commissions: WholesaleCommission[];
  customersById: Map<string, WholesaleCustomer>;
  exchangeRates: ExchangeRateRow[];
  logisticsOrders: WholesaleLogisticsOrder[];
  logisticsStatuses: WholesaleLogisticsStatus[];
  onSettleCommission: (commissionId: string) => void;
  orders: WholesaleOrder[];
  pendingKey: string | null;
  profilesById: Map<string, WholesaleProfile>;
  referrals: WholesaleReferral[];
  variant: "commission" | "incentives";
};

const ALL = "all";

export function WholesaleCommissionSection({
  canAdmin,
  commissionRuleSettings,
  commissions,
  customersById,
  exchangeRates,
  logisticsOrders,
  logisticsStatuses,
  onSettleCommission,
  orders,
  pendingKey,
  profilesById,
  referrals,
  variant,
}: WholesaleCommissionSectionProps) {
  const [incentiveSearch, setIncentiveSearch] = useState("");
  const [incentiveStatusFilter, setIncentiveStatusFilter] = useState(ALL);
  const [incentiveSalesFilter, setIncentiveSalesFilter] = useState(ALL);
  const { locale } = useLocale();
  const orderById = useMemo(
    () => new Map(orders.map((order) => [order.id, order])),
    [orders],
  );
  const commissionDescription = useMemo(
    () => formatWholesaleOrderCommissionDescription(commissionRuleSettings, locale),
    [commissionRuleSettings, locale],
  );
  const referralRows = useMemo(
    () =>
      buildReferralCommissionRows({
        commissionRuleSettings,
        customersById,
        exchangeRates,
        logisticsOrders,
        logisticsStatuses,
        orders,
        referrals,
      }),
    [
      commissionRuleSettings,
      customersById,
      exchangeRates,
      logisticsOrders,
      logisticsStatuses,
      orders,
      referrals,
    ],
  );
  const filteredCommissions = useMemo(() => {
    const searchValue = normalizeSearchText(incentiveSearch);

    return commissions.filter((commission) => {
      const order = orderById.get(commission.order_id);

      if (
        incentiveStatusFilter !== ALL &&
        commission.status !== incentiveStatusFilter
      ) {
        return false;
      }

      if (
        incentiveSalesFilter !== ALL &&
        (commission.beneficiary_user_id ?? "") !== incentiveSalesFilter
      ) {
        return false;
      }

      if (!searchValue) return true;

      return [
        order?.order_number ?? "",
        getCustomerName(customersById, commission.customer_id),
        getProfileName(profilesById, commission.beneficiary_user_id),
      ].some((value) => normalizeSearchText(value).includes(searchValue));
    });
  }, [
    commissions,
    customersById,
    incentiveSalesFilter,
    incentiveSearch,
    incentiveStatusFilter,
    orderById,
    profilesById,
  ]);
  const totalCommission = commissions.reduce(
    (sum, row) => sum + Number(row.commission_amount_rmb ?? 0),
    0,
  );
  const pendingCommission = commissions
    .filter((row) => row.status === "pending")
    .reduce((sum, row) => sum + Number(row.commission_amount_rmb ?? 0), 0);
  const salesAccounts = useMemo(() => {
    const userIds = new Set(
      commissions
        .map((commission) => commission.beneficiary_user_id)
        .filter((value): value is string => Boolean(value)),
    );

    return [...userIds].map((userId) => ({
      label: getProfileName(profilesById, userId),
      userId,
    }));
  }, [commissions, profilesById]);

  if (variant === "commission") {
    return (
      <WholesaleReferralCommissionSection
        customersById={customersById}
        referralRows={referralRows}
      />
    );
  }

  const hasActiveFilters =
    incentiveSearch || incentiveStatusFilter !== ALL || incentiveSalesFilter !== ALL;

  return (
    <WholesalePageShell
      description={commissionDescription}
      eyebrow="批发业务"
      title="提成"
    >
      <WholesaleStatGrid
        stats={[
          { label: "提成合计", value: formatCurrency(totalCommission) },
          { label: "待结算提成", value: formatCurrency(pendingCommission) },
          { label: "提成记录", value: `${commissions.length}` },
          { label: "当前显示", value: `${filteredCommissions.length}` },
        ]}
      />

      <DashboardListSection
        actions={
          <Button
            className="rounded-full border border-[#d8dde2] bg-white text-[#486782] hover:bg-[#eef3f6]"
            disabled={!hasActiveFilters}
            onClick={() => {
              setIncentiveSearch("");
              setIncentiveStatusFilter(ALL);
              setIncentiveSalesFilter(ALL);
            }}
            type="button"
            variant="outline"
          >
            <RefreshCcw className="size-4" />
            清空筛选
          </Button>
        }
        description={`共 ${commissions.length} 条提成记录，当前显示 ${filteredCommissions.length} 条。`}
        title="业务员提成"
      >
        <div className="mb-5 grid gap-4 md:grid-cols-3">
          <DashboardFilterField label="搜索提成">
            <input
              className={dashboardFilterInputClassName}
              onChange={(event) => setIncentiveSearch(event.target.value)}
              placeholder="订单编号、客户或业务员"
              type="search"
              value={incentiveSearch}
            />
          </DashboardFilterField>
          <DashboardFilterField label="业务员">
            <select
              className={dashboardFilterInputClassName}
              onChange={(event) => setIncentiveSalesFilter(event.target.value)}
              value={incentiveSalesFilter}
            >
              <option value={ALL}>全部业务员</option>
              {salesAccounts.map((account) => (
                <option key={account.userId} value={account.userId}>
                  {account.label}
                </option>
              ))}
            </select>
          </DashboardFilterField>
          <DashboardFilterField label="结算状态">
            <select
              className={dashboardFilterInputClassName}
              onChange={(event) => setIncentiveStatusFilter(event.target.value)}
              value={incentiveStatusFilter}
            >
              <option value={ALL}>全部状态</option>
              <option value="pending">待结算</option>
              <option value="settled">已结算</option>
              <option value="cancelled">已取消</option>
            </select>
          </DashboardFilterField>
        </div>

        {filteredCommissions.length === 0 ? (
          <WholesaleEmptyState
            description="批发订单保存后，系统会按毛利自动生成提成记录。"
            icon={<Calculator className="size-5" />}
            title="暂无匹配提成"
          />
        ) : (
          <WholesaleCommissionRecords
            canAdmin={canAdmin}
            commissions={filteredCommissions}
            customersById={customersById}
            onSettleCommission={onSettleCommission}
            orderById={orderById}
            pendingKey={pendingKey}
            profilesById={profilesById}
          />
        )}
      </DashboardListSection>
    </WholesalePageShell>
  );
}

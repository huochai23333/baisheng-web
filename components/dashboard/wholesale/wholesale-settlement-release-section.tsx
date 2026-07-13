"use client";
import { UiMessage } from "@/components/i18n/ui-message";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Plus, RefreshCcw, ReceiptText } from "lucide-react";
import {
  DashboardFilterField,
  DashboardListSection,
  dashboardFilterInputClassName,
} from "@/components/dashboard/dashboard-section-panel";
import { Button } from "@/components/ui/button";
import type {
  WholesaleCustomer,
  WholesaleOrder,
  WholesaleOrderSettlement,
  WholesaleProfile,
} from "@/lib/wholesale";
import type { WholesaleSettlementRelease } from "@/lib/wholesale-settlement-releases";
import { normalizeSearchText } from "@/lib/value-normalizers";
import { formatCurrency } from "./wholesale-display";
import {
  WholesaleSettlementReleaseClaimDialog,
  WholesaleSettlementReleaseCreateDialog,
} from "./wholesale-settlement-release-dialogs";
import {
  getSettlementReleaseSearchText,
  WHOLESALE_SETTLEMENT_RELEASE_STATUS_LABELS,
} from "./wholesale-settlement-release-display";
import { WholesaleSettlementReleaseTable } from "./wholesale-settlement-release-table";
import {
  WholesaleEmptyState,
  WholesalePageShell,
  WholesaleStatGrid,
} from "./wholesale-ui";
type WholesaleSettlementReleaseSectionProps = {
  canClaim: boolean;
  canPublish: boolean;
  customers: WholesaleCustomer[];
  onCancelRelease: (releaseId: string) => Promise<boolean>;
  onClaimRelease: (formData: FormData) => Promise<boolean>;
  onCreateRelease: (formData: FormData) => Promise<boolean>;
  orderSettlements: WholesaleOrderSettlement[];
  orders: WholesaleOrder[];
  pendingKey: string | null;
  profiles: WholesaleProfile[];
  releases: WholesaleSettlementRelease[];
};
const ALL = "all";
const FALLBACK_CURRENCIES = ["USD", "CNY", "EUR", "JPY", "AUD"];
export function WholesaleSettlementReleaseSection({
  canClaim,
  canPublish,
  customers,
  onCancelRelease,
  onClaimRelease,
  onCreateRelease,
  orderSettlements,
  orders,
  pendingKey,
  profiles,
  releases,
}: WholesaleSettlementReleaseSectionProps) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_settlement_release_section",
  );
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedClaimRelease, setSelectedClaimRelease] =
    useState<WholesaleSettlementRelease | null>(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState(ALL);
  const customersById = useMemo(
    () => new Map(customers.map((customer) => [customer.id, customer])),
    [customers],
  );
  const ordersById = useMemo(
    () => new Map(orders.map((order) => [order.id, order])),
    [orders],
  );
  const profilesById = useMemo(
    () => new Map(profiles.map((profile) => [profile.user_id, profile])),
    [profiles],
  );
  const orderSettlementsByOrderId = useMemo(() => {
    // 认领弹窗要按“订单剩余可结汇金额”筛选订单，所以先按订单 ID 分组已有结汇记录。
    const grouped = new Map<string, WholesaleOrderSettlement[]>();
    for (const settlement of orderSettlements) {
      const rows = grouped.get(settlement.order_id) ?? [];
      rows.push(settlement);
      grouped.set(settlement.order_id, rows);
    }
    return grouped;
  }, [orderSettlements]);
  const currencyOptions = useMemo(() => {
    const values = new Set([
      ...FALLBACK_CURRENCIES,
      ...orders.map((order) => order.customer_payment_currency),
      ...releases.map((release) => release.release_currency),
    ]);
    return Array.from(values).filter(Boolean).sort();
  }, [orders, releases]);
  const filteredReleases = useMemo(() => {
    const searchValue = normalizeSearchText(searchText);
    return releases.filter((release) => {
      if (statusFilter !== ALL && release.status !== statusFilter) return false;
      if (!searchValue) return true;
      return normalizeSearchText(
        getSettlementReleaseSearchText({
          ordersById,
          profilesById,
          release,
        }),
      ).includes(searchValue);
    });
  }, [ordersById, profilesById, releases, searchText, statusFilter]);
  const pendingCount = releases.filter(
    (release) => release.status === "pending",
  ).length;
  const claimedCount = releases.filter(
    (release) => release.status === "claimed",
  ).length;
  const pendingAmountSummary = formatPendingAmountSummary(releases);
  const hasActiveFilters = searchText || statusFilter !== ALL;
  return (
    <WholesalePageShell
      actions={
        canPublish ? (
          <Button
            className="h-11 rounded-full bg-[#486782] px-5 text-white hover:bg-[#3e5f79]"
            onClick={() => setCreateDialogOpen(true)}
            type="button"
          >
            <Plus className="size-4" />
            <UiMessage id="components_dashboard_wholesale_wholesale_settlement_release_section.text001" />
          </Button>
        ) : null
      }
      description={uiText("attribute001")}
      eyebrow={uiText("attribute002")}
      title={uiText("attribute003")}
    >
      <WholesaleStatGrid
        stats={[
          { label: "发布记录", value: `${releases.length}` },
          { label: "待认领", value: `${pendingCount}` },
          { label: "已匹配", value: `${claimedCount}` },
          { label: "待认领金额", value: pendingAmountSummary },
        ]}
      />

      <DashboardListSection
        actions={
          <Button
            className="rounded-full border border-[#d8dde2] bg-white text-[#486782] hover:bg-[#eef3f6]"
            disabled={!hasActiveFilters}
            onClick={() => {
              setSearchText("");
              setStatusFilter(ALL);
            }}
            type="button"
            variant="outline"
          >
            <RefreshCcw className="size-4" />
            <UiMessage id="components_dashboard_wholesale_wholesale_settlement_release_section.text002" />
          </Button>
        }
        description={`共 ${releases.length} 条发布记录，当前显示 ${filteredReleases.length} 条。`}
        title={uiText("attribute004")}
      >
        <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
          <DashboardFilterField label={uiText("attribute005")}>
            <input
              aria-label={uiText("attribute006")}
              className={dashboardFilterInputClassName}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder={uiText("attribute007")}
              value={searchText}
            />
          </DashboardFilterField>
          <DashboardFilterField label={uiText("attribute008")}>
            <select
              className={dashboardFilterInputClassName}
              onChange={(event) => setStatusFilter(event.target.value)}
              value={statusFilter}
            >
              <option value={ALL}>
                <UiMessage id="components_dashboard_wholesale_wholesale_settlement_release_section.text003" />
              </option>
              {Object.entries(WHOLESALE_SETTLEMENT_RELEASE_STATUS_LABELS).map(
                ([status, label]) => (
                  <option key={status} value={status}>
                    {label}
                  </option>
                ),
              )}
            </select>
          </DashboardFilterField>
        </div>

        {filteredReleases.length > 0 ? (
          <WholesaleSettlementReleaseTable
            canClaim={canClaim}
            canPublish={canPublish}
            onCancelRelease={onCancelRelease}
            onOpenClaim={setSelectedClaimRelease}
            ordersById={ordersById}
            pendingKey={pendingKey}
            profilesById={profilesById}
            releases={filteredReleases}
          />
        ) : (
          <WholesaleEmptyState
            description={uiText("attribute009")}
            icon={<ReceiptText className="size-6" />}
            title={uiText("attribute010")}
          />
        )}
      </DashboardListSection>

      {createDialogOpen ? (
        <WholesaleSettlementReleaseCreateDialog
          currencyOptions={currencyOptions}
          customers={customers}
          onCreateRelease={onCreateRelease}
          onOpenChange={setCreateDialogOpen}
          pending={pendingKey === "settlement-release:create"}
        />
      ) : null}

      {selectedClaimRelease ? (
        <WholesaleSettlementReleaseClaimDialog
          customersById={customersById}
          onClaimRelease={onClaimRelease}
          onOpenChange={(open) => {
            if (!open) setSelectedClaimRelease(null);
          }}
          orderSettlementsByOrderId={orderSettlementsByOrderId}
          orders={orders}
          pending={
            pendingKey === `settlement-release:claim:${selectedClaimRelease.id}`
          }
          release={selectedClaimRelease}
        />
      ) : null}
    </WholesalePageShell>
  );
}
function formatPendingAmountSummary(releases: WholesaleSettlementRelease[]) {
  const totals = new Map<string, number>();
  for (const release of releases) {
    if (release.status !== "pending") continue;
    // 不同币种不能直接相加，先按币种分别累计再展示。
    totals.set(
      release.release_currency,
      (totals.get(release.release_currency) ?? 0) +
        Number(release.release_amount ?? 0),
    );
  }
  if (totals.size === 0) {
    return "无待认领";
  }
  return Array.from(totals.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([currency, amount]) => formatCurrency(amount, currency))
    .join(" / ");
}

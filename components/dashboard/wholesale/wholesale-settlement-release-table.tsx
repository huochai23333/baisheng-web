"use client";

import { StatusBadge } from "@/components/ui/status-badge";
import { UiMessage } from "@/components/i18n/ui-message";
import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WholesaleOrder, WholesaleProfile } from "@/lib/wholesale";
import type { WholesaleSettlementRelease } from "@/lib/wholesale-settlement-releases";
import {
  formatCurrency,
  formatDate,
  getProfileName,
} from "./wholesale-display";
import {
  formatSettlementReleaseHandledAt,
  getSettlementReleaseStatusTone,
  WHOLESALE_SETTLEMENT_RELEASE_STATUS_LABELS,
} from "./wholesale-settlement-release-display";
import {
  WholesaleTable,
  WholesaleTd,
  WholesaleTh,
  wholesaleStickyFirstTdClassName,
  wholesaleStickyFirstThClassName,
} from "./wholesale-ui";
type WholesaleSettlementReleaseTableProps = {
  canClaim: boolean;
  canPublish: boolean;
  onCancelRelease: (releaseId: string) => Promise<boolean>;
  onOpenClaim: (release: WholesaleSettlementRelease) => void;
  ordersById: Map<string, WholesaleOrder>;
  pendingKey: string | null;
  profilesById: Map<string, WholesaleProfile>;
  releases: WholesaleSettlementRelease[];
};
export function WholesaleSettlementReleaseTable({
  canClaim,
  canPublish,
  onCancelRelease,
  onOpenClaim,
  ordersById,
  pendingKey,
  profilesById,
  releases,
}: WholesaleSettlementReleaseTableProps) {
  return (
    <WholesaleTable minWidth={1320}>
      <thead>
        <tr>
          <WholesaleTh className={wholesaleStickyFirstThClassName}>
            <UiMessage id="components_dashboard_wholesale_wholesale_settlement_release_table.text001" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_settlement_release_table.text002" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_settlement_release_table.text003" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_settlement_release_table.text004" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_settlement_release_table.text005" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_settlement_release_table.text006" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_settlement_release_table.text007" />
          </WholesaleTh>
          <WholesaleTh className="min-w-[240px] whitespace-normal">
            <UiMessage id="components_dashboard_wholesale_wholesale_settlement_release_table.text008" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_settlement_release_table.text009" />
          </WholesaleTh>
        </tr>
      </thead>
      <tbody>
        {releases.map((release) => {
          const matchedOrder = release.matched_order_id
            ? ordersById.get(release.matched_order_id)
            : null;
          const cancelPending =
            pendingKey === `settlement-release:cancel:${release.id}`;
          const claimPending =
            pendingKey === `settlement-release:claim:${release.id}`;
          return (
            <tr
              className="group"
              data-testid={`wholesale-settlement-release-row-${release.id}`}
              key={release.id}
            >
              <WholesaleTd
                className={`${wholesaleStickyFirstTdClassName} min-w-[230px] px-4 py-3`}
              >
                <div className="space-y-1 whitespace-normal">
                  <p className="font-semibold [overflow-wrap:anywhere]">
                    {release.customer_name}
                  </p>
                  <p className="text-content-muted">
                    {formatCurrency(
                      release.release_amount,
                      release.release_currency,
                    )}
                  </p>
                </div>
              </WholesaleTd>
              <WholesaleTd>
                <StatusBadge
                  tone={getSettlementReleaseStatusTone(release.status)}
                >
                  {WHOLESALE_SETTLEMENT_RELEASE_STATUS_LABELS[release.status]}
                </StatusBadge>
              </WholesaleTd>
              <WholesaleTd>{formatDate(release.received_on)}</WholesaleTd>
              <WholesaleTd className="min-w-[150px] whitespace-normal">
                {getProfileName(profilesById, release.published_by_user_id)}
              </WholesaleTd>
              <WholesaleTd className="min-w-[150px] whitespace-normal">
                {getProfileName(profilesById, release.claimed_by_user_id)}
              </WholesaleTd>
              <WholesaleTd className="min-w-[180px] whitespace-normal">
                {matchedOrder?.order_number ?? "未匹配"}
              </WholesaleTd>
              <WholesaleTd className="min-w-[160px] whitespace-normal">
                {formatSettlementReleaseHandledAt(release)}
              </WholesaleTd>
              <WholesaleTd className="min-w-[240px] whitespace-normal">
                {release.note ?? "未记录"}
              </WholesaleTd>
              <WholesaleTd className="min-w-[180px] whitespace-normal">
                <div className="flex flex-wrap gap-2">
                  {canClaim && release.status === "pending" ? (
                    <Button
                      variant="primary"
                      size="compact"
                      disabled={claimPending}
                      onClick={() => onOpenClaim(release)}
                      type="button"
                    >
                      {claimPending ? (
                        <LoaderCircle className="size-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-3.5" />
                      )}
                      <UiMessage id="components_dashboard_wholesale_wholesale_settlement_release_table.text010" />
                    </Button>
                  ) : null}
                  {canPublish && release.status === "pending" ? (
                    <Button
                      size="compact"
                      disabled={cancelPending}
                      onClick={() => void onCancelRelease(release.id)}
                      type="button"
                      variant="danger"
                    >
                      {cancelPending ? (
                        <LoaderCircle className="size-3.5 animate-spin" />
                      ) : (
                        <XCircle className="size-3.5" />
                      )}
                      <UiMessage id="components_dashboard_wholesale_wholesale_settlement_release_table.text011" />
                    </Button>
                  ) : null}
                  {release.status !== "pending" ? (
                    <span className="text-xs leading-6 text-content-muted">
                      <UiMessage id="components_dashboard_wholesale_wholesale_settlement_release_table.text012" />
                    </span>
                  ) : null}
                </div>
              </WholesaleTd>
            </tr>
          );
        })}
      </tbody>
    </WholesaleTable>
  );
}

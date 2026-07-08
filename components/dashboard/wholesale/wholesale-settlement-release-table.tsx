"use client";

import {
  CheckCircle2,
  LoaderCircle,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type {
  WholesaleOrder,
  WholesaleProfile,
} from "@/lib/wholesale";
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
  WholesaleStatusBadge,
  WholesaleTable,
  WholesaleTd,
  WholesaleTh,
  wholesaleStickyFirstTdClassName,
  wholesaleStickyFirstThClassName,
} from "./wholesale-ui";

type WholesaleSettlementReleaseTableProps = {
  canClaim: boolean;
  canPublish: boolean;
  onCancelRelease: (releaseId: string) => void | Promise<void>;
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
            客户和金额
          </WholesaleTh>
          <WholesaleTh>状态</WholesaleTh>
          <WholesaleTh>收款日期</WholesaleTh>
          <WholesaleTh>发布人</WholesaleTh>
          <WholesaleTh>认领人</WholesaleTh>
          <WholesaleTh>匹配订单</WholesaleTh>
          <WholesaleTh>处理时间</WholesaleTh>
          <WholesaleTh className="min-w-[240px] whitespace-normal">备注</WholesaleTh>
          <WholesaleTh>操作</WholesaleTh>
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
                  <p className="text-[#4f606b]">
                    {formatCurrency(
                      release.release_amount,
                      release.release_currency,
                    )}
                  </p>
                </div>
              </WholesaleTd>
              <WholesaleTd>
                <WholesaleStatusBadge
                  tone={getSettlementReleaseStatusTone(release.status)}
                >
                  {WHOLESALE_SETTLEMENT_RELEASE_STATUS_LABELS[release.status]}
                </WholesaleStatusBadge>
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
                      className="h-8 rounded-full bg-[#486782] px-2.5 text-xs text-white hover:bg-[#3e5f79]"
                      disabled={claimPending}
                      onClick={() => onOpenClaim(release)}
                      type="button"
                    >
                      {claimPending ? (
                        <LoaderCircle className="size-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-3.5" />
                      )}
                      认领匹配
                    </Button>
                  ) : null}
                  {canPublish && release.status === "pending" ? (
                    <Button
                      className="h-8 rounded-full border border-[#f1d1d1] bg-[#fff2f2] px-2.5 text-xs text-[#b13d3d] hover:bg-[#fce5e5]"
                      disabled={cancelPending}
                      onClick={() => void onCancelRelease(release.id)}
                      type="button"
                      variant="outline"
                    >
                      {cancelPending ? (
                        <LoaderCircle className="size-3.5 animate-spin" />
                      ) : (
                        <XCircle className="size-3.5" />
                      )}
                      取消
                    </Button>
                  ) : null}
                  {release.status !== "pending" ? (
                    <span className="text-xs leading-6 text-[#7b8790]">
                      已处理
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

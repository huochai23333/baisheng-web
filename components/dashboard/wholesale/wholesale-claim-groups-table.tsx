"use client";

import { Link2, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

import { formatDateTime } from "./wholesale-display";
import { formatWholesaleOrderLinkOption } from "./wholesale-order-link-options";
import type { WholesaleClaimGroupRow } from "@/lib/wholesale-claims-page";
import {
  WholesaleTable,
  WholesaleTd,
  WholesaleTh,
} from "./wholesale-ui";

/** 已认领记录按组展示；桌面使用表格，窄屏改用卡片避免把多笔订单压成竖排文字。 */
export function WholesaleClaimGroupsTable({
  canEdit,
  onOpenGroup,
  pendingKey,
  rows,
}: {
  canEdit: boolean;
  onOpenGroup: (row: WholesaleClaimGroupRow) => void;
  pendingKey: string | null;
  rows: WholesaleClaimGroupRow[];
}) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_claim_groups_table",
  );

  return (
    <>
      <div className="hidden md:block">
        <WholesaleTable minWidth={1260}>
          <thead>
            <tr>
              <WholesaleTh>{uiText("group")}</WholesaleTh>
              <WholesaleTh>{uiText("customer")}</WholesaleTh>
              <WholesaleTh className="min-w-[270px] whitespace-normal">
                {uiText("purchaseOrders")}
              </WholesaleTh>
              <WholesaleTh className="min-w-[300px] whitespace-normal">
                {uiText("wholesaleOrders")}
              </WholesaleTh>
              <WholesaleTh>{uiText("claimedBy")}</WholesaleTh>
              <WholesaleTh>{uiText("updatedBy")}</WholesaleTh>
              <WholesaleTh>{uiText("actions")}</WholesaleTh>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.claimGroup.id}>
                <WholesaleTd className="min-w-[160px] whitespace-normal">
                  <div className="font-semibold text-[#2b3942]">
                    {uiText("groupNumber", { number: index + 1 })}
                  </div>
                  <div className="mt-1 text-xs leading-5 text-[#71808d]">
                    {formatDateTime(row.claimGroup.claimed_at)}
                  </div>
                </WholesaleTd>
                <WholesaleTd className="min-w-[160px] whitespace-normal font-semibold">
                  {row.customerName}
                </WholesaleTd>
                <WholesaleTd>
                  <OrderChips
                    labels={row.purchaseOrders.map(
                      (purchaseOrder) => purchaseOrder.external_order_number,
                    )}
                  />
                </WholesaleTd>
                <WholesaleTd>
                  <OrderChips
                    labels={row.wholesaleOrders.map(
                      formatWholesaleOrderLinkOption,
                    )}
                  />
                </WholesaleTd>
                <WholesaleTd className="min-w-[150px] whitespace-normal">
                  {row.claimerName}
                </WholesaleTd>
                <WholesaleTd className="min-w-[170px] whitespace-normal">
                  <div>{row.updaterName}</div>
                  <div className="mt-1 text-xs leading-5 text-[#71808d]">
                    {formatDateTime(row.claimGroup.updated_at)}
                  </div>
                </WholesaleTd>
                <WholesaleTd>
                  {canEdit ? (
                    <AdjustButton
                      disabled={pendingKey === "1688:update-claim-group"}
                      label={uiText("adjust")}
                      onClick={() => onOpenGroup(row)}
                    />
                  ) : null}
                </WholesaleTd>
              </tr>
            ))}
          </tbody>
        </WholesaleTable>
      </div>

      <div className="grid gap-3 md:hidden">
        {rows.map((row, index) => (
          <article
            className="min-w-0 rounded-[22px] border border-[#e3e7e9] bg-white p-4 shadow-[0_12px_28px_rgba(52,68,79,0.07)]"
            key={row.claimGroup.id}
          >
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 font-semibold text-[#2b3942]">
                  <Link2 className="size-4 shrink-0 text-[#486782]" />
                  <span>{uiText("groupNumber", { number: index + 1 })}</span>
                </div>
                <p className="mt-1 break-words text-sm text-[#61717e]">
                  {row.customerName}
                </p>
              </div>
              {canEdit ? (
                <AdjustButton
                  disabled={pendingKey === "1688:update-claim-group"}
                  label={uiText("adjust")}
                  onClick={() => onOpenGroup(row)}
                />
              ) : null}
            </div>

            <MobileGroupSection
              labels={row.purchaseOrders.map(
                (purchaseOrder) => purchaseOrder.external_order_number,
              )}
              title={uiText("purchaseOrders")}
            />
            <MobileGroupSection
              labels={row.wholesaleOrders.map(formatWholesaleOrderLinkOption)}
              title={uiText("wholesaleOrders")}
            />
            <div className="mt-4 grid gap-2 text-xs leading-5 text-[#71808d] sm:grid-cols-2">
              <p>
                {uiText("claimedSummary", {
                  name: row.claimerName,
                  time: formatDateTime(row.claimGroup.claimed_at),
                })}
              </p>
              <p>
                {uiText("updatedSummary", {
                  name: row.updaterName,
                  time: formatDateTime(row.claimGroup.updated_at),
                })}
              </p>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function OrderChips({ labels }: { labels: string[] }) {
  return (
    <div className="flex max-h-28 min-w-0 flex-wrap gap-1.5 overflow-y-auto pr-1">
      {labels.map((label) => (
        <span
          className="max-w-full rounded-full bg-[#edf3f6] px-2.5 py-1 text-xs font-semibold break-words text-[#486782] [overflow-wrap:anywhere]"
          key={label}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

function MobileGroupSection({
  labels,
  title,
}: {
  labels: string[];
  title: string;
}) {
  return (
    <section className="mt-4 min-w-0">
      <h4 className="text-xs font-semibold tracking-wide text-[#71808d] uppercase">
        {title}
      </h4>
      <div className="mt-2">
        <OrderChips labels={labels} />
      </div>
    </section>
  );
}

function AdjustButton({
  disabled,
  label,
  onClick,
}: {
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      className="h-9 shrink-0 rounded-full border border-[#d8e2e8] bg-white px-3 text-xs text-[#486782] hover:bg-[#eef3f6]"
      disabled={disabled}
      onClick={onClick}
      type="button"
      variant="outline"
    >
      <Pencil className="size-3.5" />
      {label}
    </Button>
  );
}

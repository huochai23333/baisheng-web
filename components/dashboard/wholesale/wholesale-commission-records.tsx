"use client";

import { DashboardTableFrame } from "@/components/dashboard/dashboard-section-panel";
import { Button } from "@/components/ui/button";
import type {
  WholesaleCommission,
  WholesaleCustomer,
  WholesaleOrder,
  WholesaleProfile,
} from "@/lib/wholesale";

import {
  formatCurrency,
  formatDateTime,
  formatPercent,
  getCustomerName,
  getProfileName,
  WHOLESALE_STATUS_LABELS,
} from "./wholesale-display";
import {
  WholesaleStatusBadge,
  WholesaleTd,
  WholesaleTh,
} from "./wholesale-ui";

type WholesaleCommissionRecordsProps = {
  canAdmin: boolean;
  commissions: WholesaleCommission[];
  customersById: Map<string, WholesaleCustomer>;
  onSettleCommission: (commissionId: string) => void;
  orderById: Map<string, WholesaleOrder>;
  pendingKey: string | null;
  profilesById: Map<string, WholesaleProfile>;
};

function getCommissionTone(status: WholesaleCommission["status"]) {
  if (status === "settled") return "success" as const;
  if (status === "cancelled") return "danger" as const;
  return "warning" as const;
}

// 桌面表格与移动卡片只负责展示已经筛选好的记录，筛选状态留在上层页面管理。
export function WholesaleCommissionRecords({
  canAdmin,
  commissions,
  customersById,
  onSettleCommission,
  orderById,
  pendingKey,
  profilesById,
}: WholesaleCommissionRecordsProps) {
  return (
    <>
      <div className="hidden md:block">
        <DashboardTableFrame>
          <table className="w-full min-w-[980px] table-fixed border-collapse text-left text-sm">
            <colgroup>
              <col className="w-[18%]" />
              <col className="w-[16%]" />
              <col className="w-[16%]" />
              <col className="w-[14%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
            </colgroup>
            <thead>
              <tr>
                <WholesaleTh className="whitespace-normal">订单编号</WholesaleTh>
                <WholesaleTh className="whitespace-normal">客户</WholesaleTh>
                <WholesaleTh className="whitespace-normal">业务员</WholesaleTh>
                <WholesaleTh className="whitespace-normal">订单金额</WholesaleTh>
                <WholesaleTh className="whitespace-normal">提成</WholesaleTh>
                <WholesaleTh className="whitespace-normal">状态</WholesaleTh>
                {canAdmin ? <WholesaleTh className="whitespace-normal">结算</WholesaleTh> : null}
              </tr>
            </thead>
            <tbody>
              {commissions.map((commission) => {
                const order = orderById.get(commission.order_id);

                return (
                  <tr key={commission.id}>
                    <WholesaleTd className="whitespace-normal">
                      <p className="font-semibold">{order?.order_number ?? "未找到订单"}</p>
                      <p className="mt-1 text-xs text-[#71808d]">
                        {formatDateTime(commission.calculated_at)}
                      </p>
                    </WholesaleTd>
                    <WholesaleTd className="whitespace-normal">
                      {getCustomerName(customersById, commission.customer_id)}
                    </WholesaleTd>
                    <WholesaleTd className="whitespace-normal">
                      {getProfileName(profilesById, commission.beneficiary_user_id)}
                    </WholesaleTd>
                    <WholesaleTd className="whitespace-normal">
                      <p>{formatCurrency(commission.order_payment_rmb_amount)}</p>
                      <p className="mt-1 text-xs text-[#71808d]">
                        毛利 {formatCurrency(commission.gross_profit_rmb)}
                      </p>
                    </WholesaleTd>
                    <WholesaleTd className="whitespace-normal">
                      <p>{formatCurrency(commission.commission_amount_rmb)}</p>
                      <p className="mt-1 text-xs text-[#71808d]">
                        {formatPercent(commission.commission_rate)}
                      </p>
                    </WholesaleTd>
                    <WholesaleTd className="whitespace-normal">
                      <WholesaleStatusBadge tone={getCommissionTone(commission.status)}>
                        {WHOLESALE_STATUS_LABELS[commission.status]}
                      </WholesaleStatusBadge>
                    </WholesaleTd>
                    {canAdmin ? (
                      <WholesaleTd className="whitespace-normal">
                        <SettleButton
                          commission={commission}
                          onSettleCommission={onSettleCommission}
                          pendingKey={pendingKey}
                        />
                      </WholesaleTd>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </DashboardTableFrame>
      </div>

      <div className="grid gap-3 md:hidden">
        {commissions.map((commission) => {
          const order = orderById.get(commission.order_id);

          return (
            <article
              className="min-w-0 rounded-[8px] border border-[#e4e8ec] bg-white p-4"
              key={commission.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-words font-semibold text-[#23313a]">
                    {order?.order_number ?? "未找到订单"}
                  </p>
                  <p className="mt-1 break-words text-sm text-[#6f7b85]">
                    {getCustomerName(customersById, commission.customer_id)}
                  </p>
                </div>
                <WholesaleStatusBadge tone={getCommissionTone(commission.status)}>
                  {WHOLESALE_STATUS_LABELS[commission.status]}
                </WholesaleStatusBadge>
              </div>
              <div className="mt-3 grid gap-2 break-words text-sm text-[#5e6b75]">
                <p>业务员：{getProfileName(profilesById, commission.beneficiary_user_id)}</p>
                <p>订单金额：{formatCurrency(commission.order_payment_rmb_amount)}</p>
                <p>毛利：{formatCurrency(commission.gross_profit_rmb)}</p>
                <p>
                  提成：{formatCurrency(commission.commission_amount_rmb)}（
                  {formatPercent(commission.commission_rate)}）
                </p>
              </div>
              {canAdmin ? (
                <SettleButton
                  className="mt-4"
                  commission={commission}
                  onSettleCommission={onSettleCommission}
                  pendingKey={pendingKey}
                />
              ) : null}
            </article>
          );
        })}
      </div>
    </>
  );
}

function SettleButton({
  className = "",
  commission,
  onSettleCommission,
  pendingKey,
}: {
  className?: string;
  commission: WholesaleCommission;
  onSettleCommission: (commissionId: string) => void;
  pendingKey: string | null;
}) {
  return (
    <Button
      className={`${className} h-9 rounded-full bg-[#486782] px-3 text-xs font-semibold text-white hover:bg-[#3e5f79] disabled:opacity-60`}
      disabled={commission.status !== "pending" || pendingKey === "commission:settle"}
      onClick={() => onSettleCommission(commission.id)}
      type="button"
    >
      标记结算
    </Button>
  );
}

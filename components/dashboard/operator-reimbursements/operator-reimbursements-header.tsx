"use client";

import {
  CheckCircle2,
  LoaderCircle,
  Plus,
  ReceiptText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { OperatorReimbursementPeriod } from "@/lib/operator-reimbursements";

import { DashboardSectionHeader } from "../dashboard-section-header";
import { formatOperatorReimbursementPeriod } from "./operator-reimbursements-display";

type OperatorReimbursementsHeaderSectionProps = {
  copy: {
    create: string;
    currentPeriodLabel: string;
    description: string;
    reimburseCurrent: string;
    title: string;
  };
  currentPeriod: OperatorReimbursementPeriod;
  currentUnreimbursedCount: number;
  locale: string;
  onCreate: () => void;
  onReimburseCurrent: () => void;
  reimbursePending: boolean;
};

export function OperatorReimbursementsHeaderSection({
  copy,
  currentPeriod,
  currentUnreimbursedCount,
  locale,
  onCreate,
  onReimburseCurrent,
  reimbursePending,
}: OperatorReimbursementsHeaderSectionProps) {
  // 没有本月未报销记录时按钮保持不可点，避免用户误以为页面没有反应。
  const reimburseDisabled = reimbursePending || currentUnreimbursedCount === 0;

  return (
    <DashboardSectionHeader
      actions={
        <>
          <Button
            className="h-12 rounded-full border-[#d4d8dc] bg-white px-5 text-[#486782] hover:bg-[#f2f4f6]"
            onClick={onCreate}
            variant="outline"
          >
            <Plus className="size-4" />
            {copy.create}
          </Button>
          <Button
            className="h-12 rounded-full bg-[#486782] px-5 text-white hover:bg-[#3e5f79] disabled:bg-[#9eacb6]"
            disabled={reimburseDisabled}
            onClick={onReimburseCurrent}
          >
            {reimbursePending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            {copy.reimburseCurrent}
          </Button>
        </>
      }
      asideFooter={
        <p className="max-w-full break-words text-sm leading-7 text-[#66737e] [overflow-wrap:anywhere] min-[1360px]:text-right">
          <span className="font-semibold text-[#405160]">
            {copy.currentPeriodLabel}
          </span>
          {formatOperatorReimbursementPeriod(currentPeriod, locale)}
        </p>
      }
      badge={copy.title}
      badgeClassName="bg-[#e8f0f5] text-[#486782]"
      badgeIcon={<ReceiptText className="size-3.5" />}
      description={copy.description}
      descriptionClassName="max-w-2xl text-sm leading-7"
      title={copy.title}
      titleClassName="text-3xl sm:text-4xl"
    />
  );
}

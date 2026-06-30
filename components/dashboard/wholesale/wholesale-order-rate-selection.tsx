"use client";

import { SquarePen, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type WholesaleOrderRateSelectionBarProps = {
  onClearSelection: () => void;
  onOpenBulkEdit: () => void;
  pending: boolean;
  selectedCount: number;
};

export function WholesaleOrderRateSelectionBar({
  onClearSelection,
  onOpenBulkEdit,
  pending,
  selectedCount,
}: WholesaleOrderRateSelectionBarProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="mb-5 flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-[20px] border border-[#dbe5ea] bg-[#f7fafb] px-4 py-3">
      <p className="break-words text-sm leading-6 text-[#4f606b] [overflow-wrap:anywhere]">
        已选择 {selectedCount} 笔已结汇订单。
        {selectedCount === 1 ? " 继续选择多笔后可批量修改汇率。" : ""}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          className="h-9 rounded-full bg-[#486782] px-4 text-xs text-white hover:bg-[#3e5f79]"
          disabled={pending || selectedCount < 2}
          onClick={onOpenBulkEdit}
          type="button"
        >
          <SquarePen className="size-3.5" />
          批量改汇率
        </Button>
        <Button
          className="h-9 rounded-full border border-[#d8e2e8] bg-white px-4 text-xs text-[#486782] hover:bg-[#eef3f6]"
          onClick={onClearSelection}
          type="button"
          variant="outline"
        >
          <X className="size-3.5" />
          清空选择
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  WholesaleClaimBoardKey,
  WholesaleClaimRow,
} from "@/lib/wholesale-claims-page";

/**
 * 勾选状态只保存当前筛选结果里的待认领订单。
 * resetKey 包含板块和所有筛选条件，任一条件变化都会清空，避免用户提交看不见的旧选择。
 */
export function useWholesaleClaimSelection({
  board,
  canEdit,
  resetKey,
  rows,
}: {
  board: WholesaleClaimBoardKey;
  canEdit: boolean;
  resetKey: string;
  rows: WholesaleClaimRow[];
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const selectableRows = useMemo(
    () => (canEdit && board !== "claimed" ? rows : []),
    [board, canEdit, rows],
  );
  const selectableIds = useMemo(
    () => selectableRows.map((row) => row.purchaseOrder.id),
    [selectableRows],
  );
  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  useEffect(() => {
    clearSelection();
  }, [clearSelection, resetKey]);

  useEffect(() => {
    const allowedIds = new Set(selectableIds);
    setSelectedIds((current) => {
      const next = new Set(
        [...current].filter((purchaseOrderId) =>
          allowedIds.has(purchaseOrderId),
        ),
      );

      return next.size === current.size ? current : next;
    });
  }, [selectableIds]);

  const toggleOne = useCallback((purchaseOrderId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(purchaseOrderId)) {
        next.delete(purchaseOrderId);
      } else {
        next.add(purchaseOrderId);
      }
      return next;
    });
  }, []);

  const allSelected =
    selectableIds.length > 0 &&
    selectableIds.every((purchaseOrderId) => selectedIds.has(purchaseOrderId));

  const toggleAll = useCallback(() => {
    setSelectedIds((current) => {
      const everySelected =
        selectableIds.length > 0 &&
        selectableIds.every((purchaseOrderId) => current.has(purchaseOrderId));

      return everySelected ? new Set() : new Set(selectableIds);
    });
  }, [selectableIds]);

  return {
    allSelected,
    clearSelection,
    hasPartialSelection: selectedIds.size > 0 && !allSelected,
    selectedIds,
    selectedRows: selectableRows.filter((row) =>
      selectedIds.has(row.purchaseOrder.id),
    ),
    toggleAll,
    toggleOne,
  };
}

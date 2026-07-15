"use client";
import { UiMessage } from "@/components/i18n/ui-message";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";
import { DashboardListSection } from "@/components/dashboard/dashboard-section-panel";
import { Button } from "@/components/ui/button";
import type {
  Wholesale1688Order,
  WholesaleCustomer,
  WholesaleOrder,
  WholesaleProfile,
} from "@/lib/wholesale";
import {
  Wholesale1688UploadDialog,
  WholesaleClaimDialog,
} from "./wholesale-claims-dialogs";
import { WholesaleClaimsTable } from "./wholesale-claims-table";
import {
  EMPTY_WHOLESALE_CLAIM_FILTERS,
  buildWholesaleClaimRows,
  countWholesaleClaimBoards,
  filterWholesaleClaimRows,
  WHOLESALE_CLAIM_BOARDS,
  type WholesaleClaimBoardKey,
  type WholesaleClaimRow,
} from "./wholesale-claims-view-model";
import {
  WholesaleClaimsBulkToolbar,
  WholesaleClaimsFiltersPanel,
} from "./wholesale-claims-filters";
import { WholesaleBulkClaimDialog } from "./wholesale-bulk-claim-dialog";
import { useWholesaleClaimSelection } from "./use-wholesale-claim-selection";
import type { useWholesaleActions } from "./use-wholesale-actions";
import { WholesaleEmptyState, WholesalePageShell } from "./wholesale-ui";
type WholesaleClaimsSectionProps = {
  canAdmin: boolean;
  canEdit: boolean;
  canReassignClaims: boolean;
  customers: WholesaleCustomer[];
  customersById: Map<string, WholesaleCustomer>;
  orders: WholesaleOrder[];
  pendingKey: string | null;
  profilesById: Map<string, WholesaleProfile>;
  purchaseOrders: Wholesale1688Order[];
  actions: Pick<
    ReturnType<typeof useWholesaleActions>,
    | "bulkClaim1688Orders"
    | "claim1688Order"
    | "delete1688Order"
    | "import1688Rows"
  >;
};
export function WholesaleClaimsSection({
  actions,
  canAdmin,
  canEdit,
  canReassignClaims,
  customers,
  customersById,
  orders,
  pendingKey,
  profilesById,
  purchaseOrders,
}: WholesaleClaimsSectionProps) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_claims_section",
  );
  const [activeBoard, setActiveBoard] =
    useState<WholesaleClaimBoardKey>("assisted");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [claimTarget, setClaimTarget] = useState<WholesaleClaimRow | null>(
    null,
  );
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [filters, setFilters] = useState(EMPTY_WHOLESALE_CLAIM_FILTERS);
  const ordersById = useMemo(
    () => new Map(orders.map((order) => [order.id, order])),
    [orders],
  );
  const claimRows = useMemo(
    () =>
      buildWholesaleClaimRows({
        customersById,
        ordersById,
        profilesById,
        purchaseOrders,
      }),
    [customersById, ordersById, profilesById, purchaseOrders],
  );
  const boardCounts = useMemo(
    () => countWholesaleClaimBoards(claimRows),
    [claimRows],
  );
  const filteredRows = useMemo(
    () => filterWholesaleClaimRows(claimRows, activeBoard, filters),
    [activeBoard, claimRows, filters],
  );
  const selection = useWholesaleClaimSelection({
    board: activeBoard,
    canEdit,
    resetKey: JSON.stringify([activeBoard, filters]),
    rows: filteredRows,
  });
  const hasActiveFilters = Object.values(filters).some(Boolean);
  const activeBoardMeta =
    WHOLESALE_CLAIM_BOARDS.find((board) => board.key === activeBoard) ??
    WHOLESALE_CLAIM_BOARDS[0];
  return (
    <WholesalePageShell
      actions={
        canEdit ? (
          <Button
            className="h-11 rounded-full bg-[#486782] px-5 text-white hover:bg-[#3e5f79]"
            onClick={() => setUploadDialogOpen(true)}
            type="button"
          >
            <Upload className="size-4" />
            <UiMessage id="components_dashboard_wholesale_wholesale_claims_section.text001" />
          </Button>
        ) : null
      }
      description={uiText("attribute001")}
      eyebrow={uiText("attribute002")}
      title={uiText("attribute003")}
    >
      <DashboardListSection
        description={`当前在${activeBoardMeta.label}中显示 ${filteredRows.length} 条采购订单。${activeBoardMeta.description}`}
        title={uiText("attribute004")}
      >
        <WholesaleClaimsFiltersPanel
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          onChange={(changes) =>
            setFilters((current) => ({ ...current, ...changes }))
          }
          onClear={() => setFilters({ ...EMPTY_WHOLESALE_CLAIM_FILTERS })}
        />

        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          {WHOLESALE_CLAIM_BOARDS.map((board) => (
            <button
              className={
                activeBoard === board.key
                  ? "rounded-[18px] bg-[#486782] px-4 py-3 text-left text-sm font-semibold text-white shadow-[0_12px_24px_rgba(72,103,130,0.18)]"
                  : "rounded-[18px] border border-[#dfe5ea] bg-white px-4 py-3 text-left text-sm font-semibold text-[#486782] hover:bg-[#f4f8fa]"
              }
              key={board.key}
              onClick={() => setActiveBoard(board.key)}
              type="button"
            >
              <span className="block">{board.label}</span>
              <span className="mt-1 block text-xs opacity-80">
                {boardCounts[board.key]}
                <UiMessage id="components_dashboard_wholesale_wholesale_claims_section.text003" />
              </span>
            </button>
          ))}
        </div>

        <WholesaleClaimsBulkToolbar
          onClaim={() => setBulkDialogOpen(true)}
          onClear={selection.clearSelection}
          selectedCount={selection.selectedRows.length}
        />

        <div className="mt-5">
          {filteredRows.length === 0 ? (
            <WholesaleEmptyState
              description={getEmptyDescription(activeBoard)}
              icon={<FileSpreadsheet className="size-5" />}
              title={uiText("attribute007")}
            />
          ) : (
            <WholesaleClaimsTable
              canAdmin={canAdmin}
              canEdit={canEdit}
              canReassignClaims={canReassignClaims}
              onDelete={actions.delete1688Order}
              onOpenClaim={setClaimTarget}
              pendingKey={pendingKey}
              rows={filteredRows}
              selection={
                canEdit && activeBoard !== "claimed"
                  ? {
                      allSelected: selection.allSelected,
                      hasPartialSelection: selection.hasPartialSelection,
                      onToggleAll: selection.toggleAll,
                      onToggleOne: selection.toggleOne,
                      selectedIds: selection.selectedIds,
                    }
                  : undefined
              }
            />
          )}
        </div>
      </DashboardListSection>

      <Wholesale1688UploadDialog
        onImportRows={actions.import1688Rows}
        onOpenChange={setUploadDialogOpen}
        open={uploadDialogOpen}
        pending={pendingKey === "1688:import"}
      />

      <WholesaleClaimDialog
        claimTarget={claimTarget}
        customers={customers}
        onClaim={actions.claim1688Order}
        onOpenChange={(open) => {
          if (!open) setClaimTarget(null);
        }}
        orders={orders}
        pending={pendingKey === "1688:claim"}
      />

      <WholesaleBulkClaimDialog
        customers={customers}
        onClaim={actions.bulkClaim1688Orders}
        onOpenChange={setBulkDialogOpen}
        onSuccess={() => {
          setBulkDialogOpen(false);
          selection.clearSelection();
        }}
        open={bulkDialogOpen && selection.selectedRows.length > 0}
        orders={orders}
        pending={pendingKey === "1688:bulk-claim"}
        purchaseOrderIds={selection.selectedRows.map(
          (row) => row.purchaseOrder.id,
        )}
      />
    </WholesalePageShell>
  );
}
function getEmptyDescription(board: WholesaleClaimBoardKey) {
  if (board === "assisted") {
    return "订单表格上传后，如果系统能按收货人名字匹配到客户，会先出现在这里。";
  }
  if (board === "hall") {
    return "没有辅助匹配到客户的采购订单会进入认领大厅。";
  }
  return "确认客户和批发订单后，采购订单会进入已认领。";
}

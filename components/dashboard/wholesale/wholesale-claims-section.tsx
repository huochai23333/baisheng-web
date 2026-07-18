"use client";

import { InteractiveButton as DesignButton } from "@/components/ui/button";

import { FileSpreadsheet, LoaderCircle, Upload } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import {
  DashboardOrderListSection,
  DashboardOrderLoadMoreButton,
} from "@/components/dashboard/dashboard-order-list-section";
import { UiMessage } from "@/components/i18n/ui-message";
import { Button } from "@/components/ui/button";
import type { OrderDatePreset } from "@/lib/order-date-range";
import { getOrderDatePresetRange } from "@/lib/order-date-range";
import type { WholesaleCustomer } from "@/lib/wholesale";
import type {
  WholesaleClaimBoardKey,
  WholesaleClaimPage,
  WholesaleClaimRow,
} from "@/lib/wholesale-claims-page";

import { useWholesaleClaimSelection } from "./use-wholesale-claim-selection";
import { useWholesaleClaimsPage } from "./use-wholesale-claims-page";
import type { useWholesaleActions } from "./use-wholesale-actions";
import {
  WholesaleClaimGroupDialog,
  type WholesaleClaimGroupDialogTarget,
} from "./wholesale-claim-group-dialog";
import { WholesaleClaimGroupsTable } from "./wholesale-claim-groups-table";
import { Wholesale1688UploadDialog } from "./wholesale-claims-dialogs";
import {
  WholesaleClaimsBulkToolbar,
  WholesaleClaimsFiltersPanel,
} from "./wholesale-claims-filters";
import { WholesaleClaimsTable } from "./wholesale-claims-table";
import { WHOLESALE_CLAIM_BOARDS } from "./wholesale-claims-view-model";
import { WholesaleEmptyState, WholesalePageShell } from "./wholesale-ui";

type WholesaleClaimsSectionProps = {
  actions: Pick<
    ReturnType<typeof useWholesaleActions>,
    | "cancel1688ClaimGroup"
    | "create1688ClaimGroup"
    | "delete1688Order"
    | "import1688Rows"
    | "update1688ClaimGroup"
  >;
  canAdmin: boolean;
  canManageClaims: boolean;
  customers: WholesaleCustomer[];
  initialPage: WholesaleClaimPage;
  pendingKey: string | null;
};

export function WholesaleClaimsSection({
  actions,
  canAdmin,
  canManageClaims,
  customers,
  initialPage,
  pendingKey,
}: WholesaleClaimsSectionProps) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_claims_section",
  );
  const claims = useWholesaleClaimsPage(initialPage);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [dialogTarget, setDialogTarget] =
    useState<WholesaleClaimGroupDialogTarget | null>(null);
  const rows = claims.page.board === claims.activeBoard ? claims.page.rows : [];
  const groupRows =
    claims.page.board === claims.activeBoard ? claims.page.groupRows : [];
  const selection = useWholesaleClaimSelection({
    board: claims.activeBoard,
    canEdit: canManageClaims,
    resetKey: JSON.stringify([claims.activeBoard, claims.filters]),
    rows,
  });
  const activeBoardMeta =
    WHOLESALE_CLAIM_BOARDS.find((board) => board.key === claims.activeBoard) ??
    WHOLESALE_CLAIM_BOARDS[0];

  const refreshAfter = async (succeeded: boolean) => {
    if (succeeded) await claims.refreshFirstPage();
    return succeeded;
  };

  return (
    <WholesalePageShell
      actions={
        canManageClaims ? (
          <Button
            variant="primary"
            size="default"
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
      <WholesaleClaimsFiltersPanel
        filters={claims.filters}
        onChange={claims.updateFilters}
        onClear={claims.resetFilters}
        onExactSearch={() => claims.activateExactSearch()}
        onExitExactSearch={claims.exitExactSearch}
        onPreset={(preset: Exclude<OrderDatePreset, "custom">) =>
          claims.updateFilters({
            ...getOrderDatePresetRange(preset),
            exactOrderNumber: "",
            searchMode: "date_range",
          })
        }
      />

      <DashboardOrderListSection
        controls={
          claims.page.nextCursor ? (
            <DashboardOrderLoadMoreButton
              loading={claims.loadingMore}
              onClick={claims.loadMore}
            />
          ) : undefined
        }
        description={activeBoardMeta.description}
        progress={
          claims.page.totalCount > 0
            ? {
                kind: "loaded",
                shown:
                  claims.activeBoard === "claimed"
                    ? groupRows.length
                    : rows.length,
                total: claims.page.totalCount,
                unit:
                  claims.activeBoard === "claimed"
                    ? "claimGroups"
                    : "purchaseOrders",
              }
            : null
        }
        title={uiText("attribute004")}
      >
        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          {WHOLESALE_CLAIM_BOARDS.map((board) => (
            <DesignButton
              className={
                claims.activeBoard === board.key
                  ? "rounded-[18px] bg-primary px-4 py-3 text-left text-sm font-semibold text-white shadow-[var(--surface-shadow-interactive)]"
                  : "rounded-[18px] border border-border bg-white px-4 py-3 text-left text-sm font-semibold text-primary hover:bg-surface-inset"
              }
              key={board.key}
              onClick={() =>
                claims.setActiveBoard(board.key as WholesaleClaimBoardKey)
              }
              type="button"
            >
              <span className="block">{board.label}</span>
              <span className="mt-1 block text-xs opacity-80">
                {board.key === "claimed"
                  ? uiText("claimedBoardCount", {
                      groupCount: claims.page.boardCounts.claimedGroups,
                      purchaseCount: claims.page.boardCounts.claimedPurchases,
                    })
                  : uiText("purchaseBoardCount", {
                      count: claims.page.boardCounts[board.key],
                    })}
              </span>
            </DesignButton>
          ))}
        </div>

        {claims.activeBoard !== "claimed" ? (
          <WholesaleClaimsBulkToolbar
            onClaim={() =>
              setDialogTarget({ kind: "create", rows: selection.selectedRows })
            }
            onClear={selection.clearSelection}
            selectedCount={selection.selectedRows.length}
          />
        ) : null}

        {claims.loadError ? (
          <div className="mt-4 rounded-[18px] border border-border-subtle bg-surface-inset px-4 py-3 text-sm text-content-muted">
            {claims.loadError}
          </div>
        ) : null}

        <div className="relative mt-5 min-h-24">
          {claims.loading ? (
            <div className="absolute inset-0 z-10 flex items-start justify-center rounded-[18px] bg-white/75 pt-8">
              <LoaderCircle className="size-6 animate-spin text-primary" />
            </div>
          ) : null}
          {claims.activeBoard === "claimed" ? (
            groupRows.length === 0 ? (
              <WholesaleEmptyState
                description={uiText("claimedEmptyDescription")}
                icon={<FileSpreadsheet className="size-5" />}
                title={uiText("claimedEmptyTitle")}
              />
            ) : (
              <WholesaleClaimGroupsTable
                canEdit={canManageClaims}
                onOpenGroup={(groupRow) =>
                  setDialogTarget({ groupRow, kind: "edit" })
                }
                pendingKey={pendingKey}
                rows={groupRows}
              />
            )
          ) : rows.length === 0 ? (
            <WholesaleEmptyState
              description={
                claims.activeBoard === "assisted"
                  ? uiText("assistedEmptyDescription")
                  : uiText("hallEmptyDescription")
              }
              icon={<FileSpreadsheet className="size-5" />}
              title={uiText("attribute007")}
            />
          ) : (
            <WholesaleClaimsTable
              canAdmin={canAdmin}
              canEdit={canManageClaims}
              onDelete={async (purchaseOrderId) =>
                refreshAfter(await actions.delete1688Order(purchaseOrderId))
              }
              onOpenClaim={(row: WholesaleClaimRow) =>
                setDialogTarget({ kind: "create", rows: [row] })
              }
              pendingKey={pendingKey}
              rows={rows}
              selection={
                canManageClaims
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
      </DashboardOrderListSection>

      <Wholesale1688UploadDialog
        onImportRows={async (fileName, rowsToImport) =>
          refreshAfter(await actions.import1688Rows(fileName, rowsToImport))
        }
        onOpenChange={setUploadDialogOpen}
        open={uploadDialogOpen}
        pending={pendingKey === "1688:import"}
      />

      <WholesaleClaimGroupDialog
        customers={customers}
        onCancelGroup={async (claimGroupId) =>
          refreshAfter(await actions.cancel1688ClaimGroup(claimGroupId))
        }
        onCreateGroup={async (...parameters) => {
          const succeeded = await actions.create1688ClaimGroup(...parameters);
          if (succeeded) {
            selection.clearSelection();
            await claims.refreshFirstPage();
          }
          return succeeded;
        }}
        onOpenChange={(open) => {
          if (!open) setDialogTarget(null);
        }}
        onUpdateGroup={async (...parameters) =>
          refreshAfter(await actions.update1688ClaimGroup(...parameters))
        }
        pendingKey={pendingKey}
        target={dialogTarget}
      />
    </WholesalePageShell>
  );
}

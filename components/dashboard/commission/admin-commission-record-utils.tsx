import type {
  AdminCommissionRow,
  CommissionSettlementStatus,
} from "@/lib/admin-commission";
import type { DashboardPaginationSlice } from "@/lib/dashboard-pagination";

// 分页契约与小型展示映射从记录区块移出，让主文件专注桌面表格和移动记录的组装。
export type CommissionPagination =
  DashboardPaginationSlice<AdminCommissionRow> & {
    goToNextPage: () => void;
    goToPreviousPage: () => void;
  };

export type AdminCommissionTableSectionProps = {
  onFocusOrderNumber: (orderNumber: string) => void;
  onMarkAsPaid: (commission: AdminCommissionRow) => void;
  pagination: CommissionPagination;
  rows: AdminCommissionRow[];
  settlingCommissionId: string | null;
};

export function CommissionDetailLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="leading-7 text-content-muted">
      <span className="text-xs text-content-subtle">{label}: </span>
      <span>{value}</span>
    </div>
  );
}

export function getCommissionSettlementTone(
  status: CommissionSettlementStatus,
) {
  if (status === "paid") return "success";
  if (status === "pending" || status === "reversed") return "warning";
  return "info";
}

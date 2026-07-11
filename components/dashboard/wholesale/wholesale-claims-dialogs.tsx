"use client";
import { UiMessage } from "@/components/i18n/ui-message";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import { DashboardDialog } from "@/components/dashboard/dashboard-dialog";
import { DashboardFilterField } from "@/components/dashboard/dashboard-section-panel";
import { Button } from "@/components/ui/button";
import type { Wholesale1688IngestRow } from "@/lib/wholesale-1688-ingest";
import { parseWholesale1688Csv } from "@/lib/wholesale-1688-ingest";
import { parseWholesale1688Xlsx } from "@/lib/wholesale-1688-xlsx";
import type { WholesaleCustomer, WholesaleOrder } from "@/lib/wholesale";
import type { WholesaleClaimRow } from "./wholesale-claims-view-model";
import { WholesaleSelect } from "./wholesale-ui";
export function Wholesale1688UploadDialog({
  onImportRows,
  onOpenChange,
  open,
  pending,
}: {
  onImportRows: (fileName: string, rows: Wholesale1688IngestRow[]) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  pending: boolean;
}) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_claims_dialogs",
  );
  const fileInputId = useId();
  const [fileName, setFileName] = useState("");
  const [parsedRows, setParsedRows] = useState<Wholesale1688IngestRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const rowsWithRecipient = parsedRows.filter(
    (row) => row.recipient_name,
  ).length;
  return (
    <DashboardDialog
      description={uiText("attribute001")}
      onOpenChange={onOpenChange}
      open={open}
      title={uiText("attribute002")}
    >
      <div className="space-y-4">
        <DashboardFilterField label={uiText("attribute003")}>
          <input
            accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="sr-only"
            id={fileInputId}
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (!file) return;
              setFileName(file.name);
              setParseError(null);
              setParsedRows([]);
              parseWholesale1688File(file)
                .then((rows) => {
                  setParsedRows(rows);
                  setParseError(
                    rows.length === 0
                      ? "没有读取到采购订单，请确认选择的是从 1688 导出的订单表格。"
                      : null,
                  );
                })
                .catch(() => {
                  setParsedRows([]);
                  setParseError("订单表格没有读取成功，请重新选择。");
                });
            }}
            type="file"
          />
          <div className="flex min-h-[52px] items-center gap-3 rounded-[18px] border border-[#dfe5ea] bg-white px-3 py-2">
            <label
              className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full bg-[#486782] px-4 text-sm font-semibold whitespace-nowrap text-white hover:bg-[#3e5f79]"
              htmlFor={fileInputId}
            >
              <FileSpreadsheet className="size-4" />
              <UiMessage id="components_dashboard_wholesale_wholesale_claims_dialogs.text001" />
            </label>
            <span className="min-w-0 flex-1 truncate text-sm text-[#23313a]">
              {fileName || "未选择订单表格"}
            </span>
          </div>
        </DashboardFilterField>
        {parseError ? (
          <p className="text-sm text-[#b13d3d]">{parseError}</p>
        ) : parsedRows.length > 0 ? (
          <p className="text-sm leading-6 text-[#61717e]">
            <UiMessage id="components_dashboard_wholesale_wholesale_claims_dialogs.text002" />
            {parsedRows.length}
            <UiMessage id="components_dashboard_wholesale_wholesale_claims_dialogs.text003" />
            {rowsWithRecipient}{" "}
            <UiMessage id="components_dashboard_wholesale_wholesale_claims_dialogs.text004" />
          </p>
        ) : null}
        <div className="flex justify-end">
          <Button
            className="h-11 rounded-full bg-[#486782] px-5 text-white hover:bg-[#3e5f79] disabled:opacity-60"
            disabled={parsedRows.length === 0 || pending}
            onClick={() => {
              onImportRows(fileName, parsedRows);
              onOpenChange(false);
            }}
            type="button"
          >
            <FileSpreadsheet className="size-4" />
            <UiMessage id="components_dashboard_wholesale_wholesale_claims_dialogs.text005" />
          </Button>
        </div>
      </div>
    </DashboardDialog>
  );
}
async function parseWholesale1688File(file: File) {
  const lowerFileName = file.name.toLowerCase();
  if (lowerFileName.endsWith(".xlsx")) {
    return parseWholesale1688Xlsx(await file.arrayBuffer());
  }
  if (lowerFileName.endsWith(".csv")) {
    return parseWholesale1688Csv(await file.text());
  }
  throw new Error("unsupported_file");
}
export function WholesaleClaimDialog({
  claimTarget,
  customers,
  onClaim,
  onOpenChange,
  orders,
  pending,
}: {
  claimTarget: WholesaleClaimRow | null;
  customers: WholesaleCustomer[];
  onClaim: (formData: FormData) => void;
  onOpenChange: (open: boolean) => void;
  orders: WholesaleOrder[];
  pending: boolean;
}) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_claims_dialogs",
  );
  return (
    <DashboardDialog
      description={uiText("attribute004")}
      onOpenChange={onOpenChange}
      open={Boolean(claimTarget)}
      title={claimTarget?.purchaseOrder.external_order_number ?? "认领采购订单"}
    >
      {claimTarget ? (
        <WholesaleClaimDialogForm
          claimTarget={claimTarget}
          customers={customers}
          key={claimTarget.purchaseOrder.id}
          onClaim={onClaim}
          onOpenChange={onOpenChange}
          orders={orders}
          pending={pending}
        />
      ) : null}
    </DashboardDialog>
  );
}
function WholesaleClaimDialogForm({
  claimTarget,
  customers,
  onClaim,
  onOpenChange,
  orders,
  pending,
}: {
  claimTarget: WholesaleClaimRow;
  customers: WholesaleCustomer[];
  onClaim: (formData: FormData) => void;
  onOpenChange: (open: boolean) => void;
  orders: WholesaleOrder[];
  pending: boolean;
}) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_claims_dialogs",
  );
  const defaultCustomerId =
    claimTarget.purchaseOrder.assisted_customer_id ??
    claimTarget.purchaseOrder.customer_id ??
    "";
  const [selectedCustomerId, setSelectedCustomerId] =
    useState(defaultCustomerId);
  const [selectedOrderId, setSelectedOrderId] = useState(() =>
    getDefaultWholesaleOrderId(orders, defaultCustomerId, claimTarget),
  );
  const matchingOrders = useMemo(
    () =>
      selectedCustomerId
        ? orders.filter((order) => order.customer_id === selectedCustomerId)
        : [],
    [orders, selectedCustomerId],
  );
  const canSubmit = Boolean(selectedCustomerId && selectedOrderId);
  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onClaim(new FormData(event.currentTarget));
        onOpenChange(false);
      }}
    >
      <input
        name="purchase_order_id"
        type="hidden"
        value={claimTarget.purchaseOrder.id}
      />
      {claimTarget.purchaseOrder.assisted_customer_id ? (
        <div className="rounded-[18px] bg-[#f6f8f9] px-4 py-3 text-sm leading-6 text-[#61717e]">
          <UiMessage id="components_dashboard_wholesale_wholesale_claims_dialogs.text006" />
          {claimTarget.recipientName}
          <UiMessage id="components_dashboard_wholesale_wholesale_claims_dialogs.text007" />
          {claimTarget.assistedCustomerName}
          <UiMessage id="components_dashboard_wholesale_wholesale_claims_dialogs.text008" />
        </div>
      ) : null}
      <WholesaleSelect
        label={uiText("attribute005")}
        name="customer_id"
        onChange={(event) => {
          const nextCustomerId = event.target.value;
          setSelectedCustomerId(nextCustomerId);
          setSelectedOrderId(
            getDefaultWholesaleOrderId(orders, nextCustomerId, claimTarget),
          );
        }}
        required
        value={selectedCustomerId}
      >
        <option value="">
          <UiMessage id="components_dashboard_wholesale_wholesale_claims_dialogs.text009" />
        </option>
        {customers.map((customer) => (
          <option key={customer.id} value={customer.id}>
            {customer.unique_name}
          </option>
        ))}
      </WholesaleSelect>
      <WholesaleSelect
        disabled={!selectedCustomerId || matchingOrders.length === 0}
        label={uiText("attribute006")}
        name="wholesale_order_id"
        onChange={(event) => setSelectedOrderId(event.target.value)}
        required
        value={selectedOrderId}
      >
        <option value="">
          {selectedCustomerId ? "选择批发订单" : "先选择客户"}
        </option>
        {matchingOrders.map((order) => (
          <option key={order.id} value={order.id}>
            {order.order_number}
          </option>
        ))}
      </WholesaleSelect>
      {selectedCustomerId && matchingOrders.length === 0 ? (
        <p className="text-sm leading-6 text-[#9a6a07]">
          <UiMessage id="components_dashboard_wholesale_wholesale_claims_dialogs.text010" />
        </p>
      ) : null}
      <div className="flex justify-end">
        <Button
          className="h-11 rounded-full bg-[#486782] px-5 text-white hover:bg-[#3e5f79] disabled:opacity-60"
          disabled={pending || !canSubmit}
          type="submit"
        >
          <UiMessage id="components_dashboard_wholesale_wholesale_claims_dialogs.text011" />
        </Button>
      </div>
    </form>
  );
}
function getDefaultWholesaleOrderId(
  orders: WholesaleOrder[],
  customerId: string,
  claimTarget: WholesaleClaimRow,
) {
  if (!customerId) {
    return "";
  }
  const targetOrderId = claimTarget.purchaseOrder.wholesale_order_id;
  if (
    targetOrderId &&
    orders.some(
      (order) => order.id === targetOrderId && order.customer_id === customerId,
    )
  ) {
    return targetOrderId;
  }
  const matchingOrders = orders.filter(
    (order) => order.customer_id === customerId,
  );
  return matchingOrders.length === 1 ? matchingOrders[0].id : "";
}

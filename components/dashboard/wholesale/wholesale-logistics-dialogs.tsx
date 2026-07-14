"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { DashboardDialog } from "@/components/dashboard/dashboard-dialog";
import { Button } from "@/components/ui/button";
import type {
  WholesaleCustomer,
  WholesaleOrderLinkOption,
} from "@/lib/wholesale";

import type { WholesaleLogisticsRecordType } from "./wholesale-logistics-mutations";
import {
  formatWholesaleOrderLinkOption,
  getWholesaleOrderLinkOptionsForCustomer,
} from "./wholesale-order-link-options";
import {
  WholesaleField,
  WholesaleSelect,
  WholesaleSubmitButton,
} from "./wholesale-ui";

export type WholesaleLogisticsLinkTarget = {
  customerId: string | null;
  recordId: string;
  recordType: WholesaleLogisticsRecordType;
  trackingNumber: string;
  wholesaleOrderId: string | null;
};

export function WholesaleLogisticsCreateDialog({
  customers,
  onCreate,
  onOpenChange,
  onSucceeded,
  open,
  orders,
  pending,
}: {
  customers: WholesaleCustomer[];
  onCreate: (formData: FormData) => Promise<boolean>;
  onOpenChange: (open: boolean) => void;
  onSucceeded: () => Promise<void>;
  open: boolean;
  orders: WholesaleOrderLinkOption[];
  pending: boolean;
}) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_logistics_section",
  );
  const formRef = useRef<HTMLFormElement | null>(null);
  const [customerId, setCustomerId] = useState("");
  const [orderId, setOrderId] = useState("");
  const matchingOrders = useMemo(
    () => getWholesaleOrderLinkOptionsForCustomer(orders, customerId),
    [customerId, orders],
  );

  const resetForm = () => {
    formRef.current?.reset();
    setCustomerId("");
    setOrderId("");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  return (
    <DashboardDialog
      description={uiText("createDialogDescription")}
      onOpenChange={handleOpenChange}
      open={open}
      title={uiText("createDialogTitle")}
    >
      <form
        className="grid min-w-0 gap-4 md:grid-cols-2"
        onSubmit={async (event) => {
          event.preventDefault();
          const succeeded = await onCreate(new FormData(event.currentTarget));
          // 失败时不改动表单；成功后再刷新列表、清空输入并关闭弹窗。
          if (!succeeded) return;
          await onSucceeded();
          resetForm();
          onOpenChange(false);
        }}
        ref={formRef}
      >
        <WholesaleField
          label={uiText("attribute006")}
          name="tracking_number"
          placeholder={uiText("attribute007")}
          required
        />
        <WholesaleField
          label={uiText("attribute008")}
          name="customer_name"
          placeholder={uiText("attribute009")}
          required
        />
        <WholesaleSelect
          label={uiText("attribute010")}
          name="customer_id"
          onChange={(event) => {
            setCustomerId(event.target.value);
            setOrderId("");
          }}
          value={customerId}
        >
          <option value="">{uiText("noCustomer")}</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.unique_name}
            </option>
          ))}
        </WholesaleSelect>
        <WholesaleSelect
          disabled={!customerId}
          label={uiText("attribute011")}
          name="wholesale_order_id"
          onChange={(event) => setOrderId(event.target.value)}
          value={orderId}
        >
          <option value="">
            {customerId ? uiText("noOrder") : uiText("selectCustomerFirst")}
          </option>
          {matchingOrders.map((order) => (
            <option key={order.id} value={order.id}>
              {formatWholesaleOrderLinkOption(order)}
            </option>
          ))}
        </WholesaleSelect>
        <div className="flex min-w-0 flex-wrap justify-end gap-3 md:col-span-2">
          <Button
            className="min-h-10 rounded-full px-4"
            disabled={pending}
            onClick={() => handleOpenChange(false)}
            type="button"
            variant="outline"
          >
            {uiText("cancel")}
          </Button>
          <WholesaleSubmitButton pending={pending}>
            {uiText("createSubmit")}
          </WholesaleSubmitButton>
        </div>
      </form>
    </DashboardDialog>
  );
}

export function WholesaleLogisticsLinkDialog({
  customers,
  onOpenChange,
  onSave,
  open,
  orders,
  pending,
  target,
}: {
  customers: WholesaleCustomer[];
  onOpenChange: (open: boolean) => void;
  onSave: (
    recordType: WholesaleLogisticsRecordType,
    recordId: string,
    orderId: string,
  ) => Promise<boolean>;
  open: boolean;
  orders: WholesaleOrderLinkOption[];
  pending: boolean;
  target: WholesaleLogisticsLinkTarget | null;
}) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_logistics_section",
  );
  const [customerId, setCustomerId] = useState("");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    if (!open || !target) return;
    // 每次打开都使用行内最新客户和订单，避免上一次选择残留到另一条记录。
    setCustomerId(target.customerId ?? "");
    setOrderId(target.wholesaleOrderId ?? "");
  }, [open, target]);

  const matchingOrders = useMemo(
    () => getWholesaleOrderLinkOptionsForCustomer(orders, customerId),
    [customerId, orders],
  );
  const isAdjusting = Boolean(target?.wholesaleOrderId);

  return (
    <DashboardDialog
      description={uiText("linkDialogDescription", {
        trackingNumber: target?.trackingNumber ?? "",
      })}
      onOpenChange={onOpenChange}
      open={open}
      title={uiText(isAdjusting ? "adjustDialogTitle" : "linkDialogTitle")}
    >
      <form
        className="grid min-w-0 gap-4 md:grid-cols-2"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!target || !orderId) return;
          const succeeded = await onSave(
            target.recordType,
            target.recordId,
            orderId,
          );
          // 保存失败时弹窗继续打开，客户和订单选择也保持不变。
          if (succeeded) onOpenChange(false);
        }}
      >
        <WholesaleSelect
          label={uiText("attribute010")}
          name="customer_id"
          onChange={(event) => {
            setCustomerId(event.target.value);
            setOrderId("");
          }}
          required
          value={customerId}
        >
          <option value="">{uiText("selectCustomer")}</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.unique_name}
            </option>
          ))}
        </WholesaleSelect>
        <WholesaleSelect
          disabled={!customerId}
          label={uiText("attribute011")}
          name="wholesale_order_id"
          onChange={(event) => setOrderId(event.target.value)}
          required
          value={orderId}
        >
          <option value="">
            {customerId ? uiText("selectOrder") : uiText("selectCustomerFirst")}
          </option>
          {matchingOrders.map((order) => (
            <option key={order.id} value={order.id}>
              {formatWholesaleOrderLinkOption(order)}
            </option>
          ))}
        </WholesaleSelect>
        <div className="flex min-w-0 flex-wrap justify-end gap-3 md:col-span-2">
          <Button
            className="min-h-10 rounded-full px-4"
            disabled={pending}
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            {uiText("cancel")}
          </Button>
          <WholesaleSubmitButton pending={pending}>
            {uiText("saveLink")}
          </WholesaleSubmitButton>
        </div>
      </form>
    </DashboardDialog>
  );
}

export function WholesaleLogisticsUnlinkDialog({
  onConfirm,
  onOpenChange,
  open,
  pending,
  target,
}: {
  onConfirm: (
    recordType: WholesaleLogisticsRecordType,
    recordId: string,
  ) => Promise<boolean>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  pending: boolean;
  target: WholesaleLogisticsLinkTarget | null;
}) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_logistics_section",
  );

  return (
    <DashboardDialog
      description={uiText("unlinkDialogDescription", {
        trackingNumber: target?.trackingNumber ?? "",
      })}
      onOpenChange={onOpenChange}
      open={open}
      title={uiText("unlinkDialogTitle")}
    >
      <p className="break-words text-sm leading-7 text-[#69747d] [overflow-wrap:anywhere]">
        {uiText("unlinkVisibilityWarning")}
      </p>
      <div className="mt-6 flex min-w-0 flex-wrap justify-end gap-3">
        <Button
          className="min-h-10 rounded-full px-4"
          disabled={pending}
          onClick={() => onOpenChange(false)}
          type="button"
          variant="outline"
        >
          {uiText("cancel")}
        </Button>
        <Button
          className="min-h-10 rounded-full px-4"
          disabled={pending}
          onClick={async () => {
            if (!target) return;
            const succeeded = await onConfirm(
              target.recordType,
              target.recordId,
            );
            if (succeeded) onOpenChange(false);
          }}
          type="button"
          variant="destructive"
        >
          {uiText("confirmUnlink")}
        </Button>
      </div>
    </DashboardDialog>
  );
}

"use client";
import { UiMessage } from "@/components/i18n/ui-message";
import { useTranslations } from "next-intl";
import { AlertTriangle, LoaderCircle, Trash2 } from "lucide-react";
import { DashboardDialog } from "@/components/dashboard/dashboard-dialog";
import { Button } from "@/components/ui/button";
import type { WholesaleCustomer } from "@/lib/wholesale";
type WholesaleCustomerDeleteDialogProps = {
  customer: WholesaleCustomer | null;
  onDeleteCustomer: (customerId: string) => boolean | Promise<boolean>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  pending: boolean;
};
export function WholesaleCustomerDeleteDialog({
  customer,
  onDeleteCustomer,
  onOpenChange,
  open,
  pending,
}: WholesaleCustomerDeleteDialogProps) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_customer_delete_dialog",
  );
  return (
    <DashboardDialog
      description={uiText("attribute001")}
      onOpenChange={onOpenChange}
      open={open}
      title={uiText("attribute002")}
    >
      {customer ? (
        <div className="space-y-5">
          <div className="flex gap-3 rounded-[18px] border border-border-subtle bg-surface-inset p-4 text-content-muted">
            <AlertTriangle className="mt-0.5 size-5 shrink-0" />
            <div className="min-w-0">
              <p className="break-words text-sm font-semibold">
                <UiMessage id="components_dashboard_wholesale_wholesale_customer_delete_dialog.text001" />
                {customer.unique_name}”？
              </p>
              <p className="mt-2 break-words text-sm leading-6">
                <UiMessage id="components_dashboard_wholesale_wholesale_customer_delete_dialog.text002" />
              </p>
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <Button
              size="compact"
              disabled={pending}
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              <UiMessage id="components_dashboard_wholesale_wholesale_customer_delete_dialog.text003" />
            </Button>
            <Button
              variant="danger"
              size="compact"
              disabled={pending}
              onClick={async () => {
                const deleted = await onDeleteCustomer(customer.id);
                if (deleted) {
                  onOpenChange(false);
                }
              }}
              type="button"
            >
              {pending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              <UiMessage id="components_dashboard_wholesale_wholesale_customer_delete_dialog.text004" />
            </Button>
          </div>
        </div>
      ) : null}
    </DashboardDialog>
  );
}

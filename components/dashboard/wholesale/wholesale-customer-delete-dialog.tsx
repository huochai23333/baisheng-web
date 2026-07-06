"use client";

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
  return (
    <DashboardDialog
      description="删除后，这个客户会从客户管理中移除；已有订单的客户不能删除。"
      onOpenChange={onOpenChange}
      open={open}
      title="删除批发客户"
    >
      {customer ? (
        <div className="space-y-5">
          <div className="flex gap-3 rounded-[18px] border border-[#f2d6d6] bg-[#fff7f7] p-4 text-[#7a2f2f]">
            <AlertTriangle className="mt-0.5 size-5 shrink-0" />
            <div className="min-w-0">
              <p className="break-words text-sm font-semibold">
                确认删除“{customer.unique_name}”？
              </p>
              <p className="mt-2 break-words text-sm leading-6">
                如果这个客户已经有批发订单，系统会保留客户，避免订单资料丢失。
              </p>
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <Button
              className="h-10 rounded-full border border-[#d8e2e8] bg-white px-4 text-[#486782] hover:bg-[#eef3f6]"
              disabled={pending}
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              先不删除
            </Button>
            <Button
              className="h-10 rounded-full bg-[#b13d3d] px-4 text-white hover:bg-[#963333]"
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
              确认删除
            </Button>
          </div>
        </div>
      ) : null}
    </DashboardDialog>
  );
}

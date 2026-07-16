"use client";

import { Download, FileSpreadsheet, LoaderCircle, Trash2, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { DashboardDialog } from "@/components/dashboard/dashboard-dialog";
import { useDashboardConfirm } from "@/components/dashboard/dashboard-confirm-provider";
import { DashboardFilePicker } from "@/components/dashboard/dashboard-framework-primitives";
import { Button } from "@/components/ui/button";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import {
  createWholesaleOrderListDownloadUrl,
  WHOLESALE_ORDER_LIST_MAX_FILES,
  type WholesaleOrderListAttachment,
} from "@/lib/wholesale-order-list-attachments";

type WholesaleOrderListAttachmentsProps = {
  attachments: WholesaleOrderListAttachment[];
  canManage: boolean;
  compact?: boolean;
  onDelete: (attachment: WholesaleOrderListAttachment) => void | Promise<void>;
  onUpload: (files: File[]) => Promise<boolean>;
  orderId: string;
  orderNumber: string;
  pendingKey: string | null;
};

/**
 * 表格单元格和移动端详情共用同一份附件展示。
 * 客户只能触发下载；有管理权限的内部人员会额外看到上传和删除入口。
 */
export function WholesaleOrderListAttachments({
  attachments,
  canManage,
  compact = false,
  onDelete,
  onUpload,
  orderId,
  orderNumber,
  pendingKey,
}: WholesaleOrderListAttachmentsProps) {
  const t = useTranslations("WholesaleBusiness.ordersUi.orderList");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [downloadPendingId, setDownloadPendingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const downloadAttachment = async (attachment: WholesaleOrderListAttachment) => {
    const supabase = getBrowserSupabaseClient();

    if (!supabase) {
      setDownloadError(t("connectionFailed"));
      return;
    }

    setDownloadPendingId(attachment.id);
    setDownloadError(null);

    try {
      const signedUrl = await createWholesaleOrderListDownloadUrl(
        supabase,
        attachment,
      );
      // Storage 签名地址与网页不在同一个来源，浏览器可能忽略跨来源链接的
      // download 属性并直接打开 CSV。先读取文件再生成本地对象地址，可以让
      // CSV、XLS 和 XLSX 都稳定地以原始文件名保存到用户设备。
      const response = await fetch(signedUrl);

      if (!response.ok) {
        throw new Error("Order List 附件暂时无法下载。");
      }

      const objectUrl = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.rel = "noopener";
      anchor.download = attachment.original_name;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      // 等浏览器接管下载后再释放临时地址，避免在较慢设备上提前失效。
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
    } catch {
      setDownloadError(t("downloadFailed"));
    } finally {
      setDownloadPendingId(null);
    }
  };

  return (
    <div className="min-w-0 space-y-2">
      {attachments.length > 0 ? (
        <div className={compact ? "max-h-24 space-y-2 overflow-y-auto pr-1" : "space-y-2"}>
          {attachments.map((attachment) => (
            <Button
              className="h-auto max-w-full justify-start rounded-full border border-[#d8e2e8] bg-white px-3 py-1.5 text-left text-xs font-semibold text-[#486782] hover:bg-[#eef3f6]"
              disabled={downloadPendingId === attachment.id}
              key={attachment.id}
              onClick={() => void downloadAttachment(attachment)}
              title={attachment.original_name}
              type="button"
              variant="outline"
            >
              {downloadPendingId === attachment.id ? (
                <LoaderCircle className="size-3.5 shrink-0 animate-spin" />
              ) : (
                <Download className="size-3.5 shrink-0" />
              )}
              <span className="min-w-0 break-words [overflow-wrap:anywhere]">
                {attachment.original_name}
              </span>
            </Button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#71808d]">{t("empty")}</p>
      )}

      {canManage ? (
        <Button
          className="h-8 rounded-full border border-[#d8e2e8] bg-white px-3 text-xs text-[#486782] hover:bg-[#eef3f6]"
          onClick={() => setDialogOpen(true)}
          type="button"
          variant="outline"
        >
          <Upload className="size-3.5" />
          {t("manage")}
        </Button>
      ) : null}

      {downloadError ? (
        <p className="break-words text-xs leading-5 text-[#a64b4b]">
          {downloadError}
        </p>
      ) : null}

      {canManage ? (
        <WholesaleOrderListAttachmentDialog
          attachments={attachments}
          onDelete={onDelete}
          onOpenChange={setDialogOpen}
          onUpload={onUpload}
          open={dialogOpen}
          orderId={orderId}
          orderNumber={orderNumber}
          pendingKey={pendingKey}
        />
      ) : null}
    </div>
  );
}

function WholesaleOrderListAttachmentDialog({
  attachments,
  onDelete,
  onOpenChange,
  onUpload,
  open,
  orderId,
  orderNumber,
  pendingKey,
}: {
  attachments: WholesaleOrderListAttachment[];
  onDelete: (attachment: WholesaleOrderListAttachment) => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
  onUpload: (files: File[]) => Promise<boolean>;
  open: boolean;
  orderId: string;
  orderNumber: string;
  pendingKey: string | null;
}) {
  const confirm = useDashboardConfirm();
  const confirmT = useTranslations("DashboardFramework.confirm");
  const t = useTranslations("WholesaleBusiness.ordersUi.orderList");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const uploadPending = pendingKey === `order-list:upload:${orderId}`;

  return (
    <DashboardDialog
      description={t("dialogDescription")}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setSelectedFiles([]);
        onOpenChange(nextOpen);
      }}
      open={open}
      title={`${t("title")} · ${orderNumber}`}
    >
      <div className="space-y-5">
        <form
          className="rounded-[18px] border border-dashed border-[#cfdbe3] bg-[#f8fbfd] p-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (selectedFiles.length === 0) return;
            void onUpload(selectedFiles).then((succeeded) => {
              if (!succeeded) return;
              setSelectedFiles([]);
              onOpenChange(false);
            });
          }}
        >
          <p className="block text-sm font-semibold text-[#354650]">
            {t("choose")}
          </p>
          <div className="mt-3">
          <DashboardFilePicker
            accept=".csv,.xls,.xlsx"
            files={selectedFiles}
            multiple
            onFiles={setSelectedFiles}
          />
          </div>
          <p className="mt-3 text-xs leading-5 text-[#71808d]">
            {t("help", { count: WHOLESALE_ORDER_LIST_MAX_FILES })}
          </p>
          {selectedFiles.length > 0 ? (
            <p className="mt-2 break-words text-xs text-[#486782]">
              {t("selected", { count: selectedFiles.length })}
            </p>
          ) : null}
          <div className="mt-4 flex justify-end">
            <Button
              className="rounded-full bg-[#486782] text-white hover:bg-[#3e5f79]"
              disabled={uploadPending || selectedFiles.length === 0}
              type="submit"
            >
              {uploadPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              {t("upload")}
            </Button>
          </div>
        </form>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[#354650]">
            {t("uploaded")}
          </h3>
          {attachments.length === 0 ? (
            <div className="rounded-[16px] bg-[#f7f9fa] px-4 py-3 text-sm text-[#71808d]">
              {t("noneUploaded")}
            </div>
          ) : (
            attachments.map((attachment) => {
              const deletePending = pendingKey === `order-list:delete:${attachment.id}`;

              return (
                <div
                  className="flex min-w-0 flex-col gap-3 rounded-[16px] border border-[#e5ebef] bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                  data-attachment-name={attachment.original_name}
                  key={attachment.id}
                >
                  <div className="flex min-w-0 items-start gap-2">
                    <FileSpreadsheet className="mt-0.5 size-4 shrink-0 text-[#486782]" />
                    <div className="min-w-0">
                      <p className="break-words text-sm font-semibold text-[#354650] [overflow-wrap:anywhere]">
                        {attachment.original_name}
                      </p>
                      <p className="mt-1 text-xs text-[#71808d]">
                        {formatFileSize(attachment.file_size_bytes)}
                      </p>
                    </div>
                  </div>
                  <Button
                    className="self-end rounded-full border border-[#f0d6d6] bg-white text-[#a64b4b] hover:bg-[#fff5f5] sm:self-auto"
                    disabled={deletePending}
                    onClick={async () => {
                      if (!(await confirm({
                        description: t("confirmDelete", {
                          name: attachment.original_name,
                        }),
                        title: confirmT("title"),
                        tone: "danger",
                      }))) return;
                      await onDelete(attachment);
                    }}
                    type="button"
                    variant="outline"
                  >
                    {deletePending ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                    {t("delete")}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardDialog>
  );
}

function formatFileSize(value: number) {
  if (value < 1024 * 1024) {
    return `${Math.max(value / 1024, 0.1).toFixed(1)} KB`;
  }

  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

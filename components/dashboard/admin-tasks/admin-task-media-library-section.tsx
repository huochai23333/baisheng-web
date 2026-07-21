"use client";

import { Select } from "@/components/ui/select";

import type { ReactNode } from "react";

import {
  CheckCircle2,
  ClipboardList,
  Download,
  Eye,
  File,
  FileText,
  Images,
  LoaderCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  UserRound,
  Video,
} from "lucide-react";
import { useTranslations } from "next-intl";

import type {
  AdminTaskMediaLibraryItem,
  AdminTaskMediaLibraryKind,
} from "@/lib/admin-task-media-library";
import { cn } from "@/lib/utils";

import {
  DashboardFilterField,
  DashboardListSection,
  DashboardSearchInput,
} from "@/components/dashboard/dashboard-section-panel";
import { DashboardResourceFilterSection } from "@/components/dashboard/dashboard-resource-filter-section";
import {
  EmptyState,
  formatDateTime,
  formatFileSize,
} from "@/components/dashboard/dashboard-shared-ui";
import { Button } from "@/components/ui/button";

import { canPreviewTaskFile } from "./admin-task-file-preview-dialog";
import type { AdminTaskMediaLibraryKindFilter } from "./use-admin-task-media-library";

export function AdminTaskMediaLibrarySection({
  busyItemId,
  canView,
  filteredItems,
  isRefreshing,
  items,
  kindFilter,
  onDownload,
  onKindFilterChange,
  onPreview,
  onRefresh,
  onSearchTextChange,
  searchText,
}: {
  busyItemId: string | null;
  canView: boolean;
  filteredItems: AdminTaskMediaLibraryItem[];
  isRefreshing: boolean;
  items: AdminTaskMediaLibraryItem[];
  kindFilter: AdminTaskMediaLibraryKindFilter;
  onDownload: (item: AdminTaskMediaLibraryItem) => void;
  onKindFilterChange: (value: AdminTaskMediaLibraryKindFilter) => void;
  onPreview: (item: AdminTaskMediaLibraryItem) => void;
  onRefresh: () => void;
  onSearchTextChange: (value: string) => void;
  searchText: string;
}) {
  const t = useTranslations("Tasks.admin.mediaLibrary");

  if (!canView) {
    return (
      <DashboardListSection>
        <EmptyState
          description={t("noPermissionDescription")}
          icon={<ShieldAlert className="size-6" />}
          title={t("noPermissionTitle")}
        />
      </DashboardListSection>
    );
  }

  return (
    <DashboardListSection
      actions={
        <Button
          size="compact"
          disabled={isRefreshing}
          onClick={onRefresh}
          type="button"
          variant="outline"
        >
          <RefreshCw className={cn("size-4", isRefreshing && "animate-spin")} />
          {t("refresh")}
        </Button>
      }
      description={t("description", { count: items.length })}
      eyebrow={t("badge")}
      title={t("title")}
    >
      <div className="space-y-5">
        <DashboardResourceFilterSection
          activeFilterCount={[
            Boolean(searchText),
            kindFilter !== "all",
          ].filter(Boolean).length}
          onReset={() => {
            onSearchTextChange("");
            onKindFilterChange("all");
          }}
          primary={
            <DashboardFilterField label={t("searchLabel")}>
              <DashboardSearchInput
                onChange={onSearchTextChange}
                placeholder={t("searchPlaceholder")}
                value={searchText}
              />
            </DashboardFilterField>
          }
          resetDisabled={!searchText && kindFilter === "all"}
        >
          <DashboardFilterField label={t("kindLabel")}>
            <Select
              onValueChange={onKindFilterChange}
              options={[
                { label: t("kindAll"), value: "all" },
                { label: t("kindImage"), value: "image" },
                { label: t("kindVideo"), value: "video" },
                { label: t("kindPdf"), value: "pdf" },
                { label: t("kindFile"), value: "file" },
              ]}
              value={kindFilter}
            />
          </DashboardFilterField>
        </DashboardResourceFilterSection>

        {items.length === 0 ? (
          <EmptyState
            description={t("emptyDescription")}
            icon={<Images className="size-6" />}
            title={t("emptyTitle")}
          />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            description={t("noMatchesDescription")}
            icon={<Search className="size-6" />}
            title={t("noMatchesTitle")}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {filteredItems.map((item) => (
              <TaskMediaLibraryCard
                busy={busyItemId === item.id}
                item={item}
                key={item.id}
                onDownload={onDownload}
                onPreview={onPreview}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardListSection>
  );
}

function TaskMediaLibraryCard({
  busy,
  item,
  onDownload,
  onPreview,
}: {
  busy: boolean;
  item: AdminTaskMediaLibraryItem;
  onDownload: (item: AdminTaskMediaLibraryItem) => void;
  onPreview: (item: AdminTaskMediaLibraryItem) => void;
}) {
  const t = useTranslations("Tasks.admin.mediaLibrary");
  const previewable = canPreviewTaskFile(item.kind);

  return (
    <article className="min-w-0 rounded-surface-panel border border-border-subtle bg-surface-interactive p-4 shadow-surface-interactive sm:p-5">
      <div className="flex min-w-0 items-start gap-4">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-record-card",
            item.kind === "image" && "bg-status-info-soft text-primary",
            item.kind === "video" && "bg-surface-inset text-status-success",
            item.kind === "pdf" && "bg-status-warning-soft text-status-warning",
            item.kind === "file" && "bg-surface-inset text-content-muted",
          )}
        >
          {getKindIcon(item.kind)}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="truncate text-base font-semibold text-content-strong"
            title={item.original_name}
          >
            {item.original_name}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-content-muted">
            <Badge>{getKindLabel(item.kind, t)}</Badge>
            <span>{formatFileSize(item.file_size_bytes)}</span>
            <span>{t("round", { round: item.submission_round })}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InfoTile
          icon={<ClipboardList className="size-4 text-primary" />}
          label={t("taskLabel")}
          value={item.task_name}
        />
        <InfoTile
          icon={<FileText className="size-4 text-primary" />}
          label={t("typeLabel")}
          value={item.task_type_name ?? item.task_type_code}
        />
        <InfoTile
          icon={<UserRound className="size-4 text-primary" />}
          label={t("submitterLabel")}
          value={getDisplayName(
            item.submitted_by_name,
            item.submitted_by_email,
            t,
          )}
        />
        <InfoTile
          icon={<CheckCircle2 className="size-4 text-primary" />}
          label={t("reviewedAtLabel")}
          value={formatDateTime(item.reviewed_at)}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {previewable ? (
          <Button
            size="compact"
            disabled={busy}
            onClick={() => onPreview(item)}
            type="button"
            variant="outline"
          >
            {busy ? (
              <LoaderCircle className="size-3.5 animate-spin" />
            ) : (
              <Eye className="size-3.5" />
            )}
            {t("preview")}
          </Button>
        ) : null}
        <Button
          variant="primary"
          size="compact"
          disabled={busy}
          onClick={() => onDownload(item)}
          type="button"
        >
          {busy ? (
            <LoaderCircle className="size-3.5 animate-spin" />
          ) : (
            <Download className="size-3.5" />
          )}
          {t("download")}
        </Button>
      </div>
    </article>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-status-info-soft px-2.5 py-1 font-medium text-primary">
      {children}
    </span>
  );
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-record-card bg-surface-inset px-3 py-3">
      <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.14em] text-content-subtle uppercase">
        {icon}
        <span className="min-w-0 truncate">{label}</span>
      </div>
      <p className="mt-2 min-w-0 break-words text-sm font-medium leading-6 text-content-strong [overflow-wrap:anywhere]">
        {value}
      </p>
    </div>
  );
}

function getKindIcon(kind: AdminTaskMediaLibraryKind) {
  if (kind === "image") {
    return <Images className="size-5" />;
  }

  if (kind === "video") {
    return <Video className="size-5" />;
  }

  if (kind === "pdf") {
    return <FileText className="size-5" />;
  }

  return <File className="size-5" />;
}

function getKindLabel(
  kind: AdminTaskMediaLibraryKind,
  t: ReturnType<typeof useTranslations>,
) {
  if (kind === "image") {
    return t("kindImage");
  }

  if (kind === "video") {
    return t("kindVideo");
  }

  if (kind === "pdf") {
    return t("kindPdf");
  }

  return t("kindFile");
}

function getDisplayName(
  name: string | null,
  email: string | null,
  t: ReturnType<typeof useTranslations>,
) {
  return name ?? email ?? t("unknownUser");
}
